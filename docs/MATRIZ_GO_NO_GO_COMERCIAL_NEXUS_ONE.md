# Matriz Go/No-Go Comercial - Nexus One

Esta matriz define se o Nexus One pode seguir para demonstracao, piloto assistido, producao controlada ou producao comercial ampla.

Antes da decisao, revisar `docs/REGISTRO_RISCOS_PENDENCIAS_CLIENTE_NEXUS_ONE.md` para confirmar se existem pendencias bloqueantes, riscos altos sem prazo ou dependencias externas sem evidencia.

## Classificacoes

- Go demonstracao: pode apresentar comercialmente sem dados reais sensiveis.
- Go piloto assistido: pode operar com cliente real, escopo limitado e acompanhamento proximo.
- Go producao controlada: pode operar com cliente real em ambiente definitivo, mas com restricoes e suporte ativo.
- Go producao ampla: pode comercializar com menor risco operacional.
- No-go: bloquear entrega ate corrigir pendencias.

## Criterios Bloqueantes

Qualquer item abaixo em aberto gera no-go para producao controlada/ampla:

- Deploy definitivo nao executado ou nao validado.
- `.env` com placeholder, segredo fraco ou sem auditoria.
- Banco sem backup localizado.
- Restauracao nunca testada em ambiente separado.
- Healthcheck ou smoke test operacional com falha critica.
- Monitoramento sem responsavel ou sem alerta testado.
- Suporte sem responsavel, prioridade ou canal de acionamento definido.
- Caixa/venda principal falhando.
- Estoque nao refletindo venda/entrada.
- Financeiro sem conferencia minima com caixa/vendas.
- Fiscal real vendido como ativo sem certificado, credenciamento, contador e homologacao oficial.
- Pagamento real vendido como ativo sem homologacao ponta a ponta com provedor.
- Integracao externa vendida como producao sem matriz de homologacao preenchida.
- Dados reais usados sem politica LGPD/responsavel de privacidade definido.
- Usuario-chave do cliente nao treinado no fluxo contratado.
- Termo de aceite sem responsavel definido.

## Pre-Check Antes da Decisao

- [ ] Registro de riscos/pendencias revisado.
- [ ] Cronograma de implantacao atualizado.
- [ ] Diario do piloto ou evidencias operacionais revisadas.
- [ ] Handoff comercial/implantacao/suporte concluido.
- [ ] Dependencias externas classificadas: homologado, sandbox, pendente ou fora do escopo.
- [ ] Cliente ciente de pendencias nao bloqueantes.
- [ ] Suporte, SLA, canal e responsavel definidos.
- [ ] Termo de aceite preparado quando houver producao controlada.

## Matriz de Decisao

| Area | Demonstracao | Piloto assistido | Producao controlada | Producao ampla |
| --- | --- | --- | --- | --- |
| Deploy | Local/homologacao ok | Homologacao separada | Servidor definitivo validado | Servidor definitivo com rotina operacional |
| Banco | Massa de teste | Backup manual | Backup agendado e restauracao testada | Restauracao periodica evidenciada |
| Segredos | Sem valor real exposto | `.env` protegido | Auditoria e inventario | Cofre/secret manager e rotacao |
| Monitoramento | Manual | Verificacao diaria | Alerta recorrente | Alerta recorrente testado e responsavel |
| Suporte | Contato comercial | Responsavel definido | SLA P0/P1 definido | SLA, canal e rotina de incidente ativos |
| Fiscal | Mock/controlado | Homologacao fiscal controlada | Oficial conforme cliente/modelo | Oficial validado por contador/provedor |
| Pagamentos | Mock/sandbox | Sandbox/provedor definido | Real homologado | Real monitorado e conciliado |
| Integracoes | Mock/controlado | Evidencia por canal | Matriz de homologacao preenchida | Evidencia real por cliente/filial/modelo |
| Privacidade | Dados ficticios | Dados reais autorizados | Politica LGPD e responsavel definidos | Retencao, backup e solicitacoes formalizadas |
| Operacao | Demonstra fluxo | Cliente treinado | Operacao assistida | Suporte e SLA definidos |
| Aceite | Nao exigido | Checklist piloto | Termo de aceite | Processo de release/aceite recorrente |

