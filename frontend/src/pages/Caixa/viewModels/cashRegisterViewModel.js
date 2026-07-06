import { asList, formatCurrency, getLocalDateKey } from "../../../utils/formatters.js";
import { getMixedPaymentObservation, getPaymentMethodLabel } from "../../../utils/payments.js";

export function matchesCashBranchFilter(item, cashBranchFilter) {
  if (cashBranchFilter === "TODAS") return true;
  if (cashBranchFilter === "EMPRESA") return !item.filialId;
  return String(item.filialId || "") === cashBranchFilter;
}

export function createCashClosingRows(displayedCashReport) {
  if (!displayedCashReport) return [];

  return [
    { item: "Operador", valor: displayedCashReport.usuarioNome || displayedCashReport.usuarioLogin || "-" },
    { item: "Perfil", valor: displayedCashReport.perfil || "-" },
    { item: "Empresa", valor: displayedCashReport.empresaNome || displayedCashReport.empresaId || "-" },
    { item: "Filial", valor: displayedCashReport.filial || "Empresa" },
    { item: "Status", valor: displayedCashReport.status || "-" },
    { item: "Abertura", valor: displayedCashReport.dataAbertura ? new Date(displayedCashReport.dataAbertura).toLocaleString("pt-BR") : "-" },
    { item: "Fechamento", valor: displayedCashReport.dataFechamento ? new Date(displayedCashReport.dataFechamento).toLocaleString("pt-BR") : "-" },
    { item: "Valor inicial", valor: formatCurrency(displayedCashReport.valorInicial) },
    { item: "Total vendas", valor: formatCurrency(displayedCashReport.totalVendas) },
    { item: "Pagamentos recebidos", valor: formatCurrency(displayedCashReport.totalPagamentosRecebidos) },
    { item: "Suprimentos", valor: formatCurrency(displayedCashReport.totalSuprimentos) },
    { item: "Sangrias", valor: formatCurrency(displayedCashReport.totalSangrias) },
    { item: "Saldo calculado", valor: formatCurrency(displayedCashReport.saldoCalculado) },
    { item: "Valor contado", valor: displayedCashReport.valorFechamento != null ? formatCurrency(displayedCashReport.valorFechamento) : "-" },
    { item: "Divergência", valor: displayedCashReport.divergencia != null ? formatCurrency(displayedCashReport.divergencia) : "-" },
  ];
}

export function createCashMovementRows(caixa) {
  return asList(caixa.movimentos).map((movimento) => ({
    Data: movimento.dataMovimento ? new Date(movimento.dataMovimento).toLocaleString("pt-BR") : "-",
    Filial: caixa.filial || "Empresa / sem filial",
    Tipo: movimento.tipo || "-",
    Descrição: movimento.descricao || "-",
    Operador: movimento.usuarioNome || caixa.usuarioNome || "-",
    Pagamento: getPaymentMethodLabel(movimento.metodoPagamento),
    Valor: formatCurrency(movimento.valor || 0),
    Observação: getMixedPaymentObservation(movimento.observacao) || movimento.observacao || "-",
  }));
}

export function filterCashHistory(branchScopedCashHistory, cashHistoryFilter) {
  return branchScopedCashHistory.filter((item) => {
    const openedKey = getLocalDateKey(item.dataAbertura);
    const text = [
      item.usuarioNome,
      item.usuarioLogin,
      item.perfil,
      item.empresaNome,
      item.filial,
      item.status,
      item.id,
    ].join(" ").toLowerCase();

    if (cashHistoryFilter.busca && !text.includes(cashHistoryFilter.busca.toLowerCase())) return false;
    if (cashHistoryFilter.status !== "TODOS" && item.status !== cashHistoryFilter.status) return false;
    if (cashHistoryFilter.inicio && openedKey < cashHistoryFilter.inicio) return false;
    if (cashHistoryFilter.fim && openedKey > cashHistoryFilter.fim) return false;
    return true;
  });
}

export function createCashHistoryTotals(filteredCashHistory) {
  return filteredCashHistory.reduce(
    (totals, item) => ({
      caixas: totals.caixas + 1,
      vendas: totals.vendas + Number(item.totalVendas || 0),
      saldo: totals.saldo + Number(item.saldoCalculado || 0),
      divergencia: totals.divergencia + Number(item.divergencia || 0),
    }),
    { caixas: 0, vendas: 0, saldo: 0, divergencia: 0 },
  );
}

export function createCashHistoryRows(filteredCashHistory) {
  return filteredCashHistory.map((item) => ({
    operador: item.usuarioNome || item.usuarioLogin || "-",
    filial: item.filial || "Empresa",
    status: item.status || "-",
    abertura: item.dataAbertura ? new Date(item.dataAbertura).toLocaleString("pt-BR") : "-",
    fechamento: item.dataFechamento ? new Date(item.dataFechamento).toLocaleString("pt-BR") : "-",
    vendas: formatCurrency(item.totalVendas),
    saldo: formatCurrency(item.saldoCalculado),
    divergencia: item.divergencia != null ? formatCurrency(item.divergencia) : "-",
  }));
}

export function filterPendingCashOrders(branchScopedPendingOrders, pendingSearch) {
  return branchScopedPendingOrders.filter((pedido) => {
    const itemText = asList(pedido.itens)
      .map((item) => `${item.produto || ""} ${item.quantidade || ""}`)
      .join(" ");
    const text = [
      pedido.cliente,
      pedido.numero,
      pedido.id,
      pedido.usuario,
      pedido.vendedor,
      pedido.filial,
      pedido.metodoPagamentoDescricao,
      pedido.metodoPagamento,
      pedido.tipoEntregaDescricao,
      pedido.tipoEntrega,
      pedido.enderecoEntrega,
      pedido.observacaoEntrega,
      itemText,
    ].join(" ").toLowerCase();

    return text.includes(pendingSearch.toLowerCase());
  });
}

export function getSelectedPendingCashOrder(filteredPendingOrders, selectedPendingOrderId) {
  return (
    filteredPendingOrders.find((pedido) => String(pedido.id) === String(selectedPendingOrderId)) ||
    filteredPendingOrders[0] ||
    null
  );
}
