# Roteiro de Kick-off do Cliente Real - Nexus One

Data de referencia: 11/05/2026

Use este roteiro para conduzir a reuniao inicial do cliente real antes de publicar D1, iniciar operacao assistida ou liberar producao controlada com dados reais.

## Objetivo

- Confirmar que a venda, o escopo e a implantacao estao alinhados.
- Evitar iniciar D1 sem decisor, responsavel operacional, dados, acessos, ambiente, suporte e agenda.
- Registrar bloqueios antes de consumir tempo tecnico ou expor dados reais.
- Transformar a reuniao inicial em uma decisao objetiva: apto, preparar ou bloquear D1.

## Quando Usar

- Primeiro cliente real.
- Piloto pago.
- Producao controlada inicial.
- Cliente com dados reais, mesmo quando o escopo for simples.
- Cliente escolhido para gerar evidencia antes de ampliar comercializacao.

## Participantes Minimos

| Participante | Papel |
| --- | --- |
| Decisor do cliente | Confirma valor, prazo, escopo e aceite |
| Responsavel operacional do cliente | Valida rotina, usuarios, dados e treinamento |
| Responsavel Nexus One | Conduz implantacao e registra decisoes |
| Suporte Nexus One | Confirma canal, SLA e fluxo de incidente |
| Tecnico/infra, quando aplicavel | Confirma ambiente, dominio, banco, backup e integracoes |

## Agenda Recomendada

| Bloco | Tempo | Saida esperada |
| --- | --- | --- |
| Contexto e objetivo | 5 min | Confirmar motivo da implantacao e resultado esperado |
| Escopo contratado | 10 min | Modulos, usuarios, filiais, limites e exclusoes confirmados |
| Dados e acessos | 10 min | Responsavel, prazo e formato dos dados definidos |
| Ambiente e integracoes | 10 min | Homologacao/producao controlada, backup, monitoramento e integracoes classificados |
| Operacao D1-D10 | 10 min | Agenda, horarios, treinamento e suporte alinhados |
| Riscos e bloqueios | 10 min | Pendencias, responsaveis e decisao de entrada registrados |
| Proximos passos | 5 min | Lista de acoes antes do D1 |

## Checklist de Entrada para D1

- [ ] Decisor confirmado.
- [ ] Responsavel operacional do cliente confirmado.
- [ ] Escopo, plano, limites e exclusoes confirmados.
- [ ] Dados minimos confirmados ou prazo formal aceito.
- [ ] Acessos necessarios definidos sem compartilhar segredo por mensagem aberta.
- [ ] Ambiente alvo confirmado: homologacao, piloto assistido ou producao controlada.
- [ ] Backup, restauracao, monitoramento e smoke test planejados quando houver dados reais.
- [ ] Integracoes externas classificadas: homologada, sandbox, fora do escopo ou bloqueante.
- [ ] Canal de suporte, SLA e responsavel comunicados.
- [ ] Treinamento dos usuarios-chave agendado.
- [ ] Agenda D1-D10 revisada com cliente.
- [ ] Riscos e pendencias registrados.

## Perguntas de Controle

- Qual problema o cliente espera resolver primeiro?
- Qual fluxo precisa funcionar no D1 para o cliente considerar a implantacao bem-sucedida?
- Quem pode decidir se uma pendencia bloqueia ou nao bloqueia o D1?
- Quais dados sao indispensaveis para iniciar?
- Quais integracoes foram prometidas comercialmente?
- O cliente aceita iniciar em homologacao assistida se alguma dependencia externa atrasar?
- Qual janela de suporte sera usada nos primeiros dias?
- Qual evidencia sera aceita no Go/No-Go?

## Regras de Decisao

| Situacao | Decisao |
| --- | --- |
| Todos os itens criticos confirmados | Apto para publicar D1 |
| Treinamento pendente, mas responsaveis/dados/acessos/ambiente/suporte confirmados | Preparar antes do D1 |
| Falta decisor, responsavel operacional, dados minimos, acessos, ambiente ou suporte | Nao publicar D1 |
| Integracao prometida como obrigatoria sem homologacao ou restricao formal | Nao publicar D1 em producao controlada |
| Backup/restauracao/monitoramento ausentes com dados reais | Nao iniciar producao controlada |

## Evidencias a Arquivar

- Relatorio de kick-off gerado.
- Ata de fechamento comercial.
- Ficha de diagnostico/coleta.
- Handoff comercial/implantacao/suporte.
- Cronograma de implantacao.
- Registro de riscos e pendencias.
- Comunicacao de inicio ou cronograma enviada ao cliente.

## Gerador

Use:

```powershell
.\scripts\gerar-kickoff-cliente-real.ps1 -Cliente "Cliente Piloto" -Responsavel "Nexus One" -DataD1 "2026-05-20" -DecisorConfirmado -ResponsavelOperacionalConfirmado -DadosMinimosConfirmados -AcessosConfirmados -AmbienteConfirmado -SuporteConfirmado -TreinamentoAgendado
```

O relatorio gerado deve ser anexado ao pacote de entrega antes de iniciar o D1.
