import {
  asList,
  formatCurrency,
  formatDateTime,
  formatNumber,
} from "../../../utils/formatters.js";
import {
  getClientId,
  getOrderProductSummary,
} from "../../../utils/customers.js";

const COMPLETED_STATUSES = new Set(["FINALIZADA", "RECEBIDO", "ENTREGUE", "CONCLUIDO"]);
const RECEIVABLE_STATUSES = new Set(["PENDENTE", "AGUARDANDO_PAGAMENTO", "PAGAMENTO_PENDENTE"]);

export function createCustomerPageViewModel({
  customerBranchFilter,
  data,
  search,
  selectedCustomerId,
}) {
  const clientes = asList(data.clientes || data);
  const pedidos = asList(data.pedidos);
  const filiais = asList(data.filiais);
  const followUpsComerciais = asList(data.followUpsComerciais);

  function getCustomerOrders(customer) {
    return pedidos.filter((order) => String(order.clienteId || "") === String(getClientId(customer)));
  }

  function matchesCustomerBranch(customer) {
    if (customerBranchFilter === "TODAS") return true;
    const customerOrders = getCustomerOrders(customer);
    if (customerBranchFilter === "EMPRESA") {
      return customerOrders.length === 0 || customerOrders.some((order) => !order.filialId);
    }
    return customerOrders.some((order) => String(order.filialId || "") === customerBranchFilter);
  }

  function getCustomerBranchLabel(customer) {
    const customerOrders = getCustomerOrders(customer);
    const branchOrder = customerOrders.find((order) => order.filialId || order.filial);
    if (!branchOrder) return "Empresa / sem filial";
    return branchOrder.filial
      || filiais.find((branch) => String(branch.id) === String(branchOrder.filialId))?.nome
      || "Filial";
  }

  function getCustomerCommercialProfile(customer) {
    const customerOrders = getCustomerOrders(customer);
    const completedOrders = customerOrders.filter((order) => (
      COMPLETED_STATUSES.has(String(order.status || ""))
    ));
    const revenue = completedOrders.reduce((total, order) => total + Number(order.valor || 0), 0);
    const lastOrder = customerOrders
      .slice()
      .sort((a, b) => String(b.data || "").localeCompare(String(a.data || "")))[0];
    const lastOrderDate = lastOrder?.data ? new Date(lastOrder.data) : null;
    const daysSinceLastOrder = lastOrderDate && !Number.isNaN(lastOrderDate.getTime())
      ?
      Math.floor((Date.now() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24))
      : null;
    const hasReceivable = customerOrders.some((order) => (
      RECEIVABLE_STATUSES.has(String(order.status || ""))
    ));

    if (hasReceivable) return { label: "Inadimplente", tone: "danger", detail: "Possui valor pendente" };
    if (daysSinceLastOrder !== null && daysSinceLastOrder > 90) {
      return { label: "Inativo", tone: "warning", detail: `${formatNumber(daysSinceLastOrder)} dias sem compra` };
    }
    if (revenue >= 5000) return { label: "VIP", tone: "success", detail: formatCurrency(revenue) };
    if (completedOrders.length >= 3) {
      return { label: "Recorrente", tone: "info", detail: `${formatNumber(completedOrders.length)} compras` };
    }
    if (revenue >= 2000) return { label: "Alto valor", tone: "success", detail: formatCurrency(revenue) };
    if (customerOrders.length === 0) return { label: "Novo", tone: "neutral", detail: "Sem compra ainda" };
    return { label: "Ativo", tone: "info", detail: "Relacionamento ativo" };
  }

  const branchFilteredClientes = clientes.filter(matchesCustomerBranch);
  const clientesComEmail = branchFilteredClientes.filter((customer) => customer.email).length;
  const clientesComTelefone = branchFilteredClientes.filter((customer) => customer.telefone).length;
  const branchCompletedOrders = branchFilteredClientes.flatMap((customer) => (
    getCustomerOrders(customer).filter((order) => COMPLETED_STATUSES.has(String(order.status || "")))
  ));
  const branchCompletedRevenue = branchCompletedOrders.reduce(
    (total, order) => total + Number(order.valor || 0),
    0,
  );
  const branchAverageTicket = branchCompletedOrders.length > 0
    ?
    branchCompletedRevenue / branchCompletedOrders.length
    : 0;
  const currentMonthDate = new Date();
  const previousMonthDate = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1);
  const clientesNovosMes = branchFilteredClientes.filter((customer) => {
    if (!customer.dataCriacao) return false;
    const createdAt = new Date(customer.dataCriacao);
    return createdAt.getMonth() === currentMonthDate.getMonth()
      && createdAt.getFullYear() === currentMonthDate.getFullYear();
  }).length;
  const clientesNovosMesAnterior = branchFilteredClientes.filter((customer) => {
    if (!customer.dataCriacao) return false;
    const createdAt = new Date(customer.dataCriacao);
    return createdAt.getMonth() === previousMonthDate.getMonth()
      && createdAt.getFullYear() === previousMonthDate.getFullYear();
  }).length;
  const customerNewMonthTrend = clientesNovosMesAnterior > 0
    ?
    {
        value: `${clientesNovosMes >= clientesNovosMesAnterior ? "+" : ""}${Math.round(((clientesNovosMes - clientesNovosMesAnterior) / clientesNovosMesAnterior) * 100)}% vs mes anterior`,
        tone: clientesNovosMes >= clientesNovosMesAnterior ? "positive" : "negative",
      }
    : {
        value: clientesNovosMes > 0 ? "nova carteira ativa" : "sem entrada no mês",
        tone: clientesNovosMes > 0 ? "positive" : "neutral",
      };
  const normalizedSearch = search.toLowerCase();
  const filteredClientes = branchFilteredClientes.filter((customer) => (
    `${customer.nome || ""} ${customer.cpf || ""} ${customer.email || ""}`
      .toLowerCase()
      .includes(normalizedSearch)
  ));
  const selectedCustomer = filteredClientes.find((customer) => (
    String(getClientId(customer)) === String(selectedCustomerId)
  )) || filteredClientes[0] || null;
  const selectedCustomerOrders = selectedCustomer
    ?
    getCustomerOrders(selectedCustomer).sort((a, b) => String(b.data || "").localeCompare(String(a.data || "")))
    : [];
  const selectedCustomerCompletedOrders = selectedCustomerOrders.filter((order) => (
    COMPLETED_STATUSES.has(String(order.status || ""))
  ));
  const selectedCustomerRevenue = selectedCustomerCompletedOrders.reduce(
    (total, order) => total + Number(order.valor || 0),
    0,
  );
  const selectedCustomerAverageTicket = selectedCustomerCompletedOrders.length > 0
    ?
    selectedCustomerRevenue / selectedCustomerCompletedOrders.length
    : 0;
  const selectedCustomerLastOrder = selectedCustomerOrders[0];
  const selectedCustomerOrderIds = new Set(selectedCustomerOrders.map((order) => String(order.id)));
  const selectedCustomerOpenOrders = selectedCustomerOrders.filter((order) => (
    !COMPLETED_STATUSES.has(String(order.status || "")) && String(order.status || "") !== "CANCELADO"
  ));
  const selectedCustomerFollowUps = followUpsComerciais
    .filter((item) => selectedCustomerOrderIds.has(String(item.pedidoId || item.pedido?.id || "")))
    .sort((a, b) => String(b.criadoEm || b.proximaAcao || "").localeCompare(String(a.criadoEm || a.proximaAcao || "")));
  const selectedCustomerPendingFollowUps = selectedCustomerFollowUps.filter((item) => item.status === "PENDENTE");
  const selectedCustomerProfile = selectedCustomer ? getCustomerCommercialProfile(selectedCustomer) : null;
  const selectedCustomerLastOrderDate = selectedCustomerLastOrder?.data
    ?
    new Date(selectedCustomerLastOrder.data)
    : null;
  const selectedCustomerDaysSinceLastOrder = selectedCustomerLastOrderDate
    && !Number.isNaN(selectedCustomerLastOrderDate.getTime())
    ?
    Math.floor((Date.now() - selectedCustomerLastOrderDate.getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const selectedCustomerTags = selectedCustomer ? [
    selectedCustomerRevenue >= 5000 && { label: "VIP", tone: "success" },
    selectedCustomerCompletedOrders.length >= 3 && { label: "Recorrente", tone: "info" },
    selectedCustomerDaysSinceLastOrder !== null
      && selectedCustomerDaysSinceLastOrder > 90
      && { label: "Inativo", tone: "warning" },
    selectedCustomerOrders.length === 0 && { label: "Novo", tone: "neutral" },
    selectedCustomerOrders.some((order) => RECEIVABLE_STATUSES.has(String(order.status || "")))
      && { label: "Inadimplente", tone: "danger" },
  ].filter(Boolean) : [];
  const selectedCustomerInsights = selectedCustomer ? [
    selectedCustomerOpenOrders.length > 0 && {
      title: "Pedido em andamento",
      detail: `${formatNumber(selectedCustomerOpenOrders.length)} pedido(s) para acompanhar`,
      tone: "info",
    },
    selectedCustomerPendingFollowUps.length > 0 && {
      title: "Follow-up pendente",
      detail: "Retomar contato comercial",
      tone: "warning",
    },
    selectedCustomerDaysSinceLastOrder !== null && selectedCustomerDaysSinceLastOrder > 30 && {
      title: "Reativação sugerida",
      detail: `${formatNumber(selectedCustomerDaysSinceLastOrder)} dias sem compra`,
      tone: "warning",
    },
    branchAverageTicket > 0 && selectedCustomerAverageTicket > branchAverageTicket && {
      title: "Ticket acima da média",
      detail: `${formatCurrency(selectedCustomerAverageTicket)} por compra`,
      tone: "success",
    },
    (!selectedCustomer.email || !selectedCustomer.telefone) && {
      title: "Contato incompleto",
      detail: "Atualizar email e telefone",
      tone: "danger",
    },
    selectedCustomerOrders.length === 0 && {
      title: "Primeira venda",
      detail: "Cliente pronto para ativação",
      tone: "info",
    },
  ].filter(Boolean) : [];
  const selectedCustomerTimeline = [
    ...selectedCustomerOrders.slice(0, 8).map((order) => ({
      key: `pedido-${order.id}`,
      type: "Compra",
      title: order.numero || order.id || "Pedido",
      date: order.data,
      detail: `${order.status || "-"} / ${formatCurrency(order.valor)}`,
    })),
    ...selectedCustomerFollowUps.slice(0, 8).map((item) => ({
      key: `followup-${item.id}`,
      type: "Follow-up",
      title: item.canal || "Contato comercial",
      date: item.proximaAcao || item.criadoEm,
      detail: `${item.status || "-"} / ${item.observacao || "Sem observação"}`,
    })),
  ].sort((a, b) => String(b.date || "").localeCompare(String(a.date || ""))).slice(0, 10);
  const selectedCustomerFavoriteProducts = Array.from(selectedCustomerOrders.reduce((map, order) => {
    const items = asList(order.itens);
    if (items.length === 0) {
      const fallbackName = order.produto || order.nomeProduto || "";
      if (fallbackName) {
        const current = map.get(fallbackName) || { name: fallbackName, quantity: 0, revenue: 0 };
        current.quantity += 1;
        current.revenue += Number(order.valor || 0);
        map.set(fallbackName, current);
      }
      return map;
    }
    items.forEach((item) => {
      const name = item.produto?.nomeProduto
        || item.produto?.nome
        || item.produto
        || item.nomeProduto
        || item.descricao
        || "Produto sem nome";
      const quantity = Number(item.quantidade || 1);
      const revenue = Number(
        item.subtotal
        || item.total
        || item.valorTotal
        || quantity * Number(item.preco || item.valor || 0),
      );
      const current = map.get(name) || { name, quantity: 0, revenue: 0 };
      current.quantity += quantity;
      current.revenue += revenue;
      map.set(name, current);
    });
    return map;
  }, new Map()).values())
    .sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue)
    .slice(0, 4);
  const customerHistoryRows = selectedCustomerOrders.map((order) => ({
    Pedido: order.numero || order.id,
    Filial: order.filial || "Empresa / sem filial",
    Produtos: getOrderProductSummary(order),
    Data: formatDateTime(order.data),
    Status: order.status || "-",
    Vendedor: order.usuario || "-",
    Pagamento: order.metodoPagamentoDescricao || order.metodoPagamento || "-",
    Entrega: order.tipoEntregaDescricao || order.tipoEntrega || "-",
    Valor: formatCurrency(order.valor),
  }));

  return {
    branchAverageTicket,
    branchCompletedRevenue,
    branchFilteredClientes,
    clientes,
    clientesComEmail,
    clientesComTelefone,
    clientesNovosMes,
    clientesNovosMesAnterior,
    customerHistoryRows,
    customerNewMonthTrend,
    filiais,
    filteredClientes,
    getCustomerBranchLabel,
    getCustomerCommercialProfile,
    pedidos,
    selectedCustomer,
    selectedCustomerAverageTicket,
    selectedCustomerCompletedOrders,
    selectedCustomerDaysSinceLastOrder,
    selectedCustomerFavoriteProducts,
    selectedCustomerFollowUps,
    selectedCustomerInsights,
    selectedCustomerLastOrder,
    selectedCustomerOpenOrders,
    selectedCustomerOrders,
    selectedCustomerPendingFollowUps,
    selectedCustomerProfile,
    selectedCustomerRevenue,
    selectedCustomerTags,
    selectedCustomerTimeline,
  };
}
