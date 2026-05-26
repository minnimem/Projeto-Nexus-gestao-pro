# Inventario de Segredos - Nexus One

Este inventario registra quais segredos existem, onde devem ficar e quando precisam ser rotacionados. Nao preencha valores reais neste arquivo.

## Segredos Obrigatorios

| Chave | Ambiente | Origem recomendada | Rotacao sugerida | Observacao |
| --- | --- | --- | --- | --- |
| `POSTGRES_PASSWORD` | homologacao/producao | `.env` protegido ou cofre do servidor | 90 dias ou incidente | Senha do usuario PostgreSQL |
| `DB_PASSWORD` | homologacao/producao | `.env` protegido ou cofre do servidor | 90 dias ou incidente | Deve acompanhar acesso do backend |
| `JWT_SECRET` | homologacao/producao | cofre do servidor | 180 dias ou incidente | Minimo 32 caracteres |

## Segredos Condicionais

| Chave | Quando usar | Origem recomendada | Rotacao sugerida | Observacao |
| --- | --- | --- | --- | --- |
| `ASAAS_API_KEY` | Asaas habilitado | painel Asaas/cofre | 90 dias ou troca de conta | Nunca usar token de producao em homologacao |
| `ASAAS_WEBHOOK_TOKEN` | Webhook Asaas habilitado | painel Asaas/cofre | 90 dias ou incidente | Validar com evidencia de pagamento |
| `NOTIFICATIONS_WEBHOOK_URL` | Notificacoes externas habilitadas | provedor do canal/cofre | 90 dias ou troca de canal | Pode apontar para Slack, Teams, WhatsApp gateway ou webhook proprio |
| `NOTIFICATIONS_TOKEN` | Notificacoes externas habilitadas | provedor do canal/cofre | 90 dias ou incidente | Usado para autenticar envio externo |
| `NEXUS_MONITOR_WEBHOOK_URL` | Alerta de disponibilidade | provedor de alerta/cofre | 180 dias ou incidente | Usado pelo monitoramento do servidor |
| `NEXUS_FISCAL_CERT_PASSWORD` | Fiscal real com A1 | cofre do servidor | conforme certificado | Nunca versionar |
| `NEXUS_FISCAL_CSC_TOKEN` | NFC-e real | SEFAZ/contador/cofre | conforme contador/SEFAZ | Nunca retornar ao frontend |

## Registro de Rotacao

| Data | Chave | Ambiente | Responsavel | Motivo | Validacao realizada |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |

## Regras

- Registrar apenas nome da chave, ambiente e responsavel.
- Nunca colar senha, token, certificado ou trecho de chave neste arquivo.
- Toda rotacao deve ter backup antes, atualizacao do `.env`/cofre, reinicio controlado e validacao funcional.
- Em producao, preferir cofre/secret manager do provedor quando disponivel.
