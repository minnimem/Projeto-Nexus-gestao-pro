param(
    [string]$EnvFile = ".env",
    [string]$ComposeFile = "docker-compose.prod.yml",
    [string]$ServiceName = "postgres",
    [switch]$SkipDockerRuntime
)

$ErrorActionPreference = "Stop"

function Read-EnvFile {
    param([string]$Path)

    $vars = @{}
    Get-Content -LiteralPath $Path | ForEach-Object {
        $line = $_.Trim()
        if ([string]::IsNullOrWhiteSpace($line) -or $line.StartsWith("#")) {
            return
        }

        $separator = $line.IndexOf("=")
        if ($separator -le 0) {
            return
        }

        $key = $line.Substring(0, $separator).Trim()
        $value = $line.Substring($separator + 1).Trim().Trim('"').Trim("'")
        $vars[$key] = $value
    }
    return $vars
}

function Add-Error {
    param(
        [System.Collections.Generic.List[string]]$Errors,
        [string]$Message
    )
    $Errors.Add($Message)
}

$errors = New-Object System.Collections.Generic.List[string]
$warnings = New-Object System.Collections.Generic.List[string]

if (-not (Test-Path -LiteralPath $EnvFile)) {
    Add-Error $errors "Arquivo de ambiente nao encontrado: $EnvFile"
}

if (-not (Test-Path -LiteralPath $ComposeFile)) {
    Add-Error $errors "Compose de producao nao encontrado: $ComposeFile"
}

if ($errors.Count -eq 0) {
    $vars = Read-EnvFile -Path $EnvFile

    foreach ($key in @("POSTGRES_DB", "POSTGRES_USER", "POSTGRES_PASSWORD", "DB_URL", "DB_USERNAME", "DB_PASSWORD")) {
        if (-not $vars.ContainsKey($key) -or [string]::IsNullOrWhiteSpace($vars[$key])) {
            Add-Error $errors "Variavel obrigatoria de banco ausente ou vazia: $key"
        }
    }

    if ($vars.ContainsKey("DB_URL") -and $vars["DB_URL"] -notmatch "^jdbc:postgresql://") {
        Add-Error $errors "DB_URL deve usar jdbc:postgresql://"
    }

    if ($vars.ContainsKey("POSTGRES_USER") -and $vars.ContainsKey("DB_USERNAME") -and $vars["POSTGRES_USER"] -ne $vars["DB_USERNAME"]) {
        $warnings.Add("POSTGRES_USER e DB_USERNAME estao diferentes. Isso pode ser valido, mas precisa estar intencional.")
    }

    if ($vars.ContainsKey("POSTGRES_PASSWORD") -and $vars.ContainsKey("DB_PASSWORD") -and $vars["POSTGRES_PASSWORD"] -ne $vars["DB_PASSWORD"]) {
        $warnings.Add("POSTGRES_PASSWORD e DB_PASSWORD estao diferentes. Isso pode ser valido, mas precisa estar intencional.")
    }
}

if ($errors.Count -eq 0) {
    $composeContent = Get-Content -LiteralPath $ComposeFile -Raw
    if ($composeContent -notmatch "(?m)^\s{2}$([regex]::Escape($ServiceName)):\s*$") {
        Add-Error $errors "Servico PostgreSQL '$ServiceName' nao encontrado em $ComposeFile"
    }

    if ($composeContent -notmatch "/var/lib/postgresql/data") {
        Add-Error $errors "Volume persistente do PostgreSQL nao encontrado em $ComposeFile"
    }

    if ($composeContent -notmatch "pg_isready") {
        Add-Error $errors "Healthcheck pg_isready nao encontrado no servico PostgreSQL."
    }
}

if (-not $SkipDockerRuntime -and $errors.Count -eq 0) {
    docker compose --env-file $EnvFile -f $ComposeFile config | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Add-Error $errors "Docker Compose nao conseguiu validar $ComposeFile com $EnvFile"
    }
}

if (-not $SkipDockerRuntime -and $errors.Count -eq 0) {
    $serviceId = docker compose --env-file $EnvFile -f $ComposeFile ps -q $ServiceName
    if ([string]::IsNullOrWhiteSpace($serviceId)) {
        $warnings.Add("Servico '$ServiceName' nao esta em execucao. Validacao de runtime do banco foi pulada.")
    } else {
        docker compose --env-file $EnvFile -f $ComposeFile exec -T $ServiceName sh -c 'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"' | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Add-Error $errors "PostgreSQL nao respondeu ao pg_isready dentro do container."
        }
    }
}

if ($errors.Count -gt 0) {
    Write-Host "== Banco de producao nao validado ==" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "- $_" -ForegroundColor Red }
    exit 1
}

if ($warnings.Count -gt 0) {
    Write-Host "== Alertas do banco de producao ==" -ForegroundColor Yellow
    $warnings | ForEach-Object { Write-Host "- $_" -ForegroundColor Yellow }
}

Write-Host "Banco de producao validado."
Write-Host "Env: $EnvFile"
Write-Host "Compose: $ComposeFile"
Write-Host "Servico: $ServiceName"
