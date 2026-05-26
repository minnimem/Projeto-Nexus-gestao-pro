# Decisao de Expansao Comercial Pos-Lote - Nexus One

Use esta decisao depois do `RELATORIO_RESULTADO_LOTE_COMERCIAL_NEXUS_ONE.md`. Ela transforma indicadores do lote em uma aprovacao executiva com limites, responsaveis e prazo de revisao.

## Objetivo

- Evitar abrir novo lote sem decisao formal.
- Registrar se a operacao suporta mais vendas.
- Definir limite de oportunidades e implantacoes simultaneas para o proximo ciclo.
- Separar crescimento saudavel de pressao comercial sem suporte.

## Decisoes Permitidas

| Decisao | Quando usar |
| --- | --- |
| Aumentar escala | Lote saudavel, clientes Verde, sem incidentes criticos |
| Manter escala | Resultado positivo, mas sem folga operacional |
| Pausar vendas | Cliente Vermelho, P0/P1 recorrente ou suporte pressionado |
| Corrigir processo | Gargalo de implantacao, pacote incompleto ou pendencia repetida |
| Reposicionar oferta | Baixa conversao ou perfil errado |

## Entrada Minima Para Decidir

Antes de registrar a decisao, confirme:

- Relatorio de resultado do lote gerado.
- Pontuacao do lote conhecida.
- Matriz de capacidade operacional revisada.
- Viabilidade financeira para escala revisada.
- Pacote de entrega completo dos clientes fechados.
- Aceites registrados ou pendencias aceitas formalmente.
- Saude dos clientes ativos atualizada.
- Lista de promessas comerciais revisada.
- Responsavel executivo definido.

## Matriz de Decisao

| Condicao | Decisao recomendada |
| --- | --- |
| Pontuacao >= 85, clientes Verde, sem P0/P1, capacidade confirmada e margem viavel | Aumentar escala |
| Pontuacao 70 a 84, sem bloqueante, mas com pouca folga | Manter escala |
| Pontuacao 50 a 69 ou pacote/aceite incompleto | Corrigir processo |
| Cliente Vermelho, P0/P1 recorrente ou suporte pressionado | Pausar vendas |
| Baixa conversao e objecoes recorrentes de valor/preco/ICP | Reposicionar oferta |

## Limites do Proximo Lote

Use crescimento gradual:

| Resultado do lote | Limite sugerido |
| --- | --- |
| Primeiro lote saudavel | Aumentar ate 50% do volume anterior |
| Dois lotes saudaveis seguidos | Aumentar ate 100% do volume anterior |
| Lote com alerta leve | Manter o mesmo volume |
| Lote com alerta critico | Reduzir volume ou pausar |

O limite de implantacoes simultaneas deve prevalecer sobre o desejo comercial. Se a implantacao suporta 2 clientes ao mesmo tempo, nao aprove lote que possa gerar 4 implantacoes simultaneas sem responsavel adicional, agenda e suporte aprovados.

## Campos Obrigatorios

- Lote avaliado.
- Decisao.
- Pontuacao do lote.
- Justificativa.
- Limite do proximo lote.
- Maximo de implantacoes simultaneas.
- Capacidade operacional confirmada.
- Viabilidade financeira aprovada.
- Pacote de entrega e aceite revisados.
- Responsavel.
- Prazo de revisao.
- Riscos que impedem aumentar escala.
- Autorizador executivo.

## Regras

- Nao aumentar escala com cliente Vermelho.
- Nao aumentar escala com P0/P1 recorrente.
- Nao aumentar escala se o pacote de entrega nao estiver completo nos clientes ativos.
- Nao aumentar escala sem suporte dentro do SLA.
- Nao aumentar escala sem matriz de capacidade operacional aprovada.
- Nao aumentar escala sem viabilidade financeira minima validada.
- Se houver promessa fora do escopo, pausar e corrigir mensagem comercial.
- Nao aumentar escala com pontuacao abaixo de 85 sem aprovacao executiva explicita.
- Nao aumentar escala se o limite do proximo lote ultrapassar a capacidade de implantacao.
- Nao liberar lote novo sem data de revisao.

## Saida da Decisao

A decisao deve produzir:

- Acao comercial permitida.
- Limite do proximo lote.
- Limite de implantacoes simultaneas.
- Condicoes obrigatorias para o comercial.
- Condicoes obrigatorias para implantacao/suporte.
- Riscos aceitos pela direcao.
- Prazo de nova revisao.

## Gerador

```powershell
.\scripts\gerar-capacidade-operacional-escala.ps1 -Lote "Lote 2" -OportunidadesPlanejadas 8 -ImplantacoesSimultaneas 2
.\scripts\gerar-viabilidade-financeira-escala.ps1 -Lote "Lote 2" -ReceitaMensal 2792 -ReceitaImplantacao 6400 -CustoInfraMensal 400 -CustoSuporteMensal 900 -CustoImplantacao 3200 -CustoComercial 800
.\scripts\gerar-decisao-expansao-comercial.ps1 -Lote "Lote 1" -Decisao "Aumentar escala" -PontuacaoLote 92 -LimiteProximoLote 8 -MaxImplantacoesSimultaneas 2 -CapacidadeOperacionalConfirmada "Sim" -PacoteEntregaCompleto "Sim" -AceitesRegistrados "Sim" -Autorizador "Direcao"
```
