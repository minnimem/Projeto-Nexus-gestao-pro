param(
    [Parameter(Mandatory = $true)]
    [string]$Titulo,

    [string]$Modulo = "Operacao",

    [ValidateSet("FAQ", "Tutorial", "Contorno", "Erro conhecido", "Treinamento", "Boas praticas")]
    [string]$Categoria = "FAQ",

    [string]$Publico = "Suporte",

    [string]$PerguntaOuSintoma = "Descrever a duvida, sintoma ou situacao recorrente.",

    [string]$CausaProvavel = "Causa ainda nao classificada.",

    [string]$Solucao = "Descrever o passo a passo recomendado.",

    [string]$QuandoAcionarSuporte = "Acionar suporte quando a orientacao nao resolver ou houver impacto operacional.",

    [string]$Tags = "suporte, conhecimento",

    [string]$Responsavel = "Nexus One",

    [string]$OutputDir = "reports\suporte\base-conhecimento"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$resolvedOutput = if ([System.IO.Path]::IsPathRooted($OutputDir)) {
    $OutputDir
} else {
    Join-Path $root $OutputDir
}

New-Item -ItemType Directory -Force -Path $resolvedOutput | Out-Null

$slug = ($Titulo -replace '[^a-zA-Z0-9_-]+', '-').Trim('-').ToLowerInvariant()
if ([string]::IsNullOrWhiteSpace($slug)) {
    $slug = "artigo"
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$arquivo = Join-Path $resolvedOutput "artigo-base-conhecimento-$slug-$timestamp.txt"

$linhas = New-Object System.Collections.Generic.List[string]
$linhas.Add("ARTIGO DE BASE DE CONHECIMENTO - NEXUS ONE")
$linhas.Add("Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')")
$linhas.Add("Titulo: $Titulo")
$linhas.Add("Modulo: $Modulo")
$linhas.Add("Categoria: $Categoria")
$linhas.Add("Publico: $Publico")
$linhas.Add("Responsavel: $Responsavel")
$linhas.Add("Tags: $Tags")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("PERGUNTA OU SINTOMA")
$linhas.Add("============================================================")
$linhas.Add($PerguntaOuSintoma)
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("CAUSA PROVAVEL")
$linhas.Add("============================================================")
$linhas.Add($CausaProvavel)
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("SOLUCAO RECOMENDADA")
$linhas.Add("============================================================")
$linhas.Add($Solucao)
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("QUANDO ACIONAR SUPORTE")
$linhas.Add("============================================================")
$linhas.Add($QuandoAcionarSuporte)
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("CHECKLIST DE PUBLICACAO")
$linhas.Add("============================================================")
$linhas.Add("- [ ] Linguagem simples para usuario final.")
$linhas.Add("- [ ] Sem senhas, tokens, dados pessoais ou logs sensiveis.")
$linhas.Add("- [ ] Validado por suporte/implantacao.")
$linhas.Add("- [ ] Vinculado a treinamento, incidente ou FAQ quando aplicavel.")
$linhas.Add("- [ ] Revisao agendada apos mudanca de tela/regra.")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("REFERENCIAS")
$linhas.Add("============================================================")
$linhas.Add("- docs\BASE_CONHECIMENTO_SUPORTE_CLIENTE_NEXUS_ONE.md")
$linhas.Add("- docs\ROTEIRO_SUPORTE_OPERACIONAL_NEXUS_ONE.md")
$linhas.Add("- docs\ROTEIRO_TREINAMENTO_POR_PERFIL_NEXUS_ONE.md")

$linhas | Set-Content -LiteralPath $arquivo -Encoding UTF8

Write-Host "Artigo de base de conhecimento gerado: $arquivo"
