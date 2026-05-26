# Matriz de Viabilidade Financeira Para Escala - Nexus One

Use esta matriz antes de abrir novo lote comercial, conceder desconto relevante ou aumentar implantacoes simultaneas. Ela verifica se o lote gera margem suficiente para cobrir suporte, implantacao, infraestrutura, ferramentas e risco operacional.

## Objetivo

- Evitar crescimento com prejuizo operacional.
- Confirmar se mensalidade, implantacao e adicionais cobrem custos.
- Controlar descontos, cortesias e promessas de suporte.
- Definir se o lote pode aumentar escala, manter, ajustar preco ou pausar.

## Entradas Minimas

- Receita mensal prevista.
- Receita de implantacao prevista.
- Custo mensal de infraestrutura.
- Custo mensal de suporte.
- Custo de implantacao.
- Custo comercial.
- Descontos e cortesias.
- Margem minima desejada.

## Leitura Recomendada

| Resultado | Acao |
| --- | --- |
| Margem >= 55% | Pode escalar com controle |
| Margem entre 35% e 54% | Manter escala e revisar preco/custo |
| Margem entre 15% e 34% | Corrigir preco, escopo ou capacidade antes de novo lote |
| Margem < 15% | No-go financeiro para escala |

## Riscos Financeiros

- Implantacao subprecificada.
- Desconto recorrente sem prazo.
- Cliente exige suporte acima do plano.
- Integracao real vendida sem adicional.
- Customizacao vendida como inclusa.
- Infraestrutura dedicada sem repasse.
- Lote aumenta suporte sem aumentar receita.

## Regras

- Desconto recorrente precisa de prazo e motivo.
- Implantacao deve cobrir configuracao, treinamento, carga inicial e acompanhamento.
- Integrações reais devem ser cobradas ou formalmente fora do escopo.
- Cliente com alta complexidade deve ir para plano maior ou proposta personalizada.
- Margem baixa nao deve ser compensada com promessa de escala futura.

## Gerador

```powershell
.\scripts\gerar-viabilidade-financeira-escala.ps1 -Lote "Lote 2" -ReceitaMensal 2792 -ReceitaImplantacao 6400 -CustoInfraMensal 400 -CustoSuporteMensal 900 -CustoImplantacao 3200 -CustoComercial 800 -Descontos 300
```

