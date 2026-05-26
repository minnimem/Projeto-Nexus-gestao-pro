param(
    [string]$BackendUrl = "http://localhost:8081/health",
    [string]$FrontendUrl = "http://localhost:5173",
    [string]$AlertWebhookUrl = $env:NEXUS_MONITOR_WEBHOOK_URL,
    [string]$EnvironmentName = "producao",
    [string]$LogDir = "logs\monitoramento",
    [int]$TimeoutSeconds = 10
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir | Out-Null
}

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$logFile = Join-Path $LogDir ("disponibilidade-" + (Get-Date -Format "yyyyMMdd") + ".log")
$failures = New-Object System.Collections.Generic.List[string]

function Write-MonitorLog {
    param([string]$Message)
    $line = "[$timestamp] $Message"
    Add-Content -LiteralPath $logFile -Value $line
    Write-Host $line
}

function Send-Alert {
    param([string]$Message)

    if ([string]::IsNullOrWhiteSpace($AlertWebhookUrl)) {
        Write-MonitorLog "ALERTA nao enviado: webhook nao configurado. $Message"
        return
    }

    $payload = @{
        text = $Message
        environment = $EnvironmentName
        timestamp = $timestamp
    } | ConvertTo-Json -Depth 4

    Invoke-RestMethod -Uri $AlertWebhookUrl -Method POST -ContentType "application/json" -Body $payload | Out-Null
    Write-MonitorLog "ALERTA enviado para webhook configurado."
}

try {
    $backend = Invoke-RestMethod -Uri $BackendUrl -Method GET -TimeoutSec $TimeoutSeconds
    if ($backend.status -ne "UP") {
        $failures.Add("Backend respondeu, mas status nao esta UP: $($backend.status)")
    } else {
        Write-MonitorLog "Backend OK: $BackendUrl"
    }
} catch {
    $failures.Add("Backend indisponivel em $BackendUrl. Erro: $($_.Exception.Message)")
}

try {
    $frontend = Invoke-WebRequest -UseBasicParsing -Uri $FrontendUrl -Method GET -TimeoutSec $TimeoutSeconds
    if ($frontend.StatusCode -lt 200 -or $frontend.StatusCode -ge 400) {
        $failures.Add("Frontend retornou HTTP $($frontend.StatusCode) em $FrontendUrl")
    } else {
        Write-MonitorLog "Frontend OK: $FrontendUrl"
    }
} catch {
    $failures.Add("Frontend indisponivel em $FrontendUrl. Erro: $($_.Exception.Message)")
}

if ($failures.Count -gt 0) {
    $message = "Nexus One [$EnvironmentName] com falha de disponibilidade: " + ($failures -join " | ")
    Write-MonitorLog $message
    Send-Alert -Message $message
    exit 1
}

Write-MonitorLog "Disponibilidade validada com sucesso para $EnvironmentName."
