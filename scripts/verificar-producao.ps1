param(
    [string]$ComposeFile = "docker-compose.prod.yml",
    [string]$BackendUrl = "http://localhost:8081/health",
    [string]$FrontendUrl = "http://localhost:5173"
)

$ErrorActionPreference = "Stop"

Write-Host "== Containers =="
docker compose -f $ComposeFile ps

Write-Host ""
Write-Host "== Backend health =="
$backend = Invoke-RestMethod -Uri $BackendUrl -Method GET
if ($backend.status -ne "UP") {
    Write-Error "Backend nao esta UP. Status recebido: $($backend.status)"
    exit 1
}
Write-Host "Backend UP: $($backend.service) em $($backend.timestamp)"

Write-Host ""
Write-Host "== Frontend =="
$frontend = Invoke-WebRequest -UseBasicParsing -Uri $FrontendUrl -Method GET
if ($frontend.StatusCode -lt 200 -or $frontend.StatusCode -ge 400) {
    Write-Error "Frontend retornou HTTP $($frontend.StatusCode)"
    exit 1
}
Write-Host "Frontend OK: HTTP $($frontend.StatusCode)"

Write-Host ""
Write-Host "Verificacao de producao concluida."
