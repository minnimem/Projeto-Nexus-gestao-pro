param(
  [Parameter(Mandatory = $true)]
  [string]$GitRef,
  [string]$ComposeFile = "docker-compose.prod.yml"
)

$ErrorActionPreference = "Stop"

Write-Host "Rollback solicitado para referencia Git: $GitRef"
Write-Host "Antes de continuar, confirme que existe backup recente do banco."

git checkout $GitRef
docker compose -f $ComposeFile build
docker compose -f $ComposeFile up -d --remove-orphans
docker compose -f $ComposeFile ps
