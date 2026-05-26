# Processo de Renovacao, Retencao e Mudanca de Plano - Nexus One

Data de referencia: 10/05/2026

Este processo organiza renovacao, reajuste, upgrade, downgrade, pausa e cancelamento de clientes. Ele evita perda de receita por falta de acompanhamento, desconto sem controle, mudanca de plano sem aceite ou cancelamento sem registro de causa.

## Quando Usar

- 30 dias antes de vencer contrato, piloto pago, condicao promocional ou desconto.
- Quando o cliente pedir upgrade, downgrade, pausa ou cancelamento.
- Quando houver mudanca de quantidade de usuarios, filiais, caixas, modulos ou integracoes.
- Quando a rotina de sucesso indicar risco amarelo ou vermelho.
- Quando houver inadimplencia recorrente ou baixa adocao.

## Indicadores de Retencao

| Indicador | Saudavel | Atencao | Risco |
| --- | --- | --- | --- |
| Uso do sistema | Fluxos principais em uso | Uso parcial | Cliente quase nao usa |
| Valor percebido | Cliente reconhece ganho | Valor pouco claro | Cliente questiona preco |
| Suporte | P2/P3 controlados | P1 recorrente | P0/P1 aberto ou sem contorno |
| Financeiro | Pagamentos em dia | Atrasos pontuais | Inadimplencia recorrente |
| Escopo | Plano coerente | Precisa ajuste | Produto nao atende promessa |
| Integracoes | Homologadas ou fora do escopo | Pendentes comunicadas | Promessa sem evidencia |

## Tipos de Decisao

| Decisao | Quando aplicar |
| --- | --- |
| Renovar | Cliente usa, paga e percebe valor |
| Reajustar | Contrato permite e valor entregue esta claro |
| Upgrade | Cliente precisa de mais usuarios, filiais, caixas, modulos, suporte ou integracoes |
| Downgrade | Cliente tem uso menor, mas ainda possui fit e quer reduzir custo |
| Pausar | Operacao do cliente parou temporariamente e contrato permite pausa |
| Plano de retencao | Cliente em risco, mas ainda recuperavel |
| Cancelar | Cliente sem fit, inadimplente sem acordo ou sem valor percebido recuperavel |

## Matriz de Decisao Comercial

| Saude | Financeiro | Uso | Decisao sugerida |
| --- | --- | --- | --- |
| Verde | Em dia | Uso alto | Renovar, avaliar upgrade ou referencia |
| Verde | Atraso pontual | Uso alto | Regularizar financeiro e renovar |
| Amarelo | Em dia | Uso parcial | Retencao leve, treinamento ou ajuste de escopo |
| Amarelo | Atrasos | Uso parcial | Plano de retencao com revisao financeira |
| Vermelho | Em dia | Baixo uso | Plano de acao antes de renovar/reajustar |
| Vermelho | Inadimplente | Baixo uso | Retencao critica ou cancelamento/offboarding |

## Risco de Receita

Classificar antes da decisao:

- Baixo: cliente saudavel, em dia e usando o fluxo principal.
- Medio: valor percebido parcial, atraso pontual, uso parcial ou pendencia alta com prazo.
- Alto: cliente vermelho, inadimplencia recorrente, baixo uso, P0/P1 aberto ou promessa nao cumprida.

## Checklist Antes da Decisao

- [ ] Saude do cliente revisada em `docs/ROTINA_SUCESSO_CLIENTE_POS_IMPLANTACAO_NEXUS_ONE.md`.
- [ ] Faturamento, vencimento e status financeiro revisados.
- [ ] Uso real dos modulos contratados conferido.
- [ ] Pendencias e incidentes abertos revisados.
- [ ] Promessas comerciais e integracoes comparadas com o escopo.
- [ ] Plano atual comparado com necessidade real do cliente.
- [ ] Decisor do cliente envolvido na conversa.
- [ ] Nova proposta, termo ou registro de decisao preparado quando houver mudanca.

## Regras de Venda Segura

- Upgrade precisa deixar claros novos limites, valores, adicionais e data de vigencia.
- Downgrade nao deve manter recursos do plano superior sem cobranca ou justificativa.
- Reajuste deve ser comunicado antes da cobranca reajustada.
- Desconto de retencao deve ter prazo, motivo e responsavel.
- Pausa precisa ter data de retorno ou revisao.
- Cancelamento deve registrar motivo, pendencias, exportacao de dados quando aplicavel e encerramento de acessos.
- Cancelamento deve seguir `docs/PROCESSO_OFFBOARDING_ENCERRAMENTO_CLIENTE_NEXUS_ONE.md` e gerar relatorio com `scripts/gerar-offboarding-cliente.ps1`.
- Cliente com risco vermelho nao deve ser usado como referencia comercial.
- Mudanca de plano deve atualizar faturamento, limites, permissao de modulos e aceite do decisor.
- Pausa deve definir se dados, acesso, suporte e cobranca ficam ativos, suspensos ou limitados.
- Retencao com desconto deve ter prazo final, criterio de retorno ao valor normal e responsavel.

## Plano de Retencao

Quando houver risco, registrar:

- Causa principal: preco, suporte, bug, baixa adocao, falta de treinamento, dados, integracao, expectativa ou financeiro.
- Acao proposta: treinamento, ajuste de escopo, renegociacao, prazo extra, plano inferior, suporte intensivo ou encerramento.
- Responsavel Nexus One.
- Responsavel do cliente.
- Prazo de revisao.
- Criterio de sucesso.

## Evidencia de Aceite da Decisao

| Decisao | Evidencia minima |
| --- | --- |
| Renovar | Aceite de continuidade ou contrato vigente |
| Reajustar | Comunicacao previa, regra contratual e aceite/registro |
| Upgrade | Nova proposta/escopo, novo faturamento e aceite |
| Downgrade | Novo escopo, recursos removidos e aceite |
| Pausar | Termo/comunicacao de pausa, data de revisao e regra de acesso |
| Retencao | Plano de acao, responsaveis, prazo e criterio de sucesso |
| Cancelar | Offboarding, exportacao/retencao de dados e encerramento de acessos |

## Evidencias a Arquivar

- Relatorio de saude do cliente.
- Relatorio de faturamento do cliente.
- Registro de renovacao/retencao gerado por `scripts/gerar-renovacao-retencao-cliente.ps1`.
- Nova proposta ou escopo do plano quando houver mudanca.
- Comunicacao enviada ao cliente.
- Aceite do decisor quando houver reajuste, upgrade, downgrade, pausa ou cancelamento.
- Relatorio de offboarding quando a decisao for cancelamento ou encerramento operacional.

## Gerador

```powershell
.\scripts\gerar-renovacao-retencao-cliente.ps1 -Cliente "Cliente Piloto" -Decisao "Renovar" -PlanoAtual "Medio" -NovoPlano "Medio"
```

Arquive o relatorio em `reports\sucesso-cliente` junto da saude do cliente e do faturamento.
