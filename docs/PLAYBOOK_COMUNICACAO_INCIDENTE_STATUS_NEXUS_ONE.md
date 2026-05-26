# Playbook de Comunicacao de Incidente e Status - Nexus One

Data de referencia: 10/05/2026

Este playbook padroniza comunicados externos para clientes durante incidente, indisponibilidade, degradacao, manutencao programada ou encerramento de problema. Ele complementa a ficha tecnica de suporte e evita mensagens improvisadas em momentos sensiveis.

## Quando Usar

- Incidente P0 ou P1 com impacto em producao, piloto assistido ou producao controlada.
- Indisponibilidade de frontend, backend, banco, login, caixa, vendas, financeiro ou fiscal.
- Degradacao de performance que afete operacao do cliente.
- Manutencao programada com risco de indisponibilidade.
- Falha em provedor externo: pagamento, fiscal, notificacao, hospedagem ou internet do cliente.
- Encerramento de incidente com causa, acao e orientacao final.

## Tipos de Comunicacao

| Tipo | Quando usar | Conteudo minimo |
| --- | --- | --- |
| Abertura | Problema confirmado ou em investigacao | impacto, inicio, prioridade e proxima atualizacao |
| Atualizacao | Incidente ainda aberto | status atual, acao em andamento e novo horario de retorno |
| Contorno | Existe alternativa operacional | passos seguros para o cliente continuar |
| Manutencao | Intervencao planejada | janela, impacto esperado, responsavel e plano de rollback |
| Encerramento | Servico normalizado | horario de normalizacao, causa resumida, acao e monitoramento |
| Pos-incidente | Incidente relevante P0/P1 | causa raiz, prevencao e melhorias prometidas |

## Regras de Comunicacao

- Comunicar primeiro impacto e proxima atualizacao; detalhes tecnicos ficam para depois.
- Evitar prometer prazo exato sem evidencia.
- Informar se existe contorno operacional.
- Separar responsabilidade interna, provedor externo e infraestrutura do cliente.
- Nao expor senhas, tokens, dados pessoais, logs sensiveis ou nomes de outros clientes.
- Para P0, atualizar no maximo a cada 30 minutos ate contorno ou normalizacao.
- Para P1, atualizar conforme SLA ou sempre que houver mudanca relevante.
- Encerrar apenas quando o fluxo afetado tiver sido validado.

## Campos Obrigatorios

- Cliente ou grupo de clientes afetados.
- Prioridade: P0, P1, P2 ou P3.
- Tipo de comunicado.
- Modulo/servico afetado.
- Impacto percebido.
- Status atual.
- Acao em andamento.
- Contorno, se existir.
- Proxima atualizacao.
- Responsavel Nexus One.

## Modelo de Abertura

Assunto: Incidente em acompanhamento - Nexus One

Identificamos instabilidade em `[modulo/servico]`, com impacto em `[impacto]`. Nossa equipe ja esta atuando na analise e manteremos atualizacoes ate a normalizacao.

Status atual: `[status]`.
Proxima atualizacao: `[horario]`.
Contorno temporario: `[contorno ou nao disponivel]`.

## Modelo de Encerramento

Assunto: Incidente normalizado - Nexus One

O incidente em `[modulo/servico]` foi normalizado em `[horario]`. A acao aplicada foi `[acao]`.

Seguiremos monitorando o ambiente e registraremos as medidas preventivas quando aplicavel.

## Evidencias a Arquivar

- Ficha de incidente gerada por `scripts/gerar-incidente-suporte.ps1`.
- Comunicados gerados por `scripts/gerar-comunicado-incidente-status.ps1`.
- Evidencia de monitoramento, logs ou provedor.
- Registro de causa raiz e acao preventiva para P0/P1.
- Confirmacao de normalizacao pelo cliente ou smoke test.

## Gerador

```powershell
.\scripts\gerar-comunicado-incidente-status.ps1 -Cliente "Cliente Piloto" -Tipo "Abertura" -Prioridade P1 -Modulo "Caixa" -Impacto "Fechamento de caixa indisponivel"
```

Arquive o comunicado em `reports\suporte` junto da ficha do incidente.
