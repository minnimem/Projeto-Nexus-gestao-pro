# Guia de Ambiente de Homologacao - Nexus One

Use este ambiente para validar cliente, integracoes e treinamento sem misturar dados de producao.

## Arquivos

- `.env.homolog.example`: modelo de variaveis de homologacao.
- `.env.homolog`: arquivo real, fora do Git.
- `docker-compose.homolog.yml`: compose separado para homologacao.
- Volume PostgreSQL: `nexus_postgres_homolog_data`.
- Backups: `backups/homolog`.

## Subida

1. Copiar `.env.homolog.example` para `.env.homolog`.
2. Preencher senhas e `JWT_SECRET` reais de homologacao.
3. Manter Asaas em sandbox quando pagamento real ainda nao estiver autorizado.
4. Rodar `scripts/verificar-segredos.ps1 -EnvFile .env.homolog -AllowSandboxAsaas`.
5. Rodar `docker compose --env-file .env.homolog -f docker-compose.homolog.yml build`.
6. Rodar `docker compose --env-file .env.homolog -f docker-compose.homolog.yml up -d`.
7. Validar frontend em `http://localhost:5174` e backend em `http://localhost:8082/health`.

## Regras

- Nao restaurar backup de producao com dados sensiveis sem autorizacao do cliente.
- Nao usar token Asaas de producao em homologacao.
- Nao emitir fiscal em producao a partir deste ambiente.
- Identificar todos os clientes/produtos de teste como homologacao.
- Apagar massa de teste antes de reutilizar o ambiente para outro cliente.

## Validacao diaria

Rodar:

```powershell
.\scripts\verificar-producao.ps1 -ComposeFile docker-compose.homolog.yml -BackendUrl http://localhost:8082/health -FrontendUrl http://localhost:5174
```

## Encerramento

- Exportar evidencias de homologacao.
- Gerar backup final se houver dados relevantes.
- Registrar pendencias bloqueantes e nao bloqueantes.
- Encerrar ambiente ou limpar massa de dados antes do proximo cliente.
