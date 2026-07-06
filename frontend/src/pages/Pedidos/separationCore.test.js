import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import test from "node:test";
import { SEPARATION_STAGE } from "./constants/separation.js";
import {
  canCancelInconsistentOrder,
  canFinishSeparation,
  canStartSeparation,
  getSeparationCompletionStatus,
  getSeparationStage,
  getSeparationStartLabel,
  getSeparationStatusLabel,
  isSeparationQueueOrder,
} from "./services/separationRules.js";
import {
  getFilteredSeparationOrders,
  getSeparationOrdersTotal,
  getSeparationStageCounts,
} from "./services/separationQueue.js";
import { separationService } from "./services/separationService.js";
import { useOrderWorkflowActions } from "./hooks/useOrderWorkflowActions.js";
import { endpoints } from "../../services/resources.js";

const pedidos = [
  {
    id: "pedido-1",
    numero: "P-001",
    cliente: "Ana Cliente",
    status: "PENDENTE",
    tipoEntrega: "ENTREGA",
    valor: 150,
    itens: [{ produto: { nome: "Camiseta" }, quantidade: 2 }],
  },
  {
    id: "pedido-2",
    numero: "P-002",
    cliente: "Bruno Cliente",
    status: "SEPARACAO",
    tipoEntrega: "RETIRADA_LOJA",
    valor: 90,
    itens: [{ produto: { nome: "Tênis" }, quantidade: 1 }],
  },
  {
    id: "pedido-3",
    numero: "P-003",
    cliente: "Carla Cliente",
    status: "SEPARADO",
    tipoEntrega: "ENTREGA",
    valor: 210,
    itens: [{ produto: { nome: "Mochila" }, quantidade: 1 }],
  },
];

test("separacao classifica fila, status visual e acoes permitidas", () => {
  assert.equal(isSeparationQueueOrder(pedidos[0]), true);
  assert.equal(isSeparationQueueOrder({ status: "PENDENTE", tipoEntrega: "RETIRADA_LOJA" }), false);

  assert.equal(getSeparationStage(pedidos[0]), SEPARATION_STAGE.WAITING);
  assert.equal(getSeparationStage(pedidos[1]), SEPARATION_STAGE.IN_PROGRESS);
  assert.equal(getSeparationStage(pedidos[2]), SEPARATION_STAGE.READY);

  assert.equal(getSeparationStatusLabel(pedidos[0]), "Aguardando separação");
  assert.equal(getSeparationStatusLabel(pedidos[1]), "Em separação");
  assert.equal(getSeparationStatusLabel(pedidos[2]), "Pronto para despacho");

  assert.equal(canStartSeparation(pedidos[0]), true);
  assert.equal(canFinishSeparation(pedidos[1]), true);
  assert.equal(canStartSeparation(pedidos[2]), false);
  assert.equal(canFinishSeparation(pedidos[2]), false);
});

test("separacao aplica filtros por etapa, entrega e busca", () => {
  const counts = getSeparationStageCounts(pedidos);
  assert.deepEqual(counts, {
    [SEPARATION_STAGE.WAITING]: 1,
    [SEPARATION_STAGE.IN_PROGRESS]: 1,
    [SEPARATION_STAGE.READY]: 1,
  });

  const inProgress = getFilteredSeparationOrders({
    deliveryFilter: "TODOS",
    normalizedSearch: "",
    separationOrders: pedidos,
    stageFilter: SEPARATION_STAGE.IN_PROGRESS,
  });
  assert.deepEqual(inProgress.map((pedido) => pedido.id), ["pedido-2"]);

  const delivery = getFilteredSeparationOrders({
    deliveryFilter: "ENTREGA",
    normalizedSearch: "",
    separationOrders: pedidos,
    stageFilter: SEPARATION_STAGE.ALL,
  });
  assert.deepEqual(delivery.map((pedido) => pedido.id), ["pedido-1", "pedido-3"]);

  const search = getFilteredSeparationOrders({
    deliveryFilter: "TODOS",
    normalizedSearch: "mochila",
    separationOrders: pedidos,
    stageFilter: SEPARATION_STAGE.ALL,
  });
  assert.deepEqual(search.map((pedido) => pedido.id), ["pedido-3"]);
  assert.equal(getSeparationOrdersTotal(delivery), 360);
});

