# Homologacao de Notificacoes Externas

Este roteiro valida os envios externos do Nexus One para follow-ups, estoque baixo e resumo diario.

## 1. Subir receptor local

Em um terminal na raiz do projeto:

```powershell
$env:MOCK_NOTIFICATION_TOKEN="token-local"
node .\scripts\mock-notification-webhook.js
```

O receptor fica em:

```text
http://localhost:8099/nexus-notifications
```

Ele imprime no console todo JSON recebido e valida o header `X-Nexus-Token` quando `MOCK_NOTIFICATION_TOKEN` estiver definido.

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
POST /notificacoes/follow-ups/enviar
POST /notificacoes/estoque-baixo/enviar
POST /notificacoes/resumo-diario/enviar
```

Resposta esperada:

- Follow-ups: `ativo`, `cobrancasEnviadas`, `comerciaisEnviadas`, `totalEnviado`.
- Estoque baixo: `ativo`, `itensEnviados`.
- Resumo diario: `ativo`, `resumosEnviados`.

## 4. Payloads esperados

Follow-up:

```json
{
  "origem": "NEXUS_ONE",
  "evento": "FOLLOW_UP_VENCIDO_OU_HOJE",
  "tipo": "COBRANCA ou COMERCIAL"
}
```

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

## 5. Checklist de homologacao

- Com `NOTIFICATIONS_ENABLED=false`, endpoints retornam `ativo=false` e nao enviam webhook.
- Com URL/token corretos, receptor local recebe JSON e retorna HTTP 200.
- Com token divergente, receptor retorna HTTP 401 e o backend registra erro.
- Follow-ups enviados recebem `notificacaoExternaEm` para evitar reenvio automatico.
- Estoque baixo envia quantidade, minimo, maximo e localizacao.
- Resumo diario envia vendas, pedidos concluidos, receitas, despesas, resultado e quantidade de itens em estoque baixo.

## 6. Producao

Substituir `NOTIFICATIONS_WEBHOOK_URL` pela URL final do cliente e usar um `NOTIFICATIONS_TOKEN` forte.

```powershell
$env:NOTIFICATIONS_ENABLED="true"
$env:NOTIFICATIONS_WEBHOOK_URL="https://webhook-cliente.com/nexus"
$env:NOTIFICATIONS_TOKEN="token-forte-do-cliente"
```
