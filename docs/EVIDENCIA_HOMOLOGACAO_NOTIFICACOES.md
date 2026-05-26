# Evidencia de Homologacao de Notificacoes Externas

Use este arquivo para registrar a homologacao de follow-up, estoque baixo e resumo diario no canal real do cliente.

## Identificacao

- Cliente:
- Ambiente: Mock / Sandbox / Canal real
- Canal: Webhook / WhatsApp / Email / Outro
- Data:
- Responsavel tecnico:
- Responsavel do cliente:
- URL webhook:
- Token configurado fora do Git: Sim / Nao

## Configuracao Validada

- `NOTIFICATIONS_ENABLED=true`
- `NOTIFICATIONS_WEBHOOK_URL` configurada
- `NOTIFICATIONS_TOKEN` configurado fora do Git
- `GET /notificacoes/status` retorna `ativo=true`
- Backend registra erro quando o destino rejeita payload/token

## Matriz de Testes

| Teste | Resultado | Evidencia | Observacao |
| --- | --- | --- | --- |
| Status mostra webhook configurado | Pendente |  |  |
| Token correto retorna HTTP 200 | Pendente |  |  |
| Token divergente retorna HTTP 401 | Pendente |  |  |
| Payload comercial completo retorna sucesso | Pendente |  |  |
| Payload comercial sem campos obrigatorios retorna HTTP 422 | Pendente |  |  |
| Follow-up comercial respeita regra ativa | Pendente |  |  |
| Follow-up comercial envia canal configurado | Pendente |  |  |
| Follow-up comercial envia assunto e mensagem pronta | Pendente |  |  |
| Follow-up recebe `notificacaoExternaEm` | Pendente |  |  |
| Estoque baixo envia total e itens | Pendente |  |  |
| Resumo diario envia vendas, financeiro e estoque | Pendente |  |  |
| Reenvio automatico nao duplica notificacao | Pendente |  |  |

## Comandos de Apoio

Mock local:

```powershell
$env:MOCK_NOTIFICATION_TOKEN="token-local"
npm run mock:notifications
```

Teste automatico:

```powershell
$env:MOCK_NOTIFICATION_TOKEN="token-local"
npm run test:notifications
```

Backend com notificacoes:

```powershell
$env:NOTIFICATIONS_ENABLED="true"
$env:NOTIFICATIONS_WEBHOOK_URL="http://localhost:8099/nexus-notifications"
$env:NOTIFICATIONS_TOKEN="token-local"
```

## Criterio de Aprovacao

- Todos os testes obrigatorios com resultado `Aprovado`.
- Evidencia do payload recebida pelo canal do cliente.
- Token divergente rejeitado.
- Follow-up comercial respeitando regra configurada na tela `Vendas > CRM`.
- Cliente confirmou recebimento e formato da mensagem.

## Decisao

- [ ] Aprovado para producao restrita
- [ ] Aprovado com pendencias
- [ ] Reprovado, manter mock/sandbox

Pendencias:
-

Assinatura tecnica:
-

Assinatura do cliente:
-
