param(
    [string]$EnvFile = ".env",
    [switch]$AllowSandboxAsaas
)

$ErrorActionPreference = "Stop"

$requiredKeys = @(
    "POSTGRES_DB",
    "POSTGRES_USER",
    "POSTGRES_PASSWORD",
    "DB_URL",
    "DB_USERNAME",
    "DB_PASSWORD",
    "JWT_SECRET",
    "NEXUS_ALLOWED_ORIGINS",
    "SPRING_PROFILES_ACTIVE"
)

$placeholderPatterns = @(
    "trocar",
    "sua-",
    "sua_",
    "token-local",
    "chave",
    "senha",
    "example",
    "exemplo",
    "placeholder"
)

function Test-IsPlaceholder {
    param([string]$Value)

    if ([string]::IsNullOrWhiteSpace($Value)) {
        return $true
    }

    $normalized = $Value.Trim().ToLowerInvariant()
    foreach ($pattern in $placeholderPatterns) {
        if ($normalized.Contains($pattern)) {
            return $true
        }
    }

    return $false
}

function Convert-ToBool {
    param([string]$Value)
    return @("true", "1", "yes", "sim") -contains $Value.Trim().ToLowerInvariant()
}

if (-not (Test-Path -LiteralPath $EnvFile)) {
    Write-Error "Arquivo $EnvFile nao encontrado. Copie .env.example para .env e preencha os valores reais."
    exit 1
}

$envVars = @{}
Get-Content -LiteralPath $EnvFile | ForEach-Object {
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
    $envVars[$key] = $value
}

$errors = New-Object System.Collections.Generic.List[string]
$warnings = New-Object System.Collections.Generic.List[string]

foreach ($key in $requiredKeys) {
    if (-not $envVars.ContainsKey($key) -or (Test-IsPlaceholder $envVars[$key])) {
        $errors.Add("Variavel obrigatoria ausente, vazia ou com placeholder: $key")
    }
}

if ($envVars.ContainsKey("JWT_SECRET") -and $envVars["JWT_SECRET"].Length -lt 32) {
    $errors.Add("JWT_SECRET deve ter pelo menos 32 caracteres.")
}

if ($envVars.ContainsKey("NEXUS_ALLOWED_ORIGINS")) {
    $origins = $envVars["NEXUS_ALLOWED_ORIGINS"].Split(",") | ForEach-Object { $_.Trim() } | Where-Object { $_ }
    if ($origins.Count -eq 0) {
        $errors.Add("NEXUS_ALLOWED_ORIGINS deve informar ao menos uma origem permitida.")
    }
    foreach ($origin in $origins) {
        if ($origin -notmatch "^https?://") {
            $errors.Add("Origem CORS invalida em NEXUS_ALLOWED_ORIGINS: $origin")
        }
    }
}

$isProd = $envVars.ContainsKey("SPRING_PROFILES_ACTIVE") -and $envVars["SPRING_PROFILES_ACTIVE"].ToLowerInvariant().Contains("prod")
$asaasEnabled = $envVars.ContainsKey("ASAAS_ENABLED") -and (Convert-ToBool $envVars["ASAAS_ENABLED"])
$notificationsEnabled = $envVars.ContainsKey("NOTIFICATIONS_ENABLED") -and (Convert-ToBool $envVars["NOTIFICATIONS_ENABLED"])

if ($asaasEnabled) {
    foreach ($key in @("ASAAS_API_KEY", "ASAAS_WEBHOOK_TOKEN")) {
        if (-not $envVars.ContainsKey($key) -or (Test-IsPlaceholder $envVars[$key])) {
            $errors.Add("ASAAS_ENABLED=true exige $key preenchido com valor real.")
        }
    }

    if ($isProd -and $envVars.ContainsKey("ASAAS_BASE_URL") -and $envVars["ASAAS_BASE_URL"].Contains("sandbox") -and -not $AllowSandboxAsaas) {
        $warnings.Add("ASAAS_BASE_URL aponta para sandbox com perfil prod. Use -AllowSandboxAsaas apenas em homologacao controlada.")
    }
}

if ($notificationsEnabled) {
    foreach ($key in @("NOTIFICATIONS_WEBHOOK_URL", "NOTIFICATIONS_TOKEN")) {
        if (-not $envVars.ContainsKey($key) -or (Test-IsPlaceholder $envVars[$key])) {
            $errors.Add("NOTIFICATIONS_ENABLED=true exige $key preenchido com valor real.")
        }
    }
}

foreach ($key in @("NEXUS_FISCAL_CERT_PATH", "NEXUS_FISCAL_CERT_PASSWORD", "NEXUS_FISCAL_CSC_TOKEN")) {
    if ($envVars.ContainsKey($key) -and (Test-IsPlaceholder $envVars[$key])) {
        $errors.Add("Variavel fiscal sensivel nao pode conter placeholder: $key")
    }
}

if ($errors.Count -gt 0) {
    Write-Host "== Falhas de segredos ==" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "- $_" -ForegroundColor Red }
    exit 1
}

if ($warnings.Count -gt 0) {
    Write-Host "== Alertas ==" -ForegroundColor Yellow
    $warnings | ForEach-Object { Write-Host "- $_" -ForegroundColor Yellow }
}

Write-Host "Segredos e variaveis obrigatorias validados com sucesso."
exit 0
