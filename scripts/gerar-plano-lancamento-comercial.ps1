param(
    [string]$Lote = "Lote 1",

    [string]$Responsavel = "Nexus One",

    [ValidateRange(1, 50)]
    [int]$MetaOportunidades = 5,

    [ValidateRange(1, 10)]
    [int]$MaxImplantacoesSimultaneas = 2,

    [string]$PerfilIdeal = "Comercio ou servico com venda, caixa, estoque, clientes e financeiro gerencial; baixa ou media complexidade fiscal.",

    [string]$Canais = "Indicacao, prospeccao consultiva, clientes conhecidos e demonstracao guiada.",

    [string]$Restricoes = "Nao prometer fiscal real, pagamentos reais, notificacoes externas, SLA especial ou customizacao sem contrato, homologacao e evidencia.",

    [string]$OutputDir = "reports\comercial"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$resolvedOutput = if ([System.IO.Path]::IsPathRooted($OutputDir)) {
    $OutputDir
} else {
    Join-Path $root $OutputDir
}

New-Item -ItemType Directory -Force -Path $resolvedOutput | Out-Null

$slug = ($Lote -replace '[^a-zA-Z0-9_-]+', '-').Trim('-').ToLowerInvariant()
if ([string]::IsNullOrWhiteSpace($slug)) {
    $slug = "lote"
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$arquivo = Join-Path $resolvedOutput "plano-lancamento-comercial-$slug-$timestamp.txt"

$alertas = New-Object System.Collections.Generic.List[string]
if ($MetaOportunidades -gt 10) {
    $alertas.Add("Meta de oportunidades alta para primeiro lote. Revisar capacidade de suporte e implantacao.")
}
if ($MaxImplantacoesSimultaneas -gt 2) {
    $alertas.Add("Mais de 2 implantacoes simultaneas aumenta risco operacional no lancamento controlado.")
}
if ($Restricoes -notmatch "fiscal|pagamento|notific|SLA|customiz") {
    $alertas.Add("Restricoes comerciais nao citam todos os pontos sensiveis. Revisar mensagem antes da campanha.")
}

$linhas = New-Object System.Collections.Generic.List[string]
$linhas.Add("PLANO DE LANCAMENTO COMERCIAL CONTROLADO - NEXUS ONE")
$linhas.Add("Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')")
$linhas.Add("Lote: $Lote")
$linhas.Add("Responsavel: $Responsavel")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("PORTAO DE ABERTURA DO LOTE")
$linhas.Add("============================================================")
$linhas.Add("- [ ] Cliente real usado como referencia interna possui aceite.")
$linhas.Add("- [ ] Saude do cliente real esta Verde.")
$linhas.Add("- [ ] Auditoria de evidencias nao possui bloqueio critico.")
$linhas.Add("- [ ] Capacidade operacional permite pelo menos 1 a 2 implantacoes simultaneas.")
$linhas.Add("- [ ] Comercial recebeu roteiro de promessa permitida e restricoes.")
$linhas.Add("- [ ] Implantacao possui agenda disponivel.")
$linhas.Add("- [ ] Suporte possui responsavel e SLA operacional.")
$linhas.Add("- [ ] Pagamentos, fiscal e notificacoes reais estao homologados ou fora do escopo.")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("LIMITES DO LOTE")
$linhas.Add("============================================================")
$linhas.Add("- Meta de oportunidades qualificadas: $MetaOportunidades")
$linhas.Add("- Maximo de implantacoes simultaneas: $MaxImplantacoesSimultaneas")
$linhas.Add("- Perfil ideal: $PerfilIdeal")
$linhas.Add("- Canais: $Canais")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("RESTRICOES COMERCIAIS")
$linhas.Add("============================================================")
$linhas.Add($Restricoes)
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("MENSAGEM PERMITIDA")
$linhas.Add("============================================================")
$linhas.Add("- Vendas, caixa, estoque, clientes, financeiro gerencial, relatorios e suporte operacional.")
$linhas.Add("- Implantacao acompanhada com escopo, treinamento, Go/No-Go e aceite.")
$linhas.Add("- Integracoes reais dependem de homologacao, provedor/canal, contrato e evidencia.")
$linhas.Add("- Resultado financeiro deve ser tratado como estimativa baseada em premissas.")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("GOVERNANCA DO LOTE")
$linhas.Add("============================================================")
$linhas.Add("- Semanal: oportunidades, propostas, fechamentos e gargalos comerciais.")
$linhas.Add("- A cada implantacao: handoff, cronograma, riscos, Go/No-Go e aceite.")
$linhas.Add("- D7/D15/D30 do cliente: saude, NPS, suporte e pendencias.")
$linhas.Add("- Fechamento do lote: resultado comercial, capacidade e decisao de expansao.")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("CRITERIOS PARA PAUSAR")
$linhas.Add("============================================================")
$linhas.Add("- Incidente P0/P1 recorrente.")
$linhas.Add("- Cliente Vermelho na rotina de sucesso.")
$linhas.Add("- Mais clientes em implantacao do que a capacidade definida.")
$linhas.Add("- Promessa comercial fora do escopo documentado.")
$linhas.Add("- Pendencia bloqueante repetida em mais de um cliente.")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("INDICADORES DO LOTE")
$linhas.Add("============================================================")
$linhas.Add("- [ ] Oportunidades qualificadas.")
$linhas.Add("- [ ] Propostas enviadas.")
$linhas.Add("- [ ] Fechamentos.")
$linhas.Add("- [ ] Tempo medio de implantacao.")
$linhas.Add("- [ ] Incidentes P0/P1.")
$linhas.Add("- [ ] Clientes Verde/Amarelo/Vermelho.")
$linhas.Add("- [ ] Pendencias bloqueantes por cliente.")
$linhas.Add("- [ ] Capacidade de suporte.")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("DECISAO POS-LOTE")
$linhas.Add("============================================================")
$linhas.Add("- [ ] Aumentar escala.")
$linhas.Add("- [ ] Manter volume atual.")
$linhas.Add("- [ ] Reduzir volume.")
$linhas.Add("- [ ] Pausar campanha.")
$linhas.Add("- [ ] Reposicionar oferta ou perfil ideal.")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("ALERTAS")
$linhas.Add("============================================================")
if ($alertas.Count -eq 0) {
    $linhas.Add("- Nenhum alerta automatico.")
} else {
    foreach ($alerta in $alertas) {
        $linhas.Add("- $alerta")
    }
}
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("REFERENCIAS")
$linhas.Add("============================================================")
$linhas.Add("- docs\PLANO_LANCAMENTO_COMERCIAL_CONTROLADO_NEXUS_ONE.md")
$linhas.Add("- docs\AUDITORIA_EVIDENCIAS_CLIENTE_REAL_NEXUS_ONE.md")
$linhas.Add("- docs\PLANO_LIBERACAO_COMERCIAL_AMPLA_NEXUS_ONE.md")
$linhas.Add("- docs\MATRIZ_PLANOS_COMERCIAIS_NEXUS_ONE.md")

$linhas | Set-Content -LiteralPath $arquivo -Encoding UTF8

Write-Host "Plano de lancamento comercial gerado: $arquivo"
