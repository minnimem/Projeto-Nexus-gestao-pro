param(
    [Parameter(Mandatory = $true)]
    [string]$Cliente,

    [string]$Cnpj = "Nao informado",

    [ValidateSet("Basico", "Medio", "Avancado", "Starter", "Business", "Enterprise", "Personalizado")]
    [string]$Plano = "Business",

    [ValidateRange(0, 999999)]
    [decimal]$ValorMensalidade = 349,

    [ValidateRange(0, 999999)]
    [decimal]$ValorImplantacao = 1200,

    [ValidateSet("Aprovado", "Aprovado com ressalvas", "Bloqueado")]
    [string]$Decisao = "Aprovado com ressalvas",

    [string]$Ressalvas = "Revisar anexos de escopo, integracoes externas e LGPD antes da assinatura final.",

    [ValidateSet("Nao", "Sim")]
    [string]$IntegracoesExternas = "Nao",

    [ValidateSet("Nao", "Sim")]
    [string]$FiscalReal = "Nao",

    [ValidateSet("Nao", "Sim")]
    [string]$SlaEspecial = "Nao",

    [ValidateRange(0, 9999)]
    [int]$UsuariosContratados = 8,

    [ValidateRange(0, 9999)]
    [int]$FiliaisContratadas = 3,

    [ValidateRange(0, 9999)]
    [int]$CaixasContratados = 3,

    [ValidateRange(0, 999999)]
    [int]$ProdutosContratados = 5000,

    [ValidateRange(0, 999999)]
    [int]$NotasFiscaisContratadas = 500,

    [string]$Adicionais = "Nenhum adicional informado.",

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
$arquivo = Join-Path $resolvedOutput "checklist-contrato-comercial-$slug-$timestamp.txt"
$culture = [System.Globalization.CultureInfo]::GetCultureInfo("pt-BR")
$mensalidade = $ValorMensalidade.ToString("C", $culture)
$implantacao = $ValorImplantacao.ToString("C", $culture)

$planoNormalizado = switch ($Plano) {
    "Starter" { "Basico" }
    "Business" { "Medio" }
    "Enterprise" { "Avancado" }
    default { $Plano }
}

$nomeComercial = switch ($planoNormalizado) {
    "Basico" { "Starter" }
    "Medio" { "Business" }
    "Avancado" { "Enterprise" }
    "Personalizado" { "Personalizado" }
}

$codigoPlano = switch ($planoNormalizado) {
    "Basico" { "STARTER" }
    "Medio" { "BUSINESS" }
    "Avancado" { "ENTERPRISE" }
    "Personalizado" { "CUSTOM" }
}

$limitesPadrao = @{
    Basico = @{ Usuarios = 3; Filiais = 1; Caixas = 1; Produtos = 500; Notas = 30 }
    Medio = @{ Usuarios = 8; Filiais = 3; Caixas = 3; Produtos = 5000; Notas = 500 }
    Avancado = @{ Usuarios = 9999; Filiais = 9999; Caixas = 9999; Produtos = 999999; Notas = 999999 }
}

$alertas = New-Object System.Collections.Generic.List[string]
if ($Plano -eq "Personalizado") {
    $alertas.Add("Plano personalizado exige anexo de escopo, limites e valores adicionais.")
}
if ($planoNormalizado -ne "Personalizado") {
    $limite = $limitesPadrao[$planoNormalizado]
    if ($UsuariosContratados -gt $limite.Usuarios) {
        $alertas.Add("Usuarios contratados acima do limite padrao do plano. Registrar adicional ou upgrade.")
    }
    if ($FiliaisContratadas -gt $limite.Filiais) {
        $alertas.Add("Filiais contratadas acima do limite padrao do plano. Registrar adicional ou upgrade.")
    }
    if ($CaixasContratados -gt $limite.Caixas) {
        $alertas.Add("Caixas contratados acima do limite padrao do plano. Registrar adicional ou upgrade.")
    }
    if ($ProdutosContratados -gt $limite.Produtos) {
        $alertas.Add("Produtos contratados acima do limite sugerido do plano. Registrar adicional, upgrade ou excecao.")
    }
    if ($NotasFiscaisContratadas -gt $limite.Notas) {
        $alertas.Add("Notas fiscais contratadas acima do limite sugerido do plano. Registrar pacote fiscal adicional.")
    }
}
if ($IntegracoesExternas -eq "Sim") {
    $alertas.Add("Integracoes externas devem ficar condicionadas a homologacao, provedor/canal e evidencia.")
}
if ($FiscalReal -eq "Sim") {
    $alertas.Add("Fiscal real exige certificado, contador, credenciamento, provedor/SEFAZ/municipio e homologacao oficial.")
}
if ($SlaEspecial -eq "Sim") {
    $alertas.Add("SLA especial deve ser validado contra a politica de suporte antes de assinar.")
}
if ($Decisao -eq "Bloqueado") {
    $alertas.Add("Contrato bloqueado: nao iniciar faturamento ou implantacao paga antes de corrigir ressalvas.")
}

$linhas = New-Object System.Collections.Generic.List[string]
$linhas.Add("CHECKLIST DE CONTRATO E TERMOS COMERCIAIS - NEXUS ONE")
$linhas.Add("Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')")
$linhas.Add("Cliente: $Cliente")
$linhas.Add("CNPJ/identificacao: $Cnpj")
$linhas.Add("Responsavel: $Responsavel")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("RESUMO COMERCIAL")
$linhas.Add("============================================================")
$linhas.Add("- Plano comercial: $nomeComercial")
$linhas.Add("- Plano tecnico: $planoNormalizado")
$linhas.Add("- Codigo de liberacao sugerido: $codigoPlano")
$linhas.Add("- Mensalidade: $mensalidade")
$linhas.Add("- Implantacao: $implantacao")
$linhas.Add("- Usuarios contratados: $UsuariosContratados")
$linhas.Add("- Filiais contratadas: $FiliaisContratadas")
$linhas.Add("- Caixas/PDV contratados: $CaixasContratados")
$linhas.Add("- Produtos contratados/limite: $ProdutosContratados")
$linhas.Add("- Notas fiscais contratadas/limite: $NotasFiscaisContratadas")
$linhas.Add("- Adicionais: $Adicionais")
$linhas.Add("- Integracoes externas: $IntegracoesExternas")
$linhas.Add("- Fiscal real: $FiscalReal")
$linhas.Add("- SLA especial: $SlaEspecial")
$linhas.Add("- Decisao: $Decisao")
$linhas.Add("- Ressalvas: $Ressalvas")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("CHECKLIST")
$linhas.Add("============================================================")
$linhas.Add("- [ ] Cliente, CNPJ e decisor registrados.")
$linhas.Add("- [ ] Plano, mensalidade, implantacao e vencimento definidos.")
$linhas.Add("- [ ] Codigo tecnico do plano foi registrado: STARTER, BUSINESS, ENTERPRISE ou CUSTOM.")
$linhas.Add("- [ ] Limites de usuarios, filiais, caixas, empresas e modulos documentados.")
$linhas.Add("- [ ] Limites de produtos, notas fiscais e adicionais documentados.")
$linhas.Add("- [ ] Adicionais, opcionais e fora do escopo separados.")
$linhas.Add("- [ ] Reajuste, desconto ou cortesia com prazo e responsavel.")
$linhas.Add("- [ ] SLA coerente com a politica de suporte.")
$linhas.Add("- [ ] LGPD, backup, retencao e exportacao descritos.")
$linhas.Add("- [ ] Integracoes condicionadas a homologacao quando aplicavel.")
$linhas.Add("- [ ] Fiscal real condicionado a requisitos oficiais quando aplicavel.")
$linhas.Add("- [ ] Renovacao, cancelamento, pausa e offboarding definidos.")
$linhas.Add("- [ ] Uso de nome/logo/depoimento/caso exige autorizacao separada.")
$linhas.Add("- [ ] Upgrade/downgrade tem impacto de limites descrito.")
$linhas.Add("- [ ] Recursos contratados e condicionados foram marcados como condicionados.")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("RECURSOS CONTRATADOS E CONDICIONADOS")
$linhas.Add("============================================================")
if ($FiscalReal -eq "Sim") {
    $linhas.Add("- Fiscal real: contratado e condicionado a certificado, contador, credenciamento e homologacao oficial.")
} else {
    $linhas.Add("- Fiscal real: nao contratado ou nao liberado neste momento.")
}
if ($IntegracoesExternas -eq "Sim") {
    $linhas.Add("- Integracoes externas: contratadas e condicionadas a API/canal, token, ambiente de teste e homologacao.")
} else {
    $linhas.Add("- Integracoes externas: nao contratadas ou fora do escopo inicial.")
}
if ($SlaEspecial -eq "Sim") {
    $linhas.Add("- SLA especial: condicionado a capacidade operacional, politica de suporte e aceite comercial.")
} else {
    $linhas.Add("- SLA especial: nao contratado.")
}
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
$linhas.Add("- docs\CHECKLIST_CONTRATO_TERMOS_COMERCIAIS_NEXUS_ONE.md")
$linhas.Add("- docs\MODELO_PROPOSTA_COMERCIAL_CONTROLADA_NEXUS_ONE.md")
$linhas.Add("- docs\PROCESSO_FATURAMENTO_CLIENTE_NEXUS_ONE.md")
$linhas.Add("- docs\POLITICA_SLA_SUPORTE_NEXUS_ONE.md")
$linhas.Add("- docs\POLITICA_PRIVACIDADE_LGPD_NEXUS_ONE.md")

$linhas | Set-Content -LiteralPath $arquivo -Encoding UTF8

Write-Host "Checklist de contrato comercial gerado: $arquivo"
