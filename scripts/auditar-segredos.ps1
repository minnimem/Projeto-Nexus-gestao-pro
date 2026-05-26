param(
    [string]$EnvFile = ".env",
    [string]$OutputDir = "reports"
)

$ErrorActionPreference = "Stop"

$sensitiveKeys = @(
    "POSTGRES_PASSWORD",
    "DB_PASSWORD",
    "JWT_SECRET",
    "NEXUS_ALLOWED_ORIGINS",
    "ASAAS_API_KEY",
    "ASAAS_WEBHOOK_TOKEN",
    "NOTIFICATIONS_WEBHOOK_URL",
    "NOTIFICATIONS_TOKEN",
    "NEXUS_MONITOR_WEBHOOK_URL",
    "NEXUS_FISCAL_CERT_PASSWORD",
    "NEXUS_FISCAL_CSC_TOKEN"
)

$requiredKeys = @("POSTGRES_PASSWORD", "DB_PASSWORD", "JWT_SECRET", "NEXUS_ALLOWED_ORIGINS")

if (-not (Test-Path -LiteralPath $EnvFile)) {
    Write-Error "Arquivo $EnvFile nao encontrado."
    exit 1
}

if (-not (Test-Path -LiteralPath $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$envVars = @{}
Get-Content -LiteralPath $EnvFile | ForEach-Object {
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
    $envVars[$key] = $value
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reportFile = Join-Path $OutputDir "auditoria-segredos-$timestamp.txt"
$lines = New-Object System.Collections.Generic.List[string]

$lines.Add("AUDITORIA DE SEGREDOS - NEXUS ONE")
$lines.Add("Data: " + (Get-Date -Format "dd/MM/yyyy HH:mm:ss"))
$lines.Add("Arquivo auditado: $EnvFile")
$lines.Add("")
$lines.Add("IMPORTANTE: este relatorio nao exibe valores sensiveis.")
$lines.Add("")

foreach ($key in $sensitiveKeys) {
    $exists = $envVars.ContainsKey($key)
    $filled = $exists -and -not [string]::IsNullOrWhiteSpace($envVars[$key])
    $length = if ($filled) { $envVars[$key].Length } else { 0 }
    $required = $requiredKeys -contains $key
    $status = "OK"

    if ($required -and -not $filled) {
        $status = "FALHA"
    } elseif (-not $filled) {
        $status = "NAO CONFIGURADO"
    } elseif ($key -eq "JWT_SECRET" -and $length -lt 32) {
        $status = "FALHA"
    } elseif ($key -eq "NEXUS_ALLOWED_ORIGINS" -and $envVars[$key] -notmatch "https?://") {
        $status = "FALHA"
    }

    $lines.Add(("{0} | obrigatorio={1} | preenchido={2} | tamanho={3} | status={4}" -f $key, $required, $filled, $length, $status))
}

$lines.Add("")
$lines.Add("Proximas acoes recomendadas:")
$lines.Add("- Conferir este relatorio junto com docs/INVENTARIO_SEGREDOS_NEXUS_ONE.md.")
$lines.Add("- Rodar scripts/verificar-segredos.ps1 antes de qualquer deploy.")
$lines.Add("- Registrar rotacoes sem expor valores reais.")

Set-Content -LiteralPath $reportFile -Value $lines

Write-Host "Auditoria gerada em $reportFile"
