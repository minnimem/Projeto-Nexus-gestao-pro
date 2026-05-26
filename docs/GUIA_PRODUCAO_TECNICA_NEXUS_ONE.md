# Guia de Producao Tecnica - Nexus One

Este guia organiza o minimo necessario para homologar e operar o Nexus One com menos risco comercial.

## Ambientes

- Desenvolvimento: Vite em `5173`, Spring Boot em `8081`, banco local.
- Homologacao: usar `docker-compose.homolog.yml` com `.env.homolog` separado e dados de teste controlados.
- Producao: usar o mesmo compose como base, com banco persistente, backup, segredo forte e monitoramento externo.

Guia dedicado: `docs/GUIA_AMBIENTE_HOMOLOGACAO_NEXUS_ONE.md`.
Deploy em servidor: `docs/GUIA_DEPLOY_SERVIDOR_NEXUS_ONE.md`.
Banco e restauracao: `docs/GUIA_PROVISIONAMENTO_BANCO_NEXUS_ONE.md`.
Processo de release: `docs/PROCESSO_RELEASE_NEXUS_ONE.md`.
Notas de versao para cliente: `docs/PROCESSO_NOTAS_VERSAO_CLIENTE_NEXUS_ONE.md`.
Smoke test operacional: `docs/ROTEIRO_SMOKE_TEST_OPERACIONAL_NEXUS_ONE.md`.
Go/No-Go comercial: `docs/MATRIZ_GO_NO_GO_COMERCIAL_NEXUS_ONE.md`.
Registro de riscos e pendencias: `docs/REGISTRO_RISCOS_PENDENCIAS_CLIENTE_NEXUS_ONE.md`.
SLA e suporte: `docs/POLITICA_SLA_SUPORTE_NEXUS_ONE.md`.
Comunicacao de incidente/status: `docs/PLAYBOOK_COMUNICACAO_INCIDENTE_STATUS_NEXUS_ONE.md`.
Base de conhecimento/FAQ: `docs/BASE_CONHECIMENTO_SUPORTE_CLIENTE_NEXUS_ONE.md`.
Feedback/NPS do cliente: `docs/PROCESSO_FEEDBACK_NPS_CLIENTE_NEXUS_ONE.md`.
Priorizacao de roadmap por feedback: `docs/PROCESSO_PRIORIZACAO_ROADMAP_CLIENTE_NEXUS_ONE.md`.
Integracoes externas: `docs/MATRIZ_HOMOLOGACAO_INTEGRACOES_EXTERNAS_NEXUS_ONE.md`.
Ficha de prontidao comercial: `docs/FICHA_PRONTIDAO_COMERCIAL_NEXUS_ONE.md`.
Plano de liberacao comercial ampla: `docs/PLANO_LIBERACAO_COMERCIAL_AMPLA_NEXUS_ONE.md`.
Selecao do cliente piloto real: `docs/MATRIZ_SELECAO_CLIENTE_PILOTO_REAL_NEXUS_ONE.md`.
Plano do primeiro cliente real: `docs/PLANO_EXECUCAO_PRIMEIRO_CLIENTE_REAL_NEXUS_ONE.md`.
Auditoria de evidencias do cliente real: `docs/AUDITORIA_EVIDENCIAS_CLIENTE_REAL_NEXUS_ONE.md`.
Plano de lancamento comercial controlado: `docs/PLANO_LANCAMENTO_COMERCIAL_CONTROLADO_NEXUS_ONE.md`.
Resultado do lote comercial: `docs/RELATORIO_RESULTADO_LOTE_COMERCIAL_NEXUS_ONE.md`.
Decisao de expansao comercial pos-lote: `docs/DECISAO_EXPANSAO_COMERCIAL_POS_LOTE_NEXUS_ONE.md`.
Capacidade operacional para escala: `docs/MATRIZ_CAPACIDADE_OPERACIONAL_ESCALA_NEXUS_ONE.md`.
Viabilidade financeira para escala: `docs/MATRIZ_VIABILIDADE_FINANCEIRA_ESCALA_NEXUS_ONE.md`.
Playbook comercial e qualificacao: `docs/PLAYBOOK_COMERCIAL_QUALIFICACAO_NEXUS_ONE.md`.
Posicionamento competitivo: `docs/MATRIZ_POSICIONAMENTO_COMPETITIVO_NEXUS_ONE.md`.
One-page comercial para decisor: `docs/ONE_PAGE_COMERCIAL_DECISOR_NEXUS_ONE.md`.
ROI e valor percebido: `docs/FICHA_ROI_VALOR_PERCEBIDO_NEXUS_ONE.md`.
Ata de fechamento comercial: `docs/ATA_FECHAMENTO_COMERCIAL_NEXUS_ONE.md`.
Ficha de diagnostico/coleta do cliente: `docs/FICHA_DIAGNOSTICO_COLETA_CLIENTE_NEXUS_ONE.md`.
Modelo de proposta controlada: `docs/MODELO_PROPOSTA_COMERCIAL_CONTROLADA_NEXUS_ONE.md`.
Matriz de planos comerciais: `docs/MATRIZ_PLANOS_COMERCIAIS_NEXUS_ONE.md`.
Checklist de contrato/termos comerciais: `docs/CHECKLIST_CONTRATO_TERMOS_COMERCIAIS_NEXUS_ONE.md`.
Processo de faturamento do cliente: `docs/PROCESSO_FATURAMENTO_CLIENTE_NEXUS_ONE.md`.
Renovacao, retencao e mudanca de plano: `docs/PROCESSO_RENOVACAO_RETENCAO_CLIENTE_NEXUS_ONE.md`.
Offboarding e encerramento de cliente: `docs/PROCESSO_OFFBOARDING_ENCERRAMENTO_CLIENTE_NEXUS_ONE.md`.
Roteiro de demonstracao comercial: `docs/ROTEIRO_DEMONSTRACAO_COMERCIAL_NEXUS_ONE.md`.
Treinamento por perfil: `docs/ROTEIRO_TREINAMENTO_POR_PERFIL_NEXUS_ONE.md`.
Carga inicial de dados: `docs/ROTEIRO_CARGA_INICIAL_DADOS_NEXUS_ONE.md`.
Privacidade/LGPD: `docs/POLITICA_PRIVACIDADE_LGPD_NEXUS_ONE.md`.
Piloto assistido: `docs/PLANO_PILOTO_ASSISTIDO_NEXUS_ONE.md`.
Pacote de entrega do cliente: `docs/PACOTE_ENTREGA_CLIENTE_NEXUS_ONE.md`.
Handoff comercial/implantacao/suporte: `docs/CHECKLIST_HANDOFF_COMERCIAL_IMPLANTACAO_SUPORTE_NEXUS_ONE.md`.
Kick-off do cliente real: `docs/ROTEIRO_KICKOFF_CLIENTE_REAL_NEXUS_ONE.md`.
Cronograma de implantacao: `docs/CRONOGRAMA_IMPLANTACAO_CLIENTE_NEXUS_ONE.md`.
Modelos de comunicacao: `docs/MODELOS_COMUNICACAO_IMPLANTACAO_CLIENTE_NEXUS_ONE.md`.
Rotina de sucesso do cliente: `docs/ROTINA_SUCESSO_CLIENTE_POS_IMPLANTACAO_NEXUS_ONE.md`.
Autorizacao de referencia comercial: `docs/AUTORIZACAO_REFERENCIA_COMERCIAL_CLIENTE_NEXUS_ONE.md`.

