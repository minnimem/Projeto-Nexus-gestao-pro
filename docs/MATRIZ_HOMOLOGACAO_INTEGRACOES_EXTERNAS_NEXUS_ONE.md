# Matriz de Homologacao de Integracoes Externas - Nexus One

Esta matriz consolida a liberacao comercial de pagamentos, notificacoes, monitoramento e fiscal real.

## Regra Comercial

- Nao vender como recurso real aquilo que ainda esta em mock, sandbox ou modo controlado.
- Recurso em sandbox pode ser demonstrado, mas deve ser comunicado como homologacao.
- Producao controlada exige evidencia arquivada e responsavel definido.

## Matriz

| Integracao | Demonstracao | Piloto assistido | Producao controlada | Producao ampla |
| --- | --- | --- | --- | --- |
| Asaas Pix/boleto | Mock ou sandbox | Sandbox com evidencia | Chave real, webhook real e baixa validada | Monitoramento e conciliacao acompanhados |
| Notificacoes externas | Mock local | Canal real do cliente | Token forte e payload validado | Regras revisadas e falhas monitoradas |
| Monitoramento externo | Verificacao manual | Script recorrente | Webhook real testado | Responsavel e rotina de incidente ativa |
| Fiscal NF-e/NFC-e/NFS-e | Mock/controlado | Homologacao oficial por modelo | Emissao real restrita por filial/modelo | Validacao contador/provedor e contingencia |

## Verificacao Tecnica

Gerar relatorio sem expor tokens:

```powershell
.\scripts\verificar-integracoes-externas.ps1 -EnvFile .env -OutputDir reports
```

## Evidencias Obrigatorias

- Asaas: `docs/EVIDENCIA_HOMOLOGACAO_PAGAMENTOS_ASAAS.md` ou evidencia gerada para cliente.
- Notificacoes: `docs/EVIDENCIA_HOMOLOGACAO_NOTIFICACOES.md` ou evidencia gerada para cliente.
- Fiscal: `docs/EVIDENCIA_HOMOLOGACAO_FISCAL_REAL.md` ou evidencia por cliente/filial/modelo.
- Monitoramento: relatorio do `scripts/monitorar-disponibilidade.ps1` e prova de alerta recebido.

## Bloqueios

- `ASAAS_ENABLED=true` sem chave/token real bloqueia pagamento real.
- `NOTIFICATIONS_ENABLED=true` sem webhook/token real bloqueia notificacao real.
- Fiscal com `NEXUS_FISCAL_PROVIDER=controlled` ou `NEXUS_FISCAL_XML_SIGNER=controlled` nao pode ser vendido como emissao oficial.
- Monitoramento sem webhook/responsavel nao libera producao ampla.

## Decisao

Cliente:

Ambiente:

Data:

Integracoes liberadas:

- [ ] Asaas Pix.
- [ ] Asaas boleto.
- [ ] Webhook Asaas.
- [ ] Notificacoes externas.
- [ ] Monitoramento externo.
- [ ] NF-e.
- [ ] NFC-e.
- [ ] NFS-e.

Pendencias:

-
