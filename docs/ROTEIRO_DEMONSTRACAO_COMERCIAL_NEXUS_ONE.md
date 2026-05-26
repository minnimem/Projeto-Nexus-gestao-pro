# Roteiro de Demonstracao Comercial - Nexus One

Data de referencia: 10/05/2026

Este roteiro ajuda a conduzir uma demonstracao comercial sem prometer producao ampla antes de homologacoes reais. A ideia e mostrar valor, diagnosticar aderencia e sair da reuniao com um proximo passo claro: proposta, piloto assistido, homologacao tecnica ou nao avancar.

## Objetivo da Demo

- Entender dores reais do cliente.
- Mostrar os fluxos mais fortes do Nexus One com dados ficticios ou base de homologacao.
- Evidenciar valor comercial em vendas, caixa, estoque, financeiro, fiscal, logistica e relatorios.
- Separar o que esta pronto para demonstracao, o que depende de homologacao e o que fica fora do escopo inicial.
- Converter a reuniao em piloto assistido ou proposta controlada.

## Preparacao Antes da Reuniao

- Confirmar segmento do cliente.
- Confirmar numero de filiais, usuarios e operacao diaria.
- Confirmar se existe PDV, estoque, entrega, fiscal e financeiro no escopo.
- Qualificar a oportunidade com `docs/PLAYBOOK_COMERCIAL_QUALIFICACAO_NEXUS_ONE.md` e, quando houver chance real de proposta, gerar score com `scripts/gerar-qualificacao-oportunidade.ps1`.
- Preencher `docs/FICHA_DIAGNOSTICO_COLETA_CLIENTE_NEXUS_ONE.md` quando houver interesse real em proposta ou piloto.
- Usar dados ficticios em demonstracao aberta.
- Validar ambiente de demo com login, vendas, caixa, estoque, financeiro e relatorios funcionando.
- Conferir restricoes comerciais em `docs/FICHA_PRONTIDAO_COMERCIAL_NEXUS_ONE.md`.
- Se o cliente comparar alternativas, usar `docs/MATRIZ_POSICIONAMENTO_COMPETITIVO_NEXUS_ONE.md` e gerar apoio com `scripts/gerar-posicionamento-competitivo.ps1`.
- Preparar proposta controlada com `docs/MODELO_PROPOSTA_COMERCIAL_CONTROLADA_NEXUS_ONE.md`, se houver interesse.

## Agenda Executiva da Demo

| Tempo | Etapa | Objetivo |
| ---: | --- | --- |
| 0-5 min | Abertura | Confirmar dor principal, decisor e objetivo da reuniao |
| 5-12 min | Diagnostico rapido | Entender processo atual e impacto da dor |
| 12-30 min | Fluxo principal | Demonstrar um fluxo completo ligado a dor do cliente |
| 30-40 min | Indicadores e controle | Mostrar relatorios, alertas e ganhos de gestao |
| 40-45 min | Limites e dependencias | Explicar fiscal, pagamentos, dados, integracoes e producao controlada |
| 45-50 min | Fechamento | Definir proximo passo unico |

Se a demo tiver menos de 30 minutos, mostrar apenas dor principal, fluxo completo e proximo passo. Evitar passeio por modulos sem relacao com a decisao.

## Perguntas de Diagnostico

- Como o cliente registra vendas hoje?
- O caixa fecha com divergencia? Com que frequencia?
- O estoque e conferido por sistema, planilha ou manualmente?
- Existe ruptura de produto, compra emergencial ou perda por falta de controle?
- Como o cliente acompanha contas a receber e inadimplencia?
- Existe entrega/logistica propria?
- O cliente precisa emitir nota fiscal pelo sistema ou ja usa outro emissor?
- Quais relatorios o dono/gerente cobra toda semana?
- O maior problema hoje e perda de venda, retrabalho, estoque, caixa, financeiro, fiscal ou gestao da equipe?

## Demo Por Dor Principal

