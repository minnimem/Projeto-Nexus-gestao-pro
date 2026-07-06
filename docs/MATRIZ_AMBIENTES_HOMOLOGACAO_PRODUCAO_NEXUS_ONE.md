# Matriz de Ambientes - Nexus One

Esta matriz define o uso oficial dos ambientes de homologacao e producao. Ela serve como ponto unico de decisao antes de publicar cliente, rodar smoke test, configurar dominio, backup ou integracoes externas.

## Homologacao

Objetivo: validar release, treinamento, dados de teste, integracoes em sandbox e aceite operacional antes de qualquer uso real.

Arquivos oficiais:

- `.env.homolog`
- `.env.homolog.example`
- `docker-compose.homolog.yml`
- `docs/GUIA_AMBIENTE_HOMOLOGACAO_NEXUS_ONE.md`

Padrao tecnico:

- Frontend local/container: `http://localhost:5174`
- Backend local/container: `http://localhost:8082/health`
- PostgreSQL: servico `postgres-homolog`
- Volume: `nexus_postgres_homolog_data`
- Backups: `backups/homolog`
- Asaas: sandbox enquanto pagamento real nao estiver aprovado
- Fiscal: homologacao/mock/controlado, nunca numeracao real sem evidencia
- Notificacoes: mock/sandbox ou canal do cliente autorizado para teste

Pode conter:

- Massa ficticia.
- Massa anonimizada autorizada.
- Usuarios de teste.
- Certificados/tokens de homologacao.

Nao pode conter:

- Token real de pagamento sem aprovacao formal.
- Emissao fiscal real.
- Dados sensiveis de producao sem autorizacao do cliente.
- Backup de producao restaurado sem registro de responsavel e finalidade.

Criterio de pronto:

- `.env.homolog` preenchido fora do Git.
- Segredos validados.
- Compose de homologacao subindo.
- Frontend e backend respondendo.
- Smoke test minimo executado.
- Evidencias arquivadas.

## Producao

Objetivo: operar cliente real com dados reais, backup, monitoramento, controle de acesso, aceite e rollback.

Arquivos oficiais:

- `.env`
- `.env.example`
- `docker-compose.prod.yml`
- `docs/GUIA_DEPLOY_SERVIDOR_NEXUS_ONE.md`
- `docs/GUIA_PRODUCAO_TECNICA_NEXUS_ONE.md`
- `docs/ROTEIRO_SMOKE_TEST_OPERACIONAL_NEXUS_ONE.md`

Padrao tecnico:

- Frontend: dominio real em HTTPS
- Backend: API real em HTTPS ou atras de proxy interno
- PostgreSQL: banco persistente com volume dedicado
- Backups: pasta `backups` com rotina agendada
- Monitoramento: healthcheck, logs e alerta configurados
- Segredos: somente variaveis reais fora do Git
- Fiscal/pagamentos/notificacoes reais: liberados apenas por escopo homologado

Pode conter:

- Dados reais do cliente.
- Usuarios reais por perfil.
- Integrações reais homologadas.
- Certificados/tokens reais somente fora do repositorio.

Nao pode conter:

- Senhas padrao.
- `JWT_SECRET` de exemplo.
- Banco sem backup.
- Deploy sem plano de rollback.
- Modulo fiscal/pagamento real sem evidencia de homologacao do cliente/provedor.

Criterio de pronto:

- Pre-deploy aprovado.
- Build frontend aprovado.
- Backend/JAR/container validado.
- Banco provisionado e conectado.
- Backup manual criado.
- Restauracao testada em ambiente separado.
- Usuario MASTER validado e senha trocada.
- Smoke test operacional aprovado.
- Go/No-Go aprovado.

## Regra de promocao

Uma versao so pode sair de homologacao para producao quando:

1. O mesmo pacote/release foi validado em homologacao.
2. Nao ha pendencia bloqueante aberta.
3. Backup e rollback estao prontos.
4. Smoke test operacional foi executado.
5. Integracoes reais vendidas foram homologadas ou formalmente marcadas fora do escopo.
6. O responsavel registrou a decisao de Go.

## Regra de retorno

Se producao apresentar falha bloqueante:

1. Congelar novas alteracoes.
2. Gerar evidencia do erro.
3. Executar rollback ou correcao emergencial conforme severidade.
4. Reproduzir em homologacao.
5. Liberar nova versao somente apos smoke test.
