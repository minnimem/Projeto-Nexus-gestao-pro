# Ficha de ROI e Valor Percebido - Nexus One

Data de referencia: 10/05/2026

Esta ficha ajuda a estimar, de forma conservadora, o valor comercial do Nexus One para o cliente. O objetivo e traduzir dores como retrabalho, divergencia de caixa, perda de estoque, inadimplencia e falta de relatorio em uma conversa objetiva de ganho potencial, sem prometer resultado financeiro garantido.

## Quando Usar

- Durante diagnostico comercial.
- Apos demonstracao com dor clara.
- Antes de proposta para cliente que compara preco.
- Quando o decisor pergunta sobre retorno do investimento.
- Quando houver disputa com sistema mais barato.
- Em renovacao ou upgrade, para mostrar valor percebido.

## Principios

- Usar numeros informados ou validados pelo cliente.
- Trabalhar com estimativas conservadoras.
- Separar ganho potencial de promessa garantida.
- Nao usar ROI como substituto de homologacao, aceite ou contrato.
- Registrar premissas antes de apresentar o resultado.

## Fontes de Ganho

| Fonte | Exemplo |
| --- | --- |
| Reducao de retrabalho | Menos horas corrigindo venda, estoque, caixa ou financeiro |
| Reducao de divergencia de caixa | Menos perdas, ajustes manuais e tempo de conferencia |
| Melhor controle de estoque | Menos ruptura, compra emergencial e produto parado |
| Inadimplencia mais acompanhada | Cobranca mais rapida e menos esquecimento |
| Relatorios mais claros | Decisao mais rapida por dono/gerente |
| Padrao operacional | Menos dependencia de uma pessoa especifica |

## Perguntas Para Coleta

Use perguntas simples e aceite respostas aproximadas quando o cliente nao tiver numero exato.

| Tema | Pergunta |
| --- | --- |
| Retrabalho | Quantas horas por semana sua equipe perde conferindo venda, caixa, estoque ou financeiro? |
| Caixa | Com que frequencia aparecem divergencias ou recebimentos sem conferencia clara? |
| Estoque | Hoje falta produto vendido, sobra produto parado ou compra e feita sem previsao? |
| Inadimplencia | Existe valor esquecido, atrasado ou cobrado tarde por falta de controle? |
| Relatorios | Quanto tempo o dono/gerente leva para saber faturamento, margem, caixa e contas? |
| Dependencia operacional | Existe uma pessoa que concentra informacao e trava a rotina quando falta? |

## Faixas Conservadoras

Quando o cliente nao souber informar perdas, usar faixas pequenas para nao inflar promessa.

| Situacao | Premissa conservadora sugerida |
| --- | --- |
| Loja pequena com pouca medicao | 4 a 8 horas economizadas por mes |
| Operacao com caixa e estoque ativos | 8 a 16 horas economizadas por mes |
| Operacao com financeiro manual | 12 a 24 horas economizadas por mes |
| Divergencia de caixa sem medicao | Usar valor simbolico ou nao incluir no calculo |
| Perda de estoque sem medicao | Usar somente exemplos qualitativos |
| Inadimplencia sem historico | Usar recuperacao zero ate existir evidencia |

## Formula Simples

Estimativa mensal:

```text
ganho_mensal_estimado =
  horas_economizadas_mes * custo_hora_operacional
+ reducao_divergencia_caixa
+ reducao_perda_estoque
+ recuperacao_recebimentos
```

Payback aproximado:

```text
payback_meses = implantacao / max(ganho_mensal_estimado - mensalidade, 1)
```

## Leitura Comercial do Resultado

| Resultado | Como interpretar | Como vender |
| --- | --- | --- |
| Payback ate 3 meses | Forte indicativo financeiro | Defender rapidez de retorno, mantendo premissas conservadoras |
| Payback entre 3 e 6 meses | Bom para piloto/producao controlada | Defender controle, suporte e reducao de risco |
| Payback acima de 6 meses | Retorno mais longo | Defender valor operacional, padronizacao e gestao |
| Ganho nao supera mensalidade | ROI financeiro nao comprovado | Nao forcar economia; vender por controle, organizacao, suporte e governanca |

## Ganhos Qualitativos Para Defender Valor

Use quando o cliente compara apenas mensalidade:

- Menos dependencia de planilhas ou controles paralelos.
- Caixa, estoque e financeiro mais auditaveis.
- Menos risco de vender sem estoque ou comprar sem previsao.
- Melhor acompanhamento de inadimplencia e recebimentos.
- Processo de implantacao, treinamento, suporte, backup, LGPD e aceite documentado.
- Evolucao segura por piloto assistido, Go/No-Go e producao controlada.

## Cuidados

- Se o ganho estimado for muito alto, revisar premissas.
- Se o cliente nao souber informar perdas, usar faixa conservadora ou nao calcular.
- Se o payback ficar ruim, vender por controle, risco e suporte, nao apenas economia.
- Nao comparar com concorrente apenas por mensalidade; comparar escopo, implantacao, suporte, backup, LGPD e aceite.
- Nunca apresentar o calculo como garantia de economia.
- Registrar quem forneceu os numeros e quando foram validados.

## Evidencias a Arquivar

- Ficha de diagnostico/coleta.
- Posicionamento competitivo, quando houver comparacao.
- Proposta e escopo do plano.
- Relatorio de ROI/valor percebido gerado por `scripts/gerar-roi-valor-percebido.ps1`.
- Feedback/NPS apos uso real para comparar expectativa e valor percebido.

## Gerador

```powershell
.\scripts\gerar-roi-valor-percebido.ps1 -Cliente "Cliente Piloto" -Mensalidade 349 -Implantacao 1200 -HorasEconomizadasMes 12 -CustoHora 35
```

Arquive em `reports\comercial` junto da proposta e qualificacao.
