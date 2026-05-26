# Evidencia de Homologacao de Pagamentos - Asaas

Use este arquivo para registrar a homologacao Pix, boleto e webhook antes de liberar pagamento real para cliente.

## Identificacao

- Cliente:
- Ambiente: Sandbox / Producao restrita
- Data:
- Responsavel tecnico:
- Responsavel do cliente:
- URL frontend:
- URL backend:
- URL webhook publica:

## Configuracao Validada

- `ASAAS_ENABLED=true`
- `ASAAS_BASE_URL=https://api-sandbox.asaas.com/v3`
- `ASAAS_API_KEY` configurada fora do Git
- `ASAAS_WEBHOOK_TOKEN` configurado fora do Git
- Webhook cadastrado no painel Asaas
- Banco com backup antes dos testes

## Matriz de Testes

| Teste | Resultado | Evidencia | Observacao |
| --- | --- | --- | --- |
| Criar cliente com CPF/CNPJ valido | Pendente |  |  |
| Gerar cobranca Pix | Pendente |  |  |
| Pix retorna `pay_...` | Pendente |  |  |
| Pix retorna copia e cola | Pendente |  |  |
| Pix retorna QR Code | Pendente |  |  |
| Gerar boleto | Pendente |  |  |
| Boleto retorna `pay_...` | Pendente |  |  |
| Boleto retorna linha digitavel | Pendente |  |  |
| Webhook rejeita token invalido | Pendente |  |  |
| Webhook `PAYMENT_RECEIVED` aprova financeiro | Pendente |  |  |
| Webhook `PAYMENT_CONFIRMED` aprova financeiro | Pendente |  |  |
| Webhook `PAYMENT_REFUNDED` estorna financeiro | Pendente |  |  |
| Webhook nao duplica receita | Pendente |  |  |
| Chaves reais nao aparecem no Git | Pendente |  |  |

## Comandos de Apoio

```powershell
.\scripts\test-asaas-webhook.ps1 `
  -PaymentId "pay_id_existente" `
  -Event "PAYMENT_RECEIVED" `
  -BaseUrl "http://localhost:8081"
```

```powershell
.\scripts\test-asaas-webhook.ps1 `
  -PaymentId "pay_id_existente" `
  -Event "PAYMENT_REFUNDED" `
  -BaseUrl "http://localhost:8081"
```

## Criterio de Aprovacao

- Todos os testes obrigatorios com resultado `Aprovado`.
- Evidencia anexada ou descrita.
- Financeiro conferido antes e depois dos webhooks.
- Cliente ciente de que sandbox nao movimenta dinheiro real.
- Producao somente liberada apos troca de `ASAAS_BASE_URL` e chave de producao.

## Decisao

- [ ] Aprovado para producao restrita
- [ ] Aprovado com pendencias
- [ ] Reprovado, manter sandbox

Pendencias:
-

Assinatura tecnica:
-

Assinatura do cliente:
-
