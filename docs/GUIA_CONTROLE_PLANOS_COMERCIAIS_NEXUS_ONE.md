# Guia de Controle de Planos Comerciais - Nexus One

## Objetivo

Controlar comercialmente o que cada empresa pode usar sem manter versoes diferentes do sistema.

## Planos

| Plano | Limites padrao | Uso indicado |
| --- | --- | --- |
| STARTER | 3 usuarios, 1 filial, 1 caixa, 500 produtos | Loja pequena |
| BUSINESS | 8 usuarios, 3 filiais, 3 caixas, 5.000 produtos | Plano principal |
| ENTERPRISE | 15 usuarios, 5 filiais, 5 caixas, 20.000 produtos | Operacao maior ou contrato customizado |

Os limites podem ser ajustados por empresa quando houver adicional ou contrato especial.

## Status da Assinatura

- `TESTE`: permite operar em piloto.
- `ATIVA`: permite operar normalmente.
- `PENDENTE`: bloqueia modulos controlados.
- `SUSPENSA`: bloqueia modulos controlados.
- `CANCELADA`: bloqueia modulos controlados.

## Modulos Condicionados

O plano e as liberacoes extras controlam:

- Fiscal real.
- Pagamentos reais.
- Notificacoes externas.
- Logistica.
- Servicos/ordens de servico.
- Auditoria avancada.

Fiscal, pagamentos e notificacoes devem ser liberados somente depois de homologacao real ou classificacao formal como escopo permitido.

## Central de Liberacao

Cada modulo controlado pode ter um status proprio:

| Status | Uso |
| --- | --- |
| `BLOQUEADO` | Recurso fora do plano ou bloqueado manualmente |
| `CONTRATADO` | Cliente comprou, mas ainda nao pode usar |
| `PENDENTE_HOMOLOGACAO` | Depende de provedor, dados, certificado, contador ou teste real |
| `HOMOLOGADO` | Evidencia aprovada, aguardando decisao final de producao |
| `LIBERADO_PRODUCAO` | Recurso liberado tecnicamente para uso real |
| `SUSPENSO` | Recurso pausado por inadimplencia, incidente, risco ou decisao comercial |

Para modulos condicionados, a liberacao real deve ser `LIBERADO_PRODUCAO`. `CONTRATADO`, `PENDENTE_HOMOLOGACAO`, `HOMOLOGADO`, `BLOQUEADO` e `SUSPENSO` impedem o uso quando houver registro na central.

## Endpoints

- `GET /empresa/plano`: consulta plano, limites e modulos.
- `PUT /empresa/plano`: atualiza plano, limites e liberacoes.
- `GET /empresa/liberacoes`: consulta a Central de Liberacao.
- `PUT /empresa/liberacoes`: atualiza o status de um modulo controlado.

O endpoint de atualizacao exige permissao manual `action:managePlans`.

## Bootstrap da Permissao Tecnica

Como a permissao de planos e sensivel, ela deve ser concedida por banco a um responsavel tecnico:

```sql
UPDATE usuario
SET permissoes_extras = CASE
    WHEN permissoes_extras IS NULL OR permissoes_extras = '' THEN 'action:managePlans'
    WHEN permissoes_extras NOT LIKE '%action:managePlans%' THEN permissoes_extras || ',action:managePlans'
    ELSE permissoes_extras
END
WHERE login = 'admin';
```

Depois disso, esse responsavel consegue gerenciar planos pela tela Admin.

## Migracao

Antes de producao com `ddl-auto=validate`, aplicar:

```text
docs/MIGRACAO_PLANOS_COMERCIAIS_NEXUS_ONE.sql
```

Em ambiente local com `ddl-auto=update`, as colunas sao criadas automaticamente.
