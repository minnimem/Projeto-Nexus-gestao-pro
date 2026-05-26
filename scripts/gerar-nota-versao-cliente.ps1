param(
    [Parameter(Mandatory = $true)]
    [string]$Cliente,

    [string]$Versao = "nao-informada",

    [ValidateSet("homologacao", "piloto assistido", "producao controlada", "producao")]
    [string]$Ambiente = "producao controlada",

    [string]$Resumo = "Atualizacao operacional do Nexus One.",

    [string]$Melhorias = "Sem melhorias destacadas informadas.",

    [string]$Correcoes = "Sem correcoes destacadas informadas.",

    [string]$MudancasComportamento = "Sem mudancas de comportamento informadas.",

    [string]$ImpactoOperacional = "Sem impacto operacional relevante informado.",

    [string]$AcaoCliente = "Nenhuma acao obrigatoria informada.",

    [string]$RiscosConhecidos = "Nenhum risco relevante informado.",

    [string]$Responsavel = "Nexus One",

    [string]$OutputDir = "reports\release"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$resolvedOutput = if ([System.IO.Path]::IsPathRooted($OutputDir)) {
    $OutputDir
} else {
    Join-Path $root $OutputDir
}

New-Item -ItemType Directory -Force -Path $resolvedOutput | Out-Null

$slugCliente = ($Cliente -replace '[^a-zA-Z0-9_-]+', '-').Trim('-').ToLowerInvariant()
if ([string]::IsNullOrWhiteSpace($slugCliente)) {
    $slugCliente = "cliente"
}

$slugVersao = ($Versao -replace '[^a-zA-Z0-9_.-]+', '-').Trim('-').ToLowerInvariant()
if ([string]::IsNullOrWhiteSpace($slugVersao)) {
    $slugVersao = "versao"
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$arquivo = Join-Path $resolvedOutput "nota-versao-cliente-$slugCliente-$slugVersao-$timestamp.txt"

$alertas = New-Object System.Collections.Generic.List[string]
if ($AcaoCliente -match "Nenhuma" -and ($MudancasComportamento -notmatch "Sem mudancas" -or $ImpactoOperacional -notmatch "Sem impacto")) {
    $alertas.Add("Existe mudanca/impacto informado, mas acao do cliente esta como nenhuma. Revisar antes de enviar.")
}
if ($RiscosConhecidos -match "fiscal|pagamento|pix|boleto|asaas|notificacao|webhook") {
    $alertas.Add("Risco envolve integracao externa. Confirmar homologacao e comunicacao de dependencia.")
}
if ($Ambiente -eq "producao" -and $RiscosConhecidos -notmatch "Nenhum") {
    $alertas.Add("Release em producao com risco conhecido. Confirmar Go/No-Go e comunicado ao cliente.")
}

$linhas = New-Object System.Collections.Generic.List[string]
$linhas.Add("NOTA DE VERSAO PARA CLIENTE - NEXUS ONE")
$linhas.Add("Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')")
$linhas.Add("Cliente/grupo: $Cliente")
$linhas.Add("Versao: $Versao")
$linhas.Add("Ambiente: $Ambiente")
$linhas.Add("Responsavel: $Responsavel")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("MENSAGEM AO CLIENTE")
$linhas.Add("============================================================")
$linhas.Add("Assunto: Nova versao Nexus One - $Versao")
$linhas.Add("")
$linhas.Add("Publicamos uma atualizacao do Nexus One para $Ambiente.")
$linhas.Add("")
$linhas.Add("Resumo:")
$linhas.Add($Resumo)
$linhas.Add("")
$linhas.Add("Melhorias:")
$linhas.Add($Melhorias)
$linhas.Add("")
$linhas.Add("Correcoes:")
$linhas.Add($Correcoes)
$linhas.Add("")
$linhas.Add("Mudancas de comportamento:")
$linhas.Add($MudancasComportamento)
$linhas.Add("")
$linhas.Add("Impacto operacional:")
$linhas.Add($ImpactoOperacional)
$linhas.Add("")
$linhas.Add("Acao recomendada ao cliente:")
$linhas.Add($AcaoCliente)
$linhas.Add("")
$linhas.Add("Riscos ou limitacoes conhecidos:")
$linhas.Add($RiscosConhecidos)
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("CONTROLE INTERNO")
$linhas.Add("============================================================")
$linhas.Add("- [ ] Manifesto de release anexado.")
$linhas.Add("- [ ] Smoke test operacional anexado.")
$linhas.Add("- [ ] Go/No-Go aprovado quando aplicavel.")
$linhas.Add("- [ ] Suporte informado sobre mudancas relevantes.")
$linhas.Add("- [ ] Cliente comunicado quando houver impacto ou acao necessaria.")
$linhas.Add("- [ ] Base de conhecimento atualizada quando a mudanca alterar fluxo/treinamento.")
$linhas.Add("")
$linhas.Add("Alertas automaticos:")
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
$linhas.Add("- docs\PROCESSO_NOTAS_VERSAO_CLIENTE_NEXUS_ONE.md")
$linhas.Add("- docs\PROCESSO_RELEASE_NEXUS_ONE.md")
$linhas.Add("- scripts\gerar-manifesto-release.ps1")
$linhas.Add("- scripts\smoke-test-operacional.ps1")

$linhas | Set-Content -LiteralPath $arquivo -Encoding UTF8

Write-Host "Nota de versao para cliente gerada: $arquivo"
