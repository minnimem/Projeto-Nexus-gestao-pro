param(
    [string]$OutputDir = "docs",
    [string]$Cliente = "Cliente piloto",
    [string]$Ambiente = "Mock",
    [string]$Canal = "Webhook",
    [string]$WebhookUrl = "http://localhost:8099/nexus-notifications"
)

$ErrorActionPreference = "Stop"

if (!(Test-Path -LiteralPath $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$safeCliente = ($Cliente -replace '[^a-zA-Z0-9_-]', '-').ToLowerInvariant()
$output = Join-Path $OutputDir "evidencia-notificacoes-$safeCliente.md"

$content = @"
# Evidencia de Notificacoes - $Cliente

- Cliente: $Cliente
- Ambiente: $Ambiente
- Canal: $Canal
- Data: $date
- Webhook: $WebhookUrl

## Checklist

| Teste | Resultado | Evidencia | Observacao |
| --- | --- | --- | --- |
| Status mostra webhook configurado | Pendente |  |  |
| Token correto retorna HTTP 200 | Pendente |  |  |
| Token divergente retorna HTTP 401 | Pendente |  |  |
| Follow-up comercial respeita regra ativa | Pendente |  |  |
| Follow-up comercial envia assunto e mensagem | Pendente |  |  |
| Estoque baixo recebido | Pendente |  |  |
| Resumo diario recebido | Pendente |  |  |
| Reenvio automatico nao duplica notificacao | Pendente |  |  |

## Observacoes

-

## Decisao

- [ ] Aprovado
- [ ] Aprovado com pendencias
- [ ] Reprovado
"@

Set-Content -LiteralPath $output -Value $content -Encoding UTF8
Write-Host "Evidencia criada em $output"
