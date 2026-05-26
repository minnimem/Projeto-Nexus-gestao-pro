param(
    [string]$TaskName = "NexusOneMonitorDisponibilidade",
    [string]$ProjectDir = (Resolve-Path ".").Path,
    [string]$BackendUrl = "http://localhost:8081/health",
    [string]$FrontendUrl = "http://localhost:5173",
    [string]$EnvironmentName = "producao",
    [int]$IntervalMinutes = 5
)

$ErrorActionPreference = "Stop"

if ($IntervalMinutes -lt 1) {
    Write-Error "IntervalMinutes deve ser maior ou igual a 1."
    exit 1
}

if (-not (Test-Path -LiteralPath $ProjectDir)) {
    Write-Error "Diretorio do projeto nao encontrado: $ProjectDir"
    exit 1
}

$monitorScript = Join-Path $ProjectDir "scripts\monitorar-disponibilidade.ps1"
if (-not (Test-Path -LiteralPath $monitorScript)) {
    Write-Error "Script de monitoramento nao encontrado: $monitorScript"
    exit 1
}

$argument = "-NoProfile -ExecutionPolicy Bypass -File `"$monitorScript`" -BackendUrl `"$BackendUrl`" -FrontendUrl `"$FrontendUrl`" -EnvironmentName `"$EnvironmentName`""
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $argument -WorkingDirectory $ProjectDir
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes $IntervalMinutes)
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Minutes 3)

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Description "Monitoramento recorrente de disponibilidade do Nexus One" -Force | Out-Null

Write-Host "Tarefa agendada criada/atualizada: $TaskName a cada $IntervalMinutes minuto(s)"
Write-Host "Backend: $BackendUrl"
Write-Host "Frontend: $FrontendUrl"
Write-Host "Ambiente: $EnvironmentName"