## Pontuacao de Prontidao

Use como apoio. Nao substitui criterio bloqueante.

| Area | Peso | Nota 0-5 | Observacao |
| --- | ---: | ---: | --- |
| Operacao principal | 20 |  | Venda, caixa, estoque, financeiro e relatorios |
| Ambiente tecnico | 15 |  | Deploy, banco, segredos, backup e restauracao |
| Monitoramento e suporte | 15 |  | Alertas, SLA, canal e responsaveis |
| Dados e LGPD | 10 |  | Responsavel, autorizacao, retencao e carga |
| Integracoes externas | 15 |  | Fiscal, pagamento, notificacoes e terceiros |
| Treinamento e aceite | 15 |  | Usuarios-chave e termo de aceite |
| Riscos e pendencias | 10 |  | Bloqueantes zerados e altas com plano |

Leitura sugerida:

- 0 a 59: No-go ou voltar para homologacao.
- 60 a 74: Go piloto assistido com restricoes.
- 75 a 89: Go producao controlada se nao houver bloqueante.
- 90 a 100: Candidato a producao ampla/lote maior, se houver evidencias reais.

## Decisao Final

## Decisao Base Atual - 10/05/2026

Classificacao recomendada para o produto neste momento:

- [x] Go demonstracao.
- [x] Go piloto assistido.
- [ ] Go producao controlada.
- [ ] Go producao ampla.
- [ ] No-go geral.

Justificativa:

O Nexus One ja possui maturidade visual, operacional e comercial suficiente para demonstracao e piloto assistido. A producao controlada deve ser decidida cliente a cliente, apos validar ambiente, backup, suporte, treinamento, aceite, pagamentos reais e fiscal real conforme o escopo vendido.

Pendencias bloqueantes para producao ampla:

- Homologacao fiscal oficial por empresa/filial/modelo quando fiscal real estiver no contrato.
- Homologacao de Pix/boleto real com provedor quando pagamentos reais forem vendidos.
- Deploy definitivo validado com backup e restauracao testada.
- Smoke test operacional com venda, caixa, estoque, financeiro e relatorios.
- Canal de suporte, SLA e responsaveis definidos.
- Termo de aceite do cliente piloto.

Promessa comercial permitida:

- ERP + PDV com vendas, caixa, clientes, estoque, financeiro gerencial, relatorios, usuarios, implantacao assistida e suporte operacional.

Promessa comercial condicionada:

- Fiscal real, pagamentos reais, notificacoes externas, WhatsApp/e-mail, integracoes e automacoes em producao dependem de homologacao e evidencia por cliente/provedor.

---

Cliente:

Ambiente:

Data:

Versao:

Classificacao:

- [ ] Go demonstracao.
- [ ] Go piloto assistido.
- [ ] Go producao controlada.
- [ ] Go producao ampla.
- [ ] No-go.

Pendencias bloqueantes:

-

Pendencias nao bloqueantes:

-

Registro de riscos/pendencias revisado:

- [ ] Sim.
- [ ] Nao.

Pontuacao de prontidao:

-

Evidencias revisadas:

- [ ] Handoff.
- [ ] Diagnostico.
- [ ] Cronograma.
- [ ] Diario do piloto.
- [ ] Registro de riscos.
- [ ] Smoke test.
- [ ] Backup/restauracao.
- [ ] Integracoes/homologacoes.
- [ ] Treinamento.
- [ ] Termo de aceite.

Condicoes para seguir:

-

Decisao autorizada por:

Responsavel tecnico:

Responsavel comercial:

Responsavel do cliente:

Assinaturas:
