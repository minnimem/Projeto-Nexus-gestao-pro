param(
    [string]$EnvFile = ".env",
    [string]$ComposeFile = "docker-compose.prod.yml",
    [string]$BaseUrl = "http://localhost:8081",
    [string]$FrontendUrl = "http://localhost:5173",
    [string]$EnvironmentName = "producao",
    [string]$Login = "",
    [string]$Senha = "",
    [string]$OutputDir = "reports",
    [switch]$SkipDockerConfig,
    [switch]$SkipHttpCheck
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reportFile = Join-Path $OutputDir "homologacao-final-$EnvironmentName-$timestamp.txt"
$results = New-Object System.Collections.Generic.List[string]
$failures = New-Object System.Collections.Generic.List[string]
$warnings = New-Object System.Collections.Generic.List[string]

function Add-Result {
    param([string]$Status, [string]$Name, [string]$Detail)
    $results.Add(("{0} | {1} | {2}" -f $Status, $Name, $Detail))
}

function Invoke-Step {
    param(
        [string]$Name,
        [scriptblock]$Script,
        [switch]$WarningOnly
    )

    try {
        & $Script
        if ($LASTEXITCODE -ne $null -and $LASTEXITCODE -ne 0) {
            throw "Comando retornou exit code $LASTEXITCODE"
        }
        Add-Result "OK" $Name "Validado"
    } catch {
        $message = "$Name falhou: $($_.Exception.Message)"
        if ($WarningOnly) {
            $warnings.Add($message)
            Add-Result "AVISO" $Name $message
        } else {
            $failures.Add($message)
            Add-Result "FALHA" $Name $message
        }
    }
}

Invoke-Step "Pre-deploy estrutural" {
    & ".\scripts\verificar-predeploy.ps1" -EnvFile $EnvFile -ComposeFile $ComposeFile -SkipDockerConfig:$SkipDockerConfig
}

Invoke-Step "Publicacao front/back" {
    & ".\scripts\verificar-publicacao.ps1" -EnvFile $EnvFile
}

Invoke-Step "Observabilidade" {
    & ".\scripts\verificar-observabilidade.ps1" -EnvFile $EnvFile -ComposeFile $ComposeFile -BackendUrl "$BaseUrl/health" -FrontendUrl $FrontendUrl -SkipHttpCheck:$SkipHttpCheck
}

Invoke-Step "Usuario master" {
    & ".\scripts\verificar-usuario-master.ps1" -EnvFile $EnvFile -ComposeFile $ComposeFile -SkipDockerRuntime
}

if ([string]::IsNullOrWhiteSpace($Login) -or [string]::IsNullOrWhiteSpace($Senha)) {
    $warnings.Add("Smoke operacional via API nao executado porque Login/Senha nao foram informados.")
    Add-Result "AVISO" "Smoke operacional" "Informe -Login e -Senha para executar."
} else {
    Invoke-Step "Smoke operacional" {
        & ".\scripts\smoke-test-operacional.ps1" -BaseUrl $BaseUrl -Login $Login -Senha $Senha -EnvironmentName $EnvironmentName -OutputDir $OutputDir
    }
}

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("HOMOLOGACAO FINAL - NEXUS ONE")
$lines.Add("Data: " + (Get-Date -Format "dd/MM/yyyy HH:mm:ss"))
$lines.Add("Ambiente: $EnvironmentName")
$lines.Add("EnvFile: $EnvFile")
$lines.Add("ComposeFile: $ComposeFile")
$lines.Add("BaseUrl: $BaseUrl")
$lines.Add("FrontendUrl: $FrontendUrl")
$lines.Add("")
$lines.Add("Resultados:")
$results | ForEach-Object { $lines.Add("- $_") }
$lines.Add("")
$lines.Add("Avisos:")
if ($warnings.Count -gt 0) {
    $warnings | ForEach-Object { $lines.Add("- $_") }
} else {
    $lines.Add("- Nenhum aviso.")
}
$lines.Add("")
$lines.Add("Falhas:")
if ($failures.Count -gt 0) {
    $failures | ForEach-Object { $lines.Add("- $_") }
} else {
    $lines.Add("- Nenhuma falha critica.")
}

Set-Content -LiteralPath $reportFile -Value $lines

Write-Host "Relatorio gerado em $reportFile"

if ($failures.Count -gt 0) {
    exit 1
}

Write-Host "Homologacao final estrutural concluida."
