# Homologacao Asaas Sandbox

Este roteiro valida a emissao real de Pix/boleto no Asaas sandbox e a baixa automatica por webhook no Nexus One.

Referencias oficiais usadas:

- Criar cobranca: https://docs.asaas.com/reference/create-new-payment
- QR Code Pix: https://docs.asaas.com/reference/get-qr-code-for-pix-payments
- Webhooks: https://docs.asaas.com/docs/receive-asaas-events-at-your-webhook-endpoint
- Eventos de pagamento: https://docs.asaas.com/docs/payment-events

## 1. Variaveis obrigatorias

Defina no ambiente antes de iniciar o backend:

```powershell
$env:DB_URL="jdbc:postgresql://localhost:5432/TB_ADS"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="sua-senha-local"
$env:JWT_SECRET="trocar_por_uma_chave_local_com_32_ou_mais_caracteres"
$env:NEXUS_ALLOWED_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"
$env:ASAAS_ENABLED="true"
$env:ASAAS_API_KEY="sua-chave-sandbox"
$env:ASAAS_BASE_URL="https://api-sandbox.asaas.com/v3"
$env:ASAAS_WEBHOOK_TOKEN="token-forte-para-webhook"
```

Nunca versionar `ASAAS_API_KEY`, `ASAAS_WEBHOOK_TOKEN`, `DB_PASSWORD` ou `JWT_SECRET`.
Use `.env.backend.example` como modelo de preenchimento local.

## 2. Subir backend e frontend

Backend:

```powershell
cd backend\projectoads\projectoads
mvn spring-boot:run
```

Frontend:

```powershell
npm run dev
```

Conferir:

- Backend em `http://localhost:8081`.
- Frontend em `http://localhost:5173`.
- Login com usuario que tenha permissao de caixa/financeiro.

## 3. Gerar cobranca Pix

Fluxo recomendado pela interface:

1. Criar ou usar um cliente com CPF/CNPJ, nome, email e telefone validos.
2. Criar pedido pendente com metodo `PIX`.
3. No Caixa ou Financeiro, acionar `Gerar cobranca`.
4. Conferir se o retorno mostra:
   - `cobrancaProvedor = ASAAS`;
   - ID externo `pay_...`;
   - Pix copia e cola;
   - QR Code Pix.

O backend cria ou reaproveita o cliente Asaas e chama:

- `POST /customers`, quando o cliente ainda nao possui `asaasCustomerId`;
- `POST /payments`, com `billingType = PIX`;
- `GET /payments/{id}/pixQrCode`, para obter `payload` e `encodedImage`.

## 4. Gerar boleto

Fluxo recomendado pela interface:

1. Criar pedido pendente com metodo `BOLETO`.
2. Acionar `Gerar cobranca`.
3. Conferir se o retorno mostra:
   - `cobrancaProvedor = ASAAS`;
   - ID externo `pay_...`;
   - linha digitavel;
   - numero/nosso numero quando retornado pelo Asaas;
   - URL da cobranca, quando retornada.

O backend chama:

- `POST /payments`, com `billingType = BOLETO`;
- `GET /payments/{id}/identificationField`, para obter linha digitavel.

## 5. Configurar webhook no Asaas

No painel sandbox do Asaas, cadastrar:

- URL: `https://seu-dominio-publico/webhooks/asaas`
- Metodo: `POST`
- Header/token: usar o mesmo valor de `ASAAS_WEBHOOK_TOKEN`
- Eventos: ao menos eventos de cobranca/pagamento.

Para teste local, publique o backend com um tunel HTTPS apontando para `localhost:8081`.

O endpoint local espera o token no header:

```text
asaas-access-token: mesmo-valor-de-ASAAS_WEBHOOK_TOKEN
```

## 6. Teste manual do webhook

Antes do teste real pelo painel, valide o endpoint com um ID externo gravado em um financeiro:

```powershell
.\scripts\test-asaas-webhook.ps1 `
  -PaymentId "pay_id_existente_no_financeiro" `
  -Event "PAYMENT_RECEIVED"
```

Resultado esperado:

- HTTP 200.
- Lancamento financeiro com `status = APROVADO`.
- Observacao contendo `Webhook Asaas PAYMENT_RECEIVED aplicado`.

## 7. Eventos tratados pelo Nexus One

Eventos que baixam/aprovam financeiro:

- `PAYMENT_RECEIVED`
- `PAYMENT_CONFIRMED`
- `PAYMENT_CREDITED`

Eventos que cancelam ou estornam:

- `PAYMENT_DELETED` -> `CANCELADO`
- `PAYMENT_REFUNDED` -> `ESTORNADO`
- `PAYMENT_REFUND_IN_PROGRESS` -> `ESTORNADO`

Evento que mantem pendente:

- `PAYMENT_OVERDUE` -> `PENDENTE`

Eventos desconhecidos sao registrados na observacao e nao alteram o status.

## 8. Checklist de homologacao

- Pix sandbox gera `pay_...`, copia e cola e QR Code.
- Boleto sandbox gera `pay_...` e linha digitavel.
- Webhook com token invalido e rejeitado.
- Webhook `PAYMENT_RECEIVED` muda financeiro para aprovado.
- Webhook `PAYMENT_REFUNDED` muda financeiro para estornado.
- Pedido/financeiro nao duplica receita ao receber baixa por webhook.
- Chaves reais permanecem fora do Git.

Registre a homologacao no arquivo:

- `docs/EVIDENCIA_HOMOLOGACAO_PAGAMENTOS_ASAAS.md`

Ou gere uma copia para o cliente piloto:

```powershell
.\scripts\gerar-evidencia-asaas.ps1 `
  -Cliente "Nome do cliente" `
  -Ambiente "Sandbox" `
  -BackendUrl "http://localhost:8081" `
  -FrontendUrl "http://localhost:5173" `
  -WebhookUrl "https://seu-dominio-publico/webhooks/asaas"
```

## 9. Producao

Somente migrar para producao depois que Pix, boleto e webhook passarem em sandbox.

Variaveis de producao:

```powershell
$env:ASAAS_ENABLED="true"
$env:ASAAS_API_KEY="chave-producao"
$env:ASAAS_BASE_URL="https://api.asaas.com/v3"
$env:ASAAS_WEBHOOK_TOKEN="token-producao"
```

Atualizar o webhook no painel Asaas para a URL HTTPS definitiva do sistema.
