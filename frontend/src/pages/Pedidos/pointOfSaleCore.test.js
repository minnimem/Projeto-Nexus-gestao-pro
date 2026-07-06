import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import test from "node:test";
import {
  buildCartItem,
  findProductFromSearch,
  normalizeCartQuantity,
  removeCartItem,
  updateCartItemQuantity,
  upsertCartItem,
  validateProductForCart,
} from "./services/pointOfSaleCart.js";
import {
  getPointOfSalePaymentView,
  getPointOfSaleTotals,
} from "./services/pointOfSaleTotals.js";
import {
  buildPointOfSaleOrderPayload,
  buildPointOfSalePaymentPayload,
} from "./services/pointOfSaleSubmissionPayload.js";
import { getPointOfSaleSubmissionError } from "./services/pointOfSaleSubmissionValidation.js";
import { buildProposalCsvRows, buildQuotePayload } from "./services/pointOfSaleProposal.js";
import { buildPointOfSaleReceipt, getPointOfSaleSuccessMessage } from "./services/pointOfSaleReceipt.js";
import { getSalesKpiData } from "./services/salesKpis.js";
import { getSellerPerformance } from "./services/sellerPerformance.js";
import { api } from "../../services/api.js";
import { endpoints } from "../../services/resources.js";

const produtoBase = {
  id: "produto-1",
  nome: "Camiseta",
  codigoBarras: "789",
  precoVenda: 100,
  quantidadeAtual: 5,
  ativo: true,
};

const session = {
  usuarioId: "usuario-1",
  filialId: "filial-1",
};

function buildValidCartItem(overrides = {}) {
  return {
    produtoId: "produto-1",
    nome: "Camiseta",
    codigoBarras: "789",
    preco: 100,
    quantidade: 2,
    estoqueDisponivel: 5,
    ...overrides,
  };
}

test("PDV adiciona, atualiza e remove produto do carrinho", () => {
  const validation = validateProductForCart({ cart: [], produto: produtoBase, quantity: "2.8" });
  assert.equal(validation.error, undefined);
  assert.equal(validation.quantityToAdd, 2);

  const cartItem = buildCartItem({ produto: produtoBase, ...validation });
  assert.deepEqual(cartItem, buildValidCartItem());

  const cart = upsertCartItem([], cartItem);
  assert.equal(cart.length, 1);

  const updatedCart = updateCartItemQuantity(cart, "produto-1", 4);
  assert.equal(updatedCart[0].quantidade, 4);

  const incrementedCart = upsertCartItem(updatedCart, buildValidCartItem({ quantidade: 1 }));
  assert.equal(incrementedCart[0].quantidade, 5);

  const emptyCart = removeCartItem(incrementedCart, "produto-1");
  assert.equal(emptyCart.length, 0);
  assert.equal(normalizeCartQuantity("0"), 1);
});

test("PDV localiza produto ativo por codigo ou comando de quantidade", () => {
  const produtos = [
    produtoBase,
    { ...produtoBase, id: "produto-2", nome: "Inativo", codigoBarras: "000", ativo: false },
  ];

  assert.equal(findProductFromSearch({ productSearch: "789", produtos }).productToAdd.id, "produto-1");

  const result = findProductFromSearch({ productSearch: "3x camiseta", produtos });
  assert.equal(result.quantity, 3);
  assert.equal(result.productToAdd.id, "produto-1");
});

test("PDV busca produto em lista grande com tempo controlado", () => {
  const produtos = Array.from({ length: 5000 }, (_, index) => ({
    id: `produto-${index}`,
    nome: `Produto ${index}`,
    codigoBarras: `789${index}`,
    precoVenda: 10 + index,
    quantidadeAtual: 5,
    ativo: index % 17 !== 0,
  }));
  produtos.push({
    id: "produto-alvo",
    nome: "Scanner Premium",
    codigoBarras: "ABC-999",
    precoVenda: 299,
    quantidadeAtual: 3,
    ativo: true,
  });

  const startedAt = performance.now();
  const result = findProductFromSearch({ productSearch: "2x ABC-999", produtos });
  const elapsedMs = performance.now() - startedAt;

  assert.equal(result.quantity, 2);
  assert.equal(result.productToAdd.id, "produto-alvo");
  assert.ok(elapsedMs < 50, `Busca do PDV demorou ${elapsedMs.toFixed(2)}ms`);
});

