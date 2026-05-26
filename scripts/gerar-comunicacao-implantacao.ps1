param(
    [Parameter(Mandatory = $true)]
    [string]$Cliente,

    [ValidateSet("Inicio", "Dados", "Cronograma", "Treinamento", "PendenciaBloqueante", "PendenciaNaoBloqueante", "GoNoGo", "Aceite")]
    [string]$Tipo = "Inicio",

    [string]$Responsavel = "Nexus One",

    [string]$ResponsavelCliente = "",

    [string]$OutputDir = "reports\comunicacao"
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
$arquivo = Join-Path $resolvedOutput "comunicacao-$($Tipo.ToLowerInvariant())-$slug-$timestamp.txt"

$assuntos = @{
    Inicio = "Inicio da implantacao Nexus One - $Cliente"
    Dados = "Dados iniciais para implantacao Nexus One - $Cliente"
    Cronograma = "Cronograma de implantacao Nexus One - $Cliente"
    Treinamento = "Treinamento operacional Nexus One - $Cliente"
    PendenciaBloqueante = "Pendencia bloqueante na implantacao Nexus One - $Cliente"
    PendenciaNaoBloqueante = "Pendencia nao bloqueante registrada - Nexus One - $Cliente"
    GoNoGo = "Decisao Go/No-Go - Nexus One - $Cliente"
    Aceite = "Aceite da implantacao Nexus One - $Cliente"
}

$mensagens = @{
    Inicio = @(
        "Ola.",
        "",
        "Vamos iniciar a implantacao do Nexus One conforme escopo aprovado. Nesta etapa vamos confirmar dados, responsaveis, modulos contratados, ambiente, cronograma e criterios de aceite.",
        "",
        "Proximos passos:",
        "- confirmar ficha de diagnostico/coleta;",
        "- validar cronograma de implantacao;",
        "- alinhar usuarios-chave e treinamento;",
        "- revisar integracoes e dependencias externas;",
        "- iniciar preparacao tecnica."
    )
    Dados = @(
        "Ola.",
        "",
        "Para preparar o ambiente e evitar retrabalho, precisamos receber/conferir os dados iniciais do escopo contratado:",
        "",
        "- usuarios e perfis;",
        "- clientes principais;",
        "- produtos e estoque inicial;",
        "- filiais e caixas;",
        "- formas de pagamento;",
        "- dados fiscais, quando aplicavel;",
        "- fornecedores, rotas ou entregadores, quando estiverem no escopo.",
        "",
        "Antes de usar dados reais, precisamos confirmar responsavel de privacidade/LGPD."
    )
    Cronograma = @(
        "Ola.",
        "",
        "Segue o cronograma proposto para implantacao e operacao assistida. O D1 so deve iniciar quando handoff, diagnostico, escopo, dados minimos, responsaveis, ambiente e treinamento estiverem prontos.",
        "",
        "Pontos de controle:",
        "- preparacao tecnica;",
        "- carga inicial;",
        "- treinamento;",
        "- operacao assistida;",
        "- revisao de riscos/pendencias;",
        "- Go/No-Go e aceite."
    )
    Treinamento = @(
        "Ola.",
        "",
        "Vamos realizar o treinamento dos usuarios-chave conforme os perfis contratados. O objetivo e validar que o usuario consegue executar o fluxo principal sem suporte direto.",
        "",
        "Ao final, registraremos evidencia de treinamento e eventuais pendencias."
    )
    PendenciaBloqueante = @(
        "Ola.",
        "",
        "Identificamos uma pendencia bloqueante que impede avancar para producao controlada neste momento.",
        "",
        "Pendencia: [descrever]",
        "Impacto: [descrever impacto]",
        "Responsavel: [responsavel]",
        "Prazo sugerido: [prazo]",
        "",
        "Enquanto esta pendencia estiver aberta, a recomendacao e manter o ambiente em homologacao ou operacao assistida."
    )
    PendenciaNaoBloqueante = @(
        "Ola.",
        "",
        "Registramos uma pendencia nao bloqueante. Ela nao impede a continuidade do fluxo contratado, mas precisa ficar acompanhada no plano de acao.",
        "",
        "Pendencia: [descrever]",
        "Responsavel: [responsavel]",
        "Prazo: [prazo]"
    )
    GoNoGo = @(
        "Ola.",
        "",
        "Concluimos a revisao de Go/No-Go da implantacao.",
        "",
        "Decisao: [Go demonstracao / Go piloto assistido / Go producao controlada / Go producao ampla / No-go]",
        "",
        "Resumo:",
        "- pendencias bloqueantes:",
        "- pendencias nao bloqueantes:",
        "- integracoes homologadas:",
        "- integracoes pendentes/fora do escopo:"
    )
    Aceite = @(
        "Ola.",
        "",
        "Com os fluxos do escopo contratado apresentados, testados e validados, encaminhamos a etapa de aceite da implantacao.",
        "",
        "O aceite confirma:",
        "- escopo entregue;",
        "- pendencias bloqueantes ausentes ou decisao formal registrada;",
        "- pendencias nao bloqueantes aceitas, quando houver;",
        "- criterios de suporte e SLA comunicados;",
        "- proximos passos definidos."
    )
}

$linhas = New-Object System.Collections.Generic.List[string]
$linhas.Add("COMUNICACAO DE IMPLANTACAO - NEXUS ONE")
$linhas.Add("Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')")
$linhas.Add("Cliente: $Cliente")
$linhas.Add("Tipo: $Tipo")
$linhas.Add("Responsavel Nexus One: $Responsavel")
if (-not [string]::IsNullOrWhiteSpace($ResponsavelCliente)) {
    $linhas.Add("Responsavel cliente: $ResponsavelCliente")
}
$linhas.Add("")
$linhas.Add("Assunto: $($assuntos[$Tipo])")
$linhas.Add("")
foreach ($linha in $mensagens[$Tipo]) {
    $linhas.Add($linha)
}
$linhas.Add("")
$linhas.Add("Referencias:")
$linhas.Add("- docs\MODELOS_COMUNICACAO_IMPLANTACAO_CLIENTE_NEXUS_ONE.md")
$linhas.Add("- docs\CRONOGRAMA_IMPLANTACAO_CLIENTE_NEXUS_ONE.md")
$linhas.Add("- docs\PROCESSO_IMPLANTACAO_CLIENTE_NEXUS_ONE.md")
$linhas.Add("- docs\REGISTRO_RISCOS_PENDENCIAS_CLIENTE_NEXUS_ONE.md")

$linhas | Set-Content -LiteralPath $arquivo -Encoding UTF8

Write-Host "Comunicacao de implantacao gerada: $arquivo"
