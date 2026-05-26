param(
    [string]$Lote = "Proximo lote",

    [string]$Responsavel = "Nexus One",

    [ValidateRange(0, 9999999)]
    [decimal]$ReceitaMensal = 0,

    [ValidateRange(0, 9999999)]
    [decimal]$ReceitaImplantacao = 0,

    [ValidateRange(0, 9999999)]
    [decimal]$CustoInfraMensal = 0,

    [ValidateRange(0, 9999999)]
    [decimal]$CustoSuporteMensal = 0,

    [ValidateRange(0, 9999999)]
    [decimal]$CustoImplantacao = 0,

    [ValidateRange(0, 9999999)]
    [decimal]$CustoComercial = 0,

    [ValidateRange(0, 9999999)]
    [decimal]$Descontos = 0,

    [ValidateRange(0, 100)]
    [decimal]$MargemMinima = 35,

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
$arquivo = Join-Path $resolvedOutput "viabilidade-financeira-escala-$slug-$timestamp.txt"
$culture = [System.Globalization.CultureInfo]::GetCultureInfo("pt-BR")

$receitaTotalPrimeiroCiclo = $ReceitaMensal + $ReceitaImplantacao - $Descontos
$custoTotalPrimeiroCiclo = $CustoInfraMensal + $CustoSuporteMensal + $CustoImplantacao + $CustoComercial
$resultadoPrimeiroCiclo = $receitaTotalPrimeiroCiclo - $custoTotalPrimeiroCiclo
$margemPrimeiroCiclo = if ($receitaTotalPrimeiroCiclo -gt 0) {
    [math]::Round(($resultadoPrimeiroCiclo / $receitaTotalPrimeiroCiclo) * 100, 1)
} else {
    0
}

$resultadoRecorrente = $ReceitaMensal - $CustoInfraMensal - $CustoSuporteMensal
$margemRecorrente = if ($ReceitaMensal -gt 0) {
    [math]::Round(($resultadoRecorrente / $ReceitaMensal) * 100, 1)
} else {
    0
}

$alertas = New-Object System.Collections.Generic.List[string]
if ($ReceitaMensal -le 0) {
    $alertas.Add("Receita mensal zerada. Lote nao sustenta recorrencia.")
}
if ($ReceitaImplantacao -lt $CustoImplantacao) {
    $alertas.Add("Receita de implantacao menor que custo de implantacao.")
}
if ($Descontos -gt ($ReceitaMensal * 0.3) -and $ReceitaMensal -gt 0) {
    $alertas.Add("Descontos acima de 30% da receita mensal prevista.")
}
if ($margemRecorrente -lt $MargemMinima) {
    $alertas.Add("Margem recorrente abaixo da margem minima definida.")
}

if ($ReceitaMensal -le 0 -or $margemRecorrente -lt 15 -or $margemPrimeiroCiclo -lt 15) {
    $decisao = "NO-GO FINANCEIRO PARA ESCALA"
    $proximaAcao = "Revisar preco, escopo, descontos, custos ou capacidade antes de vender mais."
} elseif ($margemRecorrente -lt $MargemMinima -or $margemPrimeiroCiclo -lt $MargemMinima) {
    $decisao = "CORRIGIR PRECO OU CUSTO ANTES DE AUMENTAR"
    $proximaAcao = "Manter escala controlada e ajustar proposta/planos."
} elseif ($margemRecorrente -lt 55) {
    $decisao = "VIAVEL COM CONTROLE"
    $proximaAcao = "Abrir lote pequeno e acompanhar margem real."
} else {
    $decisao = "VIAVEL PARA ESCALA CONTROLADA"
    $proximaAcao = "Pode seguir para decisao de expansao mantendo limites operacionais."
}

$linhas = New-Object System.Collections.Generic.List[string]
$linhas.Add("VIABILIDADE FINANCEIRA PARA ESCALA - NEXUS ONE")
$linhas.Add("Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')")
$linhas.Add("Lote/escopo avaliado: $Lote")
$linhas.Add("Responsavel: $Responsavel")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("ENTRADAS")
$linhas.Add("============================================================")
$linhas.Add("- Receita mensal prevista: $($ReceitaMensal.ToString('C', $culture))")
$linhas.Add("- Receita de implantacao prevista: $($ReceitaImplantacao.ToString('C', $culture))")
$linhas.Add("- Custo mensal de infraestrutura: $($CustoInfraMensal.ToString('C', $culture))")
$linhas.Add("- Custo mensal de suporte: $($CustoSuporteMensal.ToString('C', $culture))")
$linhas.Add("- Custo de implantacao: $($CustoImplantacao.ToString('C', $culture))")
$linhas.Add("- Custo comercial: $($CustoComercial.ToString('C', $culture))")
$linhas.Add("- Descontos/cortesias: $($Descontos.ToString('C', $culture))")
$linhas.Add("- Margem minima definida: $MargemMinima%")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("RESULTADO")
$linhas.Add("============================================================")
$linhas.Add("- Receita total primeiro ciclo: $($receitaTotalPrimeiroCiclo.ToString('C', $culture))")
$linhas.Add("- Custo total primeiro ciclo: $($custoTotalPrimeiroCiclo.ToString('C', $culture))")
$linhas.Add("- Resultado primeiro ciclo: $($resultadoPrimeiroCiclo.ToString('C', $culture))")
$linhas.Add("- Margem primeiro ciclo: $margemPrimeiroCiclo%")
$linhas.Add("- Resultado recorrente mensal: $($resultadoRecorrente.ToString('C', $culture))")
$linhas.Add("- Margem recorrente mensal: $margemRecorrente%")
$linhas.Add("- Decisao: $decisao")
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
$linhas.Add("- [ ] Descontos possuem prazo e motivo.")
$linhas.Add("- [ ] Implantacao cobre configuracao, treinamento e acompanhamento.")
$linhas.Add("- [ ] Integracoes reais foram cobradas ou ficaram fora do escopo.")
$linhas.Add("- [ ] Suporte prometido cabe no plano contratado.")
$linhas.Add("- [ ] Margem foi revisada antes da decisao de expansao.")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("OBSERVACOES")
$linhas.Add("============================================================")
$linhas.Add($Observacoes)
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("REFERENCIAS")
$linhas.Add("============================================================")
$linhas.Add("- docs\MATRIZ_VIABILIDADE_FINANCEIRA_ESCALA_NEXUS_ONE.md")
$linhas.Add("- docs\MATRIZ_PLANOS_COMERCIAIS_NEXUS_ONE.md")
$linhas.Add("- docs\DECISAO_EXPANSAO_COMERCIAL_POS_LOTE_NEXUS_ONE.md")
$linhas.Add("- docs\PROCESSO_FATURAMENTO_CLIENTE_NEXUS_ONE.md")

$linhas | Set-Content -LiteralPath $arquivo -Encoding UTF8

Write-Host "Viabilidade financeira gerada: $arquivo"
