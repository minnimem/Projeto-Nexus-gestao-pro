param(
    [Parameter(Mandatory = $true)]
    [string]$Titulo,

    [ValidateSet("Feedback/NPS", "Incidente", "Comercial", "Suporte", "Implantacao", "Interno", "Outro")]
    [string]$Origem = "Feedback/NPS",

    [string]$Cliente = "Nao informado",

    [string]$Modulo = "Produto",

    [ValidateRange(0, 25)]
    [int]$ImpactoComercial = 15,

    [ValidateRange(0, 20)]
    [int]$ImpactoOperacional = 12,

    [ValidateRange(0, 15)]
    [int]$RecorrenciaClientes = 8,

    [ValidateRange(0, 15)]
    [int]$ReducaoRiscoSuporte = 8,

    [ValidateRange(0, 15)]
    [int]$AlinhamentoProduto = 10,

    [ValidateRange(0, 10)]
    [int]$BaixoEsforco = 5,

    [ValidateSet("Bug", "Melhoria", "Customizacao", "Treinamento", "Pendencia", "Ideia")]
    [string]$Tipo = "Melhoria",

    [string]$Descricao = "Descrever contexto, evidencia e resultado esperado.",

    [string]$Responsavel = "Nexus One",

    [string]$OutputDir = "reports\produto"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$resolvedOutput = if ([System.IO.Path]::IsPathRooted($OutputDir)) {
    $OutputDir
} else {
    Join-Path $root $OutputDir
}

New-Item -ItemType Directory -Force -Path $resolvedOutput | Out-Null

$slug = ($Titulo -replace '[^a-zA-Z0-9_-]+', '-').Trim('-').ToLowerInvariant()
if ([string]::IsNullOrWhiteSpace($slug)) {
    $slug = "roadmap"
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$arquivo = Join-Path $resolvedOutput "priorizacao-roadmap-$slug-$timestamp.txt"

$total = $ImpactoComercial + $ImpactoOperacional + $RecorrenciaClientes + $ReducaoRiscoSuporte + $AlinhamentoProduto + $BaixoEsforco

if ($total -lt 40) {
    $decisao = "NAO PRIORIZAR AGORA"
    $proximaAcao = "Manter como ideia/backlog frio e reavaliar se houver recorrencia."
} elseif ($total -lt 60) {
    $decisao = "BACKLOG MONITORADO"
    $proximaAcao = "Monitorar repeticao em clientes, suporte ou comercial antes de planejar."
} elseif ($total -lt 80) {
    $decisao = "PLANEJAR PROXIMA JANELA"
    $proximaAcao = "Detalhar escopo, risco, dependencia e encaixar em proximo ciclo."
} else {
    $decisao = "PRIORIDADE ALTA"
    $proximaAcao = "Avaliar inclusao no proximo ciclo/release e comunicar partes interessadas."
}

$alertas = New-Object System.Collections.Generic.List[string]
if ($Tipo -eq "Bug" -and $total -lt 60) {
    $alertas.Add("Item classificado como bug: revisar prioridade por impacto real, nao apenas score.")
}
if ($Tipo -eq "Customizacao" -and $AlinhamentoProduto -lt 8) {
    $alertas.Add("Customizacao com baixo alinhamento: avaliar contrato, custo e manutencao antes de aceitar.")
}
if ($Origem -eq "Comercial" -and $ImpactoComercial -ge 20) {
    $alertas.Add("Possivel bloqueio comercial: nao prometer prazo sem aprovacao formal.")
}
if ($Tipo -eq "Treinamento" -and $BaixoEsforco -ge 7) {
    $alertas.Add("Pode ser resolvido com artigo/treinamento antes de desenvolvimento.")
}

$linhas = New-Object System.Collections.Generic.List[string]
$linhas.Add("PRIORIZACAO DE ROADMAP - NEXUS ONE")
$linhas.Add("Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')")
$linhas.Add("Titulo: $Titulo")
$linhas.Add("Cliente/origem: $Cliente")
$linhas.Add("Origem: $Origem")
$linhas.Add("Modulo: $Modulo")
$linhas.Add("Tipo: $Tipo")
$linhas.Add("Responsavel: $Responsavel")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("SCORE")
$linhas.Add("============================================================")
$linhas.Add("- Impacto comercial/receita: $ImpactoComercial / 25")
$linhas.Add("- Impacto operacional/retencao: $ImpactoOperacional / 20")
$linhas.Add("- Recorrencia entre clientes: $RecorrenciaClientes / 15")
$linhas.Add("- Reducao de risco/suporte: $ReducaoRiscoSuporte / 15")
$linhas.Add("- Alinhamento com produto padrao: $AlinhamentoProduto / 15")
$linhas.Add("- Baixo esforco relativo: $BaixoEsforco / 10")
$linhas.Add("")
$linhas.Add("Total: $total / 100")
$linhas.Add("Decisao: $decisao")
$linhas.Add("Proxima acao: $proximaAcao")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("DESCRICAO E EVIDENCIA")
$linhas.Add("============================================================")
$linhas.Add($Descricao)
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("CHECKLIST")
$linhas.Add("============================================================")
$linhas.Add("- [ ] Evidencia anexada: feedback, incidente, venda, suporte ou implantacao.")
$linhas.Add("- [ ] Tipo separado corretamente: bug, melhoria, customizacao, treinamento ou pendencia.")
$linhas.Add("- [ ] Impacto comercial e operacional revisado.")
$linhas.Add("- [ ] Dependencias externas avaliadas.")
$linhas.Add("- [ ] Comunicacao ao cliente definida quando houver promessa ou expectativa.")
$linhas.Add("- [ ] Base de conhecimento atualizada quando for duvida recorrente.")
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
$linhas.Add("- docs\PROCESSO_PRIORIZACAO_ROADMAP_CLIENTE_NEXUS_ONE.md")
$linhas.Add("- docs\PROCESSO_FEEDBACK_NPS_CLIENTE_NEXUS_ONE.md")
$linhas.Add("- docs\BASE_CONHECIMENTO_SUPORTE_CLIENTE_NEXUS_ONE.md")
$linhas.Add("- docs\LISTA_CONSOLIDADA_MELHORIAS_SUGESTOES_NEXUS_ONE.txt")

$linhas | Set-Content -LiteralPath $arquivo -Encoding UTF8

Write-Host "Priorizacao de roadmap gerada: $arquivo"
