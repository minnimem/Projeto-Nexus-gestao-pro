import { formatCurrency, formatNumber } from "../../../utils/formatters";

export function getSalesOverviewInsights({
  bestChartPeriod,
  strongestBottleneck,
  topProducts,
}) {
  const topProduct = topProducts[0];

  return [
    {
      label: "Melhor período",
      value: bestChartPeriod ? bestChartPeriod.label : "-",
      detail: bestChartPeriod ? `${formatCurrency(bestChartPeriod.value)} em vendas` : "Sem vendas concluídas",
      tone: bestChartPeriod ? "positive" : "neutral",
    },
    {
      label: "Produto destaque",
      value: topProduct?.produto || "-",
      detail: topProduct
        ? `${formatNumber(topProduct.quantidade || 0)} un. / ${formatCurrency(topProduct.valorTotal)}`
        : "Ranking sem dados no filtro",
      tone: topProduct ? "positive" : "neutral",
    },
    {
      label: "Prioridade agora",
      value: strongestBottleneck ? strongestBottleneck.label : "Operação limpa",
      detail: strongestBottleneck
        ? `${formatNumber(strongestBottleneck.value)} item(ns) / ${strongestBottleneck.action}`
        : "Sem gargalos críticos",
      tone: strongestBottleneck?.tone || "positive",
    },
  ];
}
