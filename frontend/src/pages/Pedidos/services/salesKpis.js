import { formatCurrency, formatNumber, getLocalDateKey } from "../../../utils/formatters.js";

export function getSalesKpiData({
  branchCompletedOrders,
  branchScopedOrders,
  sellerRankingGoal,
  sellerRankingProgress,
  sellerRankingTotal,
}) {
  const salesKpis = {
    totalVendas: branchCompletedOrders.length,
    pendentes: branchScopedOrders.filter((pedido) => String(pedido.status || "") === "PENDENTE").length,
    orcamentos: branchScopedOrders.filter((pedido) => String(pedido.status || "") === "ORCAMENTO").length,
    separacao: branchScopedOrders.filter((pedido) => String(pedido.status || "") === "SEPARACAO").length,
    separados: branchScopedOrders.filter((pedido) => String(pedido.status || "") === "SEPARADO").length,
    receita: branchCompletedOrders.reduce((total, pedido) => total + Number(pedido.valor || 0), 0),
    vendasHoje: branchCompletedOrders
      .filter((pedido) => getLocalDateKey(pedido.data) === getLocalDateKey())
      .reduce((total, pedido) => total + Number(pedido.valor || 0), 0),
  };
  const salesPipelineTotal = branchScopedOrders.length || 1;
  const salesTicketMedio = salesKpis.totalVendas > 0 ? salesKpis.receita / salesKpis.totalVendas : 0;
  const salesConversionRate = (salesKpis.totalVendas / salesPipelineTotal) * 100;
  const salesOpenAmount = branchScopedOrders
    .filter((pedido) => ["ORCAMENTO", "PENDENTE", "SEPARACAO", "SEPARADO"].includes(String(pedido.status || "")))
    .reduce((total, pedido) => total + Number(pedido.valor || 0), 0);
  const salesKpiPulseCards = [
    {
      label: "Conversao",
      value: `${formatNumber(salesConversionRate)}%`,
      detail: `${formatNumber(salesKpis.totalVendas)} concluidos de ${formatNumber(branchScopedOrders.length)} pedido(s)`,
      tone: salesConversionRate >= 60 ? "positive" : salesConversionRate >= 35 ? "warning" : "attention",
    },
    {
      label: "Ticket médio",
      value: formatCurrency(salesTicketMedio),
      detail: salesKpis.totalVendas > 0 ? "Média dos pedidos concluídos" : "Sem vendas concluídas no filtro",
      tone: salesTicketMedio > 0 ? "positive" : "neutral",
    },
    {
      label: "Aberto no funil",
      value: formatCurrency(salesOpenAmount),
      detail: `${formatNumber(salesKpis.orcamentos + salesKpis.pendentes + salesKpis.separacao + salesKpis.separados)} pedido(s) em andamento`,
      tone: salesOpenAmount > 0 ? "warning" : "positive",
    },
    {
      label: "Meta vendedores",
      value: sellerRankingGoal > 0 ? `${formatNumber(sellerRankingProgress)}%` : "-",
      detail: sellerRankingGoal > 0 ? `${formatCurrency(sellerRankingTotal)} de ${formatCurrency(sellerRankingGoal)}` : "Defina metas por vendedor",
      tone: sellerRankingGoal > 0 && sellerRankingProgress >= 100 ? "positive" : sellerRankingGoal > 0 ? "warning" : "neutral",
    },
  ];

  return { salesConversionRate, salesKpiPulseCards, salesKpis, salesOpenAmount, salesTicketMedio };
}
