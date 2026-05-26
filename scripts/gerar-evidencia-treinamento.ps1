param(
    [string]$Cliente = "",
    [string]$Perfil = "",
    [string]$Responsavel = "",
    [string]$OutputDir = "reports\treinamento"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$safeCliente = if ([string]::IsNullOrWhiteSpace($Cliente)) { "cliente" } else { ($Cliente -replace "[^a-zA-Z0-9_-]", "-") }
$safePerfil = if ([string]::IsNullOrWhiteSpace($Perfil)) { "perfil" } else { ($Perfil -replace "[^a-zA-Z0-9_-]", "-") }
$outputFile = Join-Path $OutputDir "evidencia-treinamento-$safeCliente-$safePerfil-$timestamp.txt"

$lines = @(
    "EVIDENCIA DE TREINAMENTO - NEXUS ONE",
    "Data: " + (Get-Date -Format "dd/MM/yyyy HH:mm:ss"),
    "Cliente: $Cliente",
    "Perfil treinado: $Perfil",
    "Responsavel pelo treinamento: $Responsavel",
    "",
    "Participantes:",
    "| Nome | Cargo | Usuario Nexus | Assinatura |",
    "| --- | --- | --- | --- |",
    "|  |  |  |  |",
    "",
    "Topicos treinados:",
    "- [ ] Login e troca/recuperacao de acesso.",
    "- [ ] Navegacao no modulo do perfil.",
    "- [ ] Fluxo operacional principal.",
    "- [ ] Erros comuns e como chamar suporte.",
    "- [ ] Relatorios/comprovantes quando aplicavel.",
    "- [ ] Regras de permissao e responsabilidade do usuario.",
    "",
    "Validacao pratica:",
    "- [ ] Usuario executou fluxo principal sem apoio direto.",
    "- [ ] Usuario entendeu pendencias e limites do escopo.",
    "- [ ] Usuario sabe abrir chamado e informar evidencias.",
    "",
    "Pendencias:",
    "-",
    "",
    "Aceite:",
    "- [ ] Treinamento aprovado.",
    "- [ ] Treinamento aprovado com reforco pendente.",
    "- [ ] Treinamento reprovado, agendar nova rodada.",
    "",
    "Responsavel cliente:",
    "",
    "Responsavel Nexus One:"
)

Set-Content -LiteralPath $outputFile -Value $lines

Write-Host "Evidencia de treinamento gerada em $outputFile"