## Subida base

1. Copiar `.env.example` para `.env`.
2. Trocar todas as senhas, tokens e `JWT_SECRET`.
3. Conferir `DB_URL`, `POSTGRES_DB`, `POSTGRES_USER` e `POSTGRES_PASSWORD`.
4. Rodar `scripts/verificar-segredos.ps1 -EnvFile .env`.
5. Rodar `scripts/verificar-predeploy.ps1 -EnvFile .env -ComposeFile docker-compose.prod.yml`.
6. Rodar `docker compose -f docker-compose.prod.yml build`.
7. Rodar `docker compose -f docker-compose.prod.yml up -d`.
8. Validar frontend, login, caixa, venda, financeiro, fiscal e relatorios.

## Backup

- Script base: `scripts/backup-postgres.ps1`.
- Agendamento Windows: `scripts/agendar-backup-postgres.ps1`.
- Frequencia minima: diario em homologacao e producao.
- Retencao sugerida: 7 diarios, 4 semanais, 6 mensais.
- Antes de atualizar versao, gerar backup manual e registrar data/hora.

## Rollback

1. Registrar versao atual antes do deploy.
2. Gerar backup do banco.
3. Aplicar nova versao.
4. Se falhar, executar `scripts/rollback-compose.ps1` apontando para a tag anterior.
5. Se houve migracao destrutiva de banco, restaurar backup antes de subir a versao anterior.

