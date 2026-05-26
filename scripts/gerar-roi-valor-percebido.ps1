param(
    [Parameter(Mandatory = $true)]
    [string]$Cliente,

    [ValidateRange(0, 999999)]
    [decimal]$Mensalidade = 349,

    [ValidateRange(0, 999999)]
    [decimal]$Implantacao = 1200,

    [ValidateRange(0, 10000)]
    [decimal]$HorasEconomizadasMes = 10,

    [ValidateRange(0, 9999)]
    [decimal]$CustoHora = 30,

    [ValidateRange(0, 999999)]
    [decimal]$ReducaoDivergenciaCaixa = 0,

    [ValidateRange(0, 999999)]
    [decimal]$ReducaoPerdaEstoque = 0,

    [ValidateRange(0, 999999)]
    [decimal]$RecuperacaoRecebimentos = 0,

    [string]$Premissas = "Estimativa conservadora baseada em informacoes do cliente; nao representa garantia de resultado.",

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
$arquivo = Join-Path $resolvedOutput "roi-valor-percebido-$slug-$timestamp.txt"
$culture = [System.Globalization.CultureInfo]::GetCultureInfo("pt-BR")

$economiaHoras = $HorasEconomizadasMes * $CustoHora
$ganhoMensal = $economiaHoras + $ReducaoDivergenciaCaixa + $ReducaoPerdaEstoque + $RecuperacaoRecebimentos
$ganhoLiquidoMensal = $ganhoMensal - $Mensalidade
if ($ganhoLiquidoMensal -le 0) {
    $payback = $null
    $decisao = "ROI financeiro direto nao comprovado pelas premissas. Defender por controle, risco, suporte e padronizacao."
    $tipoRetorno = "Valor operacional"
} else {
    $payback = [math]::Round(($Implantacao / $ganhoLiquidoMensal), 1)
    if ($payback -le 3) {
        $decisao = "Retorno estimado forte, desde que as premissas sejam validadas pelo cliente."
        $tipoRetorno = "Payback forte"
    } elseif ($payback -le 6) {
        $decisao = "Retorno estimado aceitavel para piloto/producao controlada."
        $tipoRetorno = "Payback aceitavel"
    } else {
        $decisao = "Retorno estimado mais longo. Reforcar ganhos de controle, risco e gestao."
        $tipoRetorno = "Payback longo"
    }
}

$alertas = New-Object System.Collections.Generic.List[string]
if ($HorasEconomizadasMes -gt 80) {
    $alertas.Add("Horas economizadas muito altas: revisar premissa antes de apresentar ao cliente.")
}
if ($ganhoMensal -gt ($Mensalidade * 20) -and $Mensalidade -gt 0) {
    $alertas.Add("Ganho mensal muito superior a mensalidade: validar com dados reais para evitar promessa excessiva.")
}
if ($ganhoLiquidoMensal -le 0) {
    $alertas.Add("Ganho mensal estimado nao supera a mensalidade. Usar ROI qualitativo.")
}

$linhas = New-Object System.Collections.Generic.List[string]
$linhas.Add("ROI E VALOR PERCEBIDO - NEXUS ONE")
$linhas.Add("Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')")
$linhas.Add("Cliente: $Cliente")
$linhas.Add("Responsavel: $Responsavel")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("PREMISSAS")
$linhas.Add("============================================================")
$linhas.Add("- Mensalidade: $($Mensalidade.ToString('C', $culture))")
$linhas.Add("- Implantacao: $($Implantacao.ToString('C', $culture))")
$linhas.Add("- Horas economizadas por mes: $HorasEconomizadasMes")
$linhas.Add("- Custo hora operacional: $($CustoHora.ToString('C', $culture))")
$linhas.Add("- Reducao mensal de divergencia de caixa: $($ReducaoDivergenciaCaixa.ToString('C', $culture))")
$linhas.Add("- Reducao mensal de perda de estoque: $($ReducaoPerdaEstoque.ToString('C', $culture))")
$linhas.Add("- Recuperacao mensal de recebimentos: $($RecuperacaoRecebimentos.ToString('C', $culture))")
$linhas.Add("- Observacao: $Premissas")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("ESTIMATIVA")
$linhas.Add("============================================================")
$linhas.Add("- Economia estimada por horas: $($economiaHoras.ToString('C', $culture))")
$linhas.Add("- Ganho mensal estimado bruto: $($ganhoMensal.ToString('C', $culture))")
$linhas.Add("- Ganho mensal estimado apos mensalidade: $($ganhoLiquidoMensal.ToString('C', $culture))")
if ($null -eq $payback) {
    $linhas.Add("- Payback estimado: nao aplicavel pelas premissas atuais")
} else {
    $linhas.Add("- Payback estimado da implantacao: $payback mes(es)")
}
$linhas.Add("- Classificacao: $tipoRetorno")
$linhas.Add("- Leitura comercial: $decisao")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("GANHOS QUALITATIVOS PARA DEFESA DE VALOR")
$linhas.Add("============================================================")
$linhas.Add("- Menos dependencia de planilhas ou controles paralelos.")
$linhas.Add("- Caixa, estoque e financeiro mais auditaveis.")
$linhas.Add("- Melhor acompanhamento de recebimentos, inadimplencia e divergencias.")
$linhas.Add("- Implantacao, treinamento, suporte, backup, LGPD e aceite documentados.")
$linhas.Add("- Evolucao segura por piloto assistido, Go/No-Go e producao controlada.")
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
$linhas.Add("- [ ] Cliente validou as premissas usadas.")
$linhas.Add("- [ ] ROI foi apresentado como estimativa, nao garantia.")
$linhas.Add("- [ ] Ganhos qualitativos foram registrados.")
$linhas.Add("- [ ] Proposta e plano seguem limites documentados.")
$linhas.Add("- [ ] Feedback/NPS futuro sera usado para comparar expectativa e valor percebido.")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("REFERENCIAS")
$linhas.Add("============================================================")
$linhas.Add("- docs\FICHA_ROI_VALOR_PERCEBIDO_NEXUS_ONE.md")
$linhas.Add("- docs\FICHA_DIAGNOSTICO_COLETA_CLIENTE_NEXUS_ONE.md")
$linhas.Add("- docs\MATRIZ_POSICIONAMENTO_COMPETITIVO_NEXUS_ONE.md")
$linhas.Add("- docs\MODELO_PROPOSTA_COMERCIAL_CONTROLADA_NEXUS_ONE.md")

$linhas | Set-Content -LiteralPath $arquivo -Encoding UTF8

Write-Host "ROI/valor percebido gerado: $arquivo"
