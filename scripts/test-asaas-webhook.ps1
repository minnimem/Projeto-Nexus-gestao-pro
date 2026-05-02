param(
    [Parameter(Mandatory = $true)]
    [string]$PaymentId,

    [string]$Event = "PAYMENT_RECEIVED",

    [string]$BaseUrl = "http://localhost:8081",

    [string]$Token = $env:ASAAS_WEBHOOK_TOKEN
)

if ([string]::IsNullOrWhiteSpace($Token)) {
    Write-Error "Informe ASAAS_WEBHOOK_TOKEN no ambiente ou passe -Token."
    exit 1
}

$headers = @{
    "Content-Type" = "application/json"
    "asaas-access-token" = $Token
}

$body = @{
    event = $Event
    payment = @{
        id = $PaymentId
    }
} | ConvertTo-Json -Depth 5

$uri = "$BaseUrl/webhooks/asaas"

try {
    $response = Invoke-WebRequest `
        -Method POST `
        -Uri $uri `
        -Headers $headers `
        -Body $body

    Write-Host "Webhook enviado com sucesso."
    Write-Host "URL: $uri"
    Write-Host "Evento: $Event"
    Write-Host "Payment ID: $PaymentId"
    Write-Host "HTTP: $($response.StatusCode)"
} catch {
    Write-Error "Falha ao enviar webhook para $uri"
    Write-Error $_.Exception.Message
    if ($_.Exception.Response) {
        Write-Error "HTTP: $($_.Exception.Response.StatusCode.value__)"
    }
    exit 1
}
