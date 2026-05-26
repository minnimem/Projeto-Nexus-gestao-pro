# Cronograma de Implantacao por Cliente - Nexus One

Data de referencia: 10/05/2026

Este cronograma transforma proposta, diagnostico, handoff, preparacao tecnica, treinamento, piloto assistido e aceite em uma linha de trabalho com marcos, responsaveis e evidencias.

## Identificacao

- Cliente:
- Plano:
- Ambiente: homologacao / piloto assistido / producao controlada / producao
- Responsavel comercial:
- Responsavel implantacao:
- Responsavel suporte:
- Responsavel do cliente:
- Data prevista de inicio:
- Data prevista de Go/No-Go:

## Marcos do Projeto

| Marco | Objetivo | Responsavel | Evidencia | Status |
| --- | --- | --- | --- | --- |
| M0 - Handoff | Passagem comercial para implantacao/suporte | Comercial + Implantacao | Checklist de handoff | Pendente |
| M1 - Diagnostico | Confirmar escopo, dados, modulos e responsaveis | Comercial + Cliente | Ficha de diagnostico | Pendente |
| M1.5 - Kick-off | Confirmar decisor, responsavel operacional, dados, acessos, ambiente, suporte e agenda D1-D10 | Nexus One + Cliente | Relatorio de kick-off | Pendente |
| M2 - Preparacao tecnica | Ambiente, segredos, banco, backup e monitoramento | Implantacao/Tecnico | Pre-deploy, verificacao e logs | Pendente |
| M3 - Carga inicial | Validar cadastros e arquivos de entrada | Implantacao + Cliente | Verificacao de carga | Pendente |
| M4 - Treinamento | Validar usuarios-chave por perfil | Implantacao + Cliente | Evidencia de treinamento | Pendente |
| M5 - Operacao assistida | Acompanhar uso real e registrar pendencias | Implantacao + Suporte | Diario do piloto | Pendente |
| M6 - Go/No-Go | Decidir liberacao ou prorrogacao | Nexus One + Cliente | Matriz Go/No-Go | Pendente |
| M7 - Aceite | Encerrar implantacao ou manter assistida | Nexus One + Cliente | Termo de aceite | Pendente |

## Pre-Requisitos Para Publicar Cronograma

- [ ] Proposta/aceite aprovado ou piloto autorizado.
- [ ] Handoff comercial, implantacao e suporte concluido.
- [ ] Kick-off do cliente real realizado quando houver dados reais, piloto pago ou producao controlada.
- [ ] Responsavel operacional do cliente definido.
- [ ] Modulos, usuarios, filiais, caixas e limites do plano confirmados.
- [ ] Dependencias externas classificadas: fiscal, pagamento, notificacoes e integracoes.
- [ ] Dados para carga inicial recebidos ou prazo formal definido.
- [ ] Ambiente alvo definido: homologacao, piloto assistido ou producao controlada.
- [ ] Canal de suporte e treinamento alinhado com o cliente.

## Cronograma Sugerido

| Dia util | Atividade | Entregavel |
| --- | --- | --- |
| D-5 | Handoff comercial, diagnostico e plano contratado | Handoff + ficha de diagnostico |
| D-4 | Kick-off, conferencia de dados, usuarios, filiais e modulos | Relatorio de kick-off + lista de dados/usuarios |
| D-3 | Preparacao de ambiente, `.env`, segredos e banco | Pre-deploy e verificacao |
| D-2 | Backup, restauracao, monitoramento e smoke test | Evidencias tecnicas |
| D-1 | Carga inicial, treinamento e checklist de entrada | Verificacao de carga + treinamento |
| D1 | Inicio da operacao assistida | Diario D1 |
| D2-D8 | Acompanhamento operacional por modulo | Diarios, incidentes e pendencias |
| D9 | Simulacao de suporte/incidente e consolidacao de riscos | Ficha de incidente + registro de riscos |
| D10 | Go/No-Go, aceite ou prorrogacao | Matriz + termo de aceite |

## Dependencias Por Marco

| Marco | Depende de | Se atrasar |
| --- | --- | --- |
| D-5 | Proposta, handoff e diagnostico | Nao publicar data D1 |
| D-4 | Dados e usuarios do cliente | Reprogramar carga inicial |
| D-3 | Ambiente, segredos e banco | Bloquear producao controlada |
| D-2 | Backup, restauracao, monitoramento e smoke test | Nao iniciar operacao real |
| D-1 | Carga inicial e treinamento | Iniciar apenas homologacao assistida |
| D1 | Go de entrada sem bloqueantes | Prorrogar preparacao |
| D5 | Riscos revisados | Ajustar escopo ou plano de acao |
| D10 | Evidencias e aceite | Prorrogar piloto ou emitir No-Go |

## Regras de Controle

- Nao iniciar D1 sem handoff, diagnostico, escopo do plano, dados minimos e responsaveis definidos.
- Nao publicar D1 sem kick-off aprovado quando o cliente usar dados reais.
- Nao iniciar producao controlada sem backup/restauracao, smoke test e monitoramento.
- Nao encerrar operacao assistida com pendencia bloqueante aberta.
- Pendencia alta precisa de responsavel, prazo e ciencia do cliente.
- Mudanca de escopo deve voltar para proposta/plano comercial.
- Atraso causado por dependencia do cliente deve ser registrado no cronograma e no registro de riscos.
- Operacao assistida pode ser prorrogada quando houver valor demonstrado, mas aceite ainda estiver pendente por evidencia ou treinamento.

## Status Permitidos

- Pendente.
- Em andamento.
- Concluido.
- Atrasado por Nexus One.
- Atrasado por cliente.
- Bloqueado.
- Reprogramado.

## Evidencias Esperadas

- Handoff comercial/implantacao/suporte.
- Ficha de diagnostico/coleta inicial.
- Relatorio de kick-off do cliente real.
- Escopo do plano comercial.
- Registro de riscos/pendencias.
- Pre-deploy e verificacao de producao/homologacao.
- Verificacao de carga inicial.
- Evidencia de treinamento.
- Diario operacional do piloto.
- Ficha de incidente, quando houver.
- Matriz Go/No-Go.
- Termo de aceite.
- Pacote de entrega.

## Gerador

Use:

```powershell
.\scripts\gerar-cronograma-implantacao-cliente.ps1 -Cliente "Cliente" -Plano "Medio" -DataInicio "2026-05-20" -Responsavel "Nexus One"
```

O cronograma gerado deve ser revisado com o cliente antes da primeira operacao assistida.
