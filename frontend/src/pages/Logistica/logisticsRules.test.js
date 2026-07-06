import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCarrierPayload,
  buildDriverPayload,
  buildRouteEditForm,
  buildRoutePayload,
  buildVehiclePayload,
  canDeleteCarrier,
  canDeleteRoute,
  getLogisticsDispatchState,
  getRouteSaveMessage,
  validateCarrierForm,
  validateDriverForm,
  validateRouteForm,
  validateRouteRelationForm,
  validateVehicleForm,
} from "./services/logisticsRules.js";
import {
  createDriverPerformance,
  createLogisticsDashboardSummary,
  createLogisticsDispatchPlan,
  createLogisticsTimeline,
} from "./services/logisticsDashboardRules.js";

test("logistica valida e monta payloads de veiculo, entregador e transportadora", () => {
  assert.equal(validateVehicleForm({ placa: "" }), "Informe a placa do veículo.");
  assert.deepEqual(buildVehiclePayload({ placa: " abc1234 ", modelo: "Van", capacidadeKg: "1200" }), {
    placa: "ABC1234",
    modelo: "Van",
    capacidadeKg: 1200,
    ativo: true,
  });

  assert.equal(validateDriverForm({ nome: "" }), "Informe o nome do entregador.");
  assert.deepEqual(buildDriverPayload({ nome: " Joao ", telefone: "11" }), {
    nome: "Joao",
    telefone: "11",
    ativo: true,
  });

  assert.equal(validateCarrierForm({ nome: "" }), "Informe o nome da transportadora.");
  assert.deepEqual(buildCarrierPayload({ nome: " Azul Cargo ", documento: "12.345.678/0001-90" }), {
    nome: "Azul Cargo",
    documento: "12345678000190",
    ativo: true,
  });
});

test("logistica valida e monta payload de rota", () => {
  const routeForm = {
    nome: " Rota Centro ",
    dataRota: "2026-07-06",
    entregadorId: "entregador-1",
    veiculoId: "veiculo-1",
    distanciaKm: "18.5",
    custoEstimado: "75",
    pagamentoEntrega: "JA_PAGO",
    observacao: "Priorizar janela comercial",
    entregaIds: ["entrega-1", "entrega-2"],
  };

  assert.equal(validateRouteForm({ ...routeForm, nome: "" }), "Informe o nome da rota.");
  assert.equal(validateRouteForm({ ...routeForm, dataRota: "" }), "Informe a data da rota.");
  assert.equal(validateRouteForm(routeForm), "");
  assert.deepEqual(buildRoutePayload({ editingRoute: {}, routeForm }), {
    nome: "Rota Centro",
    dataRota: "2026-07-06",
    status: "ABERTA",
    horarioSaida: null,
    horarioRetorno: null,
    quantidadeEntregas: 2,
    distanciaKm: 18.5,
    custoEstimado: 75,
    pagamentoEntrega: "JA_PAGO",
    observacao: "Priorizar janela comercial",
    entregador: null,
    veiculo: null,
  });

  assert.equal(getRouteSaveMessage(false), "Rota cadastrada.");
  assert.equal(getRouteSaveMessage(true), "Rota atualizada.");
});

test("logistica prepara edicao de rota e vinculos operacionais", () => {
  const rota = {
    id: "rota-1",
    nome: "Rota Norte",
    dataRota: "2026-07-07",
    entregador: { id: "entregador-1" },
    veiculo: { id: "veiculo-1" },
    quantidadeEntregas: 3,
    distanciaKm: 30,
    custoEstimado: 120,
    pagamentoEntrega: "NA_ENTREGA",
    observacao: "Levar comprovante",
  };
  const entregasDaRota = () => [{ id: "entrega-1" }, { id: "entrega-2" }];

  assert.deepEqual(buildRouteEditForm({ entregasDaRota, rota }), {
    nome: "Rota Norte",
    dataRota: "2026-07-07",
    entregadorId: "entregador-1",
    veiculoId: "veiculo-1",
    quantidadeEntregas: 3,
    distanciaKm: 30,
    custoEstimado: 120,
    pagamentoEntrega: "NA_ENTREGA",
    observacao: "Levar comprovante",
    entregaIds: ["entrega-1", "entrega-2"],
  });

  assert.equal(validateRouteRelationForm({ rotaId: "", entregadorId: "", veiculoId: "" }), "Selecione uma rota para relacionar.");
  assert.equal(validateRouteRelationForm({ rotaId: "rota-1", entregadorId: "", veiculoId: "" }), "Selecione motorista ou veículo para vincular.");
  assert.equal(validateRouteRelationForm({ rotaId: "rota-1", entregadorId: "entregador-1", veiculoId: "" }), "");
});

test("logistica define atalhos de despacho", () => {
  assert.deepEqual(getLogisticsDispatchState("abertas"), { routeFilter: "abertas", showRouteStatusPanel: true });
  assert.deepEqual(getLogisticsDispatchState("form-rota"), { activeLogisticsForm: "rota" });
  assert.deepEqual(getLogisticsDispatchState("vinculo"), { activeLogisticsForm: "relacao", showRouteStatusPanel: true });
  assert.deepEqual(getLogisticsDispatchState("outro"), {});
});

