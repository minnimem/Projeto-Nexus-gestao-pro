param(
    [string]$OutputDir = "docs",
    [string]$Cliente = "Cliente piloto",
    [string]$Ambiente = "Sandbox",
    [string]$BackendUrl = "http://localhost:8081",
    [string]$FrontendUrl = "http://localhost:5173",
    [string]$WebhookUrl = "https://seu-dominio-publico/webhooks/asaas"
)

$ErrorActionPreference = "Stop"

if (!(Test-Path -LiteralPath $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$safeCliente = ($Cliente -replace '[^a-zA-Z0-9_-]', '-').ToLowerInvariant()
$output = Join-Path $OutputDir "evidencia-asaas-$safeCliente.md"

$content = @"
# Evidencia Asaas - $Cliente

- Cliente: $Cliente
- Ambiente: $Ambiente
- Data: $date
- Frontend: $FrontendUrl
- Backend: $BackendUrl
- Webhook publico: $WebhookUrl

## Checklist

| Teste | Resultado | Evidencia | Observacao |
| --- | --- | --- | --- |
| Pix gerado com ID externo | Pendente |  |  |
| Pix copia e cola retornado | Pendente |  |  |
| Pix QR Code retornado | Pendente |  |  |
| Boleto gerado com ID externo | Pendente |  |  |
| Boleto linha digitavel retornada | Pendente |  |  |
| Webhook token invalido rejeitado | Pendente |  |  |
| Webhook PAYMENT_RECEIVED aprovado | Pendente |  |  |
| Webhook PAYMENT_REFUNDED estornado | Pendente |  |  |
| Financeiro sem duplicidade | Pendente |  |  |

## Observacoes

-

## Decisao

- [ ] Aprovado
- [ ] Aprovado com pendencias
- [ ] Reprovado
"@

Set-Content -LiteralPath $output -Value $content -Encoding UTF8
Write-Host "Evidencia criada em $output"
