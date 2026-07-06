param(
    [string]$EnvFile = ".env",
    [string]$ComposeFile = "docker-compose.prod.yml",
    [string]$BackendUrl = "http://localhost:8081/health",
    [string]$FrontendUrl = "http://localhost:5173",
    [string]$LogDir = "logs\monitoramento",
    [switch]$SkipHttpCheck
)

$ErrorActionPreference = "Stop"

function Read-EnvFile {
    param([string]$Path)

    $vars = @{}
    if (-not (Test-Path -LiteralPath $Path)) {
        return $vars
    }

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

$errors = New-Object System.Collections.Generic.List[string]
$warnings = New-Object System.Collections.Generic.List[string]

foreach ($file in @(
    $ComposeFile,
    "scripts\monitorar-disponibilidade.ps1",
    "scripts\agendar-monitoramento-disponibilidade.ps1",
    "backend\projectoads\projectoads\src\main\resources\application-prod.yml"
)) {
    if (-not (Test-Path -LiteralPath $file)) {
        $errors.Add("Arquivo obrigatorio ausente: $file")
    }
}

if ($errors.Count -eq 0) {
    $composeContent = Get-Content -LiteralPath $ComposeFile -Raw
    foreach ($service in @("postgres", "backend", "frontend")) {
        if ($composeContent -notmatch "(?ms)^\s{2}${service}:.*?^\s{4}healthcheck:") {
            $errors.Add("Healthcheck nao encontrado para o servico '$service' em $ComposeFile")
        }
    }
}

if ($errors.Count -eq 0) {
    $prodYaml = Get-Content -LiteralPath "backend\projectoads\projectoads\src\main\resources\application-prod.yml" -Raw
    if ($prodYaml -notmatch "(?m)^logging:") {
        $errors.Add("Bloco logging nao encontrado em application-prod.yml")
    }
    if ($prodYaml -notmatch "root:\s*INFO") {
        $warnings.Add("Nivel root INFO nao encontrado explicitamente em application-prod.yml.")
    }
}

if (-not (Test-Path -LiteralPath $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir | Out-Null
}

$vars = Read-EnvFile -Path $EnvFile
if (-not $vars.ContainsKey("NEXUS_MONITOR_WEBHOOK_URL") -or [string]::IsNullOrWhiteSpace($vars["NEXUS_MONITOR_WEBHOOK_URL"])) {
    $warnings.Add("NEXUS_MONITOR_WEBHOOK_URL nao esta configurado. Monitoramento local funciona, mas alerta externo nao sera enviado.")
}

if (-not $SkipHttpCheck -and $errors.Count -eq 0) {
    try {
        $backend = Invoke-RestMethod -Uri $BackendUrl -Method GET -TimeoutSec 10
        if ($backend.status -ne "UP") {
            $errors.Add("Backend health respondeu, mas status nao esta UP: $($backend.status)")
        }
    } catch {
        $warnings.Add("Backend nao respondeu em $BackendUrl. Se o ambiente nao estiver rodando, ignore este alerta.")
    }

    try {
        $frontend = Invoke-WebRequest -UseBasicParsing -Uri $FrontendUrl -Method GET -TimeoutSec 10
        if ($frontend.StatusCode -lt 200 -or $frontend.StatusCode -ge 400) {
            $errors.Add("Frontend retornou HTTP $($frontend.StatusCode)")
        }
    } catch {
        $warnings.Add("Frontend nao respondeu em $FrontendUrl. Se o ambiente nao estiver rodando, ignore este alerta.")
    }
}

if ($errors.Count -gt 0) {
    Write-Host "== Observabilidade nao validada ==" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "- $_" -ForegroundColor Red }
    exit 1
}

if ($warnings.Count -gt 0) {
    Write-Host "== Alertas de observabilidade ==" -ForegroundColor Yellow
    $warnings | ForEach-Object { Write-Host "- $_" -ForegroundColor Yellow }
}

Write-Host "Logs e monitoramento basico validados."
Write-Host "LogDir: $LogDir"
Write-Host "Backend: $BackendUrl"
Write-Host "Frontend: $FrontendUrl"
