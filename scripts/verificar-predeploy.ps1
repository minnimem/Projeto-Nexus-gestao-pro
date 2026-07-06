param(
    [string]$EnvFile = ".env",
    [string]$ComposeFile = "docker-compose.prod.yml",
    [switch]$SkipDockerConfig
)

$ErrorActionPreference = "Stop"

$requiredFiles = @(
    $EnvFile,
    $ComposeFile,
    "frontend\Dockerfile",
    "frontend\nginx.conf",
    "frontend\package.json",
    "frontend\src\App.jsx",
    "backend\projectoads\projectoads\Dockerfile",
    "scripts\verificar-segredos.ps1",
    "scripts\verificar-banco-producao.ps1",
    "scripts\verificar-usuario-master.ps1",
    "scripts\verificar-observabilidade.ps1",
    "scripts\verificar-publicacao.ps1",
    "scripts\backup-postgres.ps1",
    "scripts\restaurar-backup-postgres.ps1",
    "scripts\monitorar-disponibilidade.ps1"
)

$errors = New-Object System.Collections.Generic.List[string]

foreach ($file in $requiredFiles) {
    if (-not (Test-Path -LiteralPath $file)) {
        $errors.Add("Arquivo obrigatorio ausente: $file")
    }
}

if ($errors.Count -eq 0) {
    & ".\scripts\verificar-segredos.ps1" -EnvFile $EnvFile
    if ($LASTEXITCODE -ne 0) {
        $errors.Add("Validacao de segredos falhou para $EnvFile")
    }
}

if ($errors.Count -eq 0) {
    & ".\scripts\verificar-banco-producao.ps1" -EnvFile $EnvFile -ComposeFile $ComposeFile -SkipDockerRuntime
    if ($LASTEXITCODE -ne 0) {
        $errors.Add("Validacao do banco de producao falhou para $EnvFile e $ComposeFile")
    }
}

if ($errors.Count -eq 0) {
    & ".\scripts\verificar-usuario-master.ps1" -EnvFile $EnvFile -ComposeFile $ComposeFile -SkipDockerRuntime
    if ($LASTEXITCODE -ne 0) {
        $errors.Add("Validacao estrutural de usuario master falhou para $EnvFile e $ComposeFile")
    }
}

if ($errors.Count -eq 0) {
    & ".\scripts\verificar-observabilidade.ps1" -EnvFile $EnvFile -ComposeFile $ComposeFile -SkipHttpCheck
    if ($LASTEXITCODE -ne 0) {
        $errors.Add("Validacao de logs/monitoramento falhou para $EnvFile e $ComposeFile")
    }
}

if ($errors.Count -eq 0) {
    & ".\scripts\verificar-publicacao.ps1" -EnvFile $EnvFile
    if ($LASTEXITCODE -ne 0) {
        $errors.Add("Validacao de publicacao falhou para $EnvFile")
    }
}

if (-not $SkipDockerConfig -and $errors.Count -eq 0) {
    docker compose --env-file $EnvFile -f $ComposeFile config | Out-Null
    if ($LASTEXITCODE -ne 0) {
        $errors.Add("Docker Compose nao conseguiu validar $ComposeFile")
    }
}

if ($errors.Count -gt 0) {
    Write-Host "== Pre-deploy bloqueado ==" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "- $_" -ForegroundColor Red }
    exit 1
}

Write-Host "Pre-deploy validado com sucesso."
Write-Host "Env: $EnvFile"
Write-Host "Compose: $ComposeFile"
