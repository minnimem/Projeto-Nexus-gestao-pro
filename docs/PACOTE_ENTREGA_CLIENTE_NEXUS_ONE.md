# Pacote de Entrega do Cliente - Nexus One

Data de referencia: 10/05/2026

Este pacote organiza tudo que deve ser entregue, conferido e arquivado antes de liberar um cliente em piloto assistido, producao controlada ou producao comercial.

## Identificacao

- Cliente:
- CNPJ:
- Ambiente: homologacao / producao controlada / producao
- Responsavel Nexus One:
- Responsavel do cliente:
- Data da entrega:
- Versao entregue:
- Escopo contratado:

## 1. Comercial e Aceite

- `docs/FICHA_PRONTIDAO_COMERCIAL_NEXUS_ONE.md`
- `docs/PLAYBOOK_COMERCIAL_QUALIFICACAO_NEXUS_ONE.md`
- `docs/MATRIZ_SELECAO_CLIENTE_PILOTO_REAL_NEXUS_ONE.md`, quando for primeiro cliente real ou piloto pago.
- `docs/PLANO_EXECUCAO_PRIMEIRO_CLIENTE_REAL_NEXUS_ONE.md`, quando for primeiro cliente real, piloto pago ou producao controlada inicial.
- `docs/AUDITORIA_EVIDENCIAS_CLIENTE_REAL_NEXUS_ONE.md`, quando a entrega for usada para liberar producao ampla.
- `docs/PLANO_LANCAMENTO_COMERCIAL_CONTROLADO_NEXUS_ONE.md`, quando houver liberacao de novo lote comercial.
- `docs/RELATORIO_RESULTADO_LOTE_COMERCIAL_NEXUS_ONE.md`, ao fechar ou revisar lote comercial.
- `docs/DECISAO_EXPANSAO_COMERCIAL_POS_LOTE_NEXUS_ONE.md`, antes de aumentar, manter, pausar ou reposicionar lote.
- `docs/MATRIZ_CAPACIDADE_OPERACIONAL_ESCALA_NEXUS_ONE.md`, antes de assumir novo lote ou mais implantacoes simultaneas.
- `docs/MATRIZ_VIABILIDADE_FINANCEIRA_ESCALA_NEXUS_ONE.md`, antes de ampliar lote, desconto, suporte ou implantacoes.
- `docs/MATRIZ_POSICIONAMENTO_COMPETITIVO_NEXUS_ONE.md`
- `docs/ONE_PAGE_COMERCIAL_DECISOR_NEXUS_ONE.md`
- `docs/FICHA_ROI_VALOR_PERCEBIDO_NEXUS_ONE.md`
- `docs/ATA_FECHAMENTO_COMERCIAL_NEXUS_ONE.md`
- `docs/FICHA_DIAGNOSTICO_COLETA_CLIENTE_NEXUS_ONE.md`
- `docs/MATRIZ_PLANOS_COMERCIAIS_NEXUS_ONE.md`
- `docs/MODELO_PROPOSTA_COMERCIAL_CONTROLADA_NEXUS_ONE.md`
- `docs/CHECKLIST_CONTRATO_TERMOS_COMERCIAIS_NEXUS_ONE.md`
- `docs/PROCESSO_FATURAMENTO_CLIENTE_NEXUS_ONE.md`
- `docs/PROCESSO_RENOVACAO_RETENCAO_CLIENTE_NEXUS_ONE.md`
- `docs/PROCESSO_OFFBOARDING_ENCERRAMENTO_CLIENTE_NEXUS_ONE.md`
- `docs/AUTORIZACAO_REFERENCIA_COMERCIAL_CLIENTE_NEXUS_ONE.md`, quando houver uso comercial do caso do cliente.
- Proposta gerada por `scripts/gerar-proposta-comercial-controlada.ps1`, quando aplicavel.
- Selecao do cliente piloto real gerada por `scripts/gerar-selecao-cliente-piloto-real.ps1`, antes de usar cliente como primeiro caso real.
- Plano do primeiro cliente real gerado por `scripts/gerar-plano-primeiro-cliente-real.ps1`, quando o cliente for usado como base para liberar producao ampla.
- Auditoria de evidencias gerada por `scripts/gerar-auditoria-evidencias-cliente-real.ps1`, antes de usar cliente real como referencia para escala.
- Plano de lancamento comercial gerado por `scripts/gerar-plano-lancamento-comercial.ps1`, antes de abrir novo lote de vendas.
- Resultado do lote comercial gerado por `scripts/gerar-resultado-lote-comercial.ps1`, antes de aumentar escala.
- Decisao de expansao comercial gerada por `scripts/gerar-decisao-expansao-comercial.ps1`, antes de mudar volume de vendas.
- Capacidade operacional gerada por `scripts/gerar-capacidade-operacional-escala.ps1`, antes de assumir novo lote.
- Viabilidade financeira gerada por `scripts/gerar-viabilidade-financeira-escala.ps1`, antes de ampliar escala.
- Posicionamento competitivo gerado por `scripts/gerar-posicionamento-competitivo.ps1`, quando o cliente comparar alternativas ou concorrentes.
- One-page comercial para decisor gerado por `scripts/gerar-onepage-comercial-decisor.ps1`, quando a proposta precisar circular com dono, diretoria ou aprovador financeiro.
- ROI/valor percebido gerado por `scripts/gerar-roi-valor-percebido.ps1`, quando usado para justificar preco, proposta ou renovacao.
- Ata de fechamento comercial gerada por `scripts/gerar-ata-fechamento-comercial.ps1`, antes de implantacao, faturamento, piloto pago ou producao controlada.
- Escopo do plano gerado por `scripts/gerar-escopo-plano-comercial.ps1`, quando aplicavel.
- Checklist de contrato/termos comerciais gerado por `scripts/gerar-checklist-contrato-comercial.ps1`, quando houver contrato pago, SLA especial, plano personalizado ou integracao externa.
- Faturamento do cliente gerado por `scripts/gerar-faturamento-cliente.ps1`, quando houver contrato pago, piloto pago ou producao controlada paga.
- Registro de renovacao/retencao gerado por `scripts/gerar-renovacao-retencao-cliente.ps1`, quando houver renovacao, reajuste, upgrade, downgrade, pausa ou cancelamento.
- Relatorio de offboarding gerado por `scripts/gerar-offboarding-cliente.ps1`, quando houver cancelamento, fim de piloto nao convertido ou encerramento de ambiente com dados reais.
- `docs/MATRIZ_GO_NO_GO_COMERCIAL_NEXUS_ONE.md`
- `docs/REGISTRO_RISCOS_PENDENCIAS_CLIENTE_NEXUS_ONE.md`
- `docs/TERMO_ACEITE_IMPLANTACAO_NEXUS_ONE.md`
- Termo de aceite gerado por `scripts/gerar-termo-aceite-implantacao.ps1`, quando houver Go producao controlada, Go producao ampla, prorrogacao ou retorno para homologacao.