## Segredos

- Nunca versionar `.env` real.
- `JWT_SECRET` deve ter 32+ caracteres.
- Tokens Asaas, fiscal e webhook devem ficar em variaveis de ambiente.
- Certificados fiscais devem ficar fora do repositorio, referenciados por variaveis.
- Seguir `docs/POLITICA_SEGREDOS_NEXUS_ONE.md`.
- Manter `docs/INVENTARIO_SEGREDOS_NEXUS_ONE.md` atualizado sem valores reais.
- Executar `scripts/verificar-segredos.ps1` antes de cada subida de homologacao/producao.
- Gerar auditoria com `scripts/auditar-segredos.ps1` antes de producao e apos rotacao.

## Logs e monitoramento

- Acompanhar logs com `docker compose -f docker-compose.prod.yml logs -f backend`.
- Monitorar disponibilidade do backend em `8081`.
- Monitorar disponibilidade recorrente com `scripts/monitorar-disponibilidade.ps1`.
- Agendar monitoramento no Windows com `scripts/agendar-monitoramento-disponibilidade.ps1`.
- Monitorar espaco em disco do volume PostgreSQL.
- Monitorar falhas fiscais, notificacoes, caixa, estornos e permissao.
- Executar `scripts/verificar-producao.ps1` na rotina diaria.
- Testar restauracao com `scripts/restaurar-backup-postgres.ps1` em ambiente separado.
- Seguir `docs/ROTINA_MONITORAMENTO_BACKUP_NEXUS_ONE.md`.

## Checklist pre-comercial

