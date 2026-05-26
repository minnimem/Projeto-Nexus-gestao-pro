# Politica de Segredos - Nexus One

Esta politica define o minimo operacional para proteger senhas, tokens e certificados antes de usar o Nexus One em homologacao ou producao.

## Regras obrigatorias

- Nunca versionar `.env` real, certificados fiscais, chaves privadas, tokens Asaas, tokens de webhook ou senhas de banco.
- Usar `.env.example` apenas como modelo, sem valor real.
- Executar `scripts/verificar-segredos.ps1` antes de subir ambiente de homologacao ou producao.
- Usar `JWT_SECRET` com no minimo 32 caracteres, gerado de forma aleatoria.
- Separar segredos de homologacao e producao.
- Trocar segredos sempre que um operador sair da equipe, um dispositivo for perdido ou houver suspeita de vazamento.
- Manter inventario sem valores reais em `docs/INVENTARIO_SEGREDOS_NEXUS_ONE.md`.
- Gerar auditoria sem valores sensiveis com `scripts/auditar-segredos.ps1`.

## Checklist antes do deploy

- `.env` criado fora do Git.
- `POSTGRES_PASSWORD`, `DB_PASSWORD` e `JWT_SECRET` preenchidos com valores fortes.
- `SPRING_PROFILES_ACTIVE=prod` no ambiente de producao.
- Asaas habilitado apenas quando `ASAAS_API_KEY` e `ASAAS_WEBHOOK_TOKEN` forem reais.
- Notificacoes habilitadas apenas quando `NOTIFICATIONS_WEBHOOK_URL` e `NOTIFICATIONS_TOKEN` forem reais.
- Certificado fiscal A1, senha e CSC armazenados fora do repositorio.
- Backup feito antes de qualquer troca de segredo critico.
- Relatorio de auditoria de segredos gerado e arquivado.

## Rotacao

- Banco de dados: rotacionar senha em janela controlada, atualizar `.env`, reiniciar backend e validar login/caixa/venda.
- JWT: rotacionar em manutencao programada, pois usuarios autenticados podem precisar entrar novamente.
- Asaas/webhook: rotacionar token no provedor, atualizar `.env`, reiniciar backend e executar evidencia de homologacao.
- Fiscal: trocar certificado/senha conforme validade ou orientacao do contador.
- Registrar toda rotacao no inventario, sem expor valores reais.

## Validacao

Rodar:

```powershell
.\scripts\verificar-segredos.ps1 -EnvFile .env
```

Para homologacao controlada com Asaas sandbox e perfil `prod`, rodar:

```powershell
.\scripts\verificar-segredos.ps1 -EnvFile .env -AllowSandboxAsaas
```

O script bloqueia placeholders, variaveis obrigatorias vazias, `JWT_SECRET` curto e integracoes habilitadas sem token real.

Para gerar relatorio de auditoria sem expor valores:

```powershell
.\scripts\auditar-segredos.ps1 -EnvFile .env -OutputDir reports
```
