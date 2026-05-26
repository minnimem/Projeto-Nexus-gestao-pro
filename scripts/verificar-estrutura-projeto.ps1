param(
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$frontendDir = Join-Path $root "frontend"
Set-Location -LiteralPath $root

$requiredPaths = @(
    "frontend\src\App.jsx",
    "frontend\src\styles.css",
    "frontend\src\main.jsx",
    "frontend\package.json",
    "frontend\package-lock.json",
    "frontend\vite.config.js",
    "frontend\Dockerfile",
    "frontend\nginx.conf",
    "frontend\.dockerignore",
    "backend\projectoads\projectoads\pom.xml",
    "backend\projectoads\projectoads\src",
    "backend\projectoads\projectoads\Dockerfile",
    "docker-compose.prod.yml",
    "docker-compose.homolog.yml",
    "package.json",
    "README.md"
)

$errors = New-Object System.Collections.Generic.List[string]

foreach ($path in $requiredPaths) {
    if (-not (Test-Path -LiteralPath $path)) {
        $errors.Add("Ausente: $path")
    }
}

function Test-FileContains {
    param(
        [string]$Path,
        [string]$Pattern,
        [string]$Message
    )

    if (-not (Test-Path -LiteralPath $Path)) {
        return
    }

    $content = Get-Content -LiteralPath $Path -Raw
    if ($content -notmatch [regex]::Escape($Pattern)) {
        $errors.Add($Message)
    }
}

Test-FileContains -Path "docker-compose.prod.yml" -Pattern "context: ./frontend" -Message "docker-compose.prod.yml nao aponta o build do frontend para ./frontend."
Test-FileContains -Path "docker-compose.homolog.yml" -Pattern "context: ./frontend" -Message "docker-compose.homolog.yml nao aponta o build do frontend para ./frontend."
Test-FileContains -Path "package.json" -Pattern "npm --prefix frontend run dev" -Message "package.json da raiz nao possui atalho para frontend/dev."
Test-FileContains -Path "package.json" -Pattern "npm --prefix frontend run build" -Message "package.json da raiz nao possui atalho para frontend/build."

if (-not $SkipBuild -and $errors.Count -eq 0) {
    & npm.cmd --prefix $frontendDir run build
    if ($LASTEXITCODE -ne 0) {
        $errors.Add("Build do frontend falhou via npm run build na raiz.")
    }
}

if ($errors.Count -gt 0) {
    Write-Host "== Estrutura do projeto com pendencias ==" -ForegroundColor Red
    foreach ($errorItem in $errors) {
        Write-Host "- $errorItem" -ForegroundColor Red
    }
    exit 1
}

Write-Host "Estrutura do projeto validada com sucesso." -ForegroundColor Green
Write-Host "Frontend: frontend"
Write-Host "Backend: backend\projectoads\projectoads"
Write-Host "Comandos raiz: npm run dev | npm run build | npm run preview"
