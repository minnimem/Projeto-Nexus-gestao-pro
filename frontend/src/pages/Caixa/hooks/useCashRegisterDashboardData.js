import { normalizeStatus } from "../../../components/common/StatusUi.jsx";
import { canPerform, normalizePerfil } from "../../../utils/permissions.js";
import {
  asList,
  formatCurrency,
  formatDateTime,
  formatNumber,
  getLocalDateKey,
} from "../../../utils/formatters.js";
import { canInstallmentPayment, getPaymentMethodLabel } from "../../../utils/payments.js";
import {
  getCashClosingDifference,
  getCashPaymentReadiness,
} from "../services/cashRegisterRules.js";
import {
  createCashClosingRows,
  createCashHistoryRows,
  createCashHistoryTotals,
  createCashMovementRows,
  filterCashHistory,
  filterPendingCashOrders,
  getSelectedPendingCashOrder,
  matchesCashBranchFilter,
} from "../viewModels/cashRegisterViewModel.js";

export function useCashRegisterDashboardData({
  cashBranchFilter,
  cashHistoryFilter,
  closeForm,
  data,
  pendingSearch,
  receivePaymentForm,
  selectedCashReport,
  selectedPendingOrderId,
  session,
}) {
  const caixa = data.aberto || null;
  const caixaMovimentos = asList(caixa?.movimentos);
  const recentes = asList(data.recentes);
  const produtos = asList(data.produtos);
  const clientes = asList(data.clientes);
  const filiais = asList(data.filiais);
  const cashReceivableStatuses = new Set([
    "PENDENTE",
    "AGUARDANDO_PAGAMENTO",
    "PAGAMENTO_PENDENTE",
    "ABERTO",
    "SEPARACAO",
    "SEPARADO",
  ]);
  const pedidosPendentes = asList(data.pedidos)
    .filter((pedido) => cashReceivableStatuses.has(normalizeStatus(pedido.status)))
    .filter((pedido) => normalizeStatus(pedido.tipoEntrega || "RETIRADA_LOJA") !== "ENTREGA");
  const role = normalizePerfil(session.perfil);
  const canOperate = canPerform(session, "operateCash");
  const selectedCashBranchLabel = cashBranchFilter === "TODAS"
    ? "Todas as filiais"
    : cashBranchFilter === "EMPRESA"
      ? "Empresa / sem filial"
      : filiais.find((filial) => String(filial.id) === cashBranchFilter)?.nome || "Filial";
  const branchScopedPendingOrders = pedidosPendentes.filter((item) => matchesCashBranchFilter(item, cashBranchFilter));
  const branchScopedCashHistory = recentes.filter((item) => matchesCashBranchFilter(item, cashBranchFilter));
  const totalEntradasCaixa =
    Number(caixa?.totalVendas || 0) +
    Number(caixa?.totalPagamentosRecebidos || 0) +
    Number(caixa?.totalSuprimentos || 0);
  const closeExpectedValue = Number(caixa?.saldoCalculado || 0);
  const { closeDifference, closeDifferenceOk } = getCashClosingDifference({
    closeForm,
    expectedValue: closeExpectedValue,
  });
  const closeConciliationRows = [
    { label: "Fundo inicial", value: formatCurrency(caixa?.valorInicial || 0), tone: "neutral" },
    { label: "Entradas", value: formatCurrency(totalEntradasCaixa), tone: "success" },
    { label: "Sangrias", value: formatCurrency(caixa?.totalSangrias || 0), tone: "warning" },
    { label: "Saldo esperado", value: formatCurrency(closeExpectedValue), tone: "info" },
  ];
  const todayKey = getLocalDateKey();
  const todayPaymentMovements = caixaMovimentos.filter((movimento) => {
    const tipo = String(movimento.tipo || "");
    return ["VENDA", "PAGAMENTO_RECEBIDO"].includes(tipo) && getLocalDateKey(movimento.dataMovimento) === todayKey;
  });
  const paymentReportRows = Array.from(
    todayPaymentMovements.reduce((acc, movimento) => {
      const method = movimento.metodoPagamento || "NAO_INFORMADO";
      const current = acc.get(method) || { method, label: getPaymentMethodLabel(method), count: 0, total: 0 };
      current.count += 1;
      current.total += Number(movimento.valor || 0);
      acc.set(method, current);
      return acc;
    }, new Map()).values(),
  ).sort((a, b) => b.total - a.total);
  const paymentReportTotal = paymentReportRows.reduce((total, row) => total + row.total, 0);
  const cashStatusCards = [
    {
      label: "Status",
      value: caixa?.status || "SEM CAIXA",
      detail: caixa ? `Aberto em ${formatDateTime(caixa.dataAbertura)}` : "Abertura pendente",
      tone: caixa ? "success" : "warning",
    },
    {
      label: "Operador",
      value: caixa?.usuarioNome || caixa?.usuarioLogin || session.usuario || session.login || "-",
      detail: caixa?.perfil || role || "Perfil não informado",
      tone: "neutral",
    },
    {
      label: "Filial",
      value: caixa?.filial || selectedCashBranchLabel,
      detail: caixa?.empresaNome || session.empresa || "Empresa atual",
      tone: "neutral",
    },
    {
      label: "Saldo",
      value: formatCurrency(caixa?.saldoCalculado || 0),
      detail: `${formatCurrency(totalEntradasCaixa)} em entradas`,
      tone: "info",
    },
  ];
  const displayedCashReport = selectedCashReport || caixa;
  const cashClosingRows = createCashClosingRows(displayedCashReport);
  const cashMovementRows = createCashMovementRows(caixa || {});
  const filteredCashHistory = filterCashHistory(branchScopedCashHistory, cashHistoryFilter);
  const cashHistoryTotals = createCashHistoryTotals(filteredCashHistory);
  const cashHistoryRows = createCashHistoryRows(filteredCashHistory);
  const filteredPendingOrders = filterPendingCashOrders(branchScopedPendingOrders, pendingSearch);
  const selectedPendingOrder = getSelectedPendingCashOrder(filteredPendingOrders, selectedPendingOrderId);
  const selectedOrderTotal = Number(selectedPendingOrder?.valor || 0);
  const {
    receiveMixedDifference,
    receiveMixedTotal,
    receivePaymentReady,
  } = getCashPaymentReadiness({
    caixa,
    canOperate,
    receivePaymentForm,
    selectedOrderTotal,
    selectedPendingOrder,
  });
  const receivePaymentDetail = receivePaymentForm.metodoPagamento === "MISTO"
    ? `${formatCurrency(receiveMixedTotal)} distribuído | ${receiveMixedDifference >= 0 ? "Excedente" : "Falta"} ${formatCurrency(Math.abs(receiveMixedDifference))}`
    : canInstallmentPayment(receivePaymentForm.metodoPagamento)
      ? `${formatNumber(receivePaymentForm.parcelas)}x de ${formatCurrency(selectedOrderTotal / Number(receivePaymentForm.parcelas || 1))}`
      : "Recebimento integral no caixa";

  return {
    branchScopedPendingOrders,
    caixa,
    canOperate,
    cashClosingRows,
    cashHistoryRows,
    cashHistoryTotals,
    cashMovementRows,
    cashStatusCards,
    clientes,
    closeConciliationRows,
    closeDifference,
    closeDifferenceOk,
    displayedCashReport,
    filteredCashHistory,
    filteredPendingOrders,
    filiais,
    paymentReportRows,
    paymentReportTotal,
    pedidosPendentes,
    produtos,
    recentes,
    receiveMixedDifference,
    receivePaymentDetail,
    receivePaymentReady,
    selectedCashBranchLabel,
    selectedOrderTotal,
    selectedPendingOrder,
    todayPaymentMovements,
  };
}
