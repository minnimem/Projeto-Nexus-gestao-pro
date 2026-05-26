param(
    [string]$Cliente = "",
    [string]$Plano = "Piloto assistido",
    [string]$Responsavel = "",
    [string]$OutputDir = "reports\comercial"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$safeCliente = if ([string]::IsNullOrWhiteSpace($Cliente)) { "cliente" } else { ($Cliente -replace "[^a-zA-Z0-9_-]", "-") }
$proposalFile = Join-Path $OutputDir "proposta-controlada-$safeCliente-$timestamp.txt"

$lines = @(
    "PROPOSTA COMERCIAL CONTROLADA - NEXUS ONE",
    "Data: " + (Get-Date -Format "dd/MM/yyyy HH:mm:ss"),
    "Cliente: $Cliente",
    "Plano/escopo: $Plano",
    "Responsavel: $Responsavel",
    "",
    "1. Objetivo",
    "Implantar o Nexus One em demonstracao, piloto assistido ou producao controlada, com escopo claro, acompanhamento e criterios de aceite.",
    "",
    "2. Modulos base incluidos",
    "- Vendas, pedidos, propostas, CRM e separacao.",
    "- Caixa/PDV, recebimentos, sangria, suprimento e fechamento.",
    "- Clientes e historico comercial.",
    "- Estoque, compras, inventario, alertas e etiquetas.",
    "- Financeiro gerencial, contas, cobrancas, DRE, conciliacao e fluxo.",
    "- Fiscal controlado/homologacao conforme escopo.",
    "- Relatorios, BI operacional e exportacoes.",
    "- Usuarios, permissoes, auditoria e suporte operacional.",
    "",
    "3. Condicoes para producao controlada",
    "- Deploy definitivo validado.",
    "- Banco de producao provisionado.",
    "- Backup agendado e restauracao testada.",
    "- Monitoramento com alerta configurado.",
    "- Smoke test operacional aprovado.",
    "- Matriz Go/No-Go sem pendencia bloqueante.",
    "- Termo de aceite assinado.",
    "",
    "4. Integracoes condicionadas",
    "- Pix/boleto real dependem de homologacao Asaas ponta a ponta.",
    "- Notificacoes reais dependem de canal, webhook e token do cliente.",
    "- Fiscal real depende de certificado, credenciamento, contador, provedor/SEFAZ/municipio e homologacao oficial por modelo.",
    "- Monitoramento externo depende de webhook/canal real de alerta.",
    "",
    "5. Nao incluso sem homologacao formal",
    "- Emissao fiscal oficial em producao sem aceite fiscal.",
    "- Recebimento real Pix/boleto sem prova de baixa por webhook.",
    "- Envio real de notificacoes sem evidencia do canal.",
    "- Producao ampla sem ciclos reais assistidos.",
    "",
    "6. Aceite",
    "A liberacao comercial segue docs/MATRIZ_GO_NO_GO_COMERCIAL_NEXUS_ONE.md e docs/TERMO_ACEITE_IMPLANTACAO_NEXUS_ONE.md.",
    "",
    "Pendencias e observacoes:",
    "-"
)

Set-Content -LiteralPath $proposalFile -Value $lines

Write-Host "Proposta controlada gerada em $proposalFile"
