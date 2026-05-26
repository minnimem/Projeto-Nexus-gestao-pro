# Processo de Release - Nexus One

Este processo organiza cada entrega para homologacao ou producao, com versao, evidencias e decisao clara.

## Quando Usar

- Antes de publicar uma versao em homologacao.
- Antes de publicar em producao.
- Antes de atualizar cliente piloto.
- Antes de executar rollback.

## Preparacao

- Confirmar escopo da release.
- Registrar versao, branch e commit.
- Gerar backup manual antes da subida.
- Rodar build/testes aplicaveis.
- Rodar pre-deploy.
- Conferir segredos e ambiente correto.

Gerar manifesto:

```powershell
.\scripts\gerar-manifesto-release.ps1 -Version "1.0.0" -EnvironmentName producao -Responsible "Responsavel"
```

Gerar nota de versao para cliente quando houver mudanca visivel, impacto operacional ou acao necessaria:

```powershell
.\scripts\gerar-nota-versao-cliente.ps1 -Cliente "Cliente Piloto" -Versao "1.0.0" -Ambiente "producao controlada" -Resumo "Melhorias e correcoes da release"
```

## Publicacao

```powershell
docker compose --env-file .env -f docker-compose.prod.yml build
docker compose --env-file .env -f docker-compose.prod.yml up -d
```

Validar:

```powershell
.\scripts\verificar-producao.ps1
.\scripts\monitorar-disponibilidade.ps1 -EnvironmentName producao
.\scripts\smoke-test-operacional.ps1 -BaseUrl http://localhost:8081 -Login admin -Senha "senha" -EnvironmentName producao
```

## Evidencias

- Manifesto de release preenchido.
- Nota de versao para cliente quando a release afetar uso, treinamento, suporte ou comunicacao comercial.
- Saida do build/testes.
- Saida do pre-deploy.
- Nome do backup anterior a subida.
- Saida do healthcheck.
- Relatorio do smoke test operacional.
- Evidencia de fluxo operacional validado.
- Decisao final: publicar, publicar com ressalva, bloquear ou rollback.

## Rollback

Rollback so deve ser executado depois de confirmar:

- Backup anterior localizado.
- GitRef anterior definido.
- Motivo do rollback registrado.
- Janela de manutencao aprovada quando houver cliente em producao.

Comando:

```powershell
.\scripts\rollback-compose.ps1 -ComposeFile docker-compose.prod.yml -GitRef <tag-ou-commit-anterior>
```

Se houver alteracao destrutiva de banco, restaurar backup em janela aprovada antes de reabrir o sistema.
