param(
    [string]$EnvFile = ".env",
    [string]$FrontendDist = "frontend\dist",
    [string]$BackendTarget = "backend\projectoads\projectoads\target",
    [switch]$RequirePublicHttps
)

$ErrorActionPreference = "Stop"

function Read-EnvFile {
    param([string]$Path)

    $vars = @{}
    if (-not (Test-Path -LiteralPath $Path)) {
        return $vars
    }

    Get-Content -LiteralPath $Path | ForEach-Object {
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
        $vars[$key] = $value
    }
    return $vars
}

function Test-IsHttpUrl {
    param([string]$Value)

    try {
        $uri = [System.Uri]$Value
        return @("http", "https") -contains $uri.Scheme -and -not [string]::IsNullOrWhiteSpace($uri.Host)
    } catch {
        return $false
    }
}

function Test-IsLocalHost {
    param([string]$HostName)
    return @("localhost", "127.0.0.1", "::1") -contains $HostName.ToLowerInvariant()
}

$errors = New-Object System.Collections.Generic.List[string]
$warnings = New-Object System.Collections.Generic.List[string]

if (-not (Test-Path -LiteralPath $EnvFile)) {
    $errors.Add("Arquivo de ambiente nao encontrado: $EnvFile")
}

$vars = Read-EnvFile -Path $EnvFile
$publicUrl = if ($vars.ContainsKey("NEXUS_PUBLIC_URL")) { $vars["NEXUS_PUBLIC_URL"] } else { "" }
$apiUrl = if ($vars.ContainsKey("NEXUS_PUBLIC_API_URL")) { $vars["NEXUS_PUBLIC_API_URL"] } else { "" }
$origins = if ($vars.ContainsKey("NEXUS_ALLOWED_ORIGINS")) {
    $vars["NEXUS_ALLOWED_ORIGINS"].Split(",") | ForEach-Object { $_.Trim() } | Where-Object { $_ }
} else {
    @()
}

if ($RequirePublicHttps) {
    foreach ($pair in @(
        @{ Key = "NEXUS_PUBLIC_URL"; Value = $publicUrl },
        @{ Key = "NEXUS_PUBLIC_API_URL"; Value = $apiUrl }
    )) {
        if ([string]::IsNullOrWhiteSpace($pair.Value)) {
            $errors.Add("$($pair.Key) deve estar preenchida para validacao publica.")
            continue
        }
        if (-not (Test-IsHttpUrl $pair.Value)) {
            $errors.Add("$($pair.Key) deve ser uma URL http/https valida.")
            continue
        }
        $uri = [System.Uri]$pair.Value
        if ($uri.Scheme -ne "https") {
            $errors.Add("$($pair.Key) deve usar HTTPS em producao publica.")
        }
        if (Test-IsLocalHost $uri.Host) {
            $errors.Add("$($pair.Key) nao pode apontar para localhost em producao publica.")
        }
    }
}

if ($origins.Count -eq 0) {
    $errors.Add("NEXUS_ALLOWED_ORIGINS precisa ter ao menos uma origem.")
}

foreach ($origin in $origins) {
    if (-not (Test-IsHttpUrl $origin)) {
        $errors.Add("Origem CORS invalida: $origin")
        continue
    }

    $originUri = [System.Uri]$origin
    if ($RequirePublicHttps -and $originUri.Scheme -ne "https") {
        $errors.Add("Origem CORS deve usar HTTPS em producao publica: $origin")
    }
    if ($RequirePublicHttps -and (Test-IsLocalHost $originUri.Host)) {
        $errors.Add("Origem CORS nao pode ser localhost em producao publica: $origin")
    }
}

if (-not [string]::IsNullOrWhiteSpace($publicUrl) -and $origins.Count -gt 0) {
    if ($origins -notcontains $publicUrl.TrimEnd("/")) {
        $warnings.Add("NEXUS_PUBLIC_URL nao aparece exatamente em NEXUS_ALLOWED_ORIGINS. Confira CORS.")
    }
}

if (-not (Test-Path -LiteralPath (Join-Path $FrontendDist "index.html"))) {
    $errors.Add("Build final do frontend nao encontrado em $FrontendDist. Rode npm run build em frontend.")
}

$jarFiles = @()
if (Test-Path -LiteralPath $BackendTarget) {
    $jarFiles = Get-ChildItem -LiteralPath $BackendTarget -Filter "*.jar" -File |
        Where-Object { $_.Name -notmatch "original|sources|javadoc" }
}
if ($jarFiles.Count -eq 0) {
    $errors.Add("Jar do backend nao encontrado em $BackendTarget. Rode mvnw.cmd -DskipTests package.")
}

if ($errors.Count -gt 0) {
    Write-Host "== Publicacao nao validada ==" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "- $_" -ForegroundColor Red }
    exit 1
}

if ($warnings.Count -gt 0) {
    Write-Host "== Alertas de publicacao ==" -ForegroundColor Yellow
    $warnings | ForEach-Object { Write-Host "- $_" -ForegroundColor Yellow }
}

Write-Host "Publicacao validada."
Write-Host "FrontendDist: $FrontendDist"
Write-Host "BackendTarget: $BackendTarget"
if ($jarFiles.Count -gt 0) {
    $jarFiles | ForEach-Object { Write-Host "Jar: $($_.FullName)" }
}
