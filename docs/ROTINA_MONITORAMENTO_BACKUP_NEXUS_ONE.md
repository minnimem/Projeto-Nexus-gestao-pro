# Rotina de Monitoramento e Backup - Nexus One

Este roteiro cobre a rotina minima para operar homologacao/producao controlada.

## Verificacao Diaria

Executar:

```powershell
.\scripts\verificar-producao.ps1
```

Para monitoramento recorrente com alerta:

```powershell
.\scripts\monitorar-disponibilidade.ps1 -BackendUrl http://localhost:8081/health -FrontendUrl http://localhost:5173 -EnvironmentName producao
```

Para agendar a cada 5 minutos no Windows:

```powershell
.\scripts\agendar-monitoramento-disponibilidade.ps1 -TaskName NexusOneMonitorDisponibilidade -IntervalMinutes 5
```

Para enviar alerta por webhook, configurar a variavel `NEXUS_MONITOR_WEBHOOK_URL` no ambiente do servidor ou informar `-AlertWebhookUrl`.

Validar:

- Containers `postgres`, `backend` e `frontend` ativos.
- Backend `/health` retornando `UP`.
- Frontend respondendo HTTP 200.
- Sem crescimento anormal de logs.
- Espaco em disco suficiente.
- Ultimo backup localizado.
- Tarefa agendada ativa no Agendador de Tarefas, quando em servidor Windows.
- Monitoramento recorrente ativo com alerta externo quando houver webhook.

## Backup Diario

Executar:

```powershell
.\scripts\backup-postgres.ps1
```

Para homologacao:

```powershell
.\scripts\backup-postgres.ps1 -ComposeFile docker-compose.homolog.yml -OutputDir backups\homolog -ServiceName postgres-homolog
```

Com retencao customizada:

```powershell
.\scripts\backup-postgres.ps1 -RetentionDays 30
```

Para agendar backup diario no Windows:

```powershell
.\scripts\agendar-backup-postgres.ps1 -TaskName NexusOneBackupPostgres -Time 02:00
```

Para agendar homologacao:

```powershell
.\scripts\agendar-backup-postgres.ps1 -TaskName NexusOneBackupHomolog -ComposeFile docker-compose.homolog.yml -OutputDir backups\homolog -ServiceName postgres-homolog -Time 03:00
```

Registrar:

- Data/hora.
- Nome do arquivo `.dump`.
- Tamanho do arquivo.
- Responsavel.

Retencao sugerida:

- 7 backups diarios.
- 4 backups semanais.
- 6 backups mensais.

O script local valida se o arquivo `.dump` foi criado e se nao esta vazio.

## Restauracao de Teste

Antes de comercializar, testar restauracao em ambiente separado:

```powershell
.\scripts\restaurar-backup-postgres.ps1 -BackupFile ".\backups\nexus-one-arquivo.dump"
```

Para homologacao:

```powershell
.\scripts\restaurar-backup-postgres.ps1 -BackupFile ".\backups\nexus-one-arquivo.dump" -ComposeFile docker-compose.homolog.yml -ServiceName postgres-homolog -BackupDir backups\homolog
```

Gerar evidencia:

```powershell
.\scripts\gerar-evidencia-restauracao.ps1 -BackupFile ".\backups\nexus-one-arquivo.dump" -EnvironmentName homologacao -Responsible "Responsavel"
```

Nunca testar restauracao diretamente no banco de producao sem janela aprovada.

## Logs

Comandos uteis:

```powershell
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f postgres
.\scripts\verificar-observabilidade.ps1 -EnvFile .env -ComposeFile docker-compose.prod.yml
```

Eventos que exigem analise:

- Alerta de indisponibilidade do backend ou frontend.
- Erro 5xx no backend.
- Falha de login repetida.
- Erro de webhook Asaas/notificacoes.
- Erro fiscal.
- Divergencia de caixa.
- Falha de backup.

## Criterio Minimo Para Producao Restrita

- Healthcheck do compose ativo.
- Verificacao diaria executada.
- Logs e monitoramento validados por `scripts/verificar-observabilidade.ps1`.
- Backup diario executado.
- Backup diario agendado no servidor.
- Restauracao testada em ambiente separado.
- Responsavel definido para monitoramento.
- Alerta externo de indisponibilidade configurado e testado.
