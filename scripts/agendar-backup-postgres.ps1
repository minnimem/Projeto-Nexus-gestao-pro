param(
    [string]$TaskName = "NexusOneBackupPostgres",
    [string]$ProjectDir = (Resolve-Path ".").Path,
    [string]$ComposeFile = "docker-compose.prod.yml",
    [string]$OutputDir = "backups",
    [string]$ServiceName = "postgres",
    [string]$Time = "02:00",
    [int]$RetentionDays = 30
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $ProjectDir)) {
    Write-Error "Diretorio do projeto nao encontrado: $ProjectDir"
    exit 1
}

$backupScript = Join-Path $ProjectDir "scripts\backup-postgres.ps1"
if (-not (Test-Path -LiteralPath $backupScript)) {
    Write-Error "Script de backup nao encontrado: $backupScript"
    exit 1
}

$timeParts = $Time.Split(":")
if ($timeParts.Count -ne 2) {
    Write-Error "Horario invalido. Use HH:mm, por exemplo 02:00."
    exit 1
}

$hour = [int]$timeParts[0]
$minute = [int]$timeParts[1]
if ($hour -lt 0 -or $hour -gt 23 -or $minute -lt 0 -or $minute -gt 59) {
    Write-Error "Horario invalido. Use HH:mm entre 00:00 e 23:59."
    exit 1
}

$argument = "-NoProfile -ExecutionPolicy Bypass -File `"$backupScript`" -ComposeFile `"$ComposeFile`" -OutputDir `"$OutputDir`" -ServiceName `"$ServiceName`" -RetentionDays $RetentionDays"
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $argument -WorkingDirectory $ProjectDir
$trigger = New-ScheduledTaskTrigger -Daily -At ([datetime]::Today.AddHours($hour).AddMinutes($minute))
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Hours 2)

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Description "Backup automatico diario do PostgreSQL do Nexus One" -Force | Out-Null

Write-Host "Tarefa agendada criada/atualizada: $TaskName as $Time"
Write-Host "Projeto: $ProjectDir"
Write-Host "Compose: $ComposeFile"
Write-Host "Servico PostgreSQL: $ServiceName"
Write-Host "Saida: $OutputDir"
Write-Host "Retencao: $RetentionDays dia(s)"
