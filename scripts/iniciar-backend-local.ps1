param(
    [string]$EnvFile = ".env.local",
    [string]$JavaHome = "",
    [string]$MavenPath = "",
    [switch]$SkipEnvValidation
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$backendDir = Join-Path $repoRoot "backend\projectoads\projectoads"
$envPath = Join-Path $repoRoot $EnvFile

if (-not (Test-Path -LiteralPath $envPath)) {
    Write-Error "Arquivo $EnvFile nao encontrado. Gere com: npm run init:env:local"
    exit 1
}

if (-not $SkipEnvValidation) {
    & (Join-Path $repoRoot "scripts\verificar-segredos.ps1") -EnvFile $envPath
    if (-not $?) {
        Write-Error "Validacao de $EnvFile falhou. Corrija antes de iniciar o backend."
        exit 1
    }
}

if (-not [string]::IsNullOrWhiteSpace($JavaHome)) {
    $javaExe = Join-Path $JavaHome "bin\java.exe"
    if (-not (Test-Path -LiteralPath $javaExe)) {
        Write-Error "JavaHome informado nao possui bin\java.exe: $JavaHome"
        exit 1
    }
    $env:JAVA_HOME = $JavaHome
    $env:Path = (Join-Path $JavaHome "bin") + ";$env:Path"
}

Get-Content -LiteralPath $envPath | ForEach-Object {
    $line = $_.Trim()
    if ([string]::IsNullOrWhiteSpace($line) -or $line.StartsWith("#")) {
        return
    }

    $separator = $line.IndexOf("=")
    if ($separator -le 0) {
        return
    }

    $key = $line.Substring(0, $separator).Trim()
    $value = $line.Substring($separator + 1).Trim().Trim('"').Trim("'")
    [Environment]::SetEnvironmentVariable($key, $value, "Process")
}

$mavenCommand = $null
if (-not [string]::IsNullOrWhiteSpace($MavenPath)) {
    if (-not (Test-Path -LiteralPath $MavenPath)) {
        Write-Error "MavenPath informado nao foi encontrado: $MavenPath"
        exit 1
    }
    $mavenCommand = $MavenPath
} elseif ($null -ne (Get-Command "mvn" -ErrorAction SilentlyContinue)) {
    $mavenCommand = "mvn"
} elseif (Test-Path -LiteralPath (Join-Path $backendDir "mvnw.cmd")) {
    $mavenCommand = ".\mvnw.cmd"
} else {
    Write-Error "Maven nao encontrado. Informe -MavenPath ou instale mvn."
    exit 1
}

Write-Host "Iniciando backend local com $EnvFile em http://localhost:$env:SERVER_PORT"
Push-Location $backendDir
$backendExitCode = 0
try {
    if ($mavenCommand -eq "mvn") {
        & mvn spring-boot:run
    } else {
        & $mavenCommand spring-boot:run
    }
    $backendExitCode = $LASTEXITCODE
} finally {
    Pop-Location
}

exit $backendExitCode
