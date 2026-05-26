# Plano de Piloto Assistido - Nexus One

Este plano organiza os primeiros 10 dias uteis de uso assistido com cliente real.

Para organizar atividades antes do D1, use tambem `docs/CRONOGRAMA_IMPLANTACAO_CLIENTE_NEXUS_ONE.md`.

## Entrada

- Proposta/aceite comercial registrado.
- Ambiente de homologacao ou producao controlada validado.
- Carga inicial conferida.
- Usuarios e perfis criados.
- Treinamento por perfil concluido.
- Backup e monitoramento configurados.
- Matriz Go/No-Go sem pendencia bloqueante para o escopo contratado.

## Go de Entrada

Antes do D1, confirmar:

- [ ] Handoff comercial, implantacao e suporte concluido.
- [ ] Cronograma revisado com o cliente.
- [ ] Registro de riscos/pendencias aberto.
- [ ] Responsavel operacional do cliente presente.
- [ ] Usuario-chave treinado no fluxo principal.
- [ ] Dados minimos conferidos pelo cliente.
- [ ] Fiscal, pagamento e notificacoes classificados como homologados, sandbox ou fora do escopo.
- [ ] Canal de suporte ativo para incidentes do piloto.

## Calendario Sugerido

| Dia | Objetivo | Evidencia |
| --- | --- | --- |
| D1 | Login, usuarios, empresa/filial e cadastros base | Smoke test, prints/exportacao de cadastros |
| D2 | Vendas, orcamentos, pedidos e propostas | Pedido de teste, proposta e follow-up |
| D3 | Caixa e recebimentos | Abertura, recebimento, comprovante e fechamento |
| D4 | Estoque, entradas, baixas e alertas | Movimento de estoque e inventario amostral |
| D5 | Financeiro, contas, cobrancas e conciliacao | DRE/fluxo exportado e conferencia caixa/venda |
| D6 | Fiscal conforme escopo | Espelho, homologacao ou evidencia fiscal |
| D7 | Logistica/servicos quando contratados | Romaneio, comprovante ou OS |
| D8 | Relatorios, BI, exportacoes e auditoria | CSV/PDF e auditoria sensivel |
| D9 | Simulacao de incidente e suporte | Ficha de incidente ou chamado teste |
| D10 | Go/No-Go, aceite e plano de pendencias | Matriz preenchida e termo de aceite |

## Rotina Diaria

- Registrar vendas/pedidos do dia.
- Conferir caixa/financeiro.
- Conferir estoque impactado.
- Conferir erro fiscal, pagamento, notificacao ou monitoramento.
- Gerar backup ou confirmar backup automatico.
- Registrar pendencias bloqueantes e nao bloqueantes.

## Indicadores Diarios Minimos

- Vendas/pedidos executados:
- Caixa fechado sem divergencia: sim / nao / nao se aplica
- Estoque refletiu movimentacoes: sim / nao / nao se aplica
- Financeiro conciliou com caixa/venda: sim / nao / nao se aplica
- Incidentes P0/P1:
- Pendencias bloqueantes abertas:
- Pendencias altas abertas:
- Usuario-chave operou sem suporte direto: sim / nao

## Revisao Intermediaria - D5

No D5, decidir se o piloto continua no plano original, precisa de ajuste ou deve pausar.

- [ ] Fluxo principal ja foi usado com sucesso.
- [ ] Caixa/estoque/financeiro sem divergencia bloqueante.
- [ ] Cliente entende pendencias e proximos passos.
- [ ] Riscos altos possuem responsavel e prazo.
- [ ] Escopo continua igual.
- [ ] Treinamento adicional necessario foi agendado.

Decisao D5:

- [ ] Continuar ate D10.
- [ ] Continuar com ajuste de escopo.
- [ ] Prorrogar piloto.
- [ ] Pausar por pendencia bloqueante.

## Criterios de Saida

- Usuario-chave opera fluxo principal sem suporte direto.
- Caixa fecha sem divergencia nao explicada.
- Estoque e financeiro refletem operacao principal.
- Backup localizado e restauracao testada conforme escopo.
- Monitoramento e suporte definidos.
- Integracoes externas classificadas como homologadas, sandbox ou pendentes.
- Termo de aceite assinado ou operacao assistida prorrogada com justificativa.
- Rotina de sucesso do cliente agendada conforme `docs/ROTINA_SUCESSO_CLIENTE_POS_IMPLANTACAO_NEXUS_ONE.md`.

## Decisao de Saida - D10

- [ ] Go producao controlada.
- [ ] Go producao controlada com pendencias nao bloqueantes.
- [ ] Prorrogar piloto assistido.
- [ ] Voltar para homologacao.
- [ ] No-go ate corrigir pendencias bloqueantes.

Motivo:

-

Proxima acao:

-

## Bloqueios Durante o Piloto

Pausar ou reclassificar o piloto se ocorrer:

- Falha recorrente no fluxo principal contratado.
- Caixa com divergencia sem explicacao operacional.
- Estoque ou financeiro sem reflexo minimo da operacao real.
- Incidente P0/P1 sem responsavel ou contorno.
- Fiscal/pagamento real usado sem homologacao quando estiver no escopo.
- Cliente sem usuario-chave disponivel para operar e validar.
- Dados reais usados sem responsavel LGPD ou autorizacao.

## Diario Operacional

Gerar registro diario:

```powershell
.\scripts\gerar-diario-piloto.ps1 -Cliente "Cliente" -Dia "D1" -Responsavel "Responsavel"
```
