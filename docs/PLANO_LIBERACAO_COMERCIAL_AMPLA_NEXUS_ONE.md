# Plano de Liberacao Comercial Ampla - Nexus One

Data de referencia: 10/05/2026

Este plano define quando o Nexus One pode deixar a venda controlada/piloto assistido e passar a uma comercializacao mais ampla, com risco operacional menor.

## Objetivo

- Separar venda controlada de venda ampla.
- Exigir evidencias reais antes de escalar comercialmente.
- Evitar prometer integracoes, suporte ou producao ampla sem base operacional.
- Definir fases de liberacao comercial por maturidade.

## Fases de Comercializacao

| Fase | Nome | Permitido | Bloqueios |
| --- | --- | --- | --- |
| F1 | Demonstracao | Apresentar com dados ficticios/homologacao | Dados reais, promessa de producao ampla |
| F2 | Piloto assistido | Vender com escopo controlado e acompanhamento | Sem diagnostico, handoff, cronograma ou aceite |
| F3 | Producao controlada | Operar cliente real com suporte ativo | Pendencia bloqueante, deploy/backup/monitoramento sem evidencia |
| F4 | Comercializacao ampla | Vender para mais clientes com processo repetivel | Falta de cliente real saudavel e homologacoes essenciais |

## Criterios Minimos Para F4

- [ ] Plano do primeiro cliente real executado conforme `docs/PLANO_EXECUCAO_PRIMEIRO_CLIENTE_REAL_NEXUS_ONE.md`.
- [ ] Auditoria de evidencias do cliente real aprovada conforme `docs/AUDITORIA_EVIDENCIAS_CLIENTE_REAL_NEXUS_ONE.md`.
- [ ] Plano de lancamento comercial controlado definido conforme `docs/PLANO_LANCAMENTO_COMERCIAL_CONTROLADO_NEXUS_ONE.md`.
- [ ] Resultado do lote comercial revisado conforme `docs/RELATORIO_RESULTADO_LOTE_COMERCIAL_NEXUS_ONE.md`.
- [ ] Decisao de expansao comercial pos-lote registrada conforme `docs/DECISAO_EXPANSAO_COMERCIAL_POS_LOTE_NEXUS_ONE.md`.
- [ ] Capacidade operacional para escala aprovada conforme `docs/MATRIZ_CAPACIDADE_OPERACIONAL_ESCALA_NEXUS_ONE.md`.
- [ ] Viabilidade financeira para escala aprovada conforme `docs/MATRIZ_VIABILIDADE_FINANCEIRA_ESCALA_NEXUS_ONE.md`.
- [ ] Pelo menos um cliente real implantado com aceite.
- [ ] Cliente classificado como Verde na rotina de sucesso.
- [ ] Deploy definitivo validado.
- [ ] Banco real provisionado.
- [ ] Backup agendado e restauracao testada com evidencia.
- [ ] Monitoramento externo testado.
- [ ] Segredos auditados e primeira rotacao registrada.
- [ ] Smoke test operacional aprovado apos deploy.
- [ ] Go/No-Go sem pendencia bloqueante.
- [ ] Fiscal, pagamento e notificacoes reais classificados como homologados, sandbox ou fora do escopo.
- [ ] Suporte/SLA funcionando com canal e responsavel.
- [ ] Processo de proposta, diagnostico, handoff, cronograma, treinamento, riscos, pacote de entrega e sucesso do cliente aplicado de ponta a ponta.

## Score de Prontidao F4

Use o score para separar "quase pronto" de "liberado".

| Pilar | Peso | Evidencia esperada |
| --- | ---: | --- |
| Cliente real saudavel | 25 | Cliente Verde, aceite e uso real |
| Operacao repetivel | 20 | Diagnostico, handoff, cronograma, treinamento e pacote de entrega |
| Estabilidade tecnica | 20 | Deploy, smoke, backup, restauracao, monitoramento e segredos |
| Capacidade de escala | 20 | Matriz de capacidade, suporte/SLA e limite de implantacao |
| Disciplina comercial | 15 | Proposta, escopo, riscos, integracoes e promessas controladas |

