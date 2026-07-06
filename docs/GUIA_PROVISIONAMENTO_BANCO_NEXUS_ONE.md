# Guia de Provisionamento do Banco - Nexus One

Este guia define como preparar PostgreSQL para homologacao/producao e como registrar teste de restauracao antes de comercializar.

## Producao

- Usar PostgreSQL persistente via volume Docker ou banco gerenciado.
- Separar usuario, senha e banco por ambiente.
- Proteger `.env` ou cofre do servidor.
- Garantir espaco em disco para banco, logs e backups.
- Bloquear acesso externo direto ao PostgreSQL quando nao for necessario.
- Agendar backup diario e registrar restauracao testada.

Variaveis minimas:

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`

Validacao automatica antes do deploy:

```powershell
.\scripts\verificar-banco-producao.ps1 -EnvFile .env -ComposeFile docker-compose.prod.yml -ServiceName postgres
```

Validacao sem exigir container rodando:

```powershell
.\scripts\verificar-banco-producao.ps1 -EnvFile .env -ComposeFile docker-compose.prod.yml -ServiceName postgres -SkipDockerRuntime
```

## Homologacao

- Usar `docker-compose.homolog.yml`.
- Usar banco `nexus_one_homolog` ou equivalente.
- Usar volume `nexus_postgres_homolog_data`.
- Usar backup em `backups/homolog`.
- Nunca misturar massa de homologacao com producao sem autorizacao formal.

## Backup

Producao:

```powershell
.\scripts\backup-postgres.ps1 -ComposeFile docker-compose.prod.yml -OutputDir backups -ServiceName postgres
```

Homologacao:

```powershell
.\scripts\backup-postgres.ps1 -ComposeFile docker-compose.homolog.yml -OutputDir backups\homolog -ServiceName postgres-homolog
```

## Restauracao de Teste

Homologacao:

```powershell
.\scripts\restaurar-backup-postgres.ps1 -BackupFile ".\backups\nexus-one-arquivo.dump" -ComposeFile docker-compose.homolog.yml -ServiceName postgres-homolog -BackupDir backups\homolog
```

Depois gerar evidencia:

```powershell
.\scripts\gerar-evidencia-restauracao.ps1 -BackupFile ".\backups\nexus-one-arquivo.dump" -EnvironmentName homologacao -Responsible "Responsavel"
```

## Criterio de Aprovacao

- Backup gerado e localizado.
- Restauracao executada fora da producao.
- Backend subiu apos restauracao.
- Login e dados principais foram conferidos.
- Evidencia de restauracao foi arquivada.
- Pendencias foram registradas com responsavel e prazo.
