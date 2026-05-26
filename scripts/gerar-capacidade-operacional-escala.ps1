param(
    [string]$Lote = "Proximo lote",

    [string]$Responsavel = "Nexus One",

    [ValidateRange(0, 999)]
    [int]$OportunidadesPlanejadas = 5,

    [ValidateRange(0, 999)]
    [int]$FechamentosEsperados = 2,

    [ValidateRange(0, 999)]
    [int]$ImplantacoesSimultaneas = 2,

    [ValidateRange(0, 999)]
    [int]$CapacidadeImplantacao = 2,

    [ValidateRange(0, 999)]
    [int]$HorasImplantacaoDisponiveis = 16,

    [ValidateRange(0, 999)]
    [int]$ChamadosCriticosAbertos = 0,

    [ValidateRange(0, 999)]
    [int]$SlaEmRisco = 0,

    [ValidateRange(0, 999)]
    [int]$ClientesAmarelo = 0,

    [ValidateRange(0, 999)]
    [int]$ClientesVermelho = 0,

    [ValidateRange(0, 999)]
    [int]$PendenciasBloqueantes = 0,

    [ValidateRange(0, 999)]
    [int]$PromessasForaEscopo = 0,

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
$arquivo = Join-Path $resolvedOutput "capacidade-operacional-escala-$slug-$timestamp.txt"

$horasNecessarias = $ImplantacoesSimultaneas * 8
$folgaImplantacao = $HorasImplantacaoDisponiveis - $horasNecessarias

$scoreImplantacao = if ($CapacidadeImplantacao -eq 0 -or $ImplantacoesSimultaneas -gt $CapacidadeImplantacao -or $folgaImplantacao -lt 0) {
    5
} elseif ($ImplantacoesSimultaneas -eq $CapacidadeImplantacao -or $folgaImplantacao -lt 8) {
    18
} else {
    30
}

$scoreSuporte = if ($ChamadosCriticosAbertos -gt 0 -or $SlaEmRisco -gt 0) {
    5
} elseif ($ClientesAmarelo -gt 0) {
    16
} else {
    25
}

$scoreBase = if ($ClientesVermelho -gt 0) {
    3
} elseif ($ClientesAmarelo -gt 0) {
    12
} else {
    20
}

$scoreProdutoInfra = if ($PendenciasBloqueantes -gt 0 -or $ChamadosCriticosAbertos -gt 0) {
    3
} else {
    15
}

$scoreComercialEscopo = if ($PromessasForaEscopo -gt 0) {
    2
} elseif ($OportunidadesPlanejadas -gt 10 -or $FechamentosEsperados -gt $CapacidadeImplantacao) {
    6
} else {
    10
}

$scoreCapacidade = $scoreImplantacao + $scoreSuporte + $scoreBase + $scoreProdutoInfra + $scoreComercialEscopo

$alertas = New-Object System.Collections.Generic.List[string]
if ($ImplantacoesSimultaneas -gt $CapacidadeImplantacao) {
    $alertas.Add("Implantacoes simultaneas acima da capacidade declarada.")
}
if ($FechamentosEsperados -gt $CapacidadeImplantacao) {
    $alertas.Add("Fechamentos esperados acima da capacidade declarada de implantacao.")
}
if ($folgaImplantacao -lt 0) {
    $alertas.Add("Horas disponiveis de implantacao nao cobrem a demanda planejada.")
}
if ($ChamadosCriticosAbertos -gt 0) {
    $alertas.Add("Existem chamados criticos abertos.")
}
if ($SlaEmRisco -gt 0) {
    $alertas.Add("Existem SLAs em risco.")
}
if ($ClientesVermelho -gt 0) {
    $alertas.Add("Existem clientes Vermelho.")
}
if ($PendenciasBloqueantes -gt 0) {
    $alertas.Add("Existem pendencias bloqueantes.")
}
if ($PromessasForaEscopo -gt 0) {
    $alertas.Add("Existem promessas comerciais fora do escopo.")
}
if ($OportunidadesPlanejadas -gt 10) {
    $alertas.Add("Oportunidades planejadas acima de 10 exigem revisao de capacidade comercial e suporte.")
}

$pressao = 0
if ($ImplantacoesSimultaneas -ge $CapacidadeImplantacao -and $CapacidadeImplantacao -gt 0) { $pressao++ }
if ($FechamentosEsperados -ge $CapacidadeImplantacao -and $CapacidadeImplantacao -gt 0) { $pressao++ }
if ($folgaImplantacao -lt 8) { $pressao++ }
if ($ClientesAmarelo -gt 0) { $pressao++ }
if ($OportunidadesPlanejadas -gt 5) { $pressao++ }

if ($ChamadosCriticosAbertos -gt 0 -or $SlaEmRisco -gt 0 -or $ClientesVermelho -gt 0 -or $PendenciasBloqueantes -gt 0 -or $PromessasForaEscopo -gt 0 -or $scoreCapacidade -lt 50) {
    $decisao = "NO-GO PARA NOVO LOTE"
    $proximaAcao = "Corrigir bloqueios antes de abrir novas vendas."
} elseif ($scoreCapacidade -lt 70 -or $pressao -ge 3) {
    $decisao = "CAPACIDADE PRESSIONADA"
    $proximaAcao = "Manter escala atual e revisar em 7 a 14 dias."
} elseif ($scoreCapacidade -lt 85 -or $pressao -ge 1) {
    $decisao = "CAPACIDADE NO LIMITE"
    $proximaAcao = "Abrir lote pequeno com acompanhamento semanal."
} else {
    $decisao = "CAPACIDADE SAUDAVEL"
    $proximaAcao = "Pode abrir novo lote com os limites definidos."
}

$linhas = New-Object System.Collections.Generic.List[string]
$linhas.Add("MATRIZ DE CAPACIDADE OPERACIONAL PARA ESCALA - NEXUS ONE")
$linhas.Add("Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')")
$linhas.Add("Lote/escopo avaliado: $Lote")
$linhas.Add("Responsavel: $Responsavel")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("CAPACIDADE INFORMADA")
$linhas.Add("============================================================")
$linhas.Add("- Oportunidades planejadas: $OportunidadesPlanejadas")
$linhas.Add("- Fechamentos esperados: $FechamentosEsperados")
$linhas.Add("- Implantacoes simultaneas planejadas: $ImplantacoesSimultaneas")
$linhas.Add("- Capacidade declarada de implantacao simultanea: $CapacidadeImplantacao")
$linhas.Add("- Horas de implantacao disponiveis: $HorasImplantacaoDisponiveis")
$linhas.Add("- Horas estimadas necessarias: $horasNecessarias")
$linhas.Add("- Folga estimada de implantacao: $folgaImplantacao")
$linhas.Add("- Chamados criticos abertos: $ChamadosCriticosAbertos")
$linhas.Add("- SLAs em risco: $SlaEmRisco")
$linhas.Add("- Clientes Amarelo: $ClientesAmarelo")
$linhas.Add("- Clientes Vermelho: $ClientesVermelho")
$linhas.Add("- Pendencias bloqueantes: $PendenciasBloqueantes")
$linhas.Add("- Promessas fora do escopo: $PromessasForaEscopo")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("SCORE DE CAPACIDADE")
$linhas.Add("============================================================")
$linhas.Add("- Score total: $scoreCapacidade/100")
$linhas.Add("- Implantacao: $scoreImplantacao/30")
$linhas.Add("- Suporte/SLA: $scoreSuporte/25")
$linhas.Add("- Saude da base: $scoreBase/20")
$linhas.Add("- Produto/Infra: $scoreProdutoInfra/15")
$linhas.Add("- Comercial/Escopo: $scoreComercialEscopo/10")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("DECISAO")
$linhas.Add("============================================================")
$linhas.Add("- Resultado: $decisao")
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
$linhas.Add("CHECKLIST")
$linhas.Add("============================================================")
$linhas.Add("- [ ] Comercial revisou mensagem e limites.")
$linhas.Add("- [ ] Implantacao confirmou capacidade.")
$linhas.Add("- [ ] Suporte confirmou SLA e fila.")
$linhas.Add("- [ ] Sucesso revisou saude dos clientes ativos.")
$linhas.Add("- [ ] Produto revisou incidentes e pendencias.")
$linhas.Add("- [ ] Decisao de expansao sera atualizada com este resultado.")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("OBSERVACOES")
$linhas.Add("============================================================")
$linhas.Add($Observacoes)
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("REFERENCIAS")
$linhas.Add("============================================================")
$linhas.Add("- docs\MATRIZ_CAPACIDADE_OPERACIONAL_ESCALA_NEXUS_ONE.md")
$linhas.Add("- docs\DECISAO_EXPANSAO_COMERCIAL_POS_LOTE_NEXUS_ONE.md")
$linhas.Add("- docs\PLANO_LANCAMENTO_COMERCIAL_CONTROLADO_NEXUS_ONE.md")
$linhas.Add("- docs\POLITICA_SLA_SUPORTE_NEXUS_ONE.md")

$linhas | Set-Content -LiteralPath $arquivo -Encoding UTF8

Write-Host "Capacidade operacional gerada: $arquivo"