| Score | Liberacao |
| --- | --- |
| 90 a 100 | F4 ampla possivel |
| 80 a 89 | F4 com restricoes |
| 65 a 79 | Manter producao controlada |
| 0 a 64 | Manter piloto/demonstracao e corrigir base |

## Regras de Corte

Mesmo com score alto, nao liberar F4 se houver:

- Cliente real sem aceite.
- Cliente real Amarelo/Vermelho sem recuperacao.
- Backup sem restauracao testada.
- P0/P1 aberto ou recorrente.
- Suporte/SLA sem responsavel.
- Promessa comercial fora do escopo sem correcao.
- Fiscal/pagamento/notificacao real vendidos como prontos sem homologacao.

## Limites Antes da F4

Enquanto esses criterios nao forem cumpridos:

- Vender como demonstracao, piloto assistido ou producao controlada.
- Limitar numero de clientes simultaneos.
- Evitar prometer integracoes reais sem homologacao.
- Evitar contrato com SLA superior ao processo atual.
- Evitar cliente com alta complexidade fiscal/logistica sem validacao previa.

## Decisao de Liberacao

- [ ] Manter somente demonstracao.
- [ ] Liberar piloto assistido.
- [ ] Liberar producao controlada para cliente especifico.
- [ ] Liberar comercializacao ampla com restricoes.
- [ ] Liberar comercializacao ampla sem restricoes criticas conhecidas.

## Evidencias Necessarias

- Pacote de entrega de cliente real.
- Plano do primeiro cliente real gerado e executado.
- Auditoria de evidencias do cliente real gerada e aprovada.
- Plano de lancamento comercial controlado gerado.
- Relatorio de resultado do lote comercial gerado antes de aumentar escala.
- Decisao de expansao comercial pos-lote arquivada antes de abrir lote maior.
- Matriz de capacidade operacional arquivada antes de abrir lote maior.
- Matriz de viabilidade financeira arquivada antes de abrir lote maior.
- Termo de aceite assinado.
- Relatorio de saude do cliente classificado como Verde.
- Score F4 registrado e aprovado.
- Registro de riscos sem bloqueante.
- Evidencias de integracoes no escopo.
- Relatorio de pre-deploy/smoke/backup/restauracao/monitoramento.
- Politica LGPD e responsavel definidos.
- SLA e suporte testados.

## Gerador

Use:

```powershell
.\scripts\gerar-plano-primeiro-cliente-real.ps1 -Cliente "Cliente Piloto" -Ambiente "producao controlada" -Responsavel "Nexus One"
.\scripts\gerar-auditoria-evidencias-cliente-real.ps1 -Cliente "Cliente Piloto" -Responsavel "Nexus One" -SaudeCliente "Verde"
.\scripts\gerar-plano-lancamento-comercial.ps1 -Lote "Lote 1" -Responsavel "Nexus One"
.\scripts\gerar-resultado-lote-comercial.ps1 -Lote "Lote 1" -Oportunidades 5 -Propostas 4 -Fechamentos 2 -ClientesVerde 2
.\scripts\gerar-capacidade-operacional-escala.ps1 -Lote "Lote 2" -OportunidadesPlanejadas 8 -ImplantacoesSimultaneas 2
.\scripts\gerar-viabilidade-financeira-escala.ps1 -Lote "Lote 2" -ReceitaMensal 2792 -ReceitaImplantacao 6400 -CustoInfraMensal 400 -CustoSuporteMensal 900 -CustoImplantacao 3200 -CustoComercial 800
.\scripts\gerar-decisao-expansao-comercial.ps1 -Lote "Lote 1" -Decisao "Aumentar escala" -LimiteProximoLote 8
.\scripts\gerar-decisao-liberacao-comercial.ps1 -Status "AmplaComRestricoes" -ClienteRealComAceite "Sim" -SaudeCliente "Verde" -BackupRestaurado "Sim" -MonitoramentoAtivo "Sim" -SuporteSlaDefinido "Sim" -CapacidadeEscalaAprovada "Sim" -ResultadoLoteAprovado "Sim" -Responsavel "Nexus One"
```

Use a decisao gerada para alinhar comercial, implantacao, suporte e direcao antes de ampliar vendas.
