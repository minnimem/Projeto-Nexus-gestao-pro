# Guia de Deploy em Servidor - Nexus One

Este guia organiza o deploy definitivo em VPS/servidor proprio usando Docker Compose.

## Requisitos do Servidor

- Docker e Docker Compose instalados.
- Porta HTTP/HTTPS liberada conforme proxy escolhido.
- Porta do backend restrita quando houver proxy reverso.
- Disco com espaco para banco, logs e backups.
- Usuario operacional definido para executar deploy.
- Acesso ao repositorio ou pacote de release.
- Politica de backup e monitoramento definida.

## Preparacao

1. Clonar ou copiar o projeto para o servidor.
2. Criar `.env` real a partir de `.env.example`.
3. Preencher senhas, `JWT_SECRET`, tokens e URLs reais.
4. Criar pasta `backups`.
5. Configurar webhook de monitoramento em `NEXUS_MONITOR_WEBHOOK_URL`, quando aplicavel.
6. Conferir certificado fiscal e variaveis sensiveis fora do Git.

## Pre-Deploy

Rodar:

```powershell
.\scripts\verificar-predeploy.ps1 -EnvFile .env -ComposeFile docker-compose.prod.yml
```

Se o servidor nao permitir validar Docker Compose durante a preparacao:

```powershell
.\scripts\verificar-predeploy.ps1 -EnvFile .env -ComposeFile docker-compose.prod.yml -SkipDockerConfig
```

O deploy fica bloqueado se faltar arquivo critico, segredo real ou compose valido.

Gerar manifesto de release:

```powershell
.\scripts\gerar-manifesto-release.ps1 -Version "1.0.0" -EnvironmentName producao -Responsible "Responsavel"
```

## Deploy

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

## Pos-Deploy

- Criar primeiro backup manual.
- Testar restauracao em ambiente separado.
- Agendar backup diario.
- Agendar monitoramento recorrente.
- Registrar versao implantada, data, responsavel e URL.
- Arquivar manifesto de release.
- Executar venda, caixa, financeiro, estoque, fiscal e relatorios com usuario operacional.

## Evidencias Minimas

- Saida do pre-deploy.
- Manifesto de release.
- Saida do healthcheck.
- Relatorio de smoke test operacional.
- Nome do backup gerado.
- Evidencia de restauracao testada.
- Evidencia de monitoramento/alerta.
- Termo de aceite preenchido quando for cliente real.

## Rollback

Antes de atualizar:

- Registrar tag/versao atual.
- Gerar backup manual.
- Confirmar que o backup foi localizado.

Se falhar:

```powershell
.\scripts\rollback-compose.ps1 -ComposeFile docker-compose.prod.yml -GitRef <tag-ou-commit-anterior>
```

Se houve migracao destrutiva ou dado inconsistente, restaurar backup em janela aprovada antes de reabrir o sistema.
