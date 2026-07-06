param(
  [Parameter(Mandatory = $true)]
  [string]$GitRef,
  [string]$ComposeFile = "docker-compose.prod.yml",
  [string]$EnvFile = ".env",
  [string]$BackupOutputDir = "backups",
  [string]$BackupServiceName = "postgres",
  [switch]$SkipBackup,
  [switch]$ConfirmRollback
)

$ErrorActionPreference = "Stop"

if (-not $ConfirmRollback) {
  Write-Error "Rollback bloqueado. Reexecute com -ConfirmRollback depois de confirmar backup, janela e referencia Git."
  exit 1
}

if (-not (Test-Path -LiteralPath $ComposeFile)) {
  Write-Error "Compose nao encontrado: $ComposeFile"
  exit 1
}

Write-Host "Rollback solicitado para referencia Git: $GitRef"
Write-Host "Compose: $ComposeFile"
Write-Host "Env: $EnvFile"

if (-not $SkipBackup) {
  Write-Host "Gerando backup antes do rollback..."
  & ".\scripts\backup-postgres.ps1" -ComposeFile $ComposeFile -OutputDir $BackupOutputDir -ServiceName $BackupServiceName
  if ($LASTEXITCODE -ne 0) {
    Write-Error "Backup pre-rollback falhou. Rollback cancelado."
    exit 1
  }
} else {
  Write-Host "Backup pre-rollback pulado por parametro -SkipBackup."
}

git checkout $GitRef
docker compose --env-file $EnvFile -f $ComposeFile build
docker compose --env-file $EnvFile -f $ComposeFile up -d --remove-orphans
docker compose --env-file $EnvFile -f $ComposeFile ps

Write-Host "Rollback aplicado. Execute scripts/verificar-producao.ps1 e smoke test operacional antes de liberar usuarios."
