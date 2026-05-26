param(
    [string]$EnvFile = ".env",
    [string]$OutputDir = "reports"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $EnvFile)) {
    Write-Error "Arquivo $EnvFile nao encontrado."
    exit 1
}

if (-not (Test-Path -LiteralPath $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

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

function Test-Enabled {
    param($Vars, [string]$Key)
    return $Vars.ContainsKey($Key) -and @("true", "1", "yes", "sim") -contains $Vars[$Key].ToLowerInvariant()
}

function Test-Filled {
    param($Vars, [string]$Key)
    return $Vars.ContainsKey($Key) -and -not [string]::IsNullOrWhiteSpace($Vars[$Key])
}

function Add-Integration {
    param(
        [System.Collections.Generic.List[string]]$Lines,
        [string]$Name,
        [string]$Status,
        [string]$Detail
    )
    $Lines.Add(("{0} | {1} | {2}" -f $Name, $Status, $Detail))
}

$vars = Read-EnvFile -Path $EnvFile
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reportFile = Join-Path $OutputDir "integracoes-externas-$timestamp.txt"
$lines = New-Object System.Collections.Generic.List[string]

$lines.Add("VERIFICACAO DE INTEGRACOES EXTERNAS - NEXUS ONE")
$lines.Add("Data: " + (Get-Date -Format "dd/MM/yyyy HH:mm:ss"))
$lines.Add("Arquivo auditado: $EnvFile")
$lines.Add("")
$lines.Add("Este relatorio nao exibe tokens, senhas ou chaves.")
$lines.Add("")

$asaasEnabled = Test-Enabled $vars "ASAAS_ENABLED"
if ($asaasEnabled) {
    $asaasReady = (Test-Filled $vars "ASAAS_API_KEY") -and (Test-Filled $vars "ASAAS_WEBHOOK_TOKEN") -and (Test-Filled $vars "ASAAS_BASE_URL")
    $asaasBase = if (Test-Filled $vars "ASAAS_BASE_URL") { $vars["ASAAS_BASE_URL"] } else { "nao configurado" }
    Add-Integration $lines "Asaas" $(if ($asaasReady) { "CONFIGURADO" } else { "PENDENTE" }) "enabled=true; baseUrl=$asaasBase; apiKey=$(Test-Filled $vars "ASAAS_API_KEY"); webhookToken=$(Test-Filled $vars "ASAAS_WEBHOOK_TOKEN")"
} else {
    Add-Integration $lines "Asaas" "DESABILITADO" "ASAAS_ENABLED=false ou ausente"
}

$notificationsEnabled = Test-Enabled $vars "NOTIFICATIONS_ENABLED"
if ($notificationsEnabled) {
    $notificationsReady = (Test-Filled $vars "NOTIFICATIONS_WEBHOOK_URL") -and (Test-Filled $vars "NOTIFICATIONS_TOKEN")
    Add-Integration $lines "Notificacoes" $(if ($notificationsReady) { "CONFIGURADO" } else { "PENDENTE" }) "enabled=true; webhook=$(Test-Filled $vars "NOTIFICATIONS_WEBHOOK_URL"); token=$(Test-Filled $vars "NOTIFICATIONS_TOKEN")"
} else {
    Add-Integration $lines "Notificacoes" "DESABILITADO" "NOTIFICATIONS_ENABLED=false ou ausente"
}

$monitorReady = Test-Filled $vars "NEXUS_MONITOR_WEBHOOK_URL"
Add-Integration $lines "Monitoramento externo" $(if ($monitorReady) { "CONFIGURADO" } else { "PENDENTE" }) "webhook=$(Test-Filled $vars "NEXUS_MONITOR_WEBHOOK_URL")"

$fiscalProvider = if (Test-Filled $vars "NEXUS_FISCAL_PROVIDER") { $vars["NEXUS_FISCAL_PROVIDER"] } else { "controlled" }
$fiscalSigner = if (Test-Filled $vars "NEXUS_FISCAL_XML_SIGNER") { $vars["NEXUS_FISCAL_XML_SIGNER"] } else { "controlled" }
$fiscalReady = $fiscalProvider -ne "controlled" -and $fiscalSigner -ne "controlled"
Add-Integration $lines "Fiscal real" $(if ($fiscalReady) { "CONFIGURADO" } else { "CONTROLADO/PENDENTE" }) "provider=$fiscalProvider; signer=$fiscalSigner; certificadoSenha=$(Test-Filled $vars "NEXUS_FISCAL_CERT_PASSWORD"); csc=$(Test-Filled $vars "NEXUS_FISCAL_CSC_TOKEN")"

$lines.Add("")
$lines.Add("Proximas acoes:")
$lines.Add("- Homologar Asaas Pix/boleto/webhook antes de vender pagamento real.")
$lines.Add("- Homologar canal real antes de vender notificacoes ativas.")
$lines.Add("- Validar fiscal real com contador/provedor antes de vender emissao oficial.")
$lines.Add("- Arquivar evidencias em docs/EVIDENCIA_* ou reports.")

Set-Content -LiteralPath $reportFile -Value $lines

Write-Host "Relatorio de integracoes externas gerado em $reportFile"
