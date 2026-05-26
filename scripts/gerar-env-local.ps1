param(
    [string]$OutputFile = ".env.local",
    [string]$DbName = "TB_ADS",
    [string]$DbUser = "postgres",
    [string]$DbPassword = "",
    [string]$BackendPort = "8081",
    [string]$FrontendOrigin = "http://localhost:5173",
    [switch]$Force
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$target = Join-Path $repoRoot $OutputFile

if ((Test-Path -LiteralPath $target) -and -not $Force) {
    Write-Error "Arquivo ja existe: $target. Use -Force para sobrescrever."
    exit 1
}

function New-Secret {
    param([int]$Bytes = 48)
    $buffer = New-Object byte[] $Bytes
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try {
        $rng.GetBytes($buffer)
    } finally {
        $rng.Dispose()
    }
    return [Convert]::ToBase64String($buffer)
}

$passwordValue = if ([string]::IsNullOrWhiteSpace($DbPassword)) { "trocar_por_senha_local" } else { $DbPassword }
$jwtSecret = New-Secret
$allowedOrigins = "$FrontendOrigin,http://127.0.0.1:5173"

$lines = @(
    "# Nexus One - ambiente local sem Docker",
    "# Gerado por scripts/gerar-env-local.ps1 em $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')",
    "",
    "POSTGRES_DB=$DbName",
    "POSTGRES_USER=$DbUser",
    "POSTGRES_PASSWORD=$passwordValue",
    "DB_URL=jdbc:postgresql://localhost:5432/$DbName",
    "DB_USERNAME=$DbUser",
    "DB_PASSWORD=$passwordValue",
    "",
    "JWT_SECRET=$jwtSecret",
    "NEXUS_ALLOWED_ORIGINS=$allowedOrigins",
    "",
    "ASAAS_ENABLED=false",
    "ASAAS_API_KEY=",
    "ASAAS_BASE_URL=https://api-sandbox.asaas.com/v3",
    "ASAAS_WEBHOOK_TOKEN=",
    "",
    "NOTIFICATIONS_ENABLED=false",
    "NOTIFICATIONS_WEBHOOK_URL=",
    "NOTIFICATIONS_TOKEN=",
    "NOTIFICATIONS_FOLLOW_UP_CRON=0 0 8 * * *",
    "NOTIFICATIONS_STOCK_CRON=0 15 8 * * *",
    "NOTIFICATIONS_DAILY_SUMMARY_CRON=0 0 18 * * *",
    "",
    "NEXUS_OS_UPLOAD_DIR=uploads/ordens-servico",
    "NEXUS_UPLOAD_MAX_FILE_SIZE=10MB",
    "NEXUS_UPLOAD_MAX_REQUEST_SIZE=10MB",
    "",
    "NEXUS_FISCAL_XML_SIGNER=controlled",
    "NEXUS_FISCAL_PROVIDER=controlled",
    "NEXUS_FISCAL_HTTP_CONNECT_TIMEOUT_MS=3000",
    "NEXUS_FISCAL_HTTP_READ_TIMEOUT_MS=10000",
    "NEXUS_FISCAL_HTTP_STATUS_READ_TIMEOUT_MS=3000",
    "",
    "SPRING_PROFILES_ACTIVE=default",
    "SERVER_PORT=$BackendPort",
    "FRONTEND_PORT=5173"
)

Set-Content -LiteralPath $target -Value $lines -Encoding UTF8

Write-Host "Arquivo local gerado: $target"
if ([string]::IsNullOrWhiteSpace($DbPassword)) {
    Write-Host "Aviso: DB_PASSWORD ficou como placeholder. Edite $OutputFile antes de rodar check:env:local." -ForegroundColor Yellow
}
