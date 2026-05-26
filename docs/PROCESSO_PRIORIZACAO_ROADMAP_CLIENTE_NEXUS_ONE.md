# Processo de Priorizacao de Roadmap por Feedback - Nexus One

Data de referencia: 10/05/2026

Este processo transforma feedback, NPS, incidentes, pedidos comerciais e sugestoes de melhoria em uma decisao de roadmap com criterio claro. O objetivo e priorizar o que aumenta valor comercial, reduz risco operacional e melhora retencao sem confundir bug, customizacao, pendencia de implantacao e evolucao de produto.

## Quando Usar

- Feedback/NPS trouxe melhoria ou dificuldade recorrente.
- Incidente P0/P1 revelou fragilidade de produto ou processo.
- Cliente pediu recurso novo durante demo, piloto ou producao controlada.
- Comercial quer prometer uma melhoria para fechar venda.
- Suporte identificou duvida recorrente que nao se resolve apenas com artigo/treinamento.
- Uma melhoria aparece em mais de um cliente, segmento ou modulo.

## Entradas Aceitas

- Relatorio de feedback/NPS.
- Incidente de suporte.
- Registro de riscos/pendencias.
- Base de conhecimento/FAQ.
- Proposta comercial ou qualificacao de oportunidade.
- Saude do cliente.
- Sugestoes internas do produto.

## Separacao Obrigatoria

| Tipo | Tratamento |
| --- | --- |
| Bug | Corrigir conforme prioridade e impacto |
| Pendencia de implantacao | Resolver no cliente antes de transformar em produto |
| Duvida recorrente | Criar artigo/treinamento antes de desenvolver |
| Melhoria de produto | Priorizar por score |
| Customizacao isolada | Avaliar contrato, custo e manutencao |
| Bloqueio comercial | Avaliar se entra como requisito de venda controlada |

## Score de Priorizacao

Pontuacao maxima: 100 pontos.

| Criterio | Peso |
| --- | ---: |
| Impacto comercial/receita | 25 |
| Impacto operacional/retencao | 20 |
| Recorrencia entre clientes | 15 |
| Reducao de risco/suporte | 15 |
| Alinhamento com produto padrao | 15 |
| Baixo esforco relativo | 10 |

## Decisao Pelo Score

| Score | Decisao |
| ---: | --- |
| 0 a 39 | Nao priorizar agora. Manter como ideia/backlog frio. |
| 40 a 59 | Backlog monitorado. Reavaliar se repetir ou virar bloqueio comercial. |
| 60 a 79 | Planejar proxima janela de produto. |
| 80 a 100 | Prioridade alta. Avaliar inclusao no proximo ciclo/release. |

## Regras

- Nao prometer prazo ao cliente sem aprovacao de roadmap.
- Nao transformar pedido isolado em produto sem avaliar manutencao.
- Se for requisito para venda, registrar no escopo/proposta como condicional.
- Se for bug, nao maquiar como melhoria.
- Se for duvida recorrente, atualizar base de conhecimento antes de desenvolver.
- Toda prioridade alta deve ter evidencia: cliente, impacto, modulo e criterio.

## Saidas Possiveis

- Corrigir bug.
- Criar artigo/treinamento.
- Planejar melhoria no backlog.
- Vender como adicional/customizacao.
- Rejeitar por desalinhamento com produto.
- Manter como observacao para revisao futura.

## Gerador

```powershell
.\scripts\gerar-priorizacao-roadmap.ps1 -Titulo "Melhorar conciliacao financeira" -Origem "Feedback/NPS" -Modulo "Financeiro" -ImpactoComercial 20 -ImpactoOperacional 18
```

Arquive em `reports\produto` junto dos feedbacks, incidentes ou oportunidades que justificam a decisao.
