# Homologacao de Notificacoes Externas

Este roteiro valida os envios externos do Nexus One para follow-ups, estoque baixo e resumo diario.

## 1. Subir receptor local

Em um terminal na raiz do projeto:

```powershell
$env:MOCK_NOTIFICATION_TOKEN="token-local"
npm run mock:notifications
```

O receptor fica em:

```text
http://localhost:8099/nexus-notifications
```

Ele imprime no console todo JSON recebido e valida o header `X-Nexus-Token` quando `MOCK_NOTIFICATION_TOKEN` estiver definido. Para follow-up comercial, tambem valida se `canal`, `regraAutomacao`, `assunto` e `mensagem` foram enviados; se faltar algum campo, retorna HTTP 422.

## 2. Configurar backend

Antes de subir o backend, defina:

```powershell
$env:NOTIFICATIONS_ENABLED="true"
$env:NOTIFICATIONS_WEBHOOK_URL="http://localhost:8099/nexus-notifications"
$env:NOTIFICATIONS_TOKEN="token-local"
```

As demais variaveis obrigatorias do backend continuam sendo `DB_PASSWORD` e `JWT_SECRET`.

## 3. Disparos manuais

Com o backend em `http://localhost:8081` e usuario `ADMIN` ou `GERENTE`, acione pela interface ou pelos endpoints:

```text
GET /notificacoes/status
POST /notificacoes/follow-ups/enviar
POST /notificacoes/estoque-baixo/enviar
POST /notificacoes/resumo-diario/enviar
```

Resposta esperada:

- Status: `ativo`, `habilitado`, `webhookConfigurado`, `tokenConfigurado`, `destino`, `proximaAcao`.
- Follow-ups: `ativo`, `cobrancasEnviadas`, `comerciaisEnviadas`, `totalEnviado`.
- Estoque baixo: `ativo`, `itensEnviados`.
- Resumo diario: `ativo`, `resumosEnviados`.

## 4. Teste automatico do mock

Com o mock em execucao, rode em outro terminal:

```powershell
$env:MOCK_NOTIFICATION_TOKEN="token-local"
npm run test:notifications
```

O script valida:

- payload comercial completo retorna HTTP 200 e `commercialReady=true`;
- payload comercial sem canal/regra/assunto/mensagem retorna HTTP 422;
- token divergente retorna HTTP 401 quando `MOCK_NOTIFICATION_TOKEN` esta definido.

## 5. Payloads esperados

Follow-up:

```json
{
  "origem": "NEXUS_ONE",
  "evento": "FOLLOW_UP_VENCIDO_OU_HOJE",
  "tipo": "COBRANCA ou COMERCIAL"
}
```

Follow-up comercial com regras persistidas:

```json
{
  "origem": "NEXUS_ONE",
  "evento": "FOLLOW_UP_VENCIDO_OU_HOJE",
  "tipo": "COMERCIAL",
  "canal": "WEBHOOK",
  "regraAutomacao": "FOLLOW_UP_VENCIDO, ACAO_DE_HOJE, ALTO_VALOR_ABERTO ou SEM_PROXIMA_ACAO",
  "assunto": "Follow-up comercial vencido",
  "mensagem": "Follow-up comercial vencido: cliente ..., pedido ..., valor ..., proxima acao ...",
  "pedidoId": "...",
  "pedidoNumero": "...",
  "valor": 1000
}
```

As regras comerciais sao configuradas na tela `Vendas > CRM`, no bloco de regras de automacao, e persistidas no backend por empresa/filial em:

```text
GET /pedidos/follow-ups/configuracao
PUT /pedidos/follow-ups/configuracao
```

Para validar:

1. Na tela `Vendas > CRM`, escolha o canal padrao e salve as regras.
2. Desative `Acao de hoje`, crie um follow-up comercial para hoje e acione `POST /notificacoes/follow-ups/enviar`.
3. Resultado esperado: o retorno pode ter cobrancas enviadas, mas `comerciaisEnviadas` nao deve contar esse follow-up de hoje.
4. Ative `Acao de hoje`, salve as regras e dispare novamente com outro follow-up elegivel.
5. Resultado esperado: o receptor local imprime `commercialRule` com `canal`, `regraAutomacao`, `assunto` e `mensagemPreview`.

Estoque baixo:

```json
{
  "origem": "NEXUS_ONE",
  "evento": "ESTOQUE_BAIXO",
  "tipo": "ESTOQUE",
  "totalItens": 1
}
```

Resumo diario:

```json
{
  "origem": "NEXUS_ONE",
  "evento": "RESUMO_DIARIO",
  "tipo": "RELATORIO"
}
```

## 6. Checklist de homologacao

- Com `NOTIFICATIONS_ENABLED=false`, endpoints retornam `ativo=false` e nao enviam webhook.
- `GET /notificacoes/status` mostra se o webhook esta habilitado, configurado e pronto para disparo.
- Com URL/token corretos, receptor local recebe JSON e retorna HTTP 200.
- Com token divergente, receptor retorna HTTP 401 e o backend registra erro.
- Follow-ups enviados recebem `notificacaoExternaEm` para evitar reenvio automatico.
- Follow-ups comerciais respeitam as regras persistidas por empresa/filial antes de enviar.
- Payload comercial mostra `regraAutomacao`, `assunto`, `mensagem` pronta e usa o canal configurado.
- Mock local retorna HTTP 422 se o payload comercial chegar sem canal, regra, assunto ou mensagem.
- Estoque baixo envia quantidade, minimo, maximo e localizacao.
- Resumo diario envia vendas, pedidos concluidos, receitas, despesas, resultado e quantidade de itens em estoque baixo.

Registre a homologacao no arquivo:

- `docs/EVIDENCIA_HOMOLOGACAO_NOTIFICACOES.md`

Ou gere uma copia para o cliente piloto:

```powershell
.\scripts\gerar-evidencia-notificacoes.ps1 `
  -Cliente "Nome do cliente" `
  -Ambiente "Canal real" `
  -Canal "Webhook" `
  -WebhookUrl "https://webhook-cliente.com/nexus"
```

## 7. Producao

Substituir `NOTIFICATIONS_WEBHOOK_URL` pela URL final do cliente e usar um `NOTIFICATIONS_TOKEN` forte.

```powershell
$env:NOTIFICATIONS_ENABLED="true"
$env:NOTIFICATIONS_WEBHOOK_URL="https://webhook-cliente.com/nexus"
$env:NOTIFICATIONS_TOKEN="token-forte-do-cliente"
```
