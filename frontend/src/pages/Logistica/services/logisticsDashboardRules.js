export function getRouteStatusValue(route) {
  return String(route?.status || "ABERTA").toUpperCase();
}

export function isRouteActive(route) {
  return ["ABERTA", "EM_ANDAMENTO", "EM_ROTA"].includes(getRouteStatusValue(route));
}

export function isRouteFinished(route) {
  return ["FINALIZADA", "FINALIZADO"].includes(getRouteStatusValue(route));
}

export function createLogisticsDashboardSummary({ deliveries = [], routes = [] }) {
  const pendingRoutes = routes.filter((route) => getRouteStatusValue(route) === "ABERTA");
  const activeRoutes = routes.filter(isRouteActive);
  const finishedRoutes = routes.filter(isRouteFinished);
  const deliveriesWithoutRoute = deliveries.filter((delivery) => !delivery.rotaId);
  const routesWithoutDriver = activeRoutes.filter((route) => !route.entregador);
  const routesWithoutVehicle = activeRoutes.filter((route) => !route.veiculo);
  const plannedDeliveries = routes.reduce(
    (total, route) => total + Number(route.quantidadeEntregas || 0),
    0,
  );
  const estimatedCost = routes.reduce(
    (total, route) => total + Number(route.custoEstimado || 0),
    0,
  );

  return {
    activeRoutes,
    costPerDelivery: plannedDeliveries > 0 ? estimatedCost / plannedDeliveries : 0,
    deliveriesWithoutRoute,
    estimatedCost,
    finishedRoutes,
    pendingRoutes,
    plannedDeliveries,
    routesWithoutDriver,
    routesWithoutVehicle,
  };
}

export function createLogisticsDispatchPlan({ deliveries = [], routes = [] }) {
  const summary = createLogisticsDashboardSummary({ deliveries, routes });
  return [
    summary.deliveriesWithoutRoute.length > 0 && {
      key: "deliveries-without-route",
      severity: "warning",
      title: "Entregas sem rota",
      action: "form-rota",
    },
    summary.routesWithoutDriver.length > 0 && {
      key: "routes-without-driver",
      severity: "warning",
      title: "Rotas sem motorista",
      action: "vinculo",
    },
    summary.routesWithoutVehicle.length > 0 && {
      key: "routes-without-vehicle",
      severity: "info",
      title: "Rotas sem veículo",
      action: "vinculo",
    },
  ].filter(Boolean);
}

export function createDriverPerformance(routes = []) {
  return Array.from(
    routes.reduce((map, route) => {
      const driver = route.entregador?.nome || "Sem entregador";
      if (driver === "Sem entregador") return map;
      const current = map.get(driver) || {
        motorista: driver,
        rotas: 0,
        entregas: 0,
        ativas: 0,
        finalizadas: 0,
        custo: 0,
      };
      current.rotas += 1;
      current.entregas += Number(route.quantidadeEntregas || 0);
      current.ativas += isRouteActive(route) ? 1 : 0;
      current.finalizadas += isRouteFinished(route) ? 1 : 0;
      current.custo += Number(route.custoEstimado || 0);
      map.set(driver, current);
      return map;
    }, new Map()).values(),
  )
    .map((item) => ({
      ...item,
      custoPorEntrega: item.entregas > 0 ? item.custo / item.entregas : 0,
      eficiencia: item.rotas > 0 ? (item.finalizadas / item.rotas) * 100 : 0,
    }))
    .sort((a, b) => b.entregas - a.entregas || b.finalizadas - a.finalizadas);
}

export function createLogisticsTimeline({ deliveries = [], routes = [] }) {
  return [
    ...routes.map((route) => ({
      id: `rota-${route.id}`,
      date: route.dataRota || route.dataCadastro,
      title: isRouteFinished(route) ? "Rota finalizada" : "Rota planejada",
      detail: `${route.nome || "Rota sem nome"} / ${route.entregador?.nome || "Sem entregador"}`,
      type: "route",
    })),
    ...deliveries.map((delivery) => ({
      id: `entrega-${delivery.id}`,
      date: delivery.dataCriacao || delivery.dataEntrega || delivery.dataAtualizacao,
      title: delivery.rotaId ? "Entrega vinculada a rota" : "Entrega aguardando rota",
      detail: `${delivery.numeroPedido || delivery.pedidoNumero || delivery.pedidoId || "Pedido sem número"} / ${delivery.cliente || delivery.clienteNome || "Cliente não informado"}`,
      type: "delivery",
    })),
  ]
    .filter((item) => item.date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
