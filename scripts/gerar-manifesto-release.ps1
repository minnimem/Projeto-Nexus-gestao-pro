param(
    [string]$Version = "",
    [string]$EnvironmentName = "producao",
    [string]$Responsible = "",
    [string]$OutputDir = "reports"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reportFile = Join-Path $OutputDir "manifesto-release-$EnvironmentName-$timestamp.txt"

function Get-GitValue {
    param([string[]]$Args)
    try {
        return (& git @Args 2>$null)
    } catch {
        return ""
    }
}

$gitCommit = Get-GitValue @("rev-parse", "HEAD")
$gitBranch = Get-GitValue @("rev-parse", "--abbrev-ref", "HEAD")
$gitStatus = Get-GitValue @("status", "--short")
$packageVersion = ""

$packagePath = if (Test-Path -LiteralPath "frontend\package.json") { "frontend\package.json" } else { "package.json" }

if (Test-Path -LiteralPath $packagePath) {
    try {
        $packageJson = Get-Content -LiteralPath $packagePath -Raw | ConvertFrom-Json
        $packageVersion = $packageJson.version
    } catch {
        $packageVersion = ""
    }
}

$releaseVersion = if ([string]::IsNullOrWhiteSpace($Version)) { $packageVersion } else { $Version }
if ([string]::IsNullOrWhiteSpace($releaseVersion)) {
    $releaseVersion = "nao-informada"
}

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("MANIFESTO DE RELEASE - NEXUS ONE")
$lines.Add("Data: " + (Get-Date -Format "dd/MM/yyyy HH:mm:ss"))
$lines.Add("Ambiente: $EnvironmentName")
$lines.Add("Versao: $releaseVersion")
$lines.Add("Responsavel: $Responsible")
$lines.Add("")
$lines.Add("Git:")
$lines.Add("- Branch: $gitBranch")
$lines.Add("- Commit: $gitCommit")
$lines.Add("- Worktree limpo: " + ([string]::IsNullOrWhiteSpace(($gitStatus -join ""))))
$lines.Add("")
$lines.Add("Status pendente no Git:")
if ($gitStatus) {
    $gitStatus | ForEach-Object { $lines.Add("- $_") }
} else {
    $lines.Add("- Nenhuma pendencia detectada.")
}
$lines.Add("")
$lines.Add("Checklist obrigatorio:")
$lines.Add("- [ ] Build frontend aprovado.")
$lines.Add("- [ ] Backend compilado/testes criticos aprovados.")
$lines.Add("- [ ] Pre-deploy aprovado.")
$lines.Add("- [ ] Backup manual gerado antes da subida.")
$lines.Add("- [ ] Docker Compose subiu sem erro.")
$lines.Add("- [ ] Healthcheck backend/frontend aprovado.")
$lines.Add("- [ ] Fluxo de login validado.")
$lines.Add("- [ ] Venda/caixa/estoque/financeiro validados.")
$lines.Add("- [ ] Fiscal/notificacoes validados conforme escopo.")
$lines.Add("- [ ] Monitoramento e backup agendados.")
$lines.Add("- [ ] Plano de rollback confirmado.")
$lines.Add("")
$lines.Add("Decisao:")
$lines.Add("- [ ] Publicar release.")
$lines.Add("- [ ] Publicar com ressalvas.")
$lines.Add("- [ ] Bloquear release.")
$lines.Add("- [ ] Executar rollback.")
$lines.Add("")
$lines.Add("Observacoes:")
$lines.Add("-")

Set-Content -LiteralPath $reportFile -Value $lines

Write-Host "Manifesto de release gerado em $reportFile"