| Dor do cliente | Fluxo que deve ser mostrado | Resultado esperado na conversa |
| --- | --- | --- |
| Caixa com divergencia | Venda, recebimento, pagamento misto, comprovante e fechamento | Cliente entende controle e conciliacao |
| Estoque sem confianca | Venda com baixa, alerta minimo, compra/reposicao e inventario | Cliente entende reducao de ruptura e retrabalho |
| Financeiro desorganizado | Contas, recebimentos, inadimplencia, DRE/fluxo e conciliacao | Cliente entende visibilidade de caixa |
| Venda sem acompanhamento | Cliente, proposta, pedido, follow-up e separacao | Cliente entende processo comercial completo |
| Falta de relatorio | Dashboard, filtros, exportacoes e indicadores por periodo/filial | Decisor entende gestao e tomada de decisao |
| Entrega sem controle | Pedido, rota, entregador, romaneio e status de entrega | Cliente entende rastreabilidade operacional |

## Fluxo Recomendado de Apresentacao

Tempo sugerido: 35 a 50 minutos.

1. Abertura e diagnostico rapido.
2. Visao geral executiva com indicadores e alertas.
3. Vendas: pedido, proposta, CRM, follow-up e separacao.
4. Caixa/PDV: abertura, recebimento, pagamento misto, comprovante e fechamento.
5. Estoque: alertas, reposicao, curva ABC, inventario e etiquetas.
6. Financeiro: contas, conciliacao, DRE, fluxo e inadimplencia.
7. Fiscal: explicar prontidao, homologacao e limites de emissao real.
8. Logistica/servicos, se fizer sentido para o cliente.
9. Relatorios/exportacoes.
10. Proximo passo: piloto assistido, homologacao de integracoes ou proposta controlada.

## Sinais de Compra Durante a Demo

Registrar como sinal positivo quando o cliente:

- Pergunta preco, prazo ou implantacao.
- Pede para envolver socio, gerente, financeiro ou contador.
- Compara com o sistema atual ou concorrente.
- Pergunta como importar dados reais.
- Quer saber como abrir caixa, fechar caixa, receber Pix/boleto ou emitir documento.
- Pede proposta, piloto ou ambiente para testar.

Registrar como risco quando o cliente:

- Quer fiscal real ou integracao real imediata sem homologacao.
- Nao aceita piloto assistido/producao controlada.
- Nao informa decisor.
- Foca apenas em menor preco.
- Pede customizacao grande antes de validar o produto base.

## Demonstracao por Perfil de Cliente

### Comercio varejista

Priorizar:

- Caixa/PDV.
- Estoque e reposicao.
- Vendas e comprovante.
- Financeiro/conciliacao.
- Relatorios por dia, forma de pagamento e produto.

Evitar aprofundar:

- Fiscal real sem contador/provedor definido.
- Logistica avancada se o cliente nao entrega.

### Distribuidora ou atacado

Priorizar:

- Vendas com separacao.
- Estoque, curva ABC e compras.
- Logistica, romaneio e comprovante de entrega.
- Financeiro, contas a receber e inadimplencia.
- Relatorios por vendedor, cliente e produto.

Evitar aprofundar:

- PDV rapido se a operacao for mais pedido/entrega.

### Prestador de servico

Priorizar:

- Ordem de servico.
- Clientes/CRM.
- Financeiro e cobranca.
- Relatorios operacionais.
- SLA e suporte.

Evitar aprofundar:

- Estoque avancado se nao houver pecas/produtos.
- Logistica se nao houver entrega.

### Empresa com varias filiais

Priorizar:

- Multiempresa/filial.
- Permissoes por perfil.
- Auditoria e governanca.
- Relatorios por filial.
- Padrao de implantacao, treinamento e suporte.

Evitar prometer:

- Permissoes granulares finais para toda acao sensivel sem validacao do escopo.

## Prova de Valor

Ao final da demo, preencher:

- Dor principal identificada:
- Fluxo demonstrado que resolve a dor:
- Ganho esperado:
- Modulos prioritarios:
- Integracoes necessarias:
- Dependencias externas:
- Risco percebido:
- Estimativa conservadora de valor/ROI:
- Proximo passo recomendado:

## Fechamento da Demo

Use uma pergunta objetiva:

- "Pelo que vimos, faz sentido avancar para proposta controlada com esse escopo?"
- "Quem precisa aprovar para iniciarmos um piloto assistido?"
- "Qual integracao ou dado precisa ser validado antes da proposta?"
- "Podemos sair daqui com o proximo passo sendo diagnostico, proposta ou piloto?"

