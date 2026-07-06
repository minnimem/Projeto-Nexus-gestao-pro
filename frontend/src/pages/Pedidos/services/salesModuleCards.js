import {
  ArrowUpRight,
  ClipboardList,
  PackageCheck,
  Phone,
  ReceiptText,
  UsersRound,
} from "lucide-react";
import { formatCurrency, formatNumber } from "../../../utils/formatters";

export function getSalesModuleCards({
  bottleneckCards,
  branchScopedRecentOrders,
  chartRows,
  commercialFollowUpOrders,
  fiscalControlOrders,
  fiscalRealConclusionSummary,
  salesKpis,
  sellerRankingGoal,
  sellerRankingProgress,
  sellerRankingTotal,
  separationOrders,
  totalChartValue,
}) {
  return [
    {
      key: "orders",
      label: "Pedidos",
      value: formatNumber(branchScopedRecentOrders.length),
      detail: "Fila comercial filtrada",
      icon: ClipboardList,
      tone: salesKpis.pendentes > 0 ? "info" : "neutral",
    },
    {
      key: "followup",
      label: "CRM",
      value: formatCurrency(commercialFollowUpOrders.reduce((total, pedido) => total + Number(pedido.valor || 0), 0)),
      detail: `${formatNumber(commercialFollowUpOrders.length)} oportunidades abertas`,
      icon: Phone,
      tone: commercialFollowUpOrders.length > 0 ? "warning" : "neutral",
    },
    {
      key: "separation",
      label: "Separação",
      value: formatNumber(separationOrders.length),
      detail: `${formatNumber(salesKpis.separados)} pedidos prontos`,
      icon: PackageCheck,
      tone: separationOrders.length > 0 ? "info" : "neutral",
    },
    {
      key: "fiscal",
      label: "Fiscal",
      value: formatNumber(fiscalControlOrders.length),
      detail: `${formatNumber(fiscalRealConclusionSummary[0].value || 0)} pacote(s) pronto(s)`,
      icon: ReceiptText,
      tone: bottleneckCards.find((item) => item.key === "fiscal-pending").value > 0 ? "danger" : "success",
    },
    {
      key: "analytics",
      label: "Analytics",
      value: formatCurrency(totalChartValue),
      detail: `${formatNumber(chartRows.length)} período(s) analisados`,
      icon: ArrowUpRight,
      tone: totalChartValue > 0 ? "success" : "neutral",
    },
    {
      key: "ranking",
      label: "Ranking",
      value: sellerRankingGoal > 0 ? `${formatNumber(sellerRankingProgress)}%` : formatCurrency(sellerRankingTotal),
      detail: "Metas e comissão por vendedor",
      icon: UsersRound,
      tone: sellerRankingTotal > 0 ? "success" : "neutral",
    },
  ];
}
