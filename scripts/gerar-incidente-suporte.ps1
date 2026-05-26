param(
    [string]$Cliente = "",
    [string]$Modulo = "",
    [ValidateSet("P0", "P1", "P2", "P3")]
    [string]$Prioridade = "P2",
    [string]$Resumo = "",
    [string]$Responsavel = "",
    [string]$OutputDir = "reports\suporte"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$safeCliente = if ([string]::IsNullOrWhiteSpace($Cliente)) { "cliente" } else { ($Cliente -replace "[^a-zA-Z0-9_-]", "-") }
$incidentFile = Join-Path $OutputDir "incidente-$safeCliente-$Prioridade-$timestamp.txt"

$sla = switch ($Prioridade) {
    "P0" { "Resposta ate 30 min; atualizacao a cada 30 min; acao imediata." }
    "P1" { "Resposta ate 2 h uteis; atualizacao a cada 4 h uteis." }
    "P2" { "Resposta ate 1 dia util; atualizacao conforme evolucao." }
    "P3" { "Resposta ate 3 dias uteis; avaliar backlog/melhoria." }
}

$lines = @(
    "INCIDENTE DE SUPORTE - NEXUS ONE",
    "Data abertura: " + (Get-Date -Format "dd/MM/yyyy HH:mm:ss"),
    "Cliente: $Cliente",
    "Modulo: $Modulo",
    "Prioridade: $Prioridade",
    "SLA: $sla",
    "Responsavel: $Responsavel",
    "Resumo: $Resumo",
    "",
    "Impacto:",
    "- Usuarios afetados:",
    "- Filial/empresa:",
    "- Fluxo afetado:",
    "- Impacto financeiro/fiscal:",
    "",
    "Coleta inicial:",
    "- Data/hora do erro:",
    "- Usuario afetado:",
    "- Passo a passo:",
    "- Mensagem de erro:",
    "- Pedido/caixa/lancamento/documento:",
    "- Evidencias anexadas:",
    "",
    "Acoes executadas:",
    "-",
    "",
    "Causa raiz:",
    "-",
    "",
    "Decisao:",
    "- [ ] Resolvido.",
    "- [ ] Contornado temporariamente.",
    "- [ ] Escalado para desenvolvimento.",
    "- [ ] Escalado para provedor externo.",
    "",
    "Encerramento:",
    "- Data/hora:",
    "- Responsavel:",
    "- Orientacao ao cliente:",
    "- Virou melhoria/backlog:",
    ""
)

Set-Content -LiteralPath $incidentFile -Value $lines

Write-Host "Ficha de incidente gerada em $incidentFile"