Decisao ao final:

- [ ] Avancar para proposta controlada.
- [ ] Avancar para piloto assistido.
- [ ] Fazer diagnostico/coleta antes da proposta.
- [ ] Homologar integracao antes de proposta.
- [ ] Pausar oportunidade por falta de fit.

## Objecoes e Respostas Seguras

### "Ja posso usar em producao?"

Resposta sugerida:
O Nexus One ja pode seguir para piloto assistido ou producao controlada, desde que deploy, backup, monitoramento, smoke test, Go/No-Go e aceite estejam aprovados. Producao ampla depende de homologacoes reais e ciclos assistidos.

### "Fiscal ja emite nota real?"

Resposta sugerida:
O fluxo fiscal esta tecnicamente preparado para homologacao controlada, mas emissao oficial depende de certificado A1, credenciamento, contador, provedor/SEFAZ/municipio e validacao por cliente/filial/modelo.

### "Pix e boleto ja funcionam de verdade?"

Resposta sugerida:
O fluxo visual e operacional esta pronto para demonstracao e homologacao. O uso real depende da conta/provedor do cliente e evidencia ponta a ponta.

### "Da para importar meus dados?"

Resposta sugerida:
Sim, com roteiro de carga inicial, modelos CSV e verificador. A importacao deve ser validada em homologacao antes de producao.

### "Quanto tempo para implantar?"

Resposta sugerida:
Para piloto assistido, trabalhar com 3 a 10 dias uteis apos dados, usuarios, escopo, ambiente e responsaveis estarem definidos. Producao controlada exige aceite e evidencias.

### "Por que escolher o Nexus One?"

Resposta sugerida:
Porque o foco e unir venda, caixa, estoque, financeiro, relatorios, implantacao assistida e suporte em um processo unico, com limites e dependencias documentados. A comparacao deve considerar escopo, suporte, homologacoes, backup, LGPD, treinamento e aceite, nao apenas preco ou uma tela isolada.

### "Qual o retorno para minha empresa?"

Resposta sugerida:
Podemos estimar valor com base em horas economizadas, reducao de divergencias, melhor controle de estoque e recebimentos, sempre usando premissas validadas pelo cliente. Isso deve ser tratado como estimativa conservadora, nao como promessa de resultado.

## Criterios de Sucesso da Demo

- Cliente entendeu quais dores o sistema resolve.
- Pelo menos um fluxo principal foi demonstrado de ponta a ponta.
- Dependencias externas ficaram claras.
- Escopo do piloto ficou definido.
- Proximo passo ficou registrado: proposta, piloto, homologacao tecnica ou encerramento.

## Saida Recomendada

Se o cliente demonstrar aderencia:

- Arquivar qualificacao gerada por `scripts/gerar-qualificacao-oportunidade.ps1`.
- Gerar ROI/valor percebido com `scripts/gerar-roi-valor-percebido.ps1`, quando o cliente pedir justificativa financeira.
- Gerar one-page comercial com `scripts/gerar-onepage-comercial-decisor.ps1`, quando o decisor precisar de resumo executivo para aprovar a proxima etapa.
- Gerar ata de fechamento com `scripts/gerar-ata-fechamento-comercial.ps1`, quando houver decisao, objecao relevante ou proposta aprovada.
- Gerar proposta com `scripts/gerar-proposta-comercial-controlada.ps1`.
- Gerar plano de demo/prova de valor com `scripts/gerar-plano-demo-comercial.ps1`.
- Gerar ficha de diagnostico/coleta com `scripts/gerar-ficha-diagnostico-cliente.ps1`.
- Seguir para `docs/CHECKLIST_CLIENTE_PILOTO_NEXUS_ONE.md`.

Se houver integracoes obrigatorias:

- Preencher `docs/MATRIZ_HOMOLOGACAO_INTEGRACOES_EXTERNAS_NEXUS_ONE.md`.
- Comunicar o que esta em sandbox, homologacao ou fora do escopo.

Se houver dados reais:

- Seguir `docs/POLITICA_PRIVACIDADE_LGPD_NEXUS_ONE.md`.
- Usar carga inicial controlada por `docs/ROTEIRO_CARGA_INICIAL_DADOS_NEXUS_ONE.md`.
