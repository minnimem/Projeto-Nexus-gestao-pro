param(
    [Parameter(Mandatory = $true)]
    [string]$Cliente,

    [string]$Segmento = "Comercio varejista",

    [ValidateRange(0, 20)]
    [int]$DorClara = 15,

    [ValidateRange(0, 15)]
    [int]$Decisor = 10,

    [ValidateRange(0, 15)]
    [int]$EscopoCompativel = 10,

    [ValidateRange(0, 15)]
    [int]$DadosResponsaveis = 10,

    [ValidateRange(0, 15)]
    [int]$IntegracoesNaoBloqueantes = 10,

    [ValidateRange(0, 10)]
    [int]$OrcamentoUrgencia = 5,

    [ValidateRange(0, 10)]
    [int]$FitPlano = 5,

    [string]$Responsavel = "Nexus One",

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

$slug = ($Cliente -replace '[^a-zA-Z0-9_-]+', '-').Trim('-').ToLowerInvariant()
if ([string]::IsNullOrWhiteSpace($slug)) {
    $slug = "cliente"
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$arquivo = Join-Path $resolvedOutput "qualificacao-oportunidade-$slug-$timestamp.txt"

$total = $DorClara + $Decisor + $EscopoCompativel + $DadosResponsaveis + $IntegracoesNaoBloqueantes + $OrcamentoUrgencia + $FitPlano

if ($total -lt 40) {
    $decisao = "NUTRIR/PAUSAR"
    $proximoPasso = "Nao gerar proposta ainda. Registrar motivos, pendencias e retomar quando houver dor, decisor ou escopo mais claro."
    $fit = "Fit fraco"
    $risco = "Alto"
} elseif ($total -lt 60) {
    $decisao = "DIAGNOSTICO ANTES DE DEMO"
    $proximoPasso = "Preencher ficha de diagnostico/coleta antes de investir em demo completa ou proposta."
    $fit = "Fit em validacao"
    $risco = "Medio/alto"
} elseif ($total -lt 80) {
    $decisao = "DEMO + PROPOSTA CONTROLADA"
    $proximoPasso = "Conduzir demo focada na dor principal e preparar proposta controlada com limites e dependencias."
    $fit = "Fit bom com risco controlavel"
    $risco = "Medio"
} else {
    $decisao = "PROPOSTA + PILOTO ASSISTIDO"
    $proximoPasso = "Gerar proposta, escopo do plano e preparar handoff para piloto assistido/producao controlada."
    $fit = "Fit forte"
    $risco = "Baixo/medio"
}

$acoesAntesProposta = New-Object System.Collections.Generic.List[string]
if ($DorClara -lt 14) {
    $acoesAntesProposta.Add("Detalhar dor principal e impacto operacional antes de proposta.")
}
if ($Decisor -lt 10) {
    $acoesAntesProposta.Add("Identificar decisor e responsavel operacional.")
}
if ($EscopoCompativel -lt 10) {
    $acoesAntesProposta.Add("Reduzir escopo inicial ou separar fase 2/customizacoes.")
}
if ($DadosResponsaveis -lt 10) {
    $acoesAntesProposta.Add("Definir responsaveis por dados, fiscal, financeiro, TI e LGPD.")
}
if ($IntegracoesNaoBloqueantes -lt 10) {
    $acoesAntesProposta.Add("Classificar integracoes obrigatorias e registrar homologacoes pendentes.")
}
if ($OrcamentoUrgencia -lt 6) {
    $acoesAntesProposta.Add("Validar orcamento, urgencia e janela real de decisao.")
}
if ($FitPlano -lt 6) {
    $acoesAntesProposta.Add("Revisar plano sugerido, limites e adicionais.")
}

$linhas = New-Object System.Collections.Generic.List[string]
$linhas.Add("QUALIFICACAO DE OPORTUNIDADE COMERCIAL - NEXUS ONE")
$linhas.Add("Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')")
$linhas.Add("Cliente: $Cliente")
$linhas.Add("Segmento: $Segmento")
$linhas.Add("Responsavel: $Responsavel")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("SCORE")
$linhas.Add("============================================================")
$linhas.Add("- Dor clara e relevante: $DorClara / 20")
$linhas.Add("- Decisor identificado: $Decisor / 15")
$linhas.Add("- Escopo compativel com produto atual: $EscopoCompativel / 15")
$linhas.Add("- Dados e responsaveis disponiveis: $DadosResponsaveis / 15")
$linhas.Add("- Integracoes nao bloqueantes: $IntegracoesNaoBloqueantes / 15")
$linhas.Add("- Orcamento e urgencia coerentes: $OrcamentoUrgencia / 10")
$linhas.Add("- Fit do plano comercial: $FitPlano / 10")
$linhas.Add("")
$linhas.Add("Total: $total / 100")
$linhas.Add("Decisao: $decisao")
$linhas.Add("Fit comercial: $fit")
$linhas.Add("Risco comercial: $risco")
$linhas.Add("Proximo passo: $proximoPasso")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("ACOES ANTES DA PROPOSTA")
$linhas.Add("============================================================")
if ($acoesAntesProposta.Count -eq 0) {
    $linhas.Add("- Nenhuma acao critica automatica. Revisar manualmente limites, integracoes e aceite.")
} else {
    foreach ($acao in $acoesAntesProposta) {
        $linhas.Add("- $acao")
    }
}
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("CHECKLIST ANTES DE AVANCAR")
$linhas.Add("============================================================")
$linhas.Add("- [ ] Dor principal registrada.")
$linhas.Add("- [ ] Decisor e usuarios-chave identificados.")
$linhas.Add("- [ ] Usuarios, filiais, caixas e modulos estimados.")
$linhas.Add("- [ ] Responsaveis por dados, financeiro, fiscal/contador, TI e LGPD definidos.")
$linhas.Add("- [ ] Integracoes externas classificadas como obrigatorias, desejaveis ou fora do escopo.")
$linhas.Add("- [ ] Limites de plano e dependencias externas explicados.")
$linhas.Add("- [ ] Proximo artefato definido: diagnostico, demo, proposta, handoff ou pausa.")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("RED FLAGS A REVISAR")
$linhas.Add("============================================================")
$linhas.Add("- Fiscal real imediato sem certificado, contador ou credenciamento.")
$linhas.Add("- Producao ampla solicitada sem piloto assistido.")
$linhas.Add("- Ausencia de decisor ou responsavel operacional.")
$linhas.Add("- Integracao obrigatoria nao homologada.")
$linhas.Add("- Customizacao grande fora do produto base.")
$linhas.Add("- Falta de dados, prazo ou responsavel para conferencia.")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("REFERENCIAS")
$linhas.Add("============================================================")
$linhas.Add("- docs\PLAYBOOK_COMERCIAL_QUALIFICACAO_NEXUS_ONE.md")
$linhas.Add("- docs\FICHA_DIAGNOSTICO_COLETA_CLIENTE_NEXUS_ONE.md")
$linhas.Add("- docs\ROTEIRO_DEMONSTRACAO_COMERCIAL_NEXUS_ONE.md")
$linhas.Add("- docs\MODELO_PROPOSTA_COMERCIAL_CONTROLADA_NEXUS_ONE.md")
$linhas.Add("- docs\MATRIZ_PLANOS_COMERCIAIS_NEXUS_ONE.md")

$linhas | Set-Content -LiteralPath $arquivo -Encoding UTF8

Write-Host "Qualificacao de oportunidade gerada: $arquivo"