test("PDV calcula desconto e pagamento misto", () => {
  const cart = [buildValidCartItem()];
  const totals = getPointOfSaleTotals({
    cart,
    discount: 10,
    discountAmount: "",
    discountMode: "percent",
  });

  assert.equal(totals.subtotal, 200);
  assert.equal(totals.descontoValor, 20);
  assert.equal(totals.discountPayload, 10);
  assert.equal(totals.total, 180);

  const paymentView = getPointOfSalePaymentView({
    cart,
    cashMode: true,
    isMixedPayment: true,
    mixedPayments: { PIX: "100", DINHEIRO: "80", CARTAO_CREDITO: "", CARTAO_DEBITO: "" },
    paymentInstallments: 1,
    paymentMethod: "MISTO",
    receivedAmount: "",
    selectedClienteId: "cliente-1",
    total: totals.total,
  });

  assert.equal(paymentView.cashReceiptReady, true);
  assert.equal(paymentView.mixedPaymentDifference, 0);
  assert.match(paymentView.cashReceiptDetail, /distribuído/);
});

test("PDV valida cliente, produto, estoque e pagamento antes de finalizar", () => {
  const validCart = [buildValidCartItem()];
  const base = {
    caixa: { id: "caixa-1" },
    canOperateCash: true,
    cart: validCart,
    cashMode: true,
    isMixedPayment: false,
    mixedPaymentDifference: 0,
    paymentMethod: "PIX",
    received: 200,
    selectedClienteId: "cliente-1",
    session,
    total: 200,
  };

  assert.equal(getPointOfSaleSubmissionError({ ...base, selectedClienteId: "" }), "Selecione o cliente da venda.");
  assert.equal(getPointOfSaleSubmissionError({ ...base, cart: [] }), "Adicione pelo menos um produto.");
  assert.match(
    getPointOfSaleSubmissionError({ ...base, cart: [buildValidCartItem({ quantidade: 6 })] }),
    /não possui estoque suficiente/,
  );
  assert.equal(
    getPointOfSaleSubmissionError({ ...base, paymentMethod: "DINHEIRO", received: 100 }),
    "Valor recebido em dinheiro menor que o total da venda.",
  );
  assert.equal(
    getPointOfSaleSubmissionError({ ...base, isMixedPayment: true, mixedPaymentDifference: -10 }),
    "A soma do pagamento misto deve ser igual ao total da venda.",
  );
  assert.equal(getPointOfSaleSubmissionError(base), "");
});

test("PDV monta payload de pedido, cobranca e parcelamento", () => {
  const cart = [buildValidCartItem({ quantidade: 3 })];
  const orderPayload = buildPointOfSaleOrderPayload({
    cart,
    deliveryAddress: "Rua A, 100",
    deliveryNote: "Entregar pela manhã",
    deliveryType: "ENTREGA",
    discountPayload: 5,
    paymentInstallments: 3,
    paymentMethod: "CARTAO_CREDITO",
    priority: "ALTA",
    selectedClienteId: "cliente-1",
    session,
  });

  assert.deepEqual(orderPayload.itens, [{ produtoId: "produto-1", quantidade: 3 }]);
  assert.equal(orderPayload.clienteId, "cliente-1");
  assert.equal(orderPayload.usuarioId, "usuario-1");
  assert.equal(orderPayload.prioridade, "Alta");
  assert.equal(orderPayload.parcelas, 3);
  assert.equal(orderPayload.enderecoEntrega, "Rua A, 100");

  const paymentPayload = buildPointOfSalePaymentPayload({
    isMixedPayment: true,
    mixedPayments: { PIX: "120", DINHEIRO: "60", CARTAO_CREDITO: "", CARTAO_DEBITO: "" },
    paymentInstallments: 3,
    paymentMethod: "CARTAO_CREDITO",
  });

  assert.equal(paymentPayload.parcelas, 3);
  assert.match(paymentPayload.detalhesPagamento, /Pix: /);
  assert.match(paymentPayload.detalhesPagamento, /Dinheiro: /);
});

test("PDV monta pedido normal com recibo e mensagem de status", () => {
  const cart = [buildValidCartItem({ quantidade: 2 })];
  const pedido = { id: "pedido-1", numero: "P-001" };
  const vendaRecebida = { id: "pedido-1", numero: "P-001" };

  const orderPayload = buildPointOfSaleOrderPayload({
    cart,
    deliveryAddress: "",
    deliveryNote: "Retirada no balcao",
    deliveryType: "RETIRADA",
    discountPayload: 0,
    paymentInstallments: 1,
    paymentMethod: "PIX",
    priority: "NORMAL",
    selectedClienteId: "cliente-1",
    session,
  });

  assert.equal(orderPayload.clienteId, "cliente-1");
  assert.equal(orderPayload.orcamento, undefined);
  assert.deepEqual(orderPayload.itens, [{ produtoId: "produto-1", quantidade: 2 }]);

  const receipt = buildPointOfSaleReceipt({
    cart,
    change: 0,
    descontoValor: 0,
    mixedPayments: {},
    paymentInstallments: 1,
    paymentMethod: "PIX",
    pedido,
    received: 200,
    selectedCliente: { nome: "Ana Cliente" },
    session: { ...session, nome: "Operador" },
    subtotal: 200,
    total: 200,
    vendaRecebida,
  });

  assert.equal(receipt.numero, "P-001");
  assert.equal(receipt.cliente, "Ana Cliente");
  assert.equal(receipt.vendedor, "Operador");
  assert.equal(receipt.itens.length, 1);
  assert.match(getPointOfSaleSuccessMessage({ cashMode: true, deliveryType: "RETIRADA", pedido }), /recebida no caixa/);
  assert.match(getPointOfSaleSuccessMessage({ cashMode: false, deliveryType: "ENTREGA", pedido }), /logística|logÃ­stica/);
});

