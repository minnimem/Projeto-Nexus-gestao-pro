import assert from "node:assert/strict";
import test from "node:test";

import { useOverviewActivityData } from "./hooks/useOverviewActivityData.js";
import { buildOverviewInsightsViewModel } from "./viewModels/overviewInsightsViewModel.js";
import { buildOverviewPeriodViewModel } from "./viewModels/overviewPeriodViewModel.js";

const periodRange = { startKey: "2026-06-01", endKey: "2026-06-30" };
const todayKey = "2026-06-15";

const pedidos = [
  { id: "p1", numero: "001", cliente: "Cliente Ouro", data: "2026-06-05T12:00:00", status: "FINALIZADA", valor: 1200, filialId: "f1", usuario: "Ana" },
  { id: "p2", numero: "002", cliente: "Cliente Prata", data: "2026-06-08T12:00:00", status: "PENDENTE", valor: 500, filialId: "f1" },
  { id: "p3", numero: "003", cliente: "Cliente Bronze", data: "2026-05-25T12:00:00", status: "FINALIZADA", valor: 600 },
];

const caixas = [
  {
    id: "c1",
    dataAbertura: "2026-06-15T12:00:00",
    status: "ABERTO",
    totalVendas: 900,
    totalPagamentosRecebidos: 100,
    movimentos: [{ tipo: "VENDA" }, { tipo: "PAGAMENTO_RECEBIDO" }, { tipo: "SANGRIA" }],
  },
];

const estoqueBaixo = [
  { id: "e1", nomeProduto: "Produto Crítico", quantidadeAtual: 1, estoqueMinimo: 5 },
];

const financeiro = {
  lucro: 300,
  lancamentos: 2,
  movimentacoes: [
    { id: "f1", status: "PENDENTE", dataVencimento: "2026-06-10T12:00:00", descricao: "Conta vencida" },
    { id: "f2", status: "PENDENTE", dataVencimento: "2026-06-18T12:00:00", descricao: "Conta a vencer" },
  ],
};

test("Visao Geral calcula periodo, indicadores e resumo por filial", () => {
  const model = buildOverviewPeriodViewModel({
    caixas,
    entregas: [{ id: "entrega-1", filialId: "f1" }],
    filiais: [{ id: "f1", nome: "Filial Centro" }],
    pedidos,
    periodRange,
    todayKey,
    usuarios: [{ id: "u1", filialId: "f1", ativo: true }],
  });

  assert.equal(model.periodPedidos.length, 2);
  assert.equal(model.periodCompletedPedidos.length, 1);
  assert.equal(model.periodPendingOrders.length, 1);
  assert.equal(model.periodRevenue, 1200);
  assert.equal(model.previousRevenue, 600);
  assert.equal(model.periodCashRevenue, 1000);
  assert.equal(model.periodCashMovements, 2);
  assert.equal(model.todayCashRevenue, 1000);
  assert.equal(model.openCashRegisters, 1);
  assert.equal(model.branchOverviewRows[0].filial, "Filial Centro");
  assert.equal(model.branchOverviewRows[0].receita, 1200);
});

test("Visao Geral monta alertas, BI, recomendações e exportação operacional", () => {
  const periodModel = buildOverviewPeriodViewModel({
    caixas,
    entregas: [{ id: "entrega-1" }],
    filiais: [],
    pedidos,
    periodRange,
    todayKey,
    usuarios: [{ id: "u1", ativo: true }],
  });

  const model = buildOverviewInsightsViewModel({
    canSeeAdmin: true,
    canSeeFinance: true,
    canSeeLogistics: true,
    clientes: [],
    dailyReportDate: todayKey,
    dismissedAutomationAlerts: [],
    entregadores: [{ id: "m1" }],
    entregas: [{ id: "entrega-1" }],
    estoqueBaixo,
    financeiro,
    isCashOperator: false,
    periodAverageTicket: periodModel.periodAverageTicket,
    periodCashMovements: periodModel.periodCashMovements,
    periodCashRevenue: periodModel.periodCashRevenue,
    periodCashTicket: periodModel.periodCashTicket,
    periodCompletedPedidos: periodModel.periodCompletedPedidos,
    periodDays: periodModel.periodDays,
    periodPendingOrders: periodModel.periodPendingOrders,
    periodPedidos: periodModel.periodPedidos,
    periodRevenue: periodModel.periodRevenue,
    pedidos,
    previousRevenue: periodModel.previousRevenue,
    produtos: [],
    revenueChangeLabel: periodModel.revenueChangeLabel,
    revenueChangePercent: periodModel.revenueChangePercent,
    rotas: [],
    todayKey,
    usuarios: [{ id: "u1" }],
    vendas: { ticketMedio: 200, vendasHoje: 1200, totalVendas: 1, pedidosPendentes: 1 },
    veiculos: [{ id: "v1" }],
  });

  assert.equal(model.rotasAtivas, 0);
  assert.ok(model.activeAutomationAlerts.some((alert) => alert.title === "Estoque baixo"));
  assert.ok(model.activeAutomationAlerts.some((alert) => alert.title === "Conta vencida"));
  assert.equal(model.executiveSnapshot.length, 4);
  assert.equal(model.dailyReportRows.some((row) => row.Indicador === "Alertas ativos"), true);
  assert.equal(model.operationalBiRows.length, 5);
  assert.equal(model.operationalBiExportRows[0].Area, "Comercial");
  assert.ok(model.aiRecommendations.some((item) => item.area === "Reposição inteligente"));
  assert.ok(model.actions.includes("Cadastre produtos para liberar vendas no PDV."));
});

test("Visao Geral monta atividade recente, prioridades e widgets visiveis", () => {
  const model = useOverviewActivityData({
    estoqueBaixo,
    financeiro,
    isCashOperator: false,
    periodCaixas: caixas,
    periodCompletedPedidos: [pedidos[0]],
    periodPedidos: pedidos.slice(0, 2),
    periodPreset: "sevenDays",
    periodRange,
    session: { perfil: "ADMIN" },
    todayKey,
    widgetLayout: {
      order: ["bi", "trend", "activity", "orders", "priorities"],
      hidden: ["trend"],
    },
  });

  assert.equal(model.overviewTrendRows.length, 7);
  assert.deepEqual(model.visibleWidgetIds, ["bi", "activity", "orders", "priorities"]);
  assert.equal(model.visibleWidgetLabels.includes("BI operacional"), true);
  assert.equal(model.recentActivityRows.some((row) => row.tipo === "Venda"), true);
  assert.equal(model.recentActivityRows.some((row) => row.descricao.includes("abaixo do mínimo")), true);
});
