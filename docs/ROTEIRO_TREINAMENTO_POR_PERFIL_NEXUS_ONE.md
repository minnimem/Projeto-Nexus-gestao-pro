# Roteiro de Treinamento por Perfil - Nexus One

Este roteiro organiza treinamento operacional por perfil antes de liberar piloto assistido ou producao controlada.

Base de conhecimento e FAQ de apoio: `docs/BASE_CONHECIMENTO_SUPORTE_CLIENTE_NEXUS_ONE.md`.

## Admin/Gerente

Objetivo: administrar empresa, usuarios, permissoes, fiscal, relatorios e auditoria.

- Criar e revisar usuarios.
- Alterar perfil e acesso.
- Validar filial e empresa.
- Conferir matriz de permissoes.
- Conferir auditoria de eventos sensiveis.
- Configurar fiscal, quando estiver no escopo.
- Exportar relatorios e acompanhar BI.
- Entender Go/No-Go, aceite, backup e suporte.

Aceite minimo:

- Usuario cria outro usuario operacional.
- Usuario consulta auditoria/permissoes.
- Usuario sabe abrir chamado P0/P1.

## Vendedor

Objetivo: operar vendas, propostas, CRM e separacao sem depender do admin.

- Cadastrar/selecionar cliente.
- Criar orcamento.
- Converter proposta em pedido.
- Aplicar desconto dentro da regra.
- Registrar follow-up comercial.
- Consultar pedido pendente, separado e fiscal.
- Gerar proposta/comprovante quando aplicavel.

Aceite minimo:

- Usuario cria uma venda de teste completa.
- Usuario registra follow-up e entende status do pedido.

## Operador de Caixa

Objetivo: receber pedidos com seguranca e fechar caixa com conciliacao.

- Abrir caixa.
- Receber dinheiro, Pix, cartao, boleto e pagamento misto conforme escopo.
- Gerar comprovante.
- Registrar sangria e suprimento.
- Conferir resumo por forma de pagamento.
- Fechar caixa e explicar divergencia.

Aceite minimo:

- Usuario abre, recebe e fecha caixa de teste.
- Usuario sabe nao operar venda sem caixa aberto quando o fluxo exigir.

## Estoquista

Objetivo: manter saldo confiavel e apoiar venda/logistica.

- Conferir produtos e saldo.
- Registrar entrada.
- Conferir baixa por venda.
- Ver alertas de estoque minimo.
- Gerar etiqueta.
- Fazer inventario/contagem.
- Consultar separacao de pedidos.

Aceite minimo:

- Usuario registra entrada e confere baixa.
- Usuario entende produto critico/baixo/normal.

## Financeiro

Objetivo: acompanhar contas, cobrancas, conciliacao, DRE e fluxo.

- Cadastrar receita/despesa.
- Baixar/estornar conforme permissao.
- Conferir contas pendentes e vencidas.
- Conferir conciliacao caixa/venda/financeiro.
- Gerar cobranca quando integracao estiver homologada.
- Exportar DRE/fluxo.

Aceite minimo:

- Usuario confere uma venda recebida no financeiro.
- Usuario exporta relatorio financeiro.

## Logistica

Objetivo: organizar rota, romaneio e comprovante.

- Criar entrega.
- Planejar rota.
- Vincular motorista/veiculo.
- Imprimir romaneio.
- Gerar comprovante individual.
- Conferir atrasos e custo por entrega.

Aceite minimo:

- Usuario cria rota com entrega de teste.
- Usuario imprime romaneio/comprovante.

## Evidencia

Gerar lista de presenca:

```powershell
.\scripts\gerar-evidencia-treinamento.ps1 -Cliente "Cliente" -Perfil "Operador de Caixa" -Responsavel "Instrutor"
```

Quando uma duvida aparecer durante o treinamento e puder virar orientacao recorrente, gerar artigo com:

```powershell
.\scripts\gerar-artigo-base-conhecimento.ps1 -Titulo "Duvida recorrente" -Modulo "Caixa" -Categoria "Treinamento" -Publico "Operador de Caixa"
```
