param(
  [string]$ComposeFile = "docker-compose.prod.yml",
  [string]$OutputDir = "backups",
  [string]$ServiceName = "postgres",
  [int]$RetentionDays = 30
)

$ErrorActionPreference = "Stop"

if (!(Test-Path -LiteralPath $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupFile = "nexus-one-$timestamp.dump"
$containerPath = "/backups/$backupFile"
$dumpCommand = 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc -f ' + $containerPath

docker compose -f $ComposeFile exec -T $ServiceName sh -c $dumpCommand

$backupPath = Join-Path $OutputDir $backupFile
if (-not (Test-Path -LiteralPath $backupPath)) {
  Write-Error "Backup nao foi localizado apos execucao: $backupPath"
  exit 1
}

$backupItem = Get-Item -LiteralPath $backupPath
if ($backupItem.Length -le 0) {
  Write-Error "Backup gerado esta vazio: $backupPath"
  exit 1
}

if ($RetentionDays -gt 0) {
  $limit = (Get-Date).AddDays(-$RetentionDays)
  Get-ChildItem -LiteralPath $OutputDir -Filter "nexus-one-*.dump" -File |
    Where-Object { $_.LastWriteTime -lt $limit } |
    ForEach-Object {
      Remove-Item -LiteralPath $_.FullName -Force
      Write-Host "Backup antigo removido: $($_.Name)"
    }
}

Write-Host "Backup gerado em $backupPath"
Write-Host "Tamanho: $([Math]::Round($backupItem.Length / 1MB, 2)) MB"
Write-Host "Retencao: $RetentionDays dia(s)"
