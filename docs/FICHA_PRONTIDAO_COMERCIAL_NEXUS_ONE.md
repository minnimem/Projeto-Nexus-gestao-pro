# Ficha de Prontidao Comercial - Nexus One

Data de referencia: 10/05/2026

## Status Atual

- Demonstracao comercial: liberada.
- Piloto assistido: liberado com escopo controlado.
- Producao controlada: tecnicamente preparada, depende de execucao no servidor/cliente real.
- Producao ampla: condicionada aos primeiros ciclos reais, homologacoes externas e aceite.

## Percentuais

- Demonstracao comercial: 92% a 96%.
- Piloto controlado: 90% a 94%.
- Producao comercial completa: 90% a 96%.
- Falta para producao comercial completa: 4% a 10%.

## Liberado Para Comercializar Agora

- Demonstracao comercial forte.
- Roteiro de demonstracao/prova de valor usando `docs/ROTEIRO_DEMONSTRACAO_COMERCIAL_NEXUS_ONE.md`.
- Piloto assistido com cliente real.
- Venda consultiva com escopo claro.
- Proposta comercial controlada usando `docs/MODELO_PROPOSTA_COMERCIAL_CONTROLADA_NEXUS_ONE.md`.
- Producao controlada apenas apos Go/No-Go sem pendencia bloqueante.

## Condicoes Para Producao Controlada

- Deploy definitivo executado e validado.
- Banco de producao provisionado.
- Backup agendado e restauracao testada com evidencia.
- Monitoramento externo com alerta testado.
- Segredos auditados e protegidos.
- Smoke test operacional aprovado.
- Carga inicial validada em homologacao quando houver importacao de dados.
- Politica LGPD/privacidade definida quando houver dados reais.
- Treinamento por perfil executado e evidenciado.
- Pacote de entrega do cliente gerado e arquivado.
- Matriz Go/No-Go preenchida.
- Termo de aceite assinado.

## Bloqueios Para Producao Ampla

- Fiscal real sem homologacao oficial por cliente/filial/modelo.
- Pagamento real sem homologacao ponta a ponta com provedor.
- Notificacao real sem canal e token do cliente testados.
- Ausencia de cofre/secret manager ou rotina real de rotacao.
- Falta de historico em cliente real usando o sistema por alguns ciclos.
- Piloto assistido sem diarios/evidencias de operacao real.
- Uso de dados reais sem responsavel de privacidade e politica LGPD.
- Ausencia de decisao conforme `docs/PLANO_LIBERACAO_COMERCIAL_AMPLA_NEXUS_ONE.md`.

## Decisao Recomendada

O Nexus One pode ser vendido como piloto assistido ou implantacao controlada, deixando claro em proposta quais integracoes estao homologadas, quais estao em sandbox e quais dependem de contador/provedor/cliente.

Nao recomendar venda como producao ampla sem executar primeiro deploy real, backup/restauracao, monitoramento, smoke test, Go/No-Go e aceite do cliente.

Para ampliar vendas alem de piloto/producao controlada, seguir `docs/PLANO_LIBERACAO_COMERCIAL_AMPLA_NEXUS_ONE.md`.