Evidencias obrigatorias:

- Proposta/contrato/escopo aprovado.
- Selecao do cliente piloto real arquivada antes de iniciar D1-D10 com dados reais.
- Plano do primeiro cliente real arquivado quando a entrega for usada para validar producao controlada ou comercializacao ampla.
- Auditoria de evidencias arquivada antes de liberar comercializacao ampla.
- Plano de lancamento comercial arquivado quando houver abertura de lote comercial.
- Resultado do lote comercial arquivado antes de abrir lote maior.
- Decisao de expansao comercial arquivada antes de mudar escala.
- Capacidade operacional arquivada antes de mudar escala.
- Viabilidade financeira arquivada antes de mudar escala.
- Qualificacao comercial da oportunidade arquivada quando a entrega vier de venda consultiva.
- Posicionamento competitivo arquivado quando a venda envolver comparacao com alternativa ou concorrente.
- One-page comercial arquivado quando a decisao depender de dono, diretoria ou aprovador financeiro.
- ROI/valor percebido arquivado quando usado na proposta, renovacao ou defesa de preco.
- Ata de fechamento comercial arquivada com decisao, objecoes, riscos, limites e proximo passo.
- Checklist contratual arquivado quando houver contrato pago, SLA especial, plano personalizado ou integracao externa.
- Diagnostico/coleta inicial do cliente arquivado.
- Plano contratado, limites e adicionais registrados.
- Faturamento, vencimento, forma de pagamento e inicio de recorrencia registrados.
- Renovacao, reajuste, upgrade, downgrade, pausa ou cancelamento registrados quando aplicavel.
- Offboarding, exportacao/retencao de dados e bloqueio de acessos registrados quando houver encerramento.
- Matriz Go/No-Go preenchida.
- Registro de riscos e pendencias revisado.
- Pendencias bloqueantes zeradas ou decisao formal de manter em homologacao.
- Termo de aceite assinado para producao controlada ou producao.
- Pendencias nao bloqueantes aceitas no termo de aceite, quando existirem.
- Autorizacao de referencia comercial arquivada quando houver uso de nome, logo, depoimento, caso ou resultado do cliente.

