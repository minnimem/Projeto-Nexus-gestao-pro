# Plano de Lancamento Comercial Controlado - Nexus One

Use este plano depois da auditoria de evidencias do cliente real e da decisao de liberacao comercial. Ele define como vender para mais clientes sem transformar a comercializacao ampla em promessa sem controle.

## Objetivo

- Controlar o primeiro lote de vendas apos producao controlada.
- Definir perfil de cliente ideal para reduzir risco de suporte e implantacao.
- Padronizar promessa comercial, canais, volume e criterios de pausa.
- Medir se a operacao suporta escala antes de aumentar a campanha.

## Condicoes Para Iniciar

- Auditoria de evidencias do cliente real aprovada.
- Decisao de liberacao comercial gerada.
- Pacote de entrega do cliente real arquivado.
- Suporte/SLA com canal e responsavel.
- Planos comerciais e proposta controlada atualizados.
- Riscos criticos sem bloqueio aberto.

## Portao de Abertura do Lote

Antes de abrir o lote comercial, confirmar:

- [ ] Cliente real usado como referencia interna possui aceite.
- [ ] Saude do cliente real esta Verde.
- [ ] Auditoria de evidencias nao possui bloqueio critico.
- [ ] Capacidade operacional permite pelo menos 1 a 2 implantacoes simultaneas.
- [ ] Comercial recebeu roteiro de promessa permitida e restricoes.
- [ ] Implantacao possui agenda disponivel.
- [ ] Suporte possui responsavel e SLA operacional.
- [ ] Pagamentos, fiscal e notificacoes reais estao homologados ou fora do escopo.

## Perfil Ideal do Primeiro Lote

- Comercio, servico ou operacao com venda, caixa, estoque e financeiro gerencial.
- Baixa ou media complexidade fiscal.
- Ate 1 a 3 filiais no primeiro ciclo.
- Usuarios-chave disponiveis para treinamento.
- Aceita piloto assistido ou producao controlada.
- Nao exige customizacao critica antes de iniciar.
- Nao exige integracao real fora do que ja foi homologado ou classificado como fora do escopo.

## Limites do Primeiro Lote

- Comecar com 3 a 5 oportunidades qualificadas.
- Liberar no maximo 1 a 2 implantacoes simultaneas.
- Manter cada cliente com pacote de entrega, Go/No-Go e aceite.
- Revisar suporte, incidentes e saude antes de abrir novo lote.
- Pausar campanha se houver incidente P0/P1 recorrente, cliente Vermelho ou pendencia bloqueante repetida.

## Mensagem Comercial Permitida

Pode dizer:

- ERP/gestao comercial com vendas, caixa, estoque, clientes, financeiro gerencial, relatorios e suporte operacional.
- Implantacao acompanhada com escopo, treinamento, Go/No-Go e aceite.
- Integracoes reais dependem de homologacao, provedor/canal, contrato e evidencia.
- Producao ampla segue criterios de seguranca operacional.

Nao dizer:

- Fiscal real garantido para qualquer municipio/empresa sem homologacao.
- Pix, boleto, notificacoes ou integracoes reais sem provedor e evidencia.
- SLA especial sem contrato.
- Resultado financeiro garantido.
- Customizacao ilimitada.

## Indicadores Do Lote

- Oportunidades qualificadas.
- Propostas enviadas.
- Fechamentos.
- Tempo medio de implantacao.
- Incidentes P0/P1.
- Clientes Verde/Amarelo/Vermelho.
- Pendencias bloqueantes por cliente.
- NPS/feedback.
- Capacidade do suporte.

## Criterios Para Aumentar Escala

- Pelo menos 2 clientes Verde no lote.
- Nenhum P0 recorrente.
- Pacote de entrega completo em todos os clientes ativos.
- Suporte dentro do SLA.
- Implantacao sem gargalo critico repetido.
- Integracoes prometidas com evidencia ou fora do escopo formal.
- Resultado do lote comercial revisado antes de abrir o proximo lote.
- Decisao de expansao pos-lote registrada antes de mudar volume de vendas.
- Matriz de capacidade operacional aprovada antes de assumir novas implantacoes.
- Viabilidade financeira aprovada antes de ampliar desconto, lote ou suporte.

## Governanca do Lote

| Ritmo | Revisao |
| --- | --- |
| Semanal | Oportunidades, propostas, fechamentos e gargalos comerciais |
| A cada implantacao | Handoff, cronograma, riscos, Go/No-Go e aceite |
| D7/D15/D30 do cliente | Saude, NPS, suporte e pendencias |
| Fechamento do lote | Resultado comercial, capacidade e decisao de expansao |

## Criterios Para Pausar Campanha

- Mais de 1 cliente Vermelho no lote.
- Incidente P0/P1 recorrente.
- Pendencia bloqueante repetida em clientes diferentes.
- Implantacoes simultaneas acima da capacidade aprovada.
- Comercial prometeu recurso condicionado como pronto.
- Suporte fora do SLA definido.
- Pacote de entrega incompleto em cliente ativo.

## Decisao Pos-Lote

- [ ] Aumentar escala.
- [ ] Manter volume atual.
- [ ] Reduzir volume.
- [ ] Pausar campanha.
- [ ] Reposicionar oferta ou perfil ideal.

## Gerador

```powershell
.\scripts\gerar-plano-lancamento-comercial.ps1 -Lote "Lote 1" -Responsavel "Nexus One" -MetaOportunidades 5 -MaxImplantacoesSimultaneas 2
.\scripts\gerar-resultado-lote-comercial.ps1 -Lote "Lote 1" -Oportunidades 5 -Propostas 4 -Fechamentos 2 -ClientesVerde 2
.\scripts\gerar-capacidade-operacional-escala.ps1 -Lote "Lote 2" -OportunidadesPlanejadas 8 -ImplantacoesSimultaneas 2
.\scripts\gerar-viabilidade-financeira-escala.ps1 -Lote "Lote 2" -ReceitaMensal 2792 -ReceitaImplantacao 6400 -CustoInfraMensal 400 -CustoSuporteMensal 900 -CustoImplantacao 3200 -CustoComercial 800
.\scripts\gerar-decisao-expansao-comercial.ps1 -Lote "Lote 1" -Decisao "Aumentar escala" -LimiteProximoLote 8 -MaxImplantacoesSimultaneas 2
```
