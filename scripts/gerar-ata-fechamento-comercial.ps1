param(
    [Parameter(Mandatory = $true)]
    [string]$Cliente,

    [string]$Decisor = "",

    [ValidateSet("Aprovar proposta", "Avancar para piloto", "Avancar para producao controlada", "Voltar para diagnostico", "Pausar oportunidade", "Encerrar oportunidade")]
    [string]$Decisao = "Aprovar proposta",

    [string]$Plano = "Piloto assistido",

    [ValidateRange(0, 999999)]
    [decimal]$ValorMensal = 349,

    [ValidateRange(0, 999999)]
    [decimal]$Implantacao = 1200,

    [string]$DorPrincipal = "Controle integrado de venda, caixa, estoque e financeiro.",

    [string]$EscopoAprovado = "Vendas, caixa/PDV, clientes, estoque, financeiro gerencial, relatorios, usuarios e suporte operacional.",

    [string]$ForaDoEscopo = "Fiscal real, Pix/boleto real, notificacoes externas e customizacoes dependem de contrato, homologacao e evidencia.",

    [string]$Objecoes = "Nenhuma objecao critica registrada.",

    [string]$Riscos = "Dependencias externas e dados do cliente precisam ser validados antes da producao ampla.",

    [string]$ProximoPasso = "Assinar proposta, registrar faturamento e agendar implantacao assistida.",

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
$arquivo = Join-Path $resolvedOutput "ata-fechamento-comercial-$slug-$timestamp.txt"
$culture = [System.Globalization.CultureInfo]::GetCultureInfo("pt-BR")

$alertas = New-Object System.Collections.Generic.List[string]
if ([string]::IsNullOrWhiteSpace($Decisor)) {
    $alertas.Add("Decisor nao informado. Fechamento comercial nao deve avancar sem aprovador identificado.")
}
if ($Decisao -match "producao controlada|Aprovar proposta" -and $ValorMensal -le 0) {
    $alertas.Add("Valor mensal zerado em decisao comercial. Registrar motivo, desconto ou piloto gratuito.")
}
if ($ForaDoEscopo -notmatch "Fiscal|Pix|boleto|notific") {
    $alertas.Add("Fora do escopo nao cita integracoes/fiscal/notificacoes. Revisar limites comerciais.")
}

$linhas = New-Object System.Collections.Generic.List[string]
$linhas.Add("ATA DE FECHAMENTO COMERCIAL - NEXUS ONE")
$linhas.Add("Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')")
$linhas.Add("Cliente: $Cliente")
$linhas.Add("Decisor: $Decisor")
$linhas.Add("Responsavel Nexus One: $Responsavel")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("DECISAO")
$linhas.Add("============================================================")
$linhas.Add("- Decisao registrada: $Decisao")
$linhas.Add("- Plano/etapa: $Plano")
$linhas.Add("- Valor mensal: $($ValorMensal.ToString('C', $culture))")
$linhas.Add("- Implantacao: $($Implantacao.ToString('C', $culture))")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("DOR E ESCOPO")
$linhas.Add("============================================================")
$linhas.Add("- Dor principal confirmada: $DorPrincipal")
$linhas.Add("- Escopo aprovado: $EscopoAprovado")
$linhas.Add("- Fora do escopo: $ForaDoEscopo")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("OBJECOES, RISCOS E LIMITES")
$linhas.Add("============================================================")
$linhas.Add("- Objecoes registradas: $Objecoes")
$linhas.Add("- Riscos reconhecidos: $Riscos")
$linhas.Add("- ROI ou economia, quando citado, permanece como estimativa baseada em premissas.")
$linhas.Add("- Integracoes externas, fiscal real, Pix/boleto real e SLA especial dependem de evidencia, contrato e aceite.")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("PROXIMO PASSO")
$linhas.Add("============================================================")
$linhas.Add($ProximoPasso)
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
$linhas.Add("- [ ] Decisor confirmou a decisao.")
$linhas.Add("- [ ] Valor, implantacao e condicoes especiais foram registrados.")
$linhas.Add("- [ ] Escopo e fora do escopo foram apresentados.")
$linhas.Add("- [ ] Objecoes e riscos foram aceitos pelo cliente.")
$linhas.Add("- [ ] Proximo passo tem responsavel e data.")
$linhas.Add("- [ ] Handoff comercial/implantacao/suporte sera atualizado.")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("REFERENCIAS")
$linhas.Add("============================================================")
$linhas.Add("- docs\ATA_FECHAMENTO_COMERCIAL_NEXUS_ONE.md")
$linhas.Add("- docs\MODELO_PROPOSTA_COMERCIAL_CONTROLADA_NEXUS_ONE.md")
$linhas.Add("- docs\CHECKLIST_HANDOFF_COMERCIAL_IMPLANTACAO_SUPORTE_NEXUS_ONE.md")
$linhas.Add("- docs\PROCESSO_FATURAMENTO_CLIENTE_NEXUS_ONE.md")

$linhas | Set-Content -LiteralPath $arquivo -Encoding UTF8

Write-Host "Ata de fechamento comercial gerada: $arquivo"
