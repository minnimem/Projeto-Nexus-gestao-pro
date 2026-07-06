export function validateVehicleForm(vehicleForm) {
  if (!String(vehicleForm.placa || "").trim()) return "Informe a placa do veículo.";
  return "";
}

export function buildVehiclePayload(vehicleForm) {
  return {
    ...vehicleForm,
    placa: vehicleForm.placa.trim().toUpperCase(),
    capacidadeKg: vehicleForm.capacidadeKg ? Number(vehicleForm.capacidadeKg) : null,
    ativo: true,
  };
}

export function validateDriverForm(driverForm) {
  if (!String(driverForm.nome || "").trim()) return "Informe o nome do entregador.";
  return "";
}

export function buildDriverPayload(driverForm) {
  return {
    ...driverForm,
    nome: driverForm.nome.trim(),
    ativo: true,
  };
}

export function validateCarrierForm(carrierForm) {
  if (!String(carrierForm.nome || "").trim()) return "Informe o nome da transportadora.";
  return "";
}

export function buildCarrierPayload(carrierForm) {
  return {
    ...carrierForm,
    nome: carrierForm.nome.trim(),
    documento: String(carrierForm.documento || "").replace(/\D/g, ""),
    ativo: true,
  };
}

export function validateRouteForm(routeForm) {
  if (!String(routeForm.nome || "").trim()) return "Informe o nome da rota.";
  if (!routeForm.dataRota) return "Informe a data da rota.";
  return "";
}

export function buildRoutePayload({ editingRoute = {}, routeForm }) {
  return {
    nome: routeForm.nome.trim(),
    dataRota: routeForm.dataRota,
    status: editingRoute.status || "ABERTA",
    horarioSaida: editingRoute.horarioSaida || null,
    horarioRetorno: editingRoute.horarioRetorno || null,
    quantidadeEntregas: routeForm.entregaIds.length,
    distanciaKm: routeForm.distanciaKm ? Number(routeForm.distanciaKm) : null,
    custoEstimado: routeForm.custoEstimado ? Number(routeForm.custoEstimado) : 0,
    pagamentoEntrega: routeForm.pagamentoEntrega,
    observacao: routeForm.observacao,
    entregador: editingRoute.entregador || null,
    veiculo: editingRoute.veiculo || null,
  };
}

export function buildRouteEditForm({ entregasDaRota, rota }) {
  return {
    nome: rota.nome || "",
    dataRota: rota.dataRota || new Date().toISOString().slice(0, 10),
    entregadorId: rota.entregador?.id || "",
    veiculoId: rota.veiculo?.id || "",
    quantidadeEntregas: rota.quantidadeEntregas || 0,
    distanciaKm: rota.distanciaKm || "",
    custoEstimado: rota.custoEstimado || "",
    pagamentoEntrega: rota.pagamentoEntrega || "JA_PAGO",
    observacao: rota.observacao || "",
    entregaIds: entregasDaRota(rota).map((entrega) => entrega.id),
  };
}

export function validateRouteRelationForm(relationForm) {
  if (!relationForm.rotaId) return "Selecione uma rota para relacionar.";
  if (!relationForm.entregadorId && !relationForm.veiculoId) return "Selecione motorista ou veículo para vincular.";
  return "";
}

export function getLogisticsDispatchState(action) {
  if (action === "abertas") return { routeFilter: "abertas", showRouteStatusPanel: true };
  if (action === "form-rota") return { activeLogisticsForm: "rota" };
  if (action === "vinculo") return { activeLogisticsForm: "relacao", showRouteStatusPanel: true };
  return {};
}

export function getRouteSaveMessage(isEditing) {
  return isEditing ? "Rota atualizada." : "Rota cadastrada.";
}

export function canDeleteRoute(route, deliveries = []) {
  if (!route?.id) {
    return { allowed: false, reason: "Rota nao encontrada." };
  }

  const routeStatus = String(route.status || "ABERTA").toUpperCase();
  const linkedDeliveryCount = deliveries.filter((delivery) => String(delivery.rotaId || "") === String(route.id)).length;
  const plannedDeliveryCount = Math.max(Number(route.quantidadeEntregas || 0), linkedDeliveryCount);

  if (["EM_ANDAMENTO", "EM_ROTA", "FINALIZADA", "FINALIZADO"].includes(routeStatus)) {
    return { allowed: false, reason: "Rota com operacao em andamento ou finalizada nao pode ser excluida." };
  }

  if (plannedDeliveryCount > 0) {
    return { allowed: false, reason: "Remova as entregas vinculadas antes de excluir a rota." };
  }

  return { allowed: true, reason: "" };
}

export function canDeleteCarrier(carrier, routes = []) {
  if (!carrier?.id) {
    return { allowed: false, reason: "Transportadora nao encontrada." };
  }

  const linkedRoutes = routes.filter((route) => String(route.transportadora?.id || route.transportadoraId || "") === String(carrier.id));
  const activeLinkedRoute = linkedRoutes.find((route) =>
    ["ABERTA", "EM_ANDAMENTO", "EM_ROTA"].includes(String(route.status || "ABERTA").toUpperCase()),
  );

  if (activeLinkedRoute) {
    return { allowed: false, reason: "Transportadora possui rota ativa vinculada." };
  }

  return { allowed: true, reason: "" };
}
