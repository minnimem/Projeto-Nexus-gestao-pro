param(
    [Parameter(Mandatory = $true)]
    [string]$Cliente,

    [ValidateSet("Interno", "Anonimizado", "Nome", "Logo", "Depoimento", "Publico")]
    [string]$TipoUso = "Anonimizado",

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
$arquivo = Join-Path $resolvedOutput "autorizacao-referencia-comercial-$slug-$timestamp.txt"

$descricoes = @{
    Interno = "Uso interno apenas, sem divulgacao externa."
    Anonimizado = "Uso comercial sem identificar cliente, marca, pessoas ou dados sensiveis."
    Nome = "Uso do nome da empresa em proposta ou apresentacao autorizada."
    Logo = "Uso de logo/marca conforme autorizacao especifica do cliente."
    Depoimento = "Uso de depoimento textual aprovado pelo cliente."
    Publico = "Uso publico em site, rede social, apresentacao ou material comercial."
}

$linhas = New-Object System.Collections.Generic.List[string]
$linhas.Add("AUTORIZACAO DE REFERENCIA COMERCIAL - NEXUS ONE")
$linhas.Add("Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')")
$linhas.Add("Cliente: $Cliente")
$linhas.Add("Tipo de uso sugerido: $TipoUso")
$linhas.Add("Descricao: $($descricoes[$TipoUso])")
$linhas.Add("Responsavel Nexus One: $Responsavel")
$linhas.Add("")
$linhas.Add("CONTEUDO AUTORIZADO")
$linhas.Add("- Segmento:")
$linhas.Add("- Dor inicial:")
$linhas.Add("- Modulos implantados:")
$linhas.Add("- Ganho percebido:")
$linhas.Add("- Indicadores autorizados:")
$linhas.Add("- Frase/depoimento autorizado:")
$linhas.Add("- Restricoes:")
$linhas.Add("")
$linhas.Add("CHECKLIST ANTES DE USAR")
$linhas.Add("- [ ] Cliente classificado como Verde na rotina de sucesso.")
$linhas.Add("- [ ] Nao ha pendencia bloqueante aberta.")
$linhas.Add("- [ ] Dados sensiveis foram removidos.")
$linhas.Add("- [ ] Prints foram mascarados ou substituidos por dados ficticios.")
$linhas.Add("- [ ] Conteudo foi revisado pelo cliente.")
$linhas.Add("- [ ] Canal de uso foi aprovado.")
$linhas.Add("- [ ] Prazo/validade da autorizacao foi definido quando aplicavel.")
$linhas.Add("")
$linhas.Add("LIMITES")
$linhas.Add("- Nao usar dados pessoais, financeiros, fiscais ou operacionais sensiveis.")
$linhas.Add("- Nao usar logo, nome ou depoimento fora do tipo autorizado.")
$linhas.Add("- Nao publicar caso real sem aprovacao do cliente.")
$linhas.Add("")
$linhas.Add("ASSINATURAS")
$linhas.Add("Responsavel do cliente:")
$linhas.Add("Data:")
$linhas.Add("")
$linhas.Add("Responsavel Nexus One:")
$linhas.Add("Data:")
$linhas.Add("")
$linhas.Add("REFERENCIAS")
$linhas.Add("- docs\AUTORIZACAO_REFERENCIA_COMERCIAL_CLIENTE_NEXUS_ONE.md")
$linhas.Add("- docs\ROTINA_SUCESSO_CLIENTE_POS_IMPLANTACAO_NEXUS_ONE.md")
$linhas.Add("- docs\POLITICA_PRIVACIDADE_LGPD_NEXUS_ONE.md")

$linhas | Set-Content -LiteralPath $arquivo -Encoding UTF8

Write-Host "Autorizacao de referencia comercial gerada: $arquivo"
