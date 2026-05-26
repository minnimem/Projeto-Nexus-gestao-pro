# Politica de SLA e Suporte - Nexus One

Esta politica define prioridade, prazo de resposta e escalonamento para operacao comercial do Nexus One.

## Prioridades

| Prioridade | Definicao | Resposta | Atualizacao | Exemplos |
| --- | --- | --- | --- | --- |
| P0 | Sistema indisponivel ou risco grave | ate 30 min | a cada 30 min | API fora, banco indisponivel, caixa travado em producao, perda de dados |
| P1 | Operacao do dia impedida | ate 2 h uteis | a cada 4 h uteis | venda nao conclui, recebimento falha, fiscal real bloqueado, pagamento real sem retorno |
| P2 | Funcao importante com alternativa | ate 1 dia util | conforme evolucao | relatorio incorreto, permissao errada, conciliacao com divergencia explicavel |
| P3 | Duvida, ajuste ou melhoria | ate 3 dias uteis | conforme planejamento | treinamento, texto, layout, melhoria desejada |

## Coleta Obrigatoria

- Cliente, empresa e filial.
- Usuario afetado.
- Modulo e tela.
- Data/hora do erro.
- Passo a passo.
- Mensagem de erro.
- Print ou evidencia.
- Pedido, caixa, lancamento, produto ou documento envolvido.
- Impacto financeiro/fiscal, quando houver.

## Escalonamento

- P0: suporte aciona tecnico responsavel imediatamente e acompanha ate normalizar.
- P1: suporte valida contorno operacional e aciona desenvolvimento/provedor quando necessario.
- P2: suporte registra causa, prazo e versao prevista quando virar correcao.
- P3: suporte registra backlog ou orienta treinamento.

## Incidente

Gerar ficha:

```powershell
.\scripts\gerar-incidente-suporte.ps1 -Cliente "Cliente" -Modulo "Caixa" -Prioridade P1 -Resumo "Erro ao fechar caixa" -Responsavel "Suporte"
```

Gerar comunicado ao cliente quando houver impacto externo:

```powershell
.\scripts\gerar-comunicado-incidente-status.ps1 -Cliente "Cliente" -Tipo "Abertura" -Prioridade P1 -Modulo "Caixa" -Impacto "Erro ao fechar caixa"
```

Seguir `docs/PLAYBOOK_COMUNICACAO_INCIDENTE_STATUS_NEXUS_ONE.md` para abertura, atualizacao, contorno, manutencao, encerramento e pos-incidente.

## Encerramento

Todo incidente deve registrar:

- Causa raiz.
- Acao aplicada.
- Se houve contorno temporario.
- Se houve impacto financeiro/fiscal.
- Orientacao dada ao cliente.
- Se virou melhoria, bug ou tarefa operacional.
- Comunicacao enviada ao cliente, quando o impacto for externo.

## Go/No-Go

Para producao controlada ou ampla:

- Deve existir responsavel de suporte.
- P0/P1 devem ter canal de acionamento definido.
- Monitoramento deve ter responsavel.
- Cliente deve conhecer como abrir chamado e quais dados enviar.
