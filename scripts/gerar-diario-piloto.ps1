param(
    [string]$Cliente = "",
    [string]$Dia = "D1",
    [string]$Responsavel = "",
    [string]$OutputDir = "reports\piloto"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$resolvedOutput = if ([System.IO.Path]::IsPathRooted($OutputDir)) {
    $OutputDir
} else {
    Join-Path $root $OutputDir
}

if (-not (Test-Path -LiteralPath $resolvedOutput)) {
    New-Item -ItemType Directory -Path $resolvedOutput -Force | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$safeCliente = if ([string]::IsNullOrWhiteSpace($Cliente)) { "cliente" } else { ($Cliente -replace "[^a-zA-Z0-9_-]", "-") }
$safeDia = $Dia -replace "[^a-zA-Z0-9_-]", "-"
$outputFile = Join-Path $resolvedOutput "diario-piloto-$safeCliente-$safeDia-$timestamp.txt"

$lines = @(
    "DIARIO DE PILOTO ASSISTIDO - NEXUS ONE",
    "Data: " + (Get-Date -Format "dd/MM/yyyy HH:mm:ss"),
    "Cliente: $Cliente",
    "Dia do piloto: $Dia",
    "Responsavel: $Responsavel",
    "",
    "Objetivo do dia:",
    "-",
    "",
    "Go de entrada do dia:",
    "- [ ] Responsavel do cliente disponivel.",
    "- [ ] Ambiente acessivel.",
    "- [ ] Fluxo do dia definido.",
    "- [ ] Pendencias bloqueantes do dia anterior revisadas.",
    "",
    "Fluxos executados:",
    "- [ ] Login/acesso.",
    "- [ ] Venda/pedido/proposta.",
    "- [ ] Caixa/recebimento/fechamento.",
    "- [ ] Estoque/entrada/baixa.",
    "- [ ] Financeiro/conciliacao.",
    "- [ ] Fiscal/integracao conforme escopo.",
    "- [ ] Relatorios/exportacoes.",
    "- [ ] Suporte/incidente.",
    "",
    "Indicadores:",
    "- Pedidos criados:",
    "- Caixa fechado sem divergencia:",
    "- Estoque refletiu movimentacoes:",
    "- Financeiro conciliou com caixa/venda:",
    "- Backup localizado:",
    "- Incidentes P0/P1:",
    "- Pendencias bloqueantes:",
    "- Pendencias altas:",
    "- Usuario-chave operou sem suporte direto:",
    "",
    "Pendencias bloqueantes:",
    "-",
    "",
    "Pendencias altas:",
    "-",
    "",
    "Pendencias nao bloqueantes:",
    "-",
    "",
    "Riscos e contornos:",
    "- Risco:",
    "- Severidade: baixa / media / alta / bloqueante",
    "- Contorno:",
    "- Responsavel:",
    "- Prazo:",
    "",
    "Decisoes tomadas:",
    "-",
    "",
    "Decisao do dia:",
    "- [ ] Continua plano original.",
    "- [ ] Continua com ajuste.",
    "- [ ] Prorrogar atividade.",
    "- [ ] Pausar por pendencia bloqueante.",
    "",
    "Proxima acao:",
    "-"
)

Set-Content -LiteralPath $outputFile -Value $lines

Write-Host "Diario de piloto gerado em $outputFile"