test("separacao filtra fila grande com tempo controlado", () => {
  const largeOrders = Array.from({ length: 6000 }, (_, index) => ({
    id: `pedido-${index}`,
    numero: `P-${String(index).padStart(5, "0")}`,
    cliente: index === 4321 ? "Cliente Alvo" : `Cliente ${index}`,
    status: index % 3 === 0 ? "PENDENTE" : index % 3 === 1 ? "SEPARACAO" : "SEPARADO",
    tipoEntrega: index % 2 === 0 ? "ENTREGA" : "RETIRADA_LOJA",
    valor: 100 + index,
    itens: [{ produto: { nome: index === 4321 ? "Produto Especial" : `Produto ${index}` }, quantidade: 1 }],
  }));

  const startedAt = performance.now();
  const filtered = getFilteredSeparationOrders({
    deliveryFilter: "ENTREGA",
    normalizedSearch: "",
    separationOrders: largeOrders,
    stageFilter: SEPARATION_STAGE.ALL,
  });
  const elapsedMs = performance.now() - startedAt;

  assert.equal(filtered.length, 3000);
  assert.ok(elapsedMs < 50, `Filtro de separacao demorou ${elapsedMs.toFixed(2)}ms`);

  const searched = getFilteredSeparationOrders({
    deliveryFilter: "TODOS",
    normalizedSearch: "produto especial",
    separationOrders: largeOrders,
    stageFilter: SEPARATION_STAGE.ALL,
  });

  assert.deepEqual(searched.map((pedido) => pedido.id), ["pedido-4321"]);
});

test("separacao define status final conforme tipo de entrega", () => {
  assert.equal(getSeparationStartLabel("RETIRADA_LOJA"), "Retirar estoque");
  assert.equal(getSeparationStartLabel("ENTREGA"), "Iniciar");
  assert.equal(getSeparationCompletionStatus("RETIRADA_LOJA"), "CONCLUIDO");
  assert.equal(getSeparationCompletionStatus("ENTREGA"), "SEPARADO");
});

test("separacao permite cancelamento administrativo apenas para pedidos inconsistentes", () => {
  assert.equal(canCancelInconsistentOrder({ status: "PENDENTE", itens: [] }), true);
  assert.equal(canCancelInconsistentOrder({ status: "SEPARACAO", itens: [] }), true);
  assert.equal(canCancelInconsistentOrder({ status: "PENDENTE", itens: [{ id: "item-1" }] }), false);
  assert.equal(canCancelInconsistentOrder({ status: "CANCELADO", itens: [] }), false);
  assert.equal(canCancelInconsistentOrder({ status: "CONCLUIDO", itens: [] }), false);
});

test("separacao direciona acoes para endpoints de workflow e cancelamento", async () => {
  const calls = [];
  const originalPedidos = endpoints.pedidos;

  endpoints.pedidos = {
    ...originalPedidos,
    cancelarInconsistente: async (id) => calls.push(["cancel", id]),
    cancelarInconsistentes: async (ids) => calls.push(["cancelBatch", ids]),
    concluirSeparacao: async (id) => calls.push(["finish", id]),
    iniciarSeparacao: async (id) => calls.push(["start", id]),
  };

  try {
    await separationService.start("pedido-1");
    await separationService.finish("pedido-2");
    await separationService.cancelInconsistent("pedido-3");
    await separationService.cancelInconsistentBatch(["pedido-4", "pedido-5"]);
  } finally {
    endpoints.pedidos = originalPedidos;
  }

  assert.deepEqual(calls, [
    ["start", "pedido-1"],
    ["finish", "pedido-2"],
    ["cancel", "pedido-3"],
    ["cancelBatch", ["pedido-4", "pedido-5"]],
  ]);
});

test("separacao atualiza status operacional para estoque e despacho", async () => {
  const originalStart = separationService.start;
  const originalFinish = separationService.finish;
  const calls = [];
  const filters = [];
  const messages = [];
  const savingStates = [];
  const refreshes = [];

  separationService.start = async (id) => calls.push(["start", id]);
  separationService.finish = async (id) => calls.push(["finish", id]);

  const actions = useOrderWorkflowActions({
    onRefresh: async () => refreshes.push("refresh"),
    setOrderMessage: (message) => messages.push(message),
    setOrderStatusFilter: (status) => filters.push(status),
    setSavingOrderAction: (value) => savingStates.push(value),
  });

  try {
    await actions.handleSeparationAction("pedido-retirada", "finish", "RETIRADA_LOJA");
    await actions.handleSeparationAction("pedido-entrega", "finish", "ENTREGA");
  } finally {
    separationService.start = originalStart;
    separationService.finish = originalFinish;
  }

  assert.deepEqual(calls, [
    ["finish", "pedido-retirada"],
    ["finish", "pedido-entrega"],
  ]);
  assert.deepEqual(filters, ["CONCLUIDO", "SEPARADO"]);
  assert.equal(messages[1].text, "Retirada no estoque concluída.");
  assert.equal(messages[3].text, "Pedido separado e pronto para despacho.");
  assert.deepEqual(refreshes, ["refresh", "refresh"]);
  assert.deepEqual(savingStates, ["pedido-retirada", "", "pedido-entrega", ""]);
});
