# Base de Conhecimento e FAQ de Suporte - Nexus One

Data de referencia: 10/05/2026

Esta base organiza respostas padronizadas para duvidas recorrentes de clientes, suporte e implantacao. O objetivo e reduzir retrabalho, acelerar atendimento, treinar usuarios e transformar incidentes repetidos em artigos simples.

## Quando Usar

- Durante treinamento de usuarios.
- Em suporte P2/P3, duvidas operacionais e orientacoes recorrentes.
- Apos incidente que gerou aprendizado para o cliente.
- Quando uma pergunta aparecer mais de uma vez no mesmo cliente ou modulo.
- Antes de escalar para desenvolvimento, quando o tema pode ser resolvido por operacao, permissao, treinamento ou configuracao.

## Padrao de Artigo

Cada artigo deve conter:

- Titulo curto.
- Modulo.
- Publico: admin, vendedor, caixa, estoque, financeiro, logistico ou suporte.
- Sintoma/pergunta.
- Causa provavel.
- Passo a passo de solucao.
- Quando acionar suporte.
- Tags.
- Data de revisao.

## FAQ Inicial

### Login e Acesso

**Nao consigo entrar no sistema.**

- Conferir se o usuario esta ativo.
- Conferir email/login digitado.
- Conferir perfil e filial.
- Se varios usuarios nao acessam, abrir incidente P0/P1 conforme impacto.

**Usuario nao enxerga um menu.**

- Conferir perfil.
- Conferir permissoes manuais.
- Conferir se o modulo esta no plano contratado.
- Registrar ajuste de permissao quando houver alteracao.

### Vendas

**Pedido nao avanca ou esta pendente.**

- Conferir cliente, itens, estoque e pagamento.
- Conferir se existe pendencia fiscal, separacao ou caixa.
- Validar status do pedido antes de refazer a venda.

**Proposta precisa de validade ou condicao comercial.**

- Usar o fluxo de proposta/orcamento.
- Registrar validade e condicoes comerciais.
- Gerar proposta apenas dentro do plano e limites aprovados.

### Caixa

**Nao consigo receber um pedido.**

- Conferir se ha caixa aberto.
- Conferir operador, filial e forma de pagamento.
- Conferir se o pedido ja foi recebido.
- Se pagamento real estiver no escopo, validar provedor/canal.

**Fechamento de caixa tem divergencia.**

- Conferir resumo por forma de pagamento.
- Conferir sangria, suprimento e recebimentos.
- Registrar divergencia antes de fechar.
- Abrir suporte se a divergencia impedir a operacao.

### Estoque

**Saldo do produto parece incorreto.**

- Conferir entradas, baixas por venda e inventario.
- Validar filial/empresa.
- Conferir se a venda baixou estoque.
- Registrar inventario quando houver divergencia real.

**Produto aparece como critico ou baixo.**

- Conferir estoque minimo.
- Conferir sugestao de reposicao.
- Validar compra ou transferencia.

### Financeiro

**Conta nao aparece como recebida.**

- Conferir status da venda/caixa.
- Conferir baixa manual ou retorno de provedor.
- Conferir conciliacao com pedido e recebimento.

**DRE ou fluxo nao bate com a expectativa.**

- Conferir periodo selecionado.
- Conferir receitas/despesas aprovadas.
- Conferir custos, taxas e recorrencias.
- Exportar relatorio para analise.

### Fiscal

**Nota fiscal real nao pode ser prometida sem homologacao.**

- Confirmar certificado, contador, credenciamento, provedor e ambiente.
- Usar homologacao antes de producao.
- Registrar pendencias fiscais no pacote do cliente.

### Suporte e Incidente

**Quando abrir P0/P1?**

- P0: sistema indisponivel, perda de dados, caixa travado em producao ou risco grave.
- P1: venda, caixa, financeiro ou fiscal impedindo operacao do dia.
- P2/P3: duvida, relatorio, permissao, treinamento ou melhoria com alternativa.

## Como Evoluir a Base

- Criar artigo sempre que a duvida se repetir.
- Revisar artigos apos mudanca de tela, regra ou fluxo.
- Remover orientacao antiga que possa causar erro.
- Manter linguagem simples, sem expor detalhes tecnicos sensiveis.
- Vincular artigos a incidentes, treinamento ou saude do cliente quando fizer sentido.

## Gerador de Artigo

```powershell
.\scripts\gerar-artigo-base-conhecimento.ps1 -Titulo "Como fechar caixa com divergencia" -Modulo "Caixa" -Categoria "FAQ" -Publico "Operador de Caixa"
```

Arquive artigos gerados em `reports\suporte\base-conhecimento` e promova para esta base quando virarem orientacao recorrente.