## Niveis de Evidencia

Use esta classificacao para nao confundir documento criado com operacao validada.

| Nivel | Significado | Exemplo |
| --- | --- | --- |
| Artefato criado | Modelo, roteiro, checklist ou relatorio gerado | Proposta, cronograma, handoff |
| Evidencia executada | Prova de que o procedimento foi realizado | Smoke test, diario do piloto, backup, treinamento |
| Evidencia aceita | Cliente ou responsavel confirmou validacao | Termo de aceite, Go/No-Go, pendencia aceita |
| Evidencia de escala | Cliente real saudavel sustenta ampliacao comercial | Auditoria de evidencias + saude Verde |

Para liberar producao controlada, exigir pelo menos artefatos criados, evidencias executadas principais e Go/No-Go sem bloqueante.

Para liberar comercializacao ampla, exigir evidencia aceita e auditoria de cliente real.

## 2. Tecnico e Infraestrutura

- `docs/GUIA_PRODUCAO_TECNICA_NEXUS_ONE.md`
- `docs/GUIA_DEPLOY_SERVIDOR_NEXUS_ONE.md`
- `docs/GUIA_AMBIENTE_HOMOLOGACAO_NEXUS_ONE.md`
- `docs/GUIA_PROVISIONAMENTO_BANCO_NEXUS_ONE.md`
- `docs/ROTINA_MONITORAMENTO_BACKUP_NEXUS_ONE.md`
- `docs/PROCESSO_RELEASE_NEXUS_ONE.md`
- `docs/PROCESSO_NOTAS_VERSAO_CLIENTE_NEXUS_ONE.md`
- `docs/ROTEIRO_SMOKE_TEST_OPERACIONAL_NEXUS_ONE.md`
- `.env.example` e `.env.homolog.example` apenas como modelo, nunca com segredos reais.

Evidencias obrigatorias:

- Pre-deploy aprovado por `scripts/verificar-predeploy.ps1`.
- Verificacao de producao/homologacao aprovada por `scripts/verificar-producao.ps1`.
- Manifesto de release gerado por `scripts/gerar-manifesto-release.ps1`.
- Nota de versao para cliente gerada por `scripts/gerar-nota-versao-cliente.ps1`, quando houver mudanca visivel, impacto ou acao necessaria.
- Smoke test operacional executado por `scripts/smoke-test-operacional.ps1`.
- Backup executado por `scripts/backup-postgres.ps1`.
- Restauracao testada por `scripts/restaurar-backup-postgres.ps1`.
- Evidencia de restauracao gerada por `scripts/gerar-evidencia-restauracao.ps1`.
- Monitoramento ativo por `scripts/monitorar-disponibilidade.ps1` ou rotina equivalente.

## 3. Seguranca, Segredos e LGPD

- `docs/POLITICA_SEGREDOS_NEXUS_ONE.md`
- `docs/INVENTARIO_SEGREDOS_NEXUS_ONE.md`
- `docs/POLITICA_PRIVACIDADE_LGPD_NEXUS_ONE.md`

Evidencias obrigatorias:

