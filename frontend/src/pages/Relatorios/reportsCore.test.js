import assert from "node:assert/strict";
import test from "node:test";
import { buildBranchFiscalReportViewModel } from "./viewModels/branchFiscalReportViewModel.js";
import { buildCommercialReportViewModel } from "./viewModels/commercialReportViewModel.js";
import { buildExecutiveReportViewModel } from "./viewModels/executiveReportViewModel.js";
import {
  getSelectedReportFields,
  getSelectedReportRows,
  setReportFieldPresetSelection,
  toggleReportFieldSelection,
} from "./viewModels/reportFieldSelectionViewModel.js";
import { buildReportCardsViewModel } from "./viewModels/reportCardsViewModel.js";
import { buildReportScheduleViewModel } from "./viewModels/reportScheduleViewModel.js";
import { buildSalesPeriodViewModel } from "./viewModels/salesPeriodReportViewModel.js";

const pedidos = [
  {
    id: "pedido-1",
    numero: "P-001",
    clienteId: "cliente-1",
    cliente: "Cliente A",
    filialId: "filial-1",
    filial: "Loja Centro",
    status: "FINALIZADA",
    valor: 120,
    metodoPagamento: "PIX",
    data: "2026-07-05T12:00:00",
    itens: [{ produto: "Produto A", quantidade: 2, preco: 50, subtotal: 100 }],
  },
  {
    id: "pedido-2",
    numero: "P-002",
    clienteId: "cliente-2",
    cliente: "Cliente B",
    filialId: "filial-2",
    filial: "Loja Norte",
    status: "ORCAMENTO",
    valor: 80,
    metodoPagamento: "DINHEIRO",
    data: "2026-07-05T12:00:00",
    itens: [],
  },
  {
    id: "pedido-3",
    numero: "P-003",
    clienteId: "cliente-1",
    cliente: "Cliente A",
    filialId: "filial-1",
    filial: "Loja Centro",
    status: "ENTREGUE",
    valor: 200,
    metodoPagamento: "CARTAO_CREDITO",
    data: "2026-07-04T12:00:00",
    itens: [{ produto: "Produto B", quantidade: 1, preco: 200 }],
  },
];

const clientes = [
  { id: "cliente-1", nome: "Cliente A", telefone: "11" },
  { id: "cliente-3", nome: "Cliente Inativo", telefone: "22", ultimaCompra: "2026-01-01" },
];

const financeiro = [
  { filialId: "filial-1", filial: "Loja Centro", tipo: "RECEITA", status: "APROVADO", valor: 300, data: "2026-07-05" },
  { filialId: "filial-1", filial: "Loja Centro", tipo: "DESPESA", status: "APROVADO", valor: 50, data: "2026-07-05" },
  { filialId: "filial-2", filial: "Loja Norte", tipo: "RECEITA", status: "PENDENTE", valor: 90, data: "2026-07-05" },
];

test("relatorios valida vendas por periodo e filtros de data", () => {
  const daily = buildSalesPeriodViewModel({
    pedidos,
    salesReportFilter: { inicio: "2026-07-05", fim: "2026-07-05" },
    salesReportPeriod: "diario",
  });

  assert.equal(daily.salesReportCount, 1);
  assert.equal(daily.salesReportTotal, 120);
  assert.equal(daily.salesReportRows.length, 1);
  assert.match(daily.salesReportRows[0].formasPagamento, /Pix/);

  const monthly = buildSalesPeriodViewModel({
    pedidos,
    salesReportFilter: { inicio: "", fim: "" },
    salesReportPeriod: "mensal",
  });
  assert.equal(monthly.salesReportCount, 2);
  assert.equal(monthly.salesReportTotal, 320);
});

test("relatorios valida comercial, fiscal por filial e executivo", () => {
  const sales = buildSalesPeriodViewModel({
    pedidos,
    salesReportFilter: { inicio: "", fim: "" },
    salesReportPeriod: "diario",
  });
  const commercial = buildCommercialReportViewModel({
    clientes,
    filteredPedidos: pedidos,
    salesReportTotal: sales.salesReportTotal,
    todayKey: "2026-07-05",
    vendasConcluidas: sales.vendasConcluidas,
  });

  assert.equal(commercial.paymentReportRows.length, 2);
  assert.equal(commercial.customerRevenueReportRows[0].Cliente, "Cliente A");
  assert.equal(commercial.dormantCustomerRows[0].Cliente, "Cliente Inativo");
  assert.equal(commercial.productSalesReportRows.length, 2);

  const fiscal = buildBranchFiscalReportViewModel({
    canSeeCollaborators: true,
    canSeeFinance: true,
    documentosFiscaisPorPedido: {
      "pedido-1": [{ modelo: "NFE", serie: "1", numero: "15", status: "AUTORIZADA", protocolo: "123" }],
    },
    filteredFinanceiro: financeiro,
    filteredPedidos: pedidos,
    filteredUsuarios: [{ filialId: "filial-1", filial: "Loja Centro", perfil: "GERENTE", ativo: true }],
    vendasConcluidas: sales.vendasConcluidas,
  });

  assert.equal(fiscal.branchReportRows[0].Filial, "Loja Centro");
  assert.equal(fiscal.financeBranchReportRows.length, 2);
  assert.equal(fiscal.fiscalPreparedCount, 1);
  assert.equal(fiscal.collaboratorBranchReportRows[0].Filial, "Loja Centro");

  const executive = buildExecutiveReportViewModel({
    bestBranchPerformance: fiscal.bestBranchPerformance,
    bestPeriodRow: sales.bestPeriodRow,
    canSeeCollaborators: true,
    canSeeFinance: true,
    canSeeLogistics: true,
    clientes,
    dominantPaymentMethod: commercial.dominantPaymentMethod,
    filteredEntregas: [{ status: "ATRASADA" }],
    filteredFinanceiro: financeiro,
    filteredPedidos: pedidos,
    filteredRotas: [{ id: "rota-1" }],
    filteredUsuarios: [{ ativo: true }],
    produtos: [{ id: "produto-1" }],
    salesReportFilter: { inicio: "2026-07-01", fim: "2026-07-05" },
    todayKey: "2026-07-05",
  });

  assert.equal(executive.executiveInsightRows.some((row) => row.Area === "Vendas"), true);
  assert.equal(executive.moduleAnalyticsRows.some((row) => row.Modulo === "Logística"), true);
  assert.equal(executive.executiveHighlightCards.length, 4);
});

