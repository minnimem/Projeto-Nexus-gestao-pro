param(
    [string]$Cliente = "",
    [ValidateSet("Acesso", "Correcao", "Exclusao", "Anonimizacao", "Portabilidade", "Informacao")]
    [string]$Tipo = "Acesso",
    [string]$Solicitante = "",
    [string]$Responsavel = "",
    [string]$OutputDir = "reports\lgpd"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$safeCliente = if ([string]::IsNullOrWhiteSpace($Cliente)) { "cliente" } else { ($Cliente -replace "[^a-zA-Z0-9_-]", "-") }
$outputFile = Join-Path $OutputDir "solicitacao-lgpd-$safeCliente-$Tipo-$timestamp.txt"

$lines = @(
    "SOLICITACAO LGPD - NEXUS ONE",
    "Data abertura: " + (Get-Date -Format "dd/MM/yyyy HH:mm:ss"),
    "Cliente/controlador: $Cliente",
    "Tipo: $Tipo",
    "Solicitante: $Solicitante",
    "Responsavel Nexus One: $Responsavel",
    "",
    "Dados envolvidos:",
    "- Cliente/usuario/pedido/documento:",
    "- Modulo:",
    "- Periodo:",
    "",
    "Validacoes:",
    "- [ ] Identidade/legitimidade validada pelo cliente controlador.",
    "- [ ] Impacto fiscal/contabil avaliado.",
    "- [ ] Impacto em backups avaliado.",
    "- [ ] Dados obrigatorios por lei preservados quando aplicavel.",
    "",
    "Decisao:",
    "- [ ] Atendida.",
    "- [ ] Atendida parcialmente.",
    "- [ ] Rejeitada com justificativa.",
    "- [ ] Encaminhada ao cliente controlador.",
    "",
    "Acao executada:",
    "-",
    "",
    "Justificativa/observacoes:",
    "-",
    "",
    "Encerramento:",
    "- Data:",
    "- Responsavel:",
    "- Evidencia arquivada:"
)

Set-Content -LiteralPath $outputFile -Value $lines

Write-Host "Solicitacao LGPD gerada em $outputFile"
