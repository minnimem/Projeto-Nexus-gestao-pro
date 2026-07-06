import assert from "node:assert/strict";
import test from "node:test";
import {
  getCashClosingDifference,
  getCashMovementEndpointName,
  getCashPaymentReadiness,
  validateCashClosing,
  validateCashMovement,
  validateCashOpening,
  validateCashPaymentReceive,
} from "./services/cashRegisterRules.js";
import {
  createCashClosingRows,
  createCashHistoryRows,
  createCashHistoryTotals,
  createCashMovementRows,
  filterCashHistory,
  filterPendingCashOrders,
  getSelectedPendingCashOrder,
  matchesCashBranchFilter,
} from "./viewModels/cashRegisterViewModel.js";
import { useCashRegisterOperations } from "./hooks/useCashRegisterOperations.js";
import { endpoints } from "../../services/resources.js";

const caixaAberto = {
  id: "caixa-1",
  filialId: "filial-1",
  filial: "Matriz",
  usuarioNome: "Ana Operadora",
  status: "ABERTO",
  valorInicial: 100,
  saldoCalculado: 350,
  totalVendas: 200,
  totalPagamentosRecebidos: 80,
  totalSuprimentos: 50,
  totalSangrias: 80,
  movimentos: [
    {
      dataMovimento: "2026-07-05T10:00:00",
      tipo: "PAGAMENTO_RECEBIDO",
      descricao: "Pedido P-001",
      metodoPagamento: "PIX",
      valor: 80,
      observacao: "Pagamento misto: Pix: R$ 80,00",
    },
  ],
};

test("caixa valida abertura e fechamento com divergencia", () => {
  assert.deepEqual(validateCashOpening({ valorInicial: "150,50", observacao: "Troco" }), {
    payload: { valorInicial: 150.5, observacao: "Troco" },
  });
  assert.match(validateCashOpening({ valorInicial: "-1" }).error, /valor inicial válido/);

  assert.deepEqual(validateCashClosing({ valorFechamento: "350", observacao: "Ok" }), {
    payload: { valorFechamento: 350, observacao: "Ok" },
  });
  assert.match(validateCashClosing({ valorFechamento: "abc" }).error, /valor contado válido/);

  assert.deepEqual(
    getCashClosingDifference({ closeForm: { valorFechamento: "350" }, expectedValue: 350 }),
    { closeDifference: 0, closeDifferenceOk: true },
  );
  assert.deepEqual(
    getCashClosingDifference({ closeForm: { valorFechamento: "340" }, expectedValue: 350 }),
    { closeDifference: -10, closeDifferenceOk: false },
  );
});

test("caixa valida suprimento, sangria e pagamento recebido", () => {
  const movement = validateCashMovement({
    tipo: "sangria",
    valor: "50,25",
    metodoPagamento: "DINHEIRO",
    parcelas: 4,
    descricao: "Retirada",
    observacao: "Envelope",
  });

  assert.equal(movement.payload.valor, 50.25);
  assert.equal(movement.payload.parcelas, 1);
  assert.equal(getCashMovementEndpointName("sangria"), "sangria");
  assert.equal(getCashMovementEndpointName("pagamentoRecebido"), "pagamentoRecebido");
  assert.equal(getCashMovementEndpointName("suprimento"), "suprimento");
  assert.match(validateCashMovement({ valor: "0" }).error, /valor válido/);
});

test("caixa valida recebimento de pedido e pagamento misto", () => {
  const selectedPendingOrder = { id: "pedido-1", valor: 180 };
  const receivePaymentForm = {
    metodoPagamento: "MISTO",
    parcelas: 1,
    pagamentos: { PIX: "100", DINHEIRO: "80", CARTAO_CREDITO: "", CARTAO_DEBITO: "" },
  };

  const readiness = getCashPaymentReadiness({
    caixa: caixaAberto,
    canOperate: true,
    receivePaymentForm,
    selectedOrderTotal: 180,
    selectedPendingOrder,
  });
  assert.equal(readiness.receivePaymentReady, true);
  assert.equal(readiness.receiveMixedDifference, 0);

  const validation = validateCashPaymentReceive({
    caixa: caixaAberto,
    canOperate: true,
    receivePaymentForm,
    selectedOrderTotal: 180,
    selectedPendingOrder,
  });
  assert.equal(validation.payload.metodoPagamento, "MISTO");
  assert.match(validation.payload.detalhesPagamento, /Pix:/);
  assert.match(validation.payload.detalhesPagamento, /Dinheiro:/);

  assert.match(
    validateCashPaymentReceive({
      caixa: null,
      canOperate: true,
      receivePaymentForm,
      selectedOrderTotal: 180,
      selectedPendingOrder,
    }).error,
    /Abra um caixa/,
  );
  assert.match(
    validateCashPaymentReceive({
      caixa: caixaAberto,
      canOperate: false,
      receivePaymentForm,
      selectedOrderTotal: 180,
      selectedPendingOrder,
    }).error,
    /permissão/,
  );
  assert.match(
    validateCashPaymentReceive({
      caixa: caixaAberto,
      canOperate: true,
      receivePaymentForm: { ...receivePaymentForm, pagamentos: { PIX: "50" } },
      selectedOrderTotal: 180,
      selectedPendingOrder,
    }).error,
    /pagamento misto/,
  );
});

