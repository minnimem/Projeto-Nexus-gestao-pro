param(
    [string]$BaseUrl = "http://localhost:8081",
    [Parameter(Mandatory = $true)]
    [string]$Login,
    [Parameter(Mandatory = $true)]
    [string]$Senha,
    [string]$EnvironmentName = "producao",
    [string]$OutputDir = "reports"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reportFile = Join-Path $OutputDir "smoke-test-operacional-$EnvironmentName-$timestamp.txt"
$results = New-Object System.Collections.Generic.List[string]
$failures = New-Object System.Collections.Generic.List[string]
$warnings = New-Object System.Collections.Generic.List[string]

function Add-Result {
    param([string]$Status, [string]$Name, [string]$Detail)
    $results.Add(("{0} | {1} | {2}" -f $Status, $Name, $Detail))
}

function Invoke-ApiGet {
    param(
        [string]$Name,
        [string]$Path,
        [string]$Token,
        [switch]$AllowForbidden
    )

    try {
        $headers = @{ Authorization = "Bearer $Token" }
        $response = Invoke-WebRequest -UseBasicParsing -Uri "$BaseUrl$Path" -Method GET -Headers $headers -TimeoutSec 20
        if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 400) {
            Add-Result "OK" $Name "HTTP $($response.StatusCode)"
            return
        }

        $failures.Add("$Name retornou HTTP $($response.StatusCode)")
        Add-Result "FALHA" $Name "HTTP $($response.StatusCode)"
    } catch {
        $statusCode = $null
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
        }

        if ($AllowForbidden -and $statusCode -eq 403) {
            $warnings.Add("$Name restrito para o perfil usado no smoke test.")
            Add-Result "RESTRITO" $Name "HTTP 403"
            return
        }

        $message = "$Name falhou: $($_.Exception.Message)"
        $failures.Add($message)
        Add-Result "FALHA" $Name $message
    }
}

try {
    $health = Invoke-RestMethod -Uri "$BaseUrl/health" -Method GET -TimeoutSec 20
    if ($health.status -eq "UP") {
        Add-Result "OK" "Health" "Backend UP"
    } else {
        $failures.Add("Health retornou status inesperado: $($health.status)")
        Add-Result "FALHA" "Health" "Status $($health.status)"
    }
} catch {
    $failures.Add("Health indisponivel: $($_.Exception.Message)")
    Add-Result "FALHA" "Health" $_.Exception.Message
}

$token = ""
try {
    $loginBody = @{ login = $Login; senha = $Senha } | ConvertTo-Json
    $session = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method POST -ContentType "application/json" -Body $loginBody -TimeoutSec 20
    $token = $session.token
    if ([string]::IsNullOrWhiteSpace($token)) {
        $failures.Add("Login nao retornou token.")
        Add-Result "FALHA" "Login" "Token ausente"
    } else {
        Add-Result "OK" "Login" "Token recebido sem expor valor"
    }
} catch {
    $failures.Add("Login falhou: $($_.Exception.Message)")
    Add-Result "FALHA" "Login" $_.Exception.Message
}

if (-not [string]::IsNullOrWhiteSpace($token)) {
    Invoke-ApiGet -Name "Produtos/Estoque" -Path "/produtos" -Token $token
    Invoke-ApiGet -Name "Pedidos/Vendas" -Path "/pedidos" -Token $token
    Invoke-ApiGet -Name "Caixa aberto" -Path "/caixas/aberto" -Token $token -AllowForbidden
    Invoke-ApiGet -Name "Caixas recentes" -Path "/caixas" -Token $token -AllowForbidden
    Invoke-ApiGet -Name "Financeiro resumo" -Path "/financeiro/resumo" -Token $token -AllowForbidden
    Invoke-ApiGet -Name "Usuarios/Admin" -Path "/usuarios/admin" -Token $token -AllowForbidden
}

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("SMOKE TEST OPERACIONAL - NEXUS ONE")
$lines.Add("Data: " + (Get-Date -Format "dd/MM/yyyy HH:mm:ss"))
$lines.Add("Ambiente: $EnvironmentName")
$lines.Add("BaseUrl: $BaseUrl")
$lines.Add("Login testado: $Login")
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

Write-Host "Smoke test operacional concluido com sucesso."
