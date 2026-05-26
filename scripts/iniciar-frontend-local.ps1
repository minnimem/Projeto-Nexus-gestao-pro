param(
    [string]$EnvFile = ".env.local",
    [string]$ApiUrl = "",
    [switch]$SkipEnvCheck
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$frontendDir = Join-Path $repoRoot "frontend"
$envPath = Join-Path $repoRoot $EnvFile

if (-not $SkipEnvCheck -and -not (Test-Path -LiteralPath $envPath)) {
    Write-Error "Arquivo $EnvFile nao encontrado. Gere com: npm run init:env:local"
    exit 1
}

if (-not [string]::IsNullOrWhiteSpace($ApiUrl)) {
    $env:VITE_API_URL = $ApiUrl
} elseif (-not [string]::IsNullOrWhiteSpace($env:VITE_API_URL)) {
    Write-Host "Usando VITE_API_URL ja configurado: $env:VITE_API_URL"
} else {
    $env:VITE_API_URL = "http://localhost:8081"
}

if (-not (Test-Path -LiteralPath (Join-Path $frontendDir "package.json"))) {
    Write-Error "Frontend nao encontrado em $frontendDir"
    exit 1
}

Write-Host "Iniciando frontend local em http://localhost:5173"
Write-Host "API configurada: $env:VITE_API_URL"

Push-Location $repoRoot
try {
    npm run dev
} finally {
    Pop-Location
}
