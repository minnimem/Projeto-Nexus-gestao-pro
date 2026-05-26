param(
    [Parameter(Mandatory = $true)]
    [string]$BackupFile,
    [string]$ComposeFile = "docker-compose.prod.yml",
    [string]$ServiceName = "postgres",
    [string]$BackupDir = "backups"
)

$ErrorActionPreference = "Stop"

if (!(Test-Path -LiteralPath $BackupFile)) {
    Write-Error "Backup nao encontrado: $BackupFile"
    exit 1
}

$fileName = Split-Path -Leaf $BackupFile
$containerPath = "/backups/$fileName"

Write-Host "Restauracao solicitada: $BackupFile"
Write-Host "Copiando backup para volume mapeado de backups, se necessario."

$backupDir = Join-Path (Get-Location) $BackupDir
if (!(Test-Path -LiteralPath $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

$targetFile = Join-Path $backupDir $fileName
if ((Resolve-Path -LiteralPath $BackupFile).Path -ne (Resolve-Path -LiteralPath $targetFile -ErrorAction SilentlyContinue).Path) {
    Copy-Item -LiteralPath $BackupFile -Destination $targetFile -Force
}

$restoreCommand = 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists ' + $containerPath
docker compose -f $ComposeFile exec -T $ServiceName sh -c $restoreCommand

Write-Host "Restauracao concluida a partir de $fileName"
