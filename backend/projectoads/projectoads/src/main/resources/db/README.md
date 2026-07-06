# Banco de dados

Este diretorio concentra a orientacao de banco do backend.

## Estado atual

- Banco local padrao: `TB_ADS`.
- Driver: PostgreSQL.
- Configuracao principal: `src/main/resources/application.yml`.
- O `ddl-auto` fica configuravel por ambiente via `JPA_DDL_AUTO`.
- Em desenvolvimento o padrao ainda e `update`, para manter compatibilidade com o projeto atual.

## Migrations

O projeto ainda nao usa Flyway ou Liquibase. Antes de producao, o caminho recomendado e:

1. Congelar o schema atual do PostgreSQL.
2. Gerar uma migration inicial versionada.
3. Trocar `JPA_DDL_AUTO` para `validate` em producao.
4. Aplicar novas alteracoes somente por migration revisada.

Quando Flyway for adotado, criar arquivos em:

```text
src/main/resources/db/migration
```

Padrao sugerido:

```text
V001__baseline_schema.sql
V002__ajuste_nome_descritivo.sql
```

## Backup

Script disponivel:

```powershell
.\scripts\backup_tb_ads.ps1
```

Exemplo local:

```powershell
$env:PGPASSWORD="sua_senha"
.\scripts\backup_tb_ads.ps1 -HostName localhost -Port 5432 -Database TB_ADS -User postgres
```

O script usa `pg_dump` em formato custom, proprio para restauracao com `pg_restore`.

## Carga inicial

Script disponivel:

```text
scripts/seed_tb_ads_minimo.sql
```

Ele cria apenas a empresa local padrao se ela ainda nao existir. O usuario master e responsabilidade do `MasterBootstrapConfig`, que cria ou promove o login `master` ao subir a aplicacao fora de H2.
