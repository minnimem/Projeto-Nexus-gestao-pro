# Plano de Execucao do Primeiro Cliente Real - Nexus One

Use este plano para conduzir o primeiro cliente real do Nexus One de forma controlada. Ele conecta venda, deploy, homologacao, implantacao, suporte, Go/No-Go, aceite e rotina de sucesso em uma sequencia unica.

## Objetivo

- Transformar producao controlada em evidencia real.
- Reduzir risco antes de comercializacao ampla.
- Evitar que deploy, backup, monitoramento, integracoes e aceite fiquem soltos.
- Criar um caso real auditavel para decisao comercial.

## Quando Usar

- Cliente aprovado na matriz de selecao do cliente piloto real.
- Primeiro cliente com dados reais.
- Primeiro cliente em producao controlada.
- Primeiro piloto pago com intencao de virar producao.
- Cliente usado como referencia interna para liberar vendas mais amplas.

## Fases

| Fase | Objetivo | Evidencia minima |
| --- | --- | --- |
| F0 - Fechamento | Confirmar decisao, escopo e limites | Ata de fechamento, proposta, faturamento |
| F1 - Preparacao | Validar dados, responsaveis e ambiente | Diagnostico, handoff, kick-off, cronograma |
| F2 - Deploy | Subir ambiente real e proteger segredos | Pre-deploy, deploy, auditoria de segredos |
| F3 - Dados | Conferir carga inicial e LGPD | Verificacao de carga, responsavel LGPD |
| F4 - Operacao assistida | Rodar fluxos reais com suporte proximo | Diario do piloto, incidentes, suporte |
| F5 - Go/No-Go | Decidir continuar, pausar ou ampliar | Matriz Go/No-Go e termo de aceite |
| F6 - Saude | Medir valor, risco e satisfacao | Saude do cliente, NPS, pendencias |
| F7 - Liberacao | Decidir se pode escalar comercialmente | Decisao de liberacao comercial |

## Checklist Critico

- [ ] Cliente aprovado em `docs/MATRIZ_SELECAO_CLIENTE_PILOTO_REAL_NEXUS_ONE.md`.
- [ ] Ata de fechamento comercial gerada.
- [ ] Faturamento/contrato registrado quando aplicavel.
- [ ] Diagnostico e escopo aprovados.
- [ ] Handoff comercial/implantacao/suporte concluido.
- [ ] Kick-off do cliente real aprovado antes de publicar D1.
- [ ] Cronograma de implantacao enviado.
- [ ] Ambiente real ou producao controlada definido.
- [ ] Banco real provisionado.
- [ ] Segredos auditados e protegidos.
- [ ] Backup agendado e restauracao testada.
- [ ] Monitoramento externo testado.
- [ ] Smoke test operacional aprovado.
- [ ] Integracoes reais classificadas como homologadas, sandbox ou fora do escopo.
- [ ] Usuarios-chave treinados.
- [ ] Diario de piloto/operacao assistida preenchido.
- [ ] Incidentes e pendencias classificados.
- [ ] Go/No-Go sem pendencia bloqueante.
- [ ] Termo de aceite assinado.
- [ ] Saude do cliente classificada como Verde antes de liberar escala ampla.

## Bloqueios

Nao avancar para comercializacao ampla se houver:

- Pendencia bloqueante aberta.
- Backup sem restauracao testada.
- Monitoramento externo sem alerta validado.
- Fiscal, pagamento ou notificacao real prometidos sem homologacao.
- Cliente sem responsavel operacional.
- Kick-off sem decisor, responsavel operacional, dados minimos, acessos, ambiente ou suporte confirmados.
- Suporte sem canal e SLA comunicados.
- Operacao assistida sem evidencias.
- Cliente Amarelo ou Vermelho na rotina de sucesso.

## Saidas Esperadas

- Pacote de entrega completo.
- Aceite assinado.
- Relatorio de saude Verde ou plano de correcao.
- Lista de pendencias nao bloqueantes.
- Decisao formal de manter producao controlada ou liberar comercializacao ampla.
- Auditoria de evidencias aprovada ou plano de correcao aberto.

## Gerador

```powershell
.\scripts\gerar-selecao-cliente-piloto-real.ps1 -Cliente "Cliente Piloto" -DorClara 15 -Decisor 15 -EscopoSimples 15 -DadosResponsaveis 15 -IntegracoesNaoBloqueantes 15 -AceitaPiloto 10 -BaixaComplexidade 10 -PotencialReferencia 5
.\scripts\gerar-plano-primeiro-cliente-real.ps1 -Cliente "Cliente Piloto" -Ambiente "producao controlada" -Responsavel "Nexus One"
.\scripts\gerar-kickoff-cliente-real.ps1 -Cliente "Cliente Piloto" -Responsavel "Nexus One" -DataD1 "2026-05-20" -DecisorConfirmado -ResponsavelOperacionalConfirmado -DadosMinimosConfirmados -AcessosConfirmados -AmbienteConfirmado -SuporteConfirmado -TreinamentoAgendado
.\scripts\gerar-auditoria-evidencias-cliente-real.ps1 -Cliente "Cliente Piloto" -Responsavel "Nexus One" -SaudeCliente "Verde"
```
