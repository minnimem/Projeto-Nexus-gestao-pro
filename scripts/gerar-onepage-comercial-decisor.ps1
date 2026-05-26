param(
    [Parameter(Mandatory = $true)]
    [string]$Cliente,

    [string]$Decisor = "",

    [string]$DorPrincipal = "Reduzir retrabalho operacional e melhorar controle de venda, caixa, estoque e financeiro.",

    [string]$Plano = "Piloto assistido",

    [string]$ValorProposto = "Implantacao acompanhada do Nexus One com escopo controlado, indicadores operacionais e criterios de aceite.",

    [string]$EscopoInicial = "Vendas, caixa/PDV, clientes, estoque, financeiro gerencial, relatorios, usuarios e suporte operacional.",

    [string]$Evidencias = "Qualificacao comercial, demonstracao, proposta controlada e ROI/valor percebido quando aplicavel.",

    [string]$ProximoPasso = "Validar escopo, aprovar proposta e agendar implantacao assistida.",

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
$arquivo = Join-Path $resolvedOutput "onepage-comercial-decisor-$slug-$timestamp.txt"

$alertas = New-Object System.Collections.Generic.List[string]
if ([string]::IsNullOrWhiteSpace($Decisor)) {
    $alertas.Add("Decisor nao informado. Confirmar responsavel pela aprovacao antes de enviar proposta.")
}
if ($DorPrincipal.Length -lt 15) {
    $alertas.Add("Dor principal muito curta. Detalhar problema de negocio antes de usar o one-page.")
}
if ($ValorProposto -match '(garant|100%|lucro certo|resultado certo)') {
    $alertas.Add("Valor proposto contem linguagem de promessa. Revisar antes de enviar ao cliente.")
}

$linhas = New-Object System.Collections.Generic.List[string]
$linhas.Add("ONE-PAGE COMERCIAL PARA DECISOR - NEXUS ONE")
$linhas.Add("Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')")
$linhas.Add("Cliente: $Cliente")
$linhas.Add("Decisor: $Decisor")
$linhas.Add("Responsavel: $Responsavel")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("RESUMO EXECUTIVO")
$linhas.Add("============================================================")
$linhas.Add("- Plano/etapa sugerida: $Plano")
$linhas.Add("- Dor principal: $DorPrincipal")
$linhas.Add("- Valor proposto: $ValorProposto")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("ESCOPO INICIAL")
$linhas.Add("============================================================")
$linhas.Add($EscopoInicial)
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("EVIDENCIAS E ANEXOS RECOMENDADOS")
$linhas.Add("============================================================")
$linhas.Add($Evidencias)
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("PROXIMO PASSO")
$linhas.Add("============================================================")
$linhas.Add($ProximoPasso)
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("LIMITES COMERCIAIS")
$linhas.Add("============================================================")
$linhas.Add("- Este documento nao substitui proposta, contrato, termo de aceite ou Go/No-Go.")
$linhas.Add("- ROI, economia ou ganho citado deve estar ligado a premissas validadas pelo cliente.")
$linhas.Add("- Integracoes externas, fiscal real, Pix/boleto real e SLA especial dependem de homologacao, contrato e evidencia.")
$linhas.Add("- Escopo fora do plano precisa de aprovacao comercial antes de implantacao.")
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
$linhas.Add("- [ ] Dor principal validada pelo cliente.")
$linhas.Add("- [ ] Decisor e responsavel operacional identificados.")
$linhas.Add("- [ ] Escopo inicial confere com plano/proposta.")
$linhas.Add("- [ ] Limites comerciais e dependencias foram comunicados.")
$linhas.Add("- [ ] Proximo passo tem data e responsavel.")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("REFERENCIAS")
$linhas.Add("============================================================")
$linhas.Add("- docs\ONE_PAGE_COMERCIAL_DECISOR_NEXUS_ONE.md")
$linhas.Add("- docs\MODELO_PROPOSTA_COMERCIAL_CONTROLADA_NEXUS_ONE.md")
$linhas.Add("- docs\FICHA_ROI_VALOR_PERCEBIDO_NEXUS_ONE.md")
$linhas.Add("- docs\PLAYBOOK_COMERCIAL_QUALIFICACAO_NEXUS_ONE.md")

$linhas | Set-Content -LiteralPath $arquivo -Encoding UTF8

Write-Host "One-page comercial gerado: $arquivo"