- Auditoria de segredos gerada por `scripts/auditar-segredos.ps1`.
- Validacao de `.env` sem placeholders por `scripts/verificar-segredos.ps1`.
- Responsavel do cliente definido para dados pessoais.
- Politica de privacidade/LGPD aceita quando houver dados reais.
- Registro de solicitacao LGPD geravel por `scripts/gerar-solicitacao-lgpd.ps1`.

## 4. Dados Iniciais

- `docs/ROTEIRO_CARGA_INICIAL_DADOS_NEXUS_ONE.md`
- `templates/carga-inicial/clientes.csv`
- `templates/carga-inicial/produtos.csv`
- `templates/carga-inicial/usuarios.csv`
- `templates/carga-inicial/estoque-inicial.csv`

Evidencias obrigatorias:

- Arquivos de carga revisados pelo cliente.
- Cabecalhos validados por `scripts/verificar-carga-inicial.ps1`.
- Responsavel pela conferencia dos dados registrado.
- Pendencias de carga classificadas como bloqueantes ou nao bloqueantes.

## 5. Operacao, Treinamento e Suporte

- `docs/PROCESSO_IMPLANTACAO_CLIENTE_NEXUS_ONE.md`
- `docs/CHECKLIST_HANDOFF_COMERCIAL_IMPLANTACAO_SUPORTE_NEXUS_ONE.md`
- `docs/ROTEIRO_KICKOFF_CLIENTE_REAL_NEXUS_ONE.md`, quando houver dados reais, piloto pago ou producao controlada.
- `docs/CRONOGRAMA_IMPLANTACAO_CLIENTE_NEXUS_ONE.md`
- `docs/MODELOS_COMUNICACAO_IMPLANTACAO_CLIENTE_NEXUS_ONE.md`
- `docs/PLANO_PILOTO_ASSISTIDO_NEXUS_ONE.md`
- `docs/CHECKLIST_CLIENTE_PILOTO_NEXUS_ONE.md`
- `docs/ROTEIRO_TREINAMENTO_POR_PERFIL_NEXUS_ONE.md`
- `docs/ROTEIRO_SUPORTE_OPERACIONAL_NEXUS_ONE.md`
- `docs/BASE_CONHECIMENTO_SUPORTE_CLIENTE_NEXUS_ONE.md`
- `docs/POLITICA_SLA_SUPORTE_NEXUS_ONE.md`
- `docs/PLAYBOOK_COMUNICACAO_INCIDENTE_STATUS_NEXUS_ONE.md`
- `docs/ROTINA_SUCESSO_CLIENTE_POS_IMPLANTACAO_NEXUS_ONE.md`
- `docs/PROCESSO_FEEDBACK_NPS_CLIENTE_NEXUS_ONE.md`
- `docs/PROCESSO_PRIORIZACAO_ROADMAP_CLIENTE_NEXUS_ONE.md`

Evidencias obrigatorias:

- Diario do piloto gerado por `scripts/gerar-diario-piloto.ps1`.
- Evidencia de treinamento gerada por `scripts/gerar-evidencia-treinamento.ps1`.
- Canal de suporte, responsavel e SLA comunicados.
- Base de conhecimento/FAQ compartilhada com usuarios-chave quando aplicavel.
- Handoff comercial/implantacao/suporte arquivado.
- Kick-off do cliente real gerado por `scripts/gerar-kickoff-cliente-real.ps1` antes de publicar D1 com dados reais.
- Cronograma de implantacao arquivado.
- Comunicacoes principais arquivadas: inicio, dados, cronograma, pendencias, Go/No-Go e aceite, quando aplicavel.
- Ficha de incidente geravel por `scripts/gerar-incidente-suporte.ps1`.
- Comunicado de incidente/status geravel por `scripts/gerar-comunicado-incidente-status.ps1`.
- Artigo de base de conhecimento geravel por `scripts/gerar-artigo-base-conhecimento.ps1`.
- Revisao de saude do cliente geravel por `scripts/gerar-saude-cliente-pos-implantacao.ps1`.
- Feedback/NPS geravel por `scripts/gerar-feedback-nps-cliente.ps1`.
- Priorizacao de roadmap geravel por `scripts/gerar-priorizacao-roadmap.ps1`, quando feedback, suporte ou comercial virarem melhoria de produto.

