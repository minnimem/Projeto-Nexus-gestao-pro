param(
    [string]$Lote = "Lote 1",

    [string]$Responsavel = "Nexus One",

    [ValidateRange(0, 999)]
    [int]$Oportunidades = 0,

    [ValidateRange(0, 999)]
    [int]$Propostas = 0,

    [ValidateRange(0, 999)]
    [int]$Fechamentos = 0,

    [ValidateRange(0, 999)]
    [int]$ClientesVerde = 0,

    [ValidateRange(0, 999)]
    [int]$ClientesAmarelo = 0,

    [ValidateRange(0, 999)]
    [int]$ClientesVermelho = 0,

    [ValidateRange(0, 999)]
    [int]$IncidentesCriticos = 0,

    [ValidateRange(0, 999)]
    [int]$PendenciasBloqueantes = 0,

    [ValidateRange(0, 999)]
    [int]$PacotesEntregaCompletos = 0,

    [ValidateRange(0, 999)]
    [int]$ClientesComAceite = 0,

    [ValidateRange(0, 999)]
    [int]$PromessasForaEscopo = 0,

    [ValidateRange(1, 10)]
    [int]$MaxImplantacoesSimultaneas = 2,

    [string]$Observacoes = "Sem observacoes adicionais.",

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
$arquivo = Join-Path $resolvedOutput "resultado-lote-comercial-$slug-$timestamp.txt"

$taxaProposta = if ($Oportunidades -gt 0) { [math]::Round(($Propostas / $Oportunidades) * 100, 0) } else { 0 }
$taxaFechamento = if ($Propostas -gt 0) { [math]::Round(($Fechamentos / $Propostas) * 100, 0) } else { 0 }
$clientesAtivos = $ClientesVerde + $ClientesAmarelo + $ClientesVermelho
$percentualVerde = if ($clientesAtivos -gt 0) { [math]::Round(($ClientesVerde / $clientesAtivos) * 100, 0) } else { 0 }
$percentualPacote = if ($Fechamentos -gt 0) { [math]::Round(($PacotesEntregaCompletos / $Fechamentos) * 100, 0) } else { 0 }
$percentualAceite = if ($Fechamentos -gt 0) { [math]::Round(($ClientesComAceite / $Fechamentos) * 100, 0) } else { 0 }

$scoreConversao = if ($Oportunidades -eq 0) {
    0
} elseif ($taxaProposta -ge 60 -and $taxaFechamento -ge 40) {
    25
} elseif ($taxaProposta -ge 40 -and $taxaFechamento -ge 25) {
    18
} elseif ($taxaProposta -ge 25 -or $taxaFechamento -ge 15) {
    10
} else {
    4
}

$scoreEntrega = if ($Fechamentos -eq 0) {
    0
} elseif ($PacotesEntregaCompletos -ge $Fechamentos -and $ClientesComAceite -ge $Fechamentos -and $Fechamentos -le $MaxImplantacoesSimultaneas) {
    25
} elseif ($PacotesEntregaCompletos -gt 0 -and $ClientesComAceite -gt 0 -and $Fechamentos -le $MaxImplantacoesSimultaneas) {
    17
} elseif ($PacotesEntregaCompletos -gt 0 -or $ClientesComAceite -gt 0) {
    10
} else {
    3
}

$scoreSaude = if ($clientesAtivos -eq 0) {
    0
} elseif ($ClientesVermelho -eq 0 -and $percentualVerde -ge 80) {
    25
} elseif ($ClientesVermelho -eq 0 -and $percentualVerde -ge 60) {
    18
} elseif ($ClientesVermelho -le 1) {
    9
} else {
    3
}

$scoreSuporte = if ($IncidentesCriticos -eq 0 -and $PendenciasBloqueantes -eq 0) {
    15
} elseif ($IncidentesCriticos -eq 0 -and $PendenciasBloqueantes -le 1) {
    9
} else {
    2
}

$scoreEscopo = if ($PromessasForaEscopo -eq 0) {
    10
} elseif ($PromessasForaEscopo -le 1) {
    5
} else {
    1
}

$pontuacaoLote = $scoreConversao + $scoreEntrega + $scoreSaude + $scoreSuporte + $scoreEscopo

$alertas = New-Object System.Collections.Generic.List[string]
if ($ClientesVermelho -gt 0) {
    $alertas.Add("Existe cliente Vermelho. Nao aumentar escala ate recuperar ou encerrar plano de correcao.")
}
if ($IncidentesCriticos -gt 0) {
    $alertas.Add("Existem incidentes P0/P1. Pausar expansao ate causa raiz e contorno estarem validados.")
}
if ($PendenciasBloqueantes -gt 0) {
    $alertas.Add("Existem pendencias bloqueantes. Nao abrir novo lote.")
}
if ($Fechamentos -gt $MaxImplantacoesSimultaneas) {
    $alertas.Add("Fechamentos acima do limite de implantacoes simultaneas.")
}
if ($Oportunidades -gt 0 -and $taxaProposta -lt 40) {
    $alertas.Add("Baixa conversao de oportunidade em proposta. Revisar perfil ideal, dor e mensagem.")
}
if ($PromessasForaEscopo -gt 0) {
    $alertas.Add("Existem promessas fora do escopo. Revisar proposta, one-page e aceite comercial.")
}
if ($Fechamentos -gt 0 -and $PacotesEntregaCompletos -lt $Fechamentos) {
    $alertas.Add("Nem todos os clientes fechados possuem pacote de entrega completo.")
}
if ($Fechamentos -gt 0 -and $ClientesComAceite -lt $Fechamentos) {
    $alertas.Add("Nem todos os clientes fechados possuem aceite registrado.")
}
if ($clientesAtivos -gt 0 -and $percentualVerde -lt 70) {
    $alertas.Add("Percentual de clientes Verde abaixo de 70%. Nao aumentar escala sem plano de recuperacao.")
}

if ($alertas.Count -gt 0) {
    $decisao = "PAUSAR OU CORRIGIR ANTES DE AUMENTAR ESCALA"
    $proximaAcao = "Tratar alertas, revisar suporte/implantacao e repetir avaliacao."
} elseif ($pontuacaoLote -ge 85 -and $ClientesVerde -ge 2 -and $Fechamentos -le $MaxImplantacoesSimultaneas -and $clientesAtivos -eq $ClientesVerde) {
    $decisao = "AUMENTAR ESCALA COM CONTROLE"
    $proximaAcao = "Abrir novo lote mantendo limites e pacote de entrega por cliente."
} elseif ($pontuacaoLote -ge 70 -and $Fechamentos -gt 0) {
    $decisao = "MANTER ESCALA ATUAL"
    $proximaAcao = "Corrigir pontos fracos e medir novo ciclo antes de aumentar limite."
} elseif ($Fechamentos -gt 0) {
    $decisao = "CORRIGIR PROCESSO ANTES DO PROXIMO LOTE"
    $proximaAcao = "Fechar plano de acao, revisar evidencias e repetir Go/No-Go."
} else {
    $decisao = "REPOSICIONAR OFERTA OU QUALIFICACAO"
    $proximaAcao = "Revisar canais, perfil ideal, demonstracao, one-page e objecoes."
}

$linhas = New-Object System.Collections.Generic.List[string]
$linhas.Add("RESULTADO DO LOTE COMERCIAL - NEXUS ONE")
$linhas.Add("Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')")
$linhas.Add("Lote: $Lote")
$linhas.Add("Responsavel: $Responsavel")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("INDICADORES")
$linhas.Add("============================================================")
$linhas.Add("- Oportunidades qualificadas: $Oportunidades")
$linhas.Add("- Propostas enviadas: $Propostas")
$linhas.Add("- Fechamentos: $Fechamentos")
$linhas.Add("- Taxa oportunidade -> proposta: $taxaProposta%")
$linhas.Add("- Taxa proposta -> fechamento: $taxaFechamento%")
$linhas.Add("- Clientes Verde: $ClientesVerde")
$linhas.Add("- Clientes Amarelo: $ClientesAmarelo")
$linhas.Add("- Clientes Vermelho: $ClientesVermelho")
$linhas.Add("- Percentual de clientes Verde: $percentualVerde%")
$linhas.Add("- Incidentes P0/P1: $IncidentesCriticos")
$linhas.Add("- Pendencias bloqueantes: $PendenciasBloqueantes")
$linhas.Add("- Pacotes de entrega completos: $PacotesEntregaCompletos de $Fechamentos ($percentualPacote%)")
$linhas.Add("- Clientes com aceite registrado: $ClientesComAceite de $Fechamentos ($percentualAceite%)")
$linhas.Add("- Promessas fora do escopo: $PromessasForaEscopo")
$linhas.Add("- Limite de implantacoes simultaneas: $MaxImplantacoesSimultaneas")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("PONTUACAO DO LOTE")
$linhas.Add("============================================================")
$linhas.Add("- Pontuacao total: $pontuacaoLote/100")
$linhas.Add("- Conversao comercial: $scoreConversao/25")
$linhas.Add("- Qualidade da entrega: $scoreEntrega/25")
$linhas.Add("- Saude dos clientes: $scoreSaude/25")
$linhas.Add("- Estabilidade de suporte: $scoreSuporte/15")
$linhas.Add("- Disciplina de escopo: $scoreEscopo/10")
$linhas.Add("")
$linhas.Add("Leitura:")
if ($pontuacaoLote -ge 85) {
    $linhas.Add("- Lote saudavel para aumentar escala com controle.")
} elseif ($pontuacaoLote -ge 70) {
    $linhas.Add("- Lote aceitavel, mas ainda sem folga para escala agressiva.")
} elseif ($pontuacaoLote -ge 50) {
    $linhas.Add("- Lote exige correcao operacional/comercial antes de novo ciclo.")
} else {
    $linhas.Add("- Lote fraco. Pausar, reposicionar ou reduzir oferta.")
}
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("DECISAO")
$linhas.Add("============================================================")
$linhas.Add("- Decisao recomendada: $decisao")
$linhas.Add("- Proxima acao: $proximaAcao")
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
$linhas.Add("OBSERVACOES")
$linhas.Add("============================================================")
$linhas.Add($Observacoes)
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("PLANO DE ACAO POS-LOTE")
$linhas.Add("============================================================")
if ($pontuacaoLote -ge 85 -and $alertas.Count -eq 0) {
    $linhas.Add("- Sem plano corretivo obrigatorio. Manter monitoramento e limite de capacidade.")
} else {
    $linhas.Add("- Registrar problema, causa, acao, dono, prazo e evidencia antes do proximo lote.")
    $linhas.Add("- Revisar ICP, proposta, pacote de entrega, aceite, suporte e promessas fora do escopo.")
    $linhas.Add("- Reexecutar matriz Go/No-Go antes de aumentar limite comercial.")
}
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("EVIDENCIAS PARA PROXIMO LOTE")
$linhas.Add("============================================================")
$linhas.Add("- Resultado do lote aprovado.")
$linhas.Add("- Decisao de expansao registrada.")
$linhas.Add("- Matriz de capacidade atualizada.")
$linhas.Add("- Pacote de entrega completo por cliente.")
$linhas.Add("- Saude/NPS dos clientes ativos revisada.")
$linhas.Add("- Bloqueios repetidos com plano de acao ou removidos.")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("REFERENCIAS")
$linhas.Add("============================================================")
$linhas.Add("- docs\RELATORIO_RESULTADO_LOTE_COMERCIAL_NEXUS_ONE.md")
$linhas.Add("- docs\PLANO_LANCAMENTO_COMERCIAL_CONTROLADO_NEXUS_ONE.md")
$linhas.Add("- docs\ROTINA_SUCESSO_CLIENTE_POS_IMPLANTACAO_NEXUS_ONE.md")
$linhas.Add("- docs\PLANO_LIBERACAO_COMERCIAL_AMPLA_NEXUS_ONE.md")

$linhas | Set-Content -LiteralPath $arquivo -Encoding UTF8

Write-Host "Resultado do lote comercial gerado: $arquivo"