test("PDV monta payload e linhas de orcamento", () => {
  const cart = [buildValidCartItem({ quantidade: 1 })];
  const quotePayload = buildQuotePayload({
    cart,
    deliveryAddress: "",
    deliveryNote: "Retirada no balcão",
    deliveryType: "RETIRADA",
    discountPayload: 0,
    paymentInstallments: 1,
    paymentMethod: "PIX",
    priority: "NORMAL",
    quoteConditions: "Validade promocional",
    quoteValidity: "2026-07-12",
    selectedClienteId: "cliente-1",
    session,
  });

  assert.equal(quotePayload.orcamento, true);
  assert.equal(quotePayload.enderecoEntrega, "");
  assert.deepEqual(quotePayload.itens, [{ produtoId: "produto-1", quantidade: 1 }]);

  const rows = buildProposalCsvRows({
    proposalBranchLabel: "Matriz",
    proposalNumber: "PROP-1",
    proposalRows: [{ Produto: "Camiseta", Quantidade: 1 }],
    selectedCliente: { nome: "Ana Cliente" },
    total: 100,
  });

  assert.equal(rows.at(-1).Cliente, "Ana Cliente");
  assert.equal(rows.at(-1).Código, "");
});

test("vendas calcula dashboard, ranking, comissoes e metas de vendedor", () => {
  const orders = [
    { id: "p1", usuario: "Ana", status: "CONCLUIDO", valor: 700, data: "2026-07-05", filial: "Matriz" },
    { id: "p2", usuario: "Ana", status: "ENTREGUE", valor: 300, data: "2026-07-06", filial: "Matriz" },
    { id: "p3", usuario: "Bruno", status: "PENDENTE", valor: 200, data: "2026-07-06", filial: "Matriz" },
    { id: "p4", usuario: "Bruno", status: "ORCAMENTO", valor: 150, data: "2026-07-06", filial: "Matriz" },
  ];
  const completed = orders.filter((pedido) => ["CONCLUIDO", "ENTREGUE"].includes(pedido.status));

  const seller = getSellerPerformance({
    branchScopedOrders: orders,
    commissionPercent: 5,
    selectedSalesBranchLabel: "Matriz",
    sellerRankingFilter: { inicio: "2026-07-01", fim: "2026-07-31" },
    sellers: [{ nome: "Ana", metaVendas: 1200 }, { nome: "Bruno", metaVendas: 800 }],
  });

  assert.equal(seller.sellerCommissionSummary[0].vendedor, "Ana");
  assert.equal(seller.sellerCommissionSummary[0].total, 1000);
  assert.equal(seller.sellerCommissionSummary[0].comissao, 50);
  assert.equal(seller.sellerCommissionSummary[0].faltam, 200);
  assert.equal(Math.round(seller.sellerRankingProgress), 83);

  const kpis = getSalesKpiData({
    branchCompletedOrders: completed,
    branchScopedOrders: orders,
    sellerRankingGoal: seller.sellerRankingGoal,
    sellerRankingProgress: seller.sellerRankingProgress,
    sellerRankingTotal: seller.sellerRankingTotal,
  });

  assert.equal(kpis.salesKpis.totalVendas, 2);
  assert.equal(kpis.salesKpis.pendentes, 1);
  assert.equal(kpis.salesKpis.orcamentos, 1);
  assert.equal(kpis.salesOpenAmount, 350);
  assert.equal(kpis.salesKpiPulseCards.some((card) => card.label === "Meta vendedores"), true);
});

test("pedidos expoe contrato para converter orcamento em pedido", async () => {
  const originalPatch = api.patch;
  const calls = [];
  api.patch = async (path, body) => {
    calls.push({ path, body });
    return { id: "pedido-1", status: "PENDENTE" };
  };

  try {
    const response = await endpoints.pedidos.converterOrcamento("pedido-1");
    assert.equal(response.status, "PENDENTE");
    assert.deepEqual(calls, [{ path: "/pedidos/pedido-1/converter-orcamento", body: undefined }]);
  } finally {
    api.patch = originalPatch;
  }
});