## 6. Integracoes Externas

- `docs/MATRIZ_HOMOLOGACAO_INTEGRACOES_EXTERNAS_NEXUS_ONE.md`
- `docs/HOMOLOGACAO_ASAAS.md`
- `docs/EVIDENCIA_HOMOLOGACAO_PAGAMENTOS_ASAAS.md`
- `docs/HOMOLOGACAO_NOTIFICACOES.md`
- `docs/EVIDENCIA_HOMOLOGACAO_NOTIFICACOES.md`
- `docs/HOMOLOGACAO_FISCAL_REAL.md`
- `docs/EVIDENCIA_HOMOLOGACAO_FISCAL_REAL.md`

Evidencias obrigatorias:

- Verificacao de integracoes por `scripts/verificar-integracoes-externas.ps1`.
- Evidencia Asaas gerada por `scripts/gerar-evidencia-asaas.ps1`, quando pagamento real estiver no escopo.
- Evidencia de notificacoes gerada por `scripts/gerar-evidencia-notificacoes.ps1`, quando canal real estiver no escopo.
- Evidencia fiscal gerada por `scripts/gerar-evidencia-fiscal.ps1`, quando emissao real estiver no escopo.
- Itens nao homologados registrados como restricao comercial.

## Checklist Final de Entrega

- [ ] Escopo comercial aprovado.
- [ ] Qualificacao comercial arquivada ou dispensa justificada.
- [ ] Checklist contratual arquivado ou dispensa justificada.
- [ ] Faturamento comercial registrado ou dispensa justificada.
- [ ] Ambiente entregue e validado.
- [ ] Banco provisionado e com backup testado.
- [ ] Segredos auditados sem expor valores reais.
- [ ] Carga inicial validada, quando aplicavel.
- [ ] Treinamento por perfil concluido.
- [ ] Suporte/SLA comunicados.
- [ ] Handoff comercial/implantacao/suporte aprovado.
- [ ] Kick-off do cliente real aprovado antes de publicar D1 com dados reais.
- [ ] Cronograma de implantacao revisado com cliente.
- [ ] Comunicacoes principais arquivadas.
- [ ] Rotina de sucesso/saude do cliente agendada.
- [ ] Integracoes externas classificadas como homologadas, sandbox ou fora do escopo.
- [ ] Manifesto de release arquivado.
- [ ] Nota de versao/comunicacao de mudanca arquivada quando aplicavel.
- [ ] Smoke test operacional aprovado.
- [ ] Matriz Go/No-Go sem pendencia bloqueante.
- [ ] Registro de riscos/pendencias sem bloqueio aberto.
- [ ] Termo de aceite assinado.
- [ ] Pendencias nao bloqueantes aceitas e com plano de acao.
- [ ] Pacote revisado por responsavel Nexus One antes de enviar ao cliente.

## Bloqueios de Entrega

Nao liberar producao controlada quando existir qualquer um destes pontos:

- Backup sem restauracao testada.
- `.env` com placeholder, segredo fraco ou token real exposto em arquivo versionado.
- Login, venda, caixa, financeiro ou cadastro base falhando no smoke test.
- Carga inicial sem conferencia do cliente quando houver dados reais.
- Integracao prometida comercialmente sem homologacao ou restricao documentada.
- Treinamento nao executado para usuario-chave.
- Go/No-Go com pendencia bloqueante aberta.
- Termo de aceite ausente.
- Termo de aceite com pendencia bloqueante aberta.
- Evidencia real prometida comercialmente sem arquivo, log, relatorio, aceite ou comprovacao equivalente.

## Geracao do Relatorio do Pacote

Use:

```powershell
.\scripts\gerar-pacote-entrega.ps1 -Cliente "Cliente Piloto" -Ambiente "producao controlada" -Responsavel "Nexus One"
```

O relatorio gerado deve ser arquivado junto das evidencias do cliente. Ele nao deve conter senhas, tokens, certificados ou valores sensiveis.
