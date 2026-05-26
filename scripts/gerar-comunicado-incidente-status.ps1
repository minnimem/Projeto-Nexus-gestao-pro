param(
    [Parameter(Mandatory = $true)]
    [string]$Cliente,

    [ValidateSet("Abertura", "Atualizacao", "Contorno", "Manutencao", "Encerramento", "Pos-incidente")]
    [string]$Tipo = "Abertura",

    [ValidateSet("P0", "P1", "P2", "P3")]
    [string]$Prioridade = "P1",

    [string]$Modulo = "Operacao",

    [string]$Impacto = "Impacto operacional em analise",

    [string]$StatusAtual = "Em investigacao",

    [string]$AcaoEmAndamento = "Equipe Nexus One analisando evidencias e validando contorno",

    [string]$Contorno = "Sem contorno confirmado no momento",

    [string]$ProximaAtualizacao = "Em ate 30 minutos",

    [string]$Responsavel = "Nexus One",

    [string]$OutputDir = "reports\suporte"
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
$arquivo = Join-Path $resolvedOutput "comunicado-incidente-status-$slug-$Tipo-$Prioridade-$timestamp.txt"

$assunto = switch ($Tipo) {
    "Abertura" { "Incidente em acompanhamento - Nexus One" }
    "Atualizacao" { "Atualizacao de incidente - Nexus One" }
    "Contorno" { "Contorno operacional disponivel - Nexus One" }
    "Manutencao" { "Manutencao programada - Nexus One" }
    "Encerramento" { "Incidente normalizado - Nexus One" }
    default { "Resumo pos-incidente - Nexus One" }
}

$cadencia = switch ($Prioridade) {
    "P0" { "Atualizacoes a cada 30 minutos ate contorno ou normalizacao." }
    "P1" { "Atualizacoes conforme SLA ou quando houver mudanca relevante." }
    "P2" { "Atualizacoes conforme evolucao do suporte." }
    default { "Atualizacoes conforme planejamento." }
}

$linhas = New-Object System.Collections.Generic.List[string]
$linhas.Add("COMUNICADO DE INCIDENTE E STATUS - NEXUS ONE")
$linhas.Add("Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')")
$linhas.Add("Cliente: $Cliente")
$linhas.Add("Tipo: $Tipo")
$linhas.Add("Prioridade: $Prioridade")
$linhas.Add("Modulo/servico: $Modulo")
$linhas.Add("Responsavel: $Responsavel")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("MENSAGEM AO CLIENTE")
$linhas.Add("============================================================")
$linhas.Add("Assunto: $assunto")
$linhas.Add("")
if ($Tipo -eq "Encerramento") {
    $linhas.Add("O incidente em $Modulo foi normalizado. Impacto acompanhado: $Impacto.")
    $linhas.Add("Acao aplicada: $AcaoEmAndamento.")
    $linhas.Add("Status atual: $StatusAtual.")
    $linhas.Add("Seguiremos monitorando o ambiente e registraremos medidas preventivas quando aplicavel.")
} elseif ($Tipo -eq "Manutencao") {
    $linhas.Add("Realizaremos manutencao programada em $Modulo.")
    $linhas.Add("Impacto esperado: $Impacto.")
    $linhas.Add("Acao planejada: $AcaoEmAndamento.")
    $linhas.Add("Contorno durante a janela: $Contorno.")
    $linhas.Add("Proxima atualizacao: $ProximaAtualizacao.")
} elseif ($Tipo -eq "Contorno") {
    $linhas.Add("Temos um contorno operacional para o impacto em $Modulo.")
    $linhas.Add("Impacto acompanhado: $Impacto.")
    $linhas.Add("Contorno temporario: $Contorno.")
    $linhas.Add("Status atual: $StatusAtual.")
    $linhas.Add("Proxima atualizacao: $ProximaAtualizacao.")
} else {
    $linhas.Add("Identificamos uma situacao em $Modulo com impacto em: $Impacto.")
    $linhas.Add("Status atual: $StatusAtual.")
    $linhas.Add("Acao em andamento: $AcaoEmAndamento.")
    $linhas.Add("Contorno temporario: $Contorno.")
    $linhas.Add("Proxima atualizacao: $ProximaAtualizacao.")
}
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("CONTROLE INTERNO")
$linhas.Add("============================================================")
$linhas.Add("- Cadencia sugerida: $cadencia")
$linhas.Add("- [ ] Ficha de incidente vinculada.")
$linhas.Add("- [ ] Cliente comunicado pelo canal combinado.")
$linhas.Add("- [ ] Evidencias tecnicas anexadas.")
$linhas.Add("- [ ] Normalizacao validada por smoke test ou confirmacao do cliente.")
$linhas.Add("- [ ] Causa raiz e prevencao registradas quando P0/P1.")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("REFERENCIAS")
$linhas.Add("============================================================")
$linhas.Add("- docs\PLAYBOOK_COMUNICACAO_INCIDENTE_STATUS_NEXUS_ONE.md")
$linhas.Add("- docs\POLITICA_SLA_SUPORTE_NEXUS_ONE.md")
$linhas.Add("- docs\ROTEIRO_SUPORTE_OPERACIONAL_NEXUS_ONE.md")
$linhas.Add("- scripts\gerar-incidente-suporte.ps1")

$linhas | Set-Content -LiteralPath $arquivo -Encoding UTF8

Write-Host "Comunicado de incidente/status gerado: $arquivo"
