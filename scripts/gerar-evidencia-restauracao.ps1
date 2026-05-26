param(
    [Parameter(Mandatory = $true)]
    [string]$BackupFile,
    [string]$EnvironmentName = "homologacao",
    [string]$Responsible = "",
    [string]$OutputDir = "reports"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $BackupFile)) {
    Write-Error "Backup nao encontrado: $BackupFile"
    exit 1
}

if (-not (Test-Path -LiteralPath $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$backupItem = Get-Item -LiteralPath $BackupFile
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reportFile = Join-Path $OutputDir "evidencia-restauracao-$EnvironmentName-$timestamp.txt"

$lines = @(
    "EVIDENCIA DE RESTAURACAO DE BACKUP - NEXUS ONE",
    "Data: " + (Get-Date -Format "dd/MM/yyyy HH:mm:ss"),
    "Ambiente: $EnvironmentName",
    "Responsavel: $Responsible",
    "",
    "Backup utilizado:",
    "- Arquivo: $($backupItem.FullName)",
    "- Tamanho bytes: $($backupItem.Length)",
    "- Criado em: $($backupItem.CreationTime)",
    "- Alterado em: $($backupItem.LastWriteTime)",
    "",
    "Validacoes obrigatorias apos restauracao:",
    "- [ ] Backend /health retornou UP.",
    "- [ ] Login administrativo validado.",
    "- [ ] Empresa/filial carregaram corretamente.",
    "- [ ] Produtos e estoque carregaram corretamente.",
    "- [ ] Pedidos/vendas carregaram corretamente.",
    "- [ ] Financeiro carregou contas e conciliacao esperada.",
    "- [ ] Relatorios/exportacoes abriram sem erro.",
    "- [ ] Nenhum dado sensivel de producao foi exposto em ambiente indevido.",
    "",
    "Resultado:",
    "- [ ] Aprovado.",
    "- [ ] Aprovado com ressalvas.",
    "- [ ] Reprovado.",
    "",
    "Observacoes:",
    "-"
)

Set-Content -LiteralPath $reportFile -Value $lines

Write-Host "Evidencia gerada em $reportFile"
