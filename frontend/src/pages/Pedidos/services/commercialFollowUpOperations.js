import { getOrderProductSummary } from "../../../utils/customers";
import { formatCurrency, formatDate, formatDateTime } from "../../../utils/formatters";

export function getCommercialFollowUpRows(commercialFollowUpOrders) {
  return commercialFollowUpOrders.map((pedido) => ({
    Vendedor: pedido.usuario || pedido.vendedor || "Vendedor não informado",
    Cliente: pedido.cliente || "-",
    Filial: pedido.filial || "Empresa / sem filial",
    Pedido: pedido.numero || pedido.id,
    Status: pedido.status || "-",
    Produtos: getOrderProductSummary(pedido),
    "Último contato": formatDateTime(pedido.data),
    Valor: formatCurrency(pedido.valor),
    "Próxima ação": pedido.status === "ORCAMENTO" ?
      "Retomar proposta"
      : pedido.status === "PENDENTE" ?
        "Confirmar recebimento"
        : "Acompanhar separação",
  }));
}

export function getCommercialFunnelStages(commercialFollowUpOrders) {
  return [
    { key: "ORCAMENTO", label: "Propostas", action: "Retomar proposta", statuses: ["ORCAMENTO"] },
    { key: "PENDENTE", label: "A receber", action: "Confirmar pagamento", statuses: ["PENDENTE"] },
    { key: "SEPARACAO", label: "Separação", action: "Acompanhar entrega", statuses: ["SEPARACAO", "SEPARADO"] },
  ].map((stage) => {
    const orders = commercialFollowUpOrders.filter((pedido) => stage.statuses.includes(String(pedido.status || "")));
    const valor = orders.reduce((total, pedido) => total + Number(pedido.valor || 0), 0);
    const latest = orders.map((pedido) => pedido.data).filter(Boolean).sort((a, b) => String(b).localeCompare(String(a)))[0];
    return { ...stage, orders, valor, latest, ticketMedio: orders.length > 0 ? valor / orders.length : 0 };
  });
}

export function getBranchScopedCommercialFollowUps({ commercialFollowUps, salesBranchFilter }) {
  return commercialFollowUps.filter((item) => {
    if (salesBranchFilter === "TODAS") return true;
    if (salesBranchFilter === "EMPRESA") return !item.filialId;
    return String(item.filialId || "") === salesBranchFilter;
  });
}

export function getCommercialFollowUpHistoryRows(branchScopedCommercialFollowUps) {
  return branchScopedCommercialFollowUps.map((item) => ({
    Vendedor: item.vendedor || "-",
    Cliente: item.clienteNome || "Cliente não identificado",
    Filial: item.filial || "Empresa / sem filial",
    Pedido: item.pedidoNumero || item.pedidoId || "-",
    Status: item.status || "-",
    Canal: item.canal || "-",
    "Próxima ação": item.proximaAcao ? formatDate(item.proximaAcao) : "-",
    "Notificação externa": item.notificacaoExternaEm ? formatDateTime(item.notificacaoExternaEm) : "-",
    Valor: formatCurrency(item.valor),
    Usuario: item.usuarioNome || "-",
    Observacao: item.observacao || "-",
  }));
}
