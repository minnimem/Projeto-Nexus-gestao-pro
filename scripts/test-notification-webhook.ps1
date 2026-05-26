param(
    [string]$BaseUrl = "http://localhost:8099/nexus-notifications",

    [string]$Token = $env:MOCK_NOTIFICATION_TOKEN
)

$headers = @{
    "Content-Type" = "application/json"
}

if (-not [string]::IsNullOrWhiteSpace($Token)) {
    $headers["X-Nexus-Token"] = $Token
}

function Invoke-NotificationPost {
    param(
        [hashtable]$Payload,
        [hashtable]$Headers = $headers
    )

    $body = $Payload | ConvertTo-Json -Depth 8
    Invoke-RestMethod -Method POST -Uri $BaseUrl -Headers $Headers -Body $body
}

function Assert-Equals {
    param(
        [object]$Expected,
        [object]$Actual,
        [string]$Message
    )

    if ($Expected -ne $Actual) {
        Write-Error "$Message Esperado: $Expected | Recebido: $Actual"
        exit 1
    }
}

$commercialPayload = @{
    origem = "NEXUS_ONE"
    evento = "FOLLOW_UP_VENCIDO_OU_HOJE"
    tipo = "COMERCIAL"
    id = "00000000-0000-0000-0000-000000000101"
    cliente = "Rebeka Gomes"
    canal = "WHATSAPP"
    regraAutomacao = "ALTO_VALOR_ABERTO"
    assunto = "Oportunidade de alto valor"
    mensagem = "Oportunidade de alto valor: cliente Rebeka Gomes, pedido PED-123, valor R$ 1500.00, proxima acao 2026-05-09."
    pedidoId = "00000000-0000-0000-0000-000000000202"
    pedidoNumero = "PED-123"
    valor = 1500
    proximaAcao = "2026-05-09"
}

try {
    $response = Invoke-NotificationPost -Payload $commercialPayload
    Assert-Equals $true $response.received "Payload comercial completo nao foi recebido."
    Assert-Equals $true $response.commercialReady "Payload comercial completo nao foi marcado como pronto."
    Write-Host "Payload comercial completo aprovado."
} catch {
    Write-Error "Falha ao enviar payload comercial completo para $BaseUrl"
    Write-Error $_.Exception.Message
    if ($_.Exception.Response) {
        Write-Error "HTTP: $($_.Exception.Response.StatusCode.value__)"
    }
    exit 1
}

$invalidPayload = @{
    origem = "NEXUS_ONE"
    evento = "FOLLOW_UP_VENCIDO_OU_HOJE"
    tipo = "COMERCIAL"
    cliente = "Cliente sem mensagem"
}

try {
    Invoke-NotificationPost -Payload $invalidPayload | Out-Null
    Write-Error "Payload comercial incompleto deveria retornar HTTP 422."
    exit 1
} catch {
    $status = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { $null }
    Assert-Equals 422 $status "Payload comercial incompleto retornou status inesperado."
    Write-Host "Payload comercial incompleto rejeitado com HTTP 422."
}

if (-not [string]::IsNullOrWhiteSpace($Token)) {
    $invalidHeaders = @{
        "Content-Type" = "application/json"
        "X-Nexus-Token" = "token-invalido"
    }

    try {
        Invoke-NotificationPost -Payload $commercialPayload -Headers $invalidHeaders | Out-Null
        Write-Error "Token invalido deveria retornar HTTP 401."
        exit 1
    } catch {
        $status = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { $null }
        Assert-Equals 401 $status "Token invalido retornou status inesperado."
        Write-Host "Token invalido rejeitado com HTTP 401."
    }
}

Write-Host "Homologacao do webhook de notificacoes concluida com sucesso."
