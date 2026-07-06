import { formatCurrency, formatNumber } from "../../../utils/formatters";

export function createFinanceReconciliationSummaryViewModel({
  caixas,
  caixasComDivergencia,
  criticalInconsistencyCount,
  filteredOrphanCancellationEvents,
  financeiroSemPedido,
  mediumInconsistencyCount,
  movimentacoes,
  pedidosSemItens,
  totalCaixaVendas,
  totalFinanceiroReceitas,
  totalVendasRecebidas,
  vendasRecebidas,
  vendasSemFinanceiro,
}) {
  const reconciliationRows = [
    { indicador: "Vendas recebidas", valor: formatCurrency(totalVendasRecebidas), detalhe: `${formatNumber(vendasRecebidas.length)} pedidos` },
    { indicador: "Vendas no caixa", valor: formatCurrency(totalCaixaVendas), detalhe: `${formatNumber(caixas.length)} caixas` },
    { indicador: "Receitas financeiras", valor: formatCurrency(totalFinanceiroReceitas), detalhe: `${formatNumber(movimentacoes.length)} lançamentos` },
    { indicador: "Diferenca vendas x caixa", valor: formatCurrency(totalVendasRecebidas - totalCaixaVendas), detalhe: "Pedidos finalizados comparados ao caixa" },
    { indicador: "Diferenca caixa x financeiro", valor: formatCurrency(totalCaixaVendas - totalFinanceiroReceitas), detalhe: "Caixa comparado ao financeiro" },
    { indicador: "Vendas sem financeiro", valor: formatNumber(vendasSemFinanceiro.length), detalhe: "Pedidos recebidos sem lançamento vinculado" },
    { indicador: "Pedidos sem itens", valor: formatNumber(pedidosSemItens.length), detalhe: "Pedidos antigos ou inconsistentes fora da conciliação" },
    { indicador: "Pedidos sem itens cancelados", valor: formatNumber(filteredOrphanCancellationEvents.length), detalhe: "Histórico administrativo da limpeza" },
    { indicador: "Receitas sem pedido", valor: formatNumber(financeiroSemPedido.length), detalhe: "Lançamentos manuais ou sem vínculo" },
    { indicador: "Caixas com divergencia", valor: formatNumber(caixasComDivergencia.length), detalhe: "Fechamentos com diferenca" },
  ];
  const vendasCaixaDiff = totalVendasRecebidas - totalCaixaVendas;
  const caixaFinanceiroDiff = totalCaixaVendas - totalFinanceiroReceitas;
  const reconciliationActionPlan = [
    Math.abs(vendasCaixaDiff) > 0.009 && {
      key: "vendas-caixa",
      severity: Math.abs(vendasCaixaDiff) > 1000 ? "danger" : "warning",
      title: "Diferenca entre vendas e caixa",
      detail: `${formatCurrency(vendasCaixaDiff)} entre pedidos recebidos e valores registrados no caixa.`,
      actionLabel: "Ver caixas",
      action: "cash",
    },
    Math.abs(caixaFinanceiroDiff) > 0.009 && {
      key: "caixa-financeiro",
      severity: Math.abs(caixaFinanceiroDiff) > 1000 ? "danger" : "warning",
      title: "Diferenca entre caixa e financeiro",
      detail: `${formatCurrency(caixaFinanceiroDiff)} entre caixa e receitas financeiras aprovadas.`,
      actionLabel: "Ver vendas sem financeiro",
      action: "sales-without-finance",
    },
    vendasSemFinanceiro.length > 0 && {
      key: "sales-without-finance",
      severity: "warning",
      title: "Vendas recebidas sem lançamento financeiro",
      detail: `${formatNumber(vendasSemFinanceiro.length)} pedido(s) precisam gerar ou vincular receita.`,
      actionLabel: "Abrir lista",
      action: "sales-without-finance",
    },
    pedidosSemItens.length > 0 && {
      key: "orders-without-items",
      severity: "danger",
      title: "Pedidos sem itens fora da conciliação",
      detail: `${formatNumber(pedidosSemItens.length)} pedido(s) inconsistentes devem ser tratados administrativamente.`,
      actionLabel: "Abrir lista",
      action: "orders-without-items",
    },
    caixasComDivergencia.length > 0 && {
      key: "cash-difference",
      severity: "danger",
      title: "Caixas com divergencia",
      detail: `${formatNumber(caixasComDivergencia.length)} fechamento(s) com diferenca entre contado e esperado.`,
      actionLabel: "Abrir caixas",
      action: "cash-difference",
    },
    financeiroSemPedido.length > 0 && {
      key: "orphan-revenue",
      severity: "warning",
      title: "Receitas sem pedido vinculado",
      detail: `${formatNumber(financeiroSemPedido.length)} lançamento(s) podem ser manual ou estar sem vínculo operacional.`,
      actionLabel: "Abrir lista",
      action: "orphan-revenue",
    },
  ].filter(Boolean);
  const reconciliationPenalty = Math.min(
    100,
    criticalInconsistencyCount * 14
      + mediumInconsistencyCount * 7
      + (Math.abs(vendasCaixaDiff) > 0.009 ? 12 : 0)
      + (Math.abs(caixaFinanceiroDiff) > 0.009 ? 12 : 0),
  );
  const reconciliationScore = Math.max(0, 100 - reconciliationPenalty);
  const reconciliationTone = reconciliationScore >= 90 ? "success" : reconciliationScore >= 70 ? "warning" : "danger";
  const reconciliationLabel = reconciliationScore >= 90 ? "Saudável" : reconciliationScore >= 70 ? "Atenção" : "Crítica";

  return {
    caixaFinanceiroDiff,
    reconciliationActionPlan,
    reconciliationLabel,
    reconciliationRows,
    reconciliationScore,
    reconciliationTone,
    vendasCaixaDiff,
  };
}