- Build frontend aprovado.
- Backend compila e testes criticos passam.
- Pre-deploy aprovado com `scripts/verificar-predeploy.ps1`.
- Ambiente de homologacao separado validado.
- Banco PostgreSQL persistente validado.
- Backup manual, backup agendado, restauracao e evidencia de restauracao testados.
- `.env` real protegido.
- Auditoria de segredos gerada sem expor valores reais.
- Politica LGPD/privacidade definida para dados reais.
- Homologacao fiscal e notificacoes testadas.
- Matriz de homologacao de integracoes externas preenchida.
- Monitoramento de disponibilidade com alerta externo testado.
- Manifesto de release gerado com `scripts/gerar-manifesto-release.ps1`.
- Nota de versao para cliente gerada com `scripts/gerar-nota-versao-cliente.ps1` quando houver mudanca visivel, impacto operacional ou acao necessaria.
- Smoke test operacional executado com `scripts/smoke-test-operacional.ps1`.
- Plano de rollback documentado.
- Operador treinado em venda, caixa, financeiro, fiscal e relatorios.
- Evidencia de treinamento por perfil arquivada.
- Responsavel de suporte, prioridade e canal de acionamento definidos.
- Comunicacao de incidente/status pronta com `scripts/gerar-comunicado-incidente-status.ps1` para P0/P1, manutencao e indisponibilidade.
- Base de conhecimento/FAQ pronta e artigos recorrentes geraveis com `scripts/gerar-artigo-base-conhecimento.ps1`.
- Ficha de diagnostico/coleta do cliente preenchida antes da implantacao.
- Qualificacao comercial da oportunidade gerada com `scripts/gerar-qualificacao-oportunidade.ps1` antes de proposta/piloto, quando aplicavel.
- Faturamento do cliente gerado com `scripts/gerar-faturamento-cliente.ps1` quando houver contrato pago, piloto pago ou producao controlada paga.
- Renovacao/retencao gerada com `scripts/gerar-renovacao-retencao-cliente.ps1` quando houver reajuste, upgrade, downgrade, pausa ou cancelamento.
- Offboarding gerado com `scripts/gerar-offboarding-cliente.ps1` quando houver cancelamento, fim de piloto nao convertido ou encerramento de ambiente com dados reais.
- Handoff comercial/implantacao/suporte preenchido antes da operacao assistida.
- Kick-off do cliente real gerado com `scripts/gerar-kickoff-cliente-real.ps1` antes de publicar D1 com dados reais.
- Cronograma de implantacao gerado com `scripts/gerar-cronograma-implantacao-cliente.ps1`.
- Comunicacoes de implantacao geradas com `scripts/gerar-comunicacao-implantacao.ps1`, quando aplicavel.
- Rotina de sucesso/saude do cliente agendada apos D1 ou aceite.
- Feedback/NPS gerado com `scripts/gerar-feedback-nps-cliente.ps1` nos marcos D7, D15, D30, release ou incidente relevante.
- Priorizacao de roadmap gerada com `scripts/gerar-priorizacao-roadmap.ps1` quando feedback, suporte ou comercial virarem melhoria de produto.
- Autorizacao de referencia comercial gerada apenas quando houver uso comercial do caso do cliente.
- Plano de demonstracao/prova de valor gerado com `scripts/gerar-plano-demo-comercial.ps1`, quando a entrega vier de oportunidade comercial.
- Posicionamento competitivo gerado com `scripts/gerar-posicionamento-competitivo.ps1` quando o cliente comparar alternativas ou concorrentes.
- One-page comercial para decisor gerado com `scripts/gerar-onepage-comercial-decisor.ps1` quando a proposta precisar circular com dono, diretoria ou aprovador financeiro.
- ROI/valor percebido gerado com `scripts/gerar-roi-valor-percebido.ps1` quando usado na proposta, renovacao ou defesa de preco.
- Ata de fechamento comercial gerada com `scripts/gerar-ata-fechamento-comercial.ps1` antes de implantacao, faturamento, piloto pago ou producao controlada.
- Checklist de contrato/termos comerciais gerado com `scripts/gerar-checklist-contrato-comercial.ps1` antes de contrato pago, SLA especial, plano personalizado ou integracao externa.
- Processo de implantacao seguido conforme `docs/PROCESSO_IMPLANTACAO_CLIENTE_NEXUS_ONE.md`.
- Registro de riscos/pendencias gerado com `scripts/gerar-registro-riscos-pendencias.ps1` e revisado antes do Go/No-Go.
- Pacote de entrega gerado com `scripts/gerar-pacote-entrega.ps1` e arquivado com as evidencias do cliente.
- Decisao de liberacao comercial gerada com `scripts/gerar-decisao-liberacao-comercial.ps1` antes de ampliar vendas.
- Selecao do cliente piloto real gerada com `scripts/gerar-selecao-cliente-piloto-real.ps1` antes de iniciar primeiro cliente com dados reais.
- Plano do primeiro cliente real gerado com `scripts/gerar-plano-primeiro-cliente-real.ps1` antes de usar um cliente como evidencia para producao ampla.
- Auditoria de evidencias gerada com `scripts/gerar-auditoria-evidencias-cliente-real.ps1` antes de liberar comercializacao ampla.
- Plano de lancamento comercial gerado com `scripts/gerar-plano-lancamento-comercial.ps1` antes de abrir novo lote de vendas.
- Resultado do lote comercial gerado com `scripts/gerar-resultado-lote-comercial.ps1` antes de aumentar escala.
- Decisao de expansao comercial gerada com `scripts/gerar-decisao-expansao-comercial.ps1` antes de mudar volume de vendas.
- Capacidade operacional gerada com `scripts/gerar-capacidade-operacional-escala.ps1` antes de assumir novo lote ou mais implantacoes simultaneas.
- Viabilidade financeira gerada com `scripts/gerar-viabilidade-financeira-escala.ps1` antes de ampliar lote, desconto, suporte ou implantacoes.
- Matriz Go/No-Go preenchida sem pendencia bloqueante.
- Termo de aceite preenchido conforme `docs/TERMO_ACEITE_IMPLANTACAO_NEXUS_ONE.md`.
