# Migrations

Pasta reservada para migrations versionadas do banco.

O projeto ainda utiliza Hibernate `ddl-auto` configuravel. Quando Flyway ou Liquibase for ativado, manter aqui os scripts incrementais revisados antes de mudar producao para `JPA_DDL_AUTO=validate`.
