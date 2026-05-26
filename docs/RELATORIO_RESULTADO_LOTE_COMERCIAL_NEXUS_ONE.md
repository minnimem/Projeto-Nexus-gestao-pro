# Relatorio de Resultado do Lote Comercial - Nexus One

Use este relatorio ao final de cada lote de lancamento comercial controlado. Ele decide se o Nexus One deve aumentar escala, manter o lote atual, pausar vendas ou voltar para correcao operacional.

## Objetivo

- Medir se o lote comercial foi saudavel.
- Relacionar vendas com capacidade real de implantacao e suporte.
- Evitar escalar quando o produto, processo ou suporte ainda estao pressionados.
- Criar decisao objetiva antes de abrir novo lote.

## Indicadores Minimos

| Indicador | Leitura desejada |
| --- | --- |
| Oportunidades qualificadas | Dentro da meta do lote |
| Propostas enviadas | Compativeis com capacidade comercial |
| Fechamentos | Sem ultrapassar implantacoes simultaneas |
| Clientes Verde | Maioria dos clientes ativos |
| Clientes Vermelho | Zero para aumentar escala |
| Incidentes P0/P1 | Zero recorrente |
| Pendencias bloqueantes | Zero repetida |
| Suporte/SLA | Dentro da politica definida |
| Pacote de entrega | Completo por cliente |

## Indicadores de Conversao e Qualidade

| Indicador | Como interpretar |
| --- | --- |
| Oportunidade -> proposta | Mede aderencia do ICP, dor e oferta |
| Proposta -> fechamento | Mede valor percebido, preco e urgencia |
| % clientes Verde | Mede saude real dos clientes ativos do lote |
| Pacotes de entrega completos | Mede disciplina operacional e transferencia para suporte |
| Aceites registrados | Mede se o cliente reconheceu a entrega |
| Promessas fora do escopo | Mede risco comercial e desalinhamento de expectativa |
| Incidentes por cliente | Mede estabilidade antes de aumentar escala |

## Pontuacao do Lote

Use a pontuacao para evitar decisao baseada apenas em sensacao comercial.

| Area | Peso | O que avalia |
| --- | ---: | --- |
| Conversao comercial | 25 | Oportunidades, propostas e fechamentos |
| Qualidade da entrega | 25 | Pacote completo, aceite e limite de implantacao |
| Saude dos clientes | 25 | Clientes Verde, Amarelo e Vermelho |
| Estabilidade de suporte | 15 | Incidentes P0/P1 e pendencias bloqueantes |
| Disciplina de escopo | 10 | Promessas fora do escopo e condicoes aceitas |

| Pontuacao | Decisao sugerida |
| --- | --- |
| 85 a 100 | Pode aumentar escala com controle |
| 70 a 84 | Manter escala e corrigir pontos fracos |
| 50 a 69 | Corrigir processo antes de novo lote |
| 0 a 49 | Pausar, reposicionar ou reduzir oferta |

## Decisoes Possiveis

| Decisao | Quando usar |
| --- | --- |
| Aumentar escala | Lote saudavel, clientes Verde e suporte estavel |
| Manter escala | Resultado bom, mas sem folga operacional |
| Pausar vendas | Incidente recorrente, cliente Vermelho ou suporte pressionado |
| Corrigir processo | Gargalo de implantacao, pacote incompleto ou promessa fora do escopo |
| Reposicionar oferta | Baixa conversao, objecoes recorrentes ou perfil errado |

## Bloqueios Para Aumentar Escala

- Cliente Vermelho.
- Incidente P0/P1 recorrente.
- Promessa comercial fora do escopo.
- Implantacoes simultaneas acima do limite definido.
- Pacote de entrega incompleto em cliente ativo.
- Go/No-Go ou aceite ausente.
- Suporte fora do SLA.

## Plano de Acao Pos-Lote

Todo resultado abaixo de 85 pontos deve gerar plano de acao antes do proximo lote.

| Problema | Causa provavel | Acao | Dono | Prazo | Evidencia |
| --- | --- | --- | --- | --- | --- |
| Baixa conversao | ICP fraco ou dor pouco clara | Revisar qualificacao e roteiro | Comercial | D+3 | Playbook ajustado |
| Cliente Amarelo/Vermelho | Expectativa ou entrega desalinhada | Plano de recuperacao | Sucesso/Implantacao | D+5 | Saude atualizada |
| Pacote incompleto | Falha no handoff | Completar evidencias | Implantacao | D+2 | Pacote anexado |
| Promessa fora do escopo | Venda sem limite claro | Corrigir proposta e one-page | Comercial | D+3 | Modelo revisado |
| Incidente recorrente | Falha tecnica/processo | Corrigir causa raiz | Produto/Suporte | D+7 | Registro de correcao |

## Aprendizados do Lote

Registre, no minimo:

- Principais objecoes comerciais.
- Motivos de perda.
- Perfil de cliente com melhor aderencia.
- Promessas solicitadas fora do escopo.
- Lacunas de produto que apareceram na venda.
- Gargalos de implantacao, suporte ou treinamento.
- Argumentos que aumentaram valor percebido.

## Evidencias Para Proximo Lote

Antes de abrir novo lote, confirme:

- Resultado do lote gerado e aprovado.
- Decisao de expansao registrada.
- Matriz de capacidade revisada.
- Pacote de entrega completo por cliente fechado.
- Saude/NPS dos clientes ativos revisada.
- Nenhum bloqueio repetido sem plano de acao.
- Limite de implantacoes simultaneas definido para o proximo lote.

## Gerador

```powershell
.\scripts\gerar-resultado-lote-comercial.ps1 -Lote "Lote 1" -Oportunidades 5 -Propostas 4 -Fechamentos 2 -ClientesVerde 2 -ClientesAmarelo 0 -ClientesVermelho 0 -IncidentesCriticos 0 -PendenciasBloqueantes 0 -PacotesEntregaCompletos 2 -ClientesComAceite 2 -PromessasForaEscopo 0
.\scripts\gerar-decisao-expansao-comercial.ps1 -Lote "Lote 1" -Decisao "Aumentar escala" -LimiteProximoLote 8 -MaxImplantacoesSimultaneas 2
```
