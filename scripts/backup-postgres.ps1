param(
  [string]$ComposeFile = "docker-compose.prod.yml",
  [string]$OutputDir = "backups",
  [string]$ServiceName = "postgres"
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

Write-Host "Backup gerado em $OutputDir\$backupFile"
