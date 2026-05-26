# Matriz de Capacidade Operacional Para Escala - Nexus One

Use esta matriz antes de abrir um novo lote comercial ou aumentar o volume de implantacoes. Ela valida se comercial, implantacao e suporte conseguem absorver a demanda sem degradar cliente, SLA ou qualidade de entrega.

## Objetivo

- Evitar vender acima da capacidade operacional.
- Definir limite real de oportunidades, fechamentos e implantacoes simultaneas.
- Proteger suporte, SLA, implantacao e sucesso do cliente.
- Registrar bloqueios antes da decisao de expansao comercial.

## Areas Avaliadas

| Area | Capacidade minima |
| --- | --- |
| Comercial | Qualificar oportunidades sem prometer fora do escopo |
| Implantacao | Absorver novos clientes com cronograma e treinamento |
| Suporte | Manter SLA e atender incidentes sem fila critica |
| Produto | Corrigir P0/P1 e pendencias bloqueantes antes de escalar |
| Infra | Monitoramento, backup e ambiente estaveis |
| Sucesso do cliente | Medir saude, NPS e risco de cancelamento |

## Indicadores de Capacidade

| Indicador | Leitura desejada |
| --- | --- |
| Oportunidades planejadas | Compativeis com limite do lote |
| Fechamentos esperados | Nao excedem implantacao e suporte |
| Implantacoes simultaneas | Dentro da capacidade declarada |
| Horas disponiveis de implantacao | Cobrem agenda, treinamento e ajustes |
| Chamados criticos abertos | Zero antes de aumentar escala |
| SLA em risco | Zero ou com plano de contorno |
| Clientes Amarelo/Vermelho | Com plano ativo antes de novo lote |
| Promessas fora do escopo | Zero para aumentar escala |

## Score de Capacidade

| Area | Peso | O que mede |
| --- | ---: | --- |
| Implantacao | 30 | Folga para novos clientes e agenda |
| Suporte/SLA | 25 | Fila critica, SLA e capacidade de resposta |
| Saude da base | 20 | Clientes Verde/Amarelo/Vermelho |
| Produto/Infra | 15 | Incidentes, pendencias, monitoramento e backup |
| Comercial/Escopo | 10 | Promessas, limite do lote e qualidade da venda |

| Score | Interpretacao |
| --- | --- |
| 85 a 100 | Capacidade saudavel para novo lote |
| 70 a 84 | Capacidade no limite, abrir lote menor |
| 50 a 69 | Capacidade pressionada, manter escala |
| 0 a 49 | No-go para novo lote |

## Sinais De Alerta

- Implantacoes simultaneas acima do limite definido.
- Suporte com chamados criticos pendentes.
- Cliente Vermelho ou Amarelo sem plano.
- Incidente P0/P1 recorrente.
- Pendencia bloqueante repetida em clientes diferentes.
- Comercial vendendo recurso fora do escopo.
- Pacote de entrega incompleto.

## Decisao

| Resultado | Acao |
| --- | --- |
| Capacidade saudavel | Pode abrir novo lote com controle |
| Capacidade no limite | Manter escala e revisar em 7 a 14 dias |
| Capacidade pressionada | Pausar vendas e corrigir gargalos |
| Capacidade critica | No-go para novo lote |

## Condicoes Para Aprovar Novo Lote

- Responsavel comercial, implantacao e suporte confirmados.
- Limite de oportunidades e fechamentos esperado documentado.
- Agenda de implantacao sem conflito critico.
- SLA sem fila critica acumulada.
- Clientes Amarelo/Vermelho com plano de acao.
- Produto sem P0/P1 aberto.
- Pacote de entrega e handoff prontos para repetir.
- Data da proxima revisao definida.

## Gerador

```powershell
.\scripts\gerar-capacidade-operacional-escala.ps1 -Lote "Lote 2" -OportunidadesPlanejadas 8 -FechamentosEsperados 3 -ImplantacoesSimultaneas 2 -CapacidadeImplantacao 2 -HorasImplantacaoDisponiveis 24 -ChamadosCriticosAbertos 0 -SlaEmRisco 0 -ClientesVermelho 0 -PendenciasBloqueantes 0
```
