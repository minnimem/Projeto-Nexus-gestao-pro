param(
    [string]$EnvFile = "",
    [string]$JavaHome = "",
    [string]$MavenPath = "",
    [switch]$ValidateEnv,
    [switch]$SkipFrontendBuild,
    [switch]$SkipBackendTests
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$backendDir = Join-Path $repoRoot "backend\projectoads\projectoads"
$frontendDir = Join-Path $repoRoot "frontend"

$errors = New-Object System.Collections.Generic.List[string]
$warnings = New-Object System.Collections.Generic.List[string]

if (-not [string]::IsNullOrWhiteSpace($JavaHome)) {
    if (-not (Test-Path -LiteralPath (Join-Path $JavaHome "bin\java.exe"))) {
        $errors.Add("JavaHome informado nao possui bin\java.exe: $JavaHome")
    } else {
        $env:JAVA_HOME = $JavaHome
        $env:Path = (Join-Path $JavaHome "bin") + ";$env:Path"
    }
}

function Test-CommandExists {
    param([string]$Name)
    return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

function Add-ErrorIfMissingPath {
    param([string]$Path, [string]$Label)
    if (-not (Test-Path -LiteralPath $Path)) {
        $errors.Add("Arquivo ou pasta ausente: $Label ($Path)")
    }
}

Write-Host "== Verificacao local sem Docker =="
Write-Host "Raiz: $repoRoot"

Add-ErrorIfMissingPath $frontendDir "frontend"
Add-ErrorIfMissingPath (Join-Path $frontendDir "package.json") "frontend/package.json"
Add-ErrorIfMissingPath (Join-Path $frontendDir "src\App.jsx") "frontend/src/App.jsx"
Add-ErrorIfMissingPath $backendDir "backend Spring Boot"
Add-ErrorIfMissingPath (Join-Path $backendDir "pom.xml") "backend pom.xml"
Add-ErrorIfMissingPath (Join-Path $repoRoot "scripts\verificar-segredos.ps1") "verificar-segredos.ps1"

if (-not $SkipFrontendBuild) {
    foreach ($command in @("node", "npm")) {
        if (-not (Test-CommandExists $command)) {
            $errors.Add("Comando nao encontrado no PATH: $command")
        }
    }
}

$mavenCommand = $null
if (-not $SkipBackendTests) {
    if (-not (Test-CommandExists "java")) {
        $javaFromHome = if ($env:JAVA_HOME) { Join-Path $env:JAVA_HOME "bin\java.exe" } else { "" }
        if ([string]::IsNullOrWhiteSpace($javaFromHome) -or -not (Test-Path -LiteralPath $javaFromHome)) {
            $errors.Add("Java nao encontrado no PATH nem em JAVA_HOME. Configure Java 21 para rodar testes do backend.")
        }
    }

    if (-not [string]::IsNullOrWhiteSpace($MavenPath)) {
        if (-not (Test-Path -LiteralPath $MavenPath)) {
            $errors.Add("MavenPath informado nao foi encontrado: $MavenPath")
        } else {
            $mavenCommand = $MavenPath
        }
    } elseif (Test-CommandExists "mvn") {
        $mavenCommand = "mvn"
    } elseif (Test-Path -LiteralPath (Join-Path $backendDir "mvnw.cmd")) {
        $mavenCommand = ".\mvnw.cmd"
    } else {
        $errors.Add("Maven nao encontrado: instale mvn ou mantenha mvnw.cmd no backend.")
    }
}

if ($ValidateEnv) {
    if ([string]::IsNullOrWhiteSpace($EnvFile)) {
        $errors.Add("Use -EnvFile caminho-do-env junto com -ValidateEnv.")
    } else {
        $resolvedEnv = Join-Path $repoRoot $EnvFile
        if (-not (Test-Path -LiteralPath $resolvedEnv)) {
            $errors.Add("Arquivo de ambiente nao encontrado: $resolvedEnv")
        } else {
            Write-Host "Validando variaveis em $EnvFile..."
            & (Join-Path $repoRoot "scripts\verificar-segredos.ps1") -EnvFile $resolvedEnv
            if ($LASTEXITCODE -ne 0) {
                $errors.Add("Validacao de variaveis falhou para $EnvFile")
            }
        }
    }
} else {
    $warnings.Add("Validacao de .env ignorada. Use -ValidateEnv -EnvFile .env quando quiser bloquear placeholders.")
}

if ($errors.Count -gt 0) {
    Write-Host "== Verificacao bloqueada ==" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "- $_" -ForegroundColor Red }
    exit 1
}

if (-not $SkipFrontendBuild) {
    Write-Host "Rodando build do frontend..."
    Push-Location $repoRoot
    try {
        npm run build
        if ($LASTEXITCODE -ne 0) {
            $errors.Add("Build do frontend falhou.")
        }
    } finally {
        Pop-Location
    }
} else {
    $warnings.Add("Build do frontend ignorado por -SkipFrontendBuild.")
}

if (-not $SkipBackendTests) {
    Write-Host "Rodando testes do backend..."
    Push-Location $backendDir
    try {
        if ($mavenCommand -eq "mvn") {
            & mvn test
        } else {
            & $mavenCommand test
        }
        if ($LASTEXITCODE -ne 0) {
            $errors.Add("Testes do backend falharam.")
        }
    } finally {
        Pop-Location
    }
} else {
    $warnings.Add("Testes do backend ignorados por -SkipBackendTests.")
}

if ($errors.Count -gt 0) {
    Write-Host "== Falhas ==" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "- $_" -ForegroundColor Red }
    exit 1
}

if ($warnings.Count -gt 0) {
    Write-Host "== Alertas ==" -ForegroundColor Yellow
    $warnings | ForEach-Object { Write-Host "- $_" -ForegroundColor Yellow }
}

Write-Host "Verificacao local sem Docker concluida com sucesso."
