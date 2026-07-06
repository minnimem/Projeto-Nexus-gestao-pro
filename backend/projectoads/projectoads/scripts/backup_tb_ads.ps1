param(
    [string]$HostName = $env:DB_HOST,
    [string]$Port = $env:DB_PORT,
    [string]$Database = $env:DB_NAME,
    [string]$User = $env:DB_USERNAME,
    [string]$OutputDir = "backups"
)

if ([string]::IsNullOrWhiteSpace($HostName)) { $HostName = "localhost" }
if ([string]::IsNullOrWhiteSpace($Port)) { $Port = "5432" }
if ([string]::IsNullOrWhiteSpace($Database)) { $Database = "TB_ADS" }
if ([string]::IsNullOrWhiteSpace($User)) { $User = "postgres" }

$pgDump = Get-Command pg_dump -ErrorAction SilentlyContinue
if ($null -eq $pgDump) {
    Write-Error "pg_dump nao encontrado no PATH. Instale o PostgreSQL client ou adicione a pasta bin ao PATH."
    exit 1
}

if (-not (Test-Path -LiteralPath $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outputFile = Join-Path $OutputDir "$Database-$timestamp.dump"

Write-Host "Gerando backup de $Database em $outputFile"
Write-Host "Use a variavel PGPASSWORD na sessao atual para informar a senha sem grava-la no arquivo."

& $pgDump.Source `
    --host $HostName `
    --port $Port `
    --username $User `
    --format custom `
    --blobs `
    --verbose `
    --file $outputFile `
    $Database

if ($LASTEXITCODE -ne 0) {
    Write-Error "Backup falhou. Verifique host, porta, usuario, senha e permissao no banco."
    exit $LASTEXITCODE
}

Write-Host "Backup concluido: $outputFile"