test("caixa monta relatorios, historico e pedidos pendentes", () => {
  assert.equal(matchesCashBranchFilter(caixaAberto, "TODAS"), true);
  assert.equal(matchesCashBranchFilter(caixaAberto, "filial-1"), true);
  assert.equal(matchesCashBranchFilter(caixaAberto, "filial-2"), false);

  const closingRows = createCashClosingRows({ ...caixaAberto, valorFechamento: 350, divergencia: 0 });
  assert.equal(closingRows.find((row) => row.item === "Divergência").valor, "R$ 0,00");

  const movementRows = createCashMovementRows(caixaAberto);
  assert.equal(movementRows[0].Descrição, "Pedido P-001");
  assert.equal(movementRows[0].Observação, "Pix: R$ 80,00");

  const history = [
    caixaAberto,
    { ...caixaAberto, id: "caixa-2", status: "FECHADO", filialId: "filial-2", totalVendas: 120, saldoCalculado: 120, divergencia: -5 },
  ];
  const filteredHistory = filterCashHistory(history, { busca: "ana", status: "ABERTO", inicio: "", fim: "" });
  assert.deepEqual(filteredHistory.map((item) => item.id), ["caixa-1"]);
  assert.deepEqual(createCashHistoryTotals(history), { caixas: 2, vendas: 320, saldo: 470, divergencia: -5 });
  assert.equal(createCashHistoryRows(history)[0].operador, "Ana Operadora");

  const pendingOrders = [
    { id: "pedido-1", numero: "P-001", cliente: "Ana", valor: 180, itens: [{ produto: "Camiseta", quantidade: 2 }] },
    { id: "pedido-2", numero: "P-002", cliente: "Bruno", valor: 90, itens: [{ produto: "Tênis", quantidade: 1 }] },
  ];
  assert.deepEqual(filterPendingCashOrders(pendingOrders, "camiseta").map((pedido) => pedido.id), ["pedido-1"]);
  assert.equal(getSelectedPendingCashOrder(pendingOrders, "pedido-2").id, "pedido-2");
});

test("caixa recebe pedido, gera comprovante e atualiza fluxo operacional", async () => {
  const originalFinalizar = endpoints.pedidos.finalizar;
  const calls = [];
  const messages = [];
  const refreshes = [];
  const receivingStates = [];
  let lastReceipt = null;

  endpoints.pedidos.finalizar = async (id, payload) => {
    calls.push({ id, payload });
    return { id, numero: "P-009" };
  };

  const operations = useCashRegisterOperations({
    caixa: caixaAberto,
    canOperate: true,
    closeForm: {},
    movementForm: {},
    onRefresh: async () => refreshes.push("refresh"),
    openForm: {},
    receivePaymentForm: {
      metodoPagamento: "MISTO",
      parcelas: 1,
      pagamentos: { PIX: "100", DINHEIRO: "80", CARTAO_CREDITO: "", CARTAO_DEBITO: "" },
    },
    selectedCashBranchLabel: "Matriz",
    selectedOrderTotal: 180,
    selectedPendingOrder: {
      id: "pedido-9",
      numero: "P-009",
      cliente: "Ana Cliente",
      filial: "Matriz",
      itens: [{ produto: "Camiseta", quantidade: 2 }],
      valor: 180,
    },
    session: { nome: "Operadora" },
    setCashAction: () => {},
    setCashView: () => {},
    setCloseForm: () => {},
    setGeneratingCharge: () => {},
    setLastCashReceipt: (receipt) => {
      lastReceipt = receipt;
    },
    setMessage: (message) => messages.push(message),
    setMovementForm: () => {},
    setOpenForm: () => {},
    setReceivingOrder: (value) => receivingStates.push(value),
    setSaving: () => {},
    setSelectedCashCharge: () => {},
    setSelectedCashReport: () => {},
  });

  try {
    await operations.handleReceiveOrder("pedido-9");
  } finally {
    endpoints.pedidos.finalizar = originalFinalizar;
  }

  assert.equal(calls[0].id, "pedido-9");
  assert.equal(calls[0].payload.metodoPagamento, "MISTO");
  assert.match(calls[0].payload.detalhesPagamento, /Pix:/);
  assert.equal(lastReceipt.numero, "P-009");
  assert.equal(lastReceipt.cliente, "Ana Cliente");
  assert.equal(lastReceipt.total, 180);
  assert.deepEqual(refreshes, ["refresh"]);
  assert.deepEqual(receivingStates, ["pedido-9", ""]);
  assert.equal(messages.at(-1).text, "Pagamento recebido. Pedido enviado para retirada no estoque.");
});
