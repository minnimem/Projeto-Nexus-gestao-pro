# Auditoria de Evidencias do Cliente Real - Nexus One

Use esta auditoria depois do pacote de entrega e antes de usar um cliente real como base para producao ampla. Ela nao substitui os documentos originais; ela confere se as evidencias criticas existem e se a decisao comercial pode avancar.

## Objetivo

- Separar artefato criado de evidencia executada.
- Medir se o primeiro cliente real tem base suficiente para liberar escala.
- Encontrar bloqueios antes de prometer producao ampla.
- Registrar uma decisao objetiva: liberar, liberar com restricoes, manter controlado ou bloquear.

## Evidencias Criticas

| Grupo | Evidencia esperada | Bloqueia escala ampla? |
| --- | --- | --- |
| Comercial | Proposta, ata de fechamento, faturamento e contrato/aceite | Sim |
| Primeiro cliente | Plano do primeiro cliente real executado | Sim |
| Tecnico | Deploy, banco real, pre-deploy, smoke e release | Sim |
| Backup | Backup agendado e restauracao testada | Sim |
| Monitoramento | Alerta externo testado | Sim |
| Seguranca | Segredos auditados e rotacao inicial registrada | Sim |
| Dados/LGPD | Carga validada e responsavel por dados definido | Sim |
| Operacao | Diario do piloto, treinamento e suporte | Sim |
| Integracoes | Fiscal, pagamento e notificacoes homologados, sandbox ou fora do escopo | Sim |
| Aceite | Go/No-Go sem bloqueante e termo assinado | Sim |
| Sucesso | Saude do cliente Verde ou plano de correcao formal | Sim |

## Niveis de Evidencia Auditada

| Nivel | Descricao | Aceita para escala? |
| --- | --- | --- |
| Ausente | Nao ha arquivo, registro, assinatura, log ou relatorio | Nao |
| Artefato criado | Documento existe, mas ainda nao prova execucao real | Nao para escala ampla |
| Executada | Procedimento foi realizado e tem registro verificavel | Sim, se sem bloqueio |
| Aceita | Cliente/responsavel confirmou validacao formal | Sim |
| Recorrente | Evidencia repetida em rotina, release ou ciclo mensal | Sim, fortalece escala |

## Decisao Recomendada

| Resultado | Acao |
| --- | --- |
| 90% a 100% sem bloqueio | Pode avaliar comercializacao ampla |
| 75% a 89% sem bloqueio | Manter producao controlada com restricoes |
| Abaixo de 75% | Nao usar como evidencia de escala |
| Qualquer bloqueio critico | No-go para producao ampla |

## Plano de Correcao

Quando a auditoria nao liberar escala, registrar:

| Bloqueio | Acao corretiva | Responsavel | Prazo | Evidencia esperada |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

## Requisitos Para Usar Como Referencia Comercial

- [ ] Termo de aceite assinado.
- [ ] Saude do cliente Verde.
- [ ] Pendencias bloqueantes zeradas.
- [ ] Pendencias altas com prazo e ciencia do cliente.
- [ ] Integracoes reais prometidas homologadas ou formalmente fora do escopo.
- [ ] Autorizacao de referencia comercial assinada quando usar nome, logo, depoimento ou resultado.

## Cuidados

- Nao marcar item como concluido sem arquivo, registro, assinatura, log, relatorio ou comprovacao equivalente.
- Evidencia opcional nao libera promessa comercial.
- Integracao fora do escopo precisa estar escrita na proposta/ata/aceite.
- Cliente com saude Amarela ou Vermelha nao deve ser usado para liberar escala ampla.

## Gerador

```powershell
.\scripts\gerar-auditoria-evidencias-cliente-real.ps1 -Cliente "Cliente Piloto" -Responsavel "Nexus One" -PropostaOk -DeployOk -BackupOk -MonitoramentoOk -GoNoGoOk -AceiteOk -SaudeCliente "Verde"
```
