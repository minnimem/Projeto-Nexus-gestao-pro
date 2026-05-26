# Processo de Feedback e NPS do Cliente - Nexus One

Data de referencia: 10/05/2026

Este processo padroniza a coleta de feedback, NPS, satisfacao, risco e oportunidades de evolucao apos demo, piloto, implantacao, release ou atendimento relevante. O objetivo e transformar opiniao do cliente em decisao comercial, suporte ou produto sem misturar melhoria desejada com pendencia bloqueante.

## Quando Usar

- Apos demonstracao comercial relevante.
- No D7, D15 e D30 do piloto assistido.
- Apos aceite de producao controlada.
- Apos incidente P0/P1 encerrado.
- Apos release com impacto perceptivel.
- Antes de renovacao, upgrade, downgrade ou cancelamento.
- Quando o cliente fizer elogio, reclamacao ou pedido de melhoria importante.

## Perguntas Recomendadas

- De 0 a 10, qual a chance de recomendar o Nexus One?
- Qual foi o principal ganho percebido?
- Qual foi a maior dificuldade?
- O que ainda impede o uso pleno?
- Qual modulo trouxe mais valor?
- Qual modulo precisa de mais atencao?
- O suporte/implantacao resolveu suas duvidas?
- Existe risco de cancelar, pausar ou reduzir plano?
- Existe oportunidade de upgrade, modulo adicional ou referencia comercial?

## Classificacao NPS

| Nota | Classificacao | Acao |
| ---: | --- | --- |
| 0 a 6 | Detrator | Abrir plano de acao, revisar causa e envolver responsavel |
| 7 a 8 | Neutro | Melhorar adocao, treinamento e valor percebido |
| 9 a 10 | Promotor | Avaliar referencia comercial, caso de sucesso e expansao |

## Matriz de Acao Por NPS e Risco

| NPS | Risco de cancelamento | Acao obrigatoria | Prazo de retorno |
| --- | --- | --- | --- |
| Detrator | Alto | Plano de acao, responsavel senior e revisao de escopo | Ate 24h uteis |
| Detrator | Medio/Baixo | Plano de correcao e nova coleta | Ate 3 dias uteis |
| Neutro | Alto | Plano de retencao e reforco de valor | Ate 48h uteis |
| Neutro | Medio/Baixo | Treinamento, base de conhecimento ou ajuste de uso | Ate 7 dias |
| Promotor | Baixo | Pedir autorizacao de referencia e avaliar expansao | Ate 7 dias |
| Promotor | Medio/Alto | Resolver risco antes de pedir referencia | Ate 3 dias uteis |

## Separacao Correta

| Tipo | Como tratar |
| --- | --- |
| Bug | Registrar incidente, evidencia e prioridade |
| Pendencia de implantacao | Registrar em riscos/pendencias |
| Duvida de uso | Virar base de conhecimento ou treinamento |
| Melhoria desejada | Entrar no backlog com impacto e frequencia |
| Oportunidade comercial | Avaliar upgrade, modulo adicional ou referencia |
| Risco de churn | Abrir retencao ou plano de acao |

## Saidas do Feedback

- Plano de acao de suporte/implantacao.
- Atualizacao da saude do cliente.
- Artigo de base de conhecimento ou reforco de treinamento.
- Priorizacao de roadmap.
- Registro de retencao/renovacao.
- Autorizacao de referencia comercial.
- Oportunidade de upgrade/modulo adicional.

## Regras

- Nao prometer prazo de melhoria sem avaliacao.
- Nao tratar pedido de customizacao como bug.
- Nao usar feedback positivo como referencia comercial sem autorizacao.
- Feedback negativo deve gerar responsavel, prazo de retorno e proxima revisao.
- Feedback recorrente deve atualizar base de conhecimento, treinamento ou roadmap.
- Melhoria de produto deve ser priorizada com `docs/PROCESSO_PRIORIZACAO_ROADMAP_CLIENTE_NEXUS_ONE.md` antes de promessa comercial.
- NPS promotor nao libera referencia comercial sem autorizacao formal.
- NPS detrator ou risco alto deve atualizar a rotina de saude do cliente.

## Follow-up Obrigatorio

Registrar:

- Responsavel pelo retorno:
- Data prometida:
- Canal do retorno:
- Acao combinada:
- Evidencia esperada:
- Nova coleta agendada: sim / nao

## Evidencias a Arquivar

- Relatorio de feedback/NPS gerado por `scripts/gerar-feedback-nps-cliente.ps1`.
- Relatorio de saude do cliente.
- Registro de risco/pendencia, quando houver bloqueio.
- Artigo de base de conhecimento, quando virar duvida recorrente.
- Priorizacao de roadmap, quando virar melhoria de produto ou bloqueio comercial.
- Autorizacao de referencia comercial, quando houver uso de nome/logo/depoimento/caso.

## Gerador

```powershell
.\scripts\gerar-feedback-nps-cliente.ps1 -Cliente "Cliente Piloto" -NotaNps 9 -Momento "D30 piloto" -PrincipalGanho "Fechamento de caixa mais claro"
```

Arquive em `reports\sucesso-cliente` junto da saude do cliente e do pacote de entrega.

Quando o feedback virar melhoria de produto:

```powershell
.\scripts\gerar-priorizacao-roadmap.ps1 -Titulo "Melhoria solicitada" -Origem "Feedback/NPS" -Modulo "Financeiro"
```