test("relatorios valida dados vazios sem erro", () => {
  const sales = buildSalesPeriodViewModel({
    pedidos: [],
    salesReportFilter: { inicio: "", fim: "" },
    salesReportPeriod: "diario",
  });
  const executive = buildExecutiveReportViewModel({
    bestBranchPerformance: null,
    bestPeriodRow: null,
    canSeeCollaborators: false,
    canSeeFinance: false,
    canSeeLogistics: false,
    clientes: [],
    dominantPaymentMethod: null,
    filteredEntregas: [],
    filteredFinanceiro: [],
    filteredPedidos: [],
    filteredRotas: [],
    filteredUsuarios: [],
    produtos: [],
    salesReportFilter: { inicio: "", fim: "" },
    todayKey: "2026-07-05",
  });

  assert.equal(sales.salesReportRows.length, 0);
  assert.equal(executive.currentRevenue, 0);
  assert.equal(executive.executiveHighlightCards[0].value, "-");
});

test("relatorios valida cards, selecao de campos e exportacao de linhas", () => {
  const cardsModel = buildReportCardsViewModel({
    canSeeCollaborators: true,
    canSeeFinance: true,
    canSeeLogistics: true,
    clientes,
    filteredEntregas: [{ id: "entrega-1", numeroPedido: "P-001", filial: "Loja Centro", rotaId: "rota-1" }],
    filteredFinanceiro: financeiro,
    filteredPedidos: pedidos,
    filteredRotas: [{ id: "rota-1", nome: "Rota Centro", status: "ABERTA" }],
    filteredUsuarios: [{ nome: "Ana", login: "ana", filial: "Loja Centro", perfil: "GERENTE" }],
    produtos: [{ nome: "Produto A", codigoBarras: "123" }],
    selectedReportBranchLabel: "Todas as filiais",
  });

  assert.equal(cardsModel.reportCards.some((card) => card.key === "pedidos"), true);
  assert.equal(cardsModel.exportaveis > 0, true);
  const pedidosCard = cardsModel.reportCards.find((card) => card.key === "pedidos");

  assert.deepEqual(getSelectedReportFields(pedidosCard, {}).includes("numero"), true);
  const toggled = toggleReportFieldSelection({}, cardsModel.reportCards, "pedidos", "valor");
  assert.equal(toggled.pedidos.includes("valor"), false);
  const essential = setReportFieldPresetSelection(toggled, cardsModel.reportCards, "pedidos", "essential");
  assert.equal(essential.pedidos.includes("numero"), true);
  const selectedRows = getSelectedReportRows(pedidosCard, { pedidos: ["numero", "cliente"] });
  assert.deepEqual(Object.keys(selectedRows[0]), ["numero", "cliente"]);
});

test("relatorios valida agenda visual de relatorios", () => {
  const card = {
    key: "pedidos",
    title: "Vendas",
    rows: [{ numero: "P-001", cliente: "Cliente A" }],
  };

  const schedule = buildReportScheduleViewModel({
    executiveInsightRows: [{ Area: "Vendas", Indicador: "Receita" }],
    moduleAnalyticsRows: [{ Modulo: "Vendas", Status: "Ok" }],
    reportCards: [card],
    reportFieldSelection: { pedidos: ["numero"] },
    reportSchedule: {
      active: true,
      report: "pedidos",
      frequency: "weekly",
      format: "csv",
      nextDate: "2026-07-05",
    },
    selectedReportBranchLabel: "Todas as filiais",
    todayKey: "2026-07-05",
  });

  assert.equal(schedule.selectedScheduleOption.label, "Vendas");
  assert.equal(schedule.scheduleState.label, "Vence hoje");
  assert.equal(schedule.reportScheduleRows.length, 4);
  assert.deepEqual(schedule.selectedScheduleOption.rows, [{ numero: "P-001" }]);
});
