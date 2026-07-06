import { isSeparationQueueOrder } from "./separationRules";

export function getSalesBottleneckCards({
  branchScopedOrders,
  branchScopedRecentOrders,
  fiscalRealConclusion,
  fiscalRealConclusionSummary,
  salesKpis,
}) {
  const separationOrders = branchScopedRecentOrders.filter(isSeparationQueueOrder);
  const bottleneckCards = [
    {
      key: "quotes",
      label: "Propostas paradas",
      value: salesKpis.orcamentos,
      amount: branchScopedOrders.filter((pedido) => String(pedido.status || "") === "ORCAMENTO").reduce((total, pedido) => total + Number(pedido.valor || 0), 0),
      action: "Retomar proposta",
      target: "followup",
      tone: "warning",
    },
    {
      key: "pending",
      label: "A receber",
      value: salesKpis.pendentes,
      amount: branchScopedOrders.filter((pedido) => String(pedido.status || "") === "PENDENTE").reduce((total, pedido) => total + Number(pedido.valor || 0), 0),
      action: "Confirmar pagamento",
      target: "orders",
      tone: "info",
    },
    {
      key: "separation",
      label: "Separação",
      value: separationOrders.length,
      amount: separationOrders.reduce((total, pedido) => total + Number(pedido.valor || 0), 0),
      action: "Acompanhar estoque",
      target: "separation",
      tone: "info",
    },
    {
      key: "fiscal-pending",
      label: "Fiscal pendente",
      value: fiscalRealConclusion.filter((item) => item.status === "PENDENCIAS").length,
      amount: fiscalRealConclusion.filter((item) => item.status === "PENDENCIAS").reduce((total, item) => total + Number(item.pedido.valor || 0), 0),
      action: "Corrigir cadastro",
      target: "fiscal",
      tone: "danger",
    },
    {
      key: "fiscal-ready",
      label: "Pacote real",
      value: fiscalRealConclusionSummary[0].value || 0,
      amount: fiscalRealConclusion.filter((item) => item.ready).reduce((total, item) => total + Number(item.pedido.valor || 0), 0),
      action: "Conferir pacote",
      target: "fiscal",
      tone: "success",
    },
  ];
  const strongestBottleneck = bottleneckCards
    .filter((item) => Number(item.value || 0) > 0)
    .sort((a, b) => Number(b.value || 0) - Number(a.value || 0))[0];

  return { bottleneckCards, separationOrders, strongestBottleneck };
}
