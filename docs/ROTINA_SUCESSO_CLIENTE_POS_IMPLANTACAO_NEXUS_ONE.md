# Rotina de Sucesso do Cliente Pos-Implantacao - Nexus One

Data de referencia: 10/05/2026

Use esta rotina apos o aceite ou durante a prorrogacao da operacao assistida. O objetivo e medir adocao, estabilidade, pendencias, suporte e valor percebido antes de liberar comercializacao mais ampla.

## Objetivo

- Confirmar que o cliente esta usando os fluxos contratados.
- Identificar risco de cancelamento ou insatisfacao cedo.
- Separar problema de produto, treinamento, dados, integracao e expectativa comercial.
- Registrar melhorias futuras sem misturar com bloqueios.
- Criar evidencia para ampliar comercializacao com menor risco.
- Preparar renovacao, reajuste, upgrade, downgrade, retencao ou cancelamento conforme `docs/PROCESSO_RENOVACAO_RETENCAO_CLIENTE_NEXUS_ONE.md`.
- Coletar feedback/NPS conforme `docs/PROCESSO_FEEDBACK_NPS_CLIENTE_NEXUS_ONE.md`.

## Frequencia Recomendada

- Primeira revisao: 7 dias apos D1.
- Segunda revisao: 15 dias apos D1.
- Terceira revisao: 30 dias apos D1.
- Depois: mensal nos primeiros 3 meses ou conforme plano/SLA.

## Indicadores de Saude

| Indicador | Saudavel | Atencao | Critico |
| --- | --- | --- | --- |
| Uso dos modulos contratados | Fluxos principais usados | Uso parcial | Cliente nao usa fluxo principal |
| Vendas/caixa | Operacao sem retrabalho critico | Divergencias explicadas | Caixa/venda trava operacao |
| Estoque/financeiro | Dados coerentes | Ajustes pontuais | Dados nao confiaveis |
| Suporte | P2/P3 controlados | P1 recorrente | P0/P1 aberto sem contorno |
| Pendencias | Sem bloqueantes | Altas com prazo | Bloqueante aberta |
| Integracoes | Homologadas ou fora do escopo | Sandbox/pendente comunicado | Promessa sem evidencia |
| Treinamento | Usuario-chave opera sozinho | Duvidas recorrentes | Usuario depende do suporte para rotina |
| Satisfacao | Cliente percebe valor | Valor ainda pouco claro | Cliente questiona continuidade |

## Pontuacao de Saude

Use nota de 0 a 5 para cada area. A pontuacao ajuda, mas nao substitui bloqueios reais.

| Area | Peso | Nota 0-5 | Evidencia |
| --- | ---: | ---: | --- |
| Uso do fluxo principal | 20 |  | Diario, log, relato do usuario-chave |
| Vendas/caixa | 15 |  | Fechamento, comprovantes, conciliacao |
| Estoque/financeiro | 15 |  | Saldos, contas, relatorios |
| Suporte e incidentes | 15 |  | Chamados, P0/P1, SLA |
| Pendencias e riscos | 15 |  | Registro de riscos atualizado |
| Integracoes | 10 |  | Homologadas, sandbox ou fora do escopo |
| Satisfacao/NPS | 10 |  | Feedback ou NPS |

Leitura:

- 85 a 100: Verde, candidato a referencia comercial se houver autorizacao.
- 65 a 84: Amarelo, manter acompanhamento e plano de melhoria.
- 0 a 64: Vermelho, abrir plano de acao e nao usar como evidencia de escala.

Gatilhos automaticos:

- Qualquer pendencia bloqueante aberta impede classificacao Verde.
- P0/P1 sem contorno deixa cliente Vermelho.
- Cliente sem uso do fluxo principal nao pode ser Verde.
- Integracao real prometida sem evidencia impede referencia comercial.

## Checklist de Revisao

- [ ] Cliente operou pelo menos um fluxo principal do escopo.
- [ ] Vendas/pedidos foram registrados sem retrabalho critico.
- [ ] Caixa/recebimentos foram conferidos.
- [ ] Estoque/financeiro refletem a operacao principal.
- [ ] Relatorios/exportacoes foram usados pelo cliente.
- [ ] Suporte nao possui P0/P1 bloqueante aberto.
- [ ] Registro de riscos/pendencias foi revisado.
- [ ] Integracoes reais foram homologadas, adiadas ou marcadas fora do escopo.
- [ ] Cliente confirma que os usuarios-chave conseguem operar.
- [ ] Melhorias futuras foram separadas de pendencias de implantacao.
- [ ] Feedback/NPS coletado quando houver marco D7, D15, D30, release ou incidente relevante.

## Classificacao

- Verde: cliente saudavel, pode seguir sem operacao assistida intensiva.
- Amarelo: cliente em atencao, manter acompanhamento semanal.
- Vermelho: risco alto, abrir plano de acao e envolver responsaveis.

## Impacto Comercial da Saude

| Saude | Pode usar como referencia? | Pode sustentar escala? | Acao comercial |
| --- | --- | --- | --- |
| Verde | Sim, com autorizacao formal | Sim, se auditoria tambem estiver aprovada | Avaliar caso de sucesso, upgrade ou modulo adicional |
| Amarelo | Nao | Nao para escala ampla | Corrigir adocao, treinamento, pendencias ou expectativa |
| Vermelho | Nao | Nao | Plano de acao, retencao e revisao de escopo |

## Acoes Recomendadas

### Verde

- Registrar caso de sucesso interno.
- Avaliar permissao para usar como referencia comercial conforme `docs/AUTORIZACAO_REFERENCIA_COMERCIAL_CLIENTE_NEXUS_ONE.md`.
- Oferecer evolucao de plano ou modulo adicional quando fizer sentido.
- Gerar registro de renovacao/expansao com `scripts/gerar-renovacao-retencao-cliente.ps1` quando houver decisao comercial.

### Amarelo

- Agendar revisao com usuario-chave.
- Reforcar treinamento no modulo com maior dificuldade.
- Atualizar registro de riscos/pendencias.
- Definir prazo para nova revisao.
- Abrir plano de retencao quando houver risco de continuidade.

### Vermelho

- Abrir incidente ou plano de acao.
- Reavaliar escopo prometido, dados e integracoes.
- Manter operacao assistida.
- Nao usar como referencia comercial ate estabilizar.
- Registrar risco de cancelamento e plano de retencao/cancelamento formal.

## Plano de Saude

| Problema | Causa provavel | Acao | Responsavel | Prazo | Evidencia de melhora |
| --- | --- | --- | --- | --- | --- |
| Baixo uso | Treinamento / fit / dados |  |  |  |  |
| Pendencia alta | Produto / integracao / cliente |  |  |  |  |
| Valor pouco claro | Expectativa / relatorio / processo |  |  |  |  |

## Gerador

Use:

```powershell
.\scripts\gerar-saude-cliente-pos-implantacao.ps1 -Cliente "Cliente" -DiasDesdeInicio 15 -Responsavel "Nexus One"
```

Arquive o relatorio junto ao pacote do cliente e ao registro de riscos/pendencias.

Para renovacao, reajuste, upgrade, downgrade, retencao ou cancelamento:

```powershell
.\scripts\gerar-renovacao-retencao-cliente.ps1 -Cliente "Cliente" -Decisao "Renovar" -PlanoAtual "Medio" -NovoPlano "Medio"
```

Para feedback/NPS:

```powershell
.\scripts\gerar-feedback-nps-cliente.ps1 -Cliente "Cliente" -NotaNps 9 -Momento "D30 piloto"
```