test("logistica calcula dashboard, pendencias e entregas sem rota", () => {
  const routes = [
    { id: "rota-1", status: "ABERTA", quantidadeEntregas: 2, custoEstimado: 100 },
    { id: "rota-2", status: "EM_ROTA", quantidadeEntregas: 1, custoEstimado: 50, entregador: { nome: "Ana" } },
    { id: "rota-3", status: "FINALIZADA", quantidadeEntregas: 3, custoEstimado: 120, entregador: { nome: "Ana" }, veiculo: { placa: "ABC1234" } },
  ];
  const deliveries = [
    { id: "entrega-1", rotaId: "rota-1" },
    { id: "entrega-2", rotaId: "" },
  ];

  const summary = createLogisticsDashboardSummary({ deliveries, routes });
  assert.deepEqual(summary.pendingRoutes.map((route) => route.id), ["rota-1"]);
  assert.deepEqual(summary.deliveriesWithoutRoute.map((delivery) => delivery.id), ["entrega-2"]);
  assert.deepEqual(summary.routesWithoutDriver.map((route) => route.id), ["rota-1"]);
  assert.deepEqual(summary.routesWithoutVehicle.map((route) => route.id), ["rota-1", "rota-2"]);
  assert.equal(summary.plannedDeliveries, 6);
  assert.equal(summary.estimatedCost, 270);
  assert.equal(summary.costPerDelivery, 45);

  assert.deepEqual(createLogisticsDispatchPlan({ deliveries, routes }).map((item) => item.key), [
    "deliveries-without-route",
    "routes-without-driver",
    "routes-without-vehicle",
  ]);
});

test("logistica calcula performance de entregador e linha do tempo", () => {
  const routes = [
    { id: "rota-1", nome: "Rota 1", status: "EM_ROTA", quantidadeEntregas: 2, custoEstimado: 100, entregador: { nome: "Ana" }, dataRota: "2026-07-05" },
    { id: "rota-2", nome: "Rota 2", status: "FINALIZADA", quantidadeEntregas: 3, custoEstimado: 120, entregador: { nome: "Ana" }, dataRota: "2026-07-04" },
    { id: "rota-3", nome: "Rota 3", status: "ABERTA", quantidadeEntregas: 1, custoEstimado: 30, dataRota: "2026-07-03" },
  ];
  const deliveries = [
    { id: "entrega-1", rotaId: "rota-1", numeroPedido: "P-001", cliente: "Cliente A", dataCriacao: "2026-07-06" },
    { id: "entrega-2", rotaId: "", numeroPedido: "P-002", cliente: "Cliente B", dataCriacao: "2026-07-02" },
  ];

  const performance = createDriverPerformance(routes);
  assert.equal(performance.length, 1);
  assert.equal(performance[0].motorista, "Ana");
  assert.equal(performance[0].rotas, 2);
  assert.equal(performance[0].entregas, 5);
  assert.equal(performance[0].finalizadas, 1);
  assert.equal(performance[0].eficiencia, 50);

  const timeline = createLogisticsTimeline({ deliveries, routes });
  assert.equal(timeline[0].id, "entrega-entrega-1");
  assert.equal(timeline[0].title, "Entrega vinculada a rota");
  assert.equal(timeline.at(-1).title, "Entrega aguardando rota");
});

test("logistica valida exclusao segura de rota e transportadora", () => {
  assert.deepEqual(canDeleteRoute(null), {
    allowed: false,
    reason: "Rota nao encontrada.",
  });
  assert.deepEqual(canDeleteRoute({ id: "rota-1", status: "EM_ROTA" }), {
    allowed: false,
    reason: "Rota com operacao em andamento ou finalizada nao pode ser excluida.",
  });
  assert.deepEqual(canDeleteRoute({ id: "rota-1", status: "ABERTA" }, [{ id: "entrega-1", rotaId: "rota-1" }]), {
    allowed: false,
    reason: "Remova as entregas vinculadas antes de excluir a rota.",
  });
  assert.deepEqual(canDeleteRoute({ id: "rota-1", status: "ABERTA", quantidadeEntregas: 0 }, []), {
    allowed: true,
    reason: "",
  });

  assert.deepEqual(canDeleteCarrier(null), {
    allowed: false,
    reason: "Transportadora nao encontrada.",
  });
  assert.deepEqual(
    canDeleteCarrier({ id: "transportadora-1" }, [{ id: "rota-1", status: "ABERTA", transportadoraId: "transportadora-1" }]),
    {
      allowed: false,
      reason: "Transportadora possui rota ativa vinculada.",
    },
  );
  assert.deepEqual(
    canDeleteCarrier({ id: "transportadora-1" }, [{ id: "rota-1", status: "FINALIZADA", transportadora: { id: "transportadora-1" } }]),
    {
      allowed: true,
      reason: "",
    },
  );
});
