param(
    [string]$EnvFile = ".env",
    [string]$ComposeFile = "docker-compose.prod.yml",
    [string]$ServiceName = "postgres",
    [switch]$SkipDockerRuntime
)

$ErrorActionPreference = "Stop"

$errors = New-Object System.Collections.Generic.List[string]
$warnings = New-Object System.Collections.Generic.List[string]

if (-not (Test-Path -LiteralPath $EnvFile)) {
    $errors.Add("Arquivo de ambiente nao encontrado: $EnvFile")
}

if (-not (Test-Path -LiteralPath $ComposeFile)) {
    $errors.Add("Compose nao encontrado: $ComposeFile")
}

if (-not $SkipDockerRuntime -and $errors.Count -eq 0) {
    docker compose --env-file $EnvFile -f $ComposeFile config | Out-Null
    if ($LASTEXITCODE -ne 0) {
        $errors.Add("Docker Compose nao conseguiu validar $ComposeFile com $EnvFile")
    }
}

if (-not $SkipDockerRuntime -and $errors.Count -eq 0) {
    $serviceId = docker compose --env-file $EnvFile -f $ComposeFile ps -q $ServiceName
    if ([string]::IsNullOrWhiteSpace($serviceId)) {
        $warnings.Add("Servico '$ServiceName' nao esta em execucao. Consulta real de usuario master foi pulada.")
    } else {
        $masterCountQuery = "select count(*) from public.usuario where perfil = 'MASTER' and ativo = true and coalesce(bloqueado, false) = false;"
        $masterCount = docker compose --env-file $EnvFile -f $ComposeFile exec -T $ServiceName sh -c "psql -U `"`$POSTGRES_USER`" -d `"`$POSTGRES_DB`" -At -c `"$masterCountQuery`""
        if ($LASTEXITCODE -ne 0) {
            $errors.Add("Nao foi possivel consultar usuarios MASTER no banco.")
        } elseif ([int]$masterCount -lt 1) {
            $errors.Add("Nenhum usuario MASTER ativo e desbloqueado encontrado.")
        }

        $suspiciousQuery = "select login || '|' || perfil from public.usuario where perfil in ('MASTER','ADMIN') and lower(login) in ('admin','master','administrator','root','teste','test');"
        $suspiciousRows = docker compose --env-file $EnvFile -f $ComposeFile exec -T $ServiceName sh -c "psql -U `"`$POSTGRES_USER`" -d `"`$POSTGRES_DB`" -At -c `"$suspiciousQuery`""
        if ($LASTEXITCODE -eq 0 -and -not [string]::IsNullOrWhiteSpace(($suspiciousRows -join ""))) {
            $warnings.Add("Existem logins privilegiados obvios. Renomear ou bloquear: $($suspiciousRows -join ', ')")
        }
    }
}

if ($errors.Count -gt 0) {
    Write-Host "== Usuario master nao validado ==" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "- $_" -ForegroundColor Red }
    exit 1
}

if ($warnings.Count -gt 0) {
    Write-Host "== Alertas de usuario master ==" -ForegroundColor Yellow
    $warnings | ForEach-Object { Write-Host "- $_" -ForegroundColor Yellow }
}

Write-Host "Usuario master seguro validado em nivel estrutural."
Write-Host "Env: $EnvFile"
Write-Host "Compose: $ComposeFile"
Write-Host "Servico: $ServiceName"
