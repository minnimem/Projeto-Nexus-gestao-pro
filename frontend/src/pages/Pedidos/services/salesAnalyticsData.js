import { asList, formatCurrency, formatNumber } from "../../../utils/formatters";
import { groupSalesByPeriod } from "../../../utils/sales";

export function getSalesAnalyticsData({
  branchCompletedOrders,
  branchScopedOrders,
  chartPeriod,
  data,
  rankingProdutos,
  salesBranchFilter,
}) {
  const vendasPorDia = salesBranchFilter === "TODAS" && asList(data.vendasPorDia).length > 0
    ? data.vendasPorDia
    : branchCompletedOrders;
  const chartRows = groupSalesByPeriod(vendasPorDia, chartPeriod);
  const maxSaleValue = Math.max(...chartRows.map((item) => item.value), 1);
  const totalChartValue = chartRows.reduce((total, item) => total + item.value, 0);
  const averageChartValue = chartRows.length > 0 ? totalChartValue / chartRows.length : 0;
  const bestChartPeriod = chartRows.reduce((best, item) => (item.value > Number(best.value || 0) ? item : best), null);
  const firstChartValue = Number(chartRows[0].value || 0);
  const lastChartValue = Number(chartRows[chartRows.length - 1].value || 0);
  const chartTrendPercent = firstChartValue > 0 ? ((lastChartValue - firstChartValue) / firstChartValue) * 100 : null;
  const chartInsights = [
    {
      label: "Melhor período",
      value: bestChartPeriod ? bestChartPeriod.label : "-",
      detail: bestChartPeriod ? formatCurrency(bestChartPeriod.value) : "Sem vendas",
    },
    {
      label: "Média por período",
      value: formatCurrency(averageChartValue),
      detail: `${formatNumber(chartRows.length)} período(s)`,
    },
    {
      label: "Tendencia",
      value: chartTrendPercent === null ? "-" : `${chartTrendPercent >= 0 ? "+" : ""}${formatNumber(chartTrendPercent)}%`,
      detail: chartTrendPercent === null ? "Base insuficiente" : "Primeiro x Último período",
      tone: chartTrendPercent === null ? "neutral" : chartTrendPercent >= 0 ? "positive" : "negative",
    },
  ];
  const branchProductRanking = Array.from(
    branchScopedOrders.reduce((map, pedido) => {
      asList(pedido.itens).forEach((item) => {
        const produto = item.produto || item.nomeProduto || "Produto sem nome";
        const current = map.get(produto) || { produto, quantidade: 0, valorTotal: 0 };
        const quantidade = Number(item.quantidade || 0);
        const preco = Number(item.precoUnit || item.precoUnitario || item.preco || 0);
        current.quantidade += quantidade;
        current.valorTotal += quantidade * preco;
        map.set(produto, current);
      });
      return map;
    }, new Map()).values(),
  ).sort((a, b) => Number(b.quantidade || 0) - Number(a.quantidade || 0));
  const topProducts = (salesBranchFilter === "TODAS" || branchProductRanking.length === 0
    ? rankingProdutos
    : branchProductRanking).slice(0, 5);
  const maxProductQty = Math.max(...topProducts.map((item) => Number(item.quantidade || 0)), 1);

  return {
    averageChartValue,
    bestChartPeriod,
    chartInsights,
    chartRows,
    chartTrendPercent,
    maxProductQty,
    maxSaleValue,
    topProducts,
    totalChartValue,
    vendasPorDia,
  };
}
