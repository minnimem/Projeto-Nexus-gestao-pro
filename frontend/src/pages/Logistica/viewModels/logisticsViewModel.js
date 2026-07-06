import { formatCurrency, formatDate, formatNumber, formatPercent, isDateBeforeToday } from "../../../utils/formatters";
import {
  getDeliveryAddress,
  getDeliveryBranchLabel,
  getDeliveryCustomer,
  getDeliveryOperationalStatus,
  getDeliveryOrderNumber,
  getRouteDeliveryCount,
  getRouteDriverName,
  getRouteStatus,
  getRouteVehicleLabel,
} from "./logisticsRouteDocuments";

export {
  getDeliveryAddress,
  getDeliveryBranchLabel,
  getDeliveryCustomer,
  getDeliveryOperationalStatus,
  getDeliveryOrderNumber,
  getRouteDeliveryCount,
  getRouteDriverName,
  getRoutePaymentLabel,
  getRouteStatus,
  getRouteVehicleLabel,
  printDeliveryReceipt,
  printRouteManifest,
} from "./logisticsRouteDocuments";

export function sortRoutesByDate(routes) {
  return [...routes].sort((a, b) => {
    const dateA = new Date(a.dataRota || a.dataCadastro || 0).getTime();
    const dateB = new Date(b.dataRota || b.dataCadastro || 0).getTime();
    return dateB - dateA;
  });
}

export function buildLogisticsViewModel({
  entregas,
  filiais,
  logisticsBranchFilter,
  rotas,
  routeFilter,
  routeFormEntregaIds,
}) {
  const selectedLogisticsBranchLabel = logisticsBranchFilter === "TODAS" ?
    "Todas as filiais"
    : logisticsBranchFilter === "EMPRESA" ?
      "Empresa / sem filial"
      : filiais.find((filial) => String(filial.id) === logisticsBranchFilter).nome || "Filial";
  const matchesLogisticsBranch = (item) => {
    if (logisticsBranchFilter === "TODAS") return true;
    if (logisticsBranchFilter === "EMPRESA") return !item.filialId;
    return String(item.filialId || "") === logisticsBranchFilter;
  };
  const branchScopedDeliveries = entregas.filter(matchesLogisticsBranch);
  const entregasDaRota = (rota) => branchScopedDeliveries.filter((entrega) => String(entrega.rotaId) === String(rota.id));
  const branchScopedRoutes = rotas.filter((rota) => {
    if (logisticsBranchFilter === "TODAS") return true;
    return entregasDaRota(rota).length > 0;
  });
  const routeById = new Map(branchScopedRoutes.map((rota) => [String(rota.id), rota]));
  const getScopedRouteDeliveryCount = (rota) => {
    const scopedDeliveries = entregasDaRota(rota);
    return scopedDeliveries.length > 0 ? scopedDeliveries.length : getRouteDeliveryCount(rota);
  };
  const getRouteBranchLabel = (rota) => {
    const routeBranches = Array.from(new Set(entregasDaRota(rota).map((entrega) => entrega.filial || "Empresa")));
    if (routeBranches.length === 0) return "Sem entregas";
    if (routeBranches.length === 1) return routeBranches[0];
    return `${formatNumber(routeBranches.length)} filiais`;
  };

  const rotasFila = sortRoutesByDate(branchScopedRoutes.filter((rota) => getRouteStatus(rota) === "ABERTA"));
  const rotasEmRota = sortRoutesByDate(
    branchScopedRoutes.filter((rota) => ["EM_ANDAMENTO", "EM_ROTA"].includes(getRouteStatus(rota))),
  );
  const rotasFinalizadas = sortRoutesByDate(
    branchScopedRoutes.filter((rota) => ["FINALIZADA", "FINALIZADO"].includes(getRouteStatus(rota))),
  );
  const rotasAtivas = rotasFila.length + rotasEmRota.length;
  const entregasPlanejadas = branchScopedRoutes.reduce(
    (total, rota) => total + getScopedRouteDeliveryCount(rota),
    0,
  );
  const custoEstimado = branchScopedRoutes.reduce(
    (total, rota) => total + Number(rota.custoEstimado || 0),
    0,
  );
  const todasRotas = sortRoutesByDate(branchScopedRoutes);
  const routeGroups = [
    { title: "Fila", detail: "Rotas abertas para despacho.", items: rotasFila },
    { title: "Em rota", detail: "Rotas em andamento agora.", items: rotasEmRota },
    { title: "Finalizadas", detail: "Histórico recente concluído.", items: rotasFinalizadas },
  ];
  const rotasAtrasadas = branchScopedRoutes.filter((rota) =>
    ["ABERTA", "EM_ANDAMENTO", "EM_ROTA"].includes(getRouteStatus(rota)) && rota.dataRota && isDateBeforeToday(rota.dataRota),
  );
  const entregasSemRota = branchScopedDeliveries.filter((entrega) => !entrega.rotaId);
  const rotasSemMotorista = branchScopedRoutes.filter((rota) =>
    ["ABERTA", "EM_ANDAMENTO", "EM_ROTA"].includes(getRouteStatus(rota)) && !rota.entregador,
  );
  const rotasSemVeiculo = branchScopedRoutes.filter((rota) =>
    ["ABERTA", "EM_ANDAMENTO", "EM_ROTA"].includes(getRouteStatus(rota)) && !rota.veiculo,
  );
  const custoPorEntrega = entregasPlanejadas > 0 ? custoEstimado / entregasPlanejadas : 0;
  const logisticsDispatchPlan = [
    rotasAtrasadas.length > 0 && {
      key: "routes-overdue",
      severity: "danger",
      title: "Rotas atrasadas",
      detail: `${formatNumber(rotasAtrasadas.length)} rota(s) ativa(s) com data anterior a hoje.`,
      actionLabel: "Ver abertas",
      action: "abertas",
    },
    entregasSemRota.length > 0 && {
      key: "deliveries-without-route",
      severity: "warning",
      title: "Entregas sem rota",
      detail: `${formatNumber(entregasSemRota.length)} entrega(s) aguardam planejamento de rota.`,
      actionLabel: "Criar rota",
      action: "form-rota",
    },
    rotasSemMotorista.length > 0 && {
      key: "routes-without-driver",
      severity: "warning",
      title: "Rotas sem motorista",
      detail: `${formatNumber(rotasSemMotorista.length)} rota(s) precisam de entregador vinculado.`,
      actionLabel: "Vincular",
      action: "vinculo",
    },
    rotasSemVeiculo.length > 0 && {
      key: "routes-without-vehicle",
      severity: "info",
      title: "Rotas sem veículo",
      detail: `${formatNumber(rotasSemVeiculo.length)} rota(s) precisam de veículo definido.`,
      actionLabel: "Vincular",
      action: "vinculo",
    },
  ].filter(Boolean);
  const logisticsDispatchRows = (
    logisticsDispatchPlan.length > 0
      ?
      logisticsDispatchPlan
      : [{
          severity: "success",
          title: "Despacho sem bloqueios imediatos",
          detail: "Rotas e entregas carregadas não indicam atraso ou falta de vínculo.",
        }]
  ).map((item) => ({
    Prioridade: item.severity === "danger" ? "Crítica" : item.severity === "warning" ? "Atenção" : item.severity === "info" ? "Informativa" : "Ok",
    Acao: item.title,
    Detalhe: item.detail,
    Filial: selectedLogisticsBranchLabel,
  }));
  const driverPerformance = Array.from(
    branchScopedRoutes.reduce((map, rota) => {
      const driver = getRouteDriverName(rota);
      if (driver === "Sem entregador") return map;
      const current = map.get(driver) || {
        motorista: driver,
        rotas: 0,
        entregas: 0,
        ativas: 0,
        finalizadas: 0,
        atrasadas: 0,
        custo: 0,
      };
      const status = getRouteStatus(rota);
      current.rotas += 1;
      current.entregas += getScopedRouteDeliveryCount(rota);
      current.ativas += ["ABERTA", "EM_ANDAMENTO", "EM_ROTA"].includes(status) ? 1 : 0;
      current.finalizadas += ["FINALIZADA", "FINALIZADO"].includes(status) ? 1 : 0;
      current.atrasadas += rotasAtrasadas.some((item) => String(item.id) === String(rota.id)) ? 1 : 0;
      current.custo += Number(rota.custoEstimado || 0);
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
  const driverPerformanceRows = driverPerformance.map((item) => ({
    Motorista: item.motorista,
    Rotas: formatNumber(item.rotas),
    Entregas: formatNumber(item.entregas),
    Ativas: formatNumber(item.ativas),
    Finalizadas: formatNumber(item.finalizadas),
    Atrasadas: formatNumber(item.atrasadas),
    "Custo total": formatCurrency(item.custo),
    "Custo por entrega": formatCurrency(item.custoPorEntrega),
    Eficiencia: `${formatPercent(item.eficiencia)}%`,
  }));
  const logisticsTimeline = [
    ...branchScopedRoutes.map((rota) => {
      const status = getRouteStatus(rota);
      const delayed = ["ABERTA", "EM_ANDAMENTO", "EM_ROTA"].includes(status) && rota.dataRota && isDateBeforeToday(rota.dataRota);
      return {
        id: `rota-${rota.id}`,
        date: rota.dataRota || rota.dataCadastro,
        tone: delayed ? "danger" : ["FINALIZADA", "FINALIZADO"].includes(status) ? "success" : "info",
        title: delayed ? "Rota atrasada" : ["FINALIZADA", "FINALIZADO"].includes(status) ? "Rota finalizada" : "Rota planejada",
        detail: `${rota.nome || "Rota sem nome"} / ${getRouteDriverName(rota)} / ${formatNumber(getScopedRouteDeliveryCount(rota))} entrega(s)`,
        meta: `${getRouteBranchLabel(rota)} / ${getRouteVehicleLabel(rota)} / ${getRoutePaymentLabel(rota)}`,
      };
    }),
    ...branchScopedDeliveries.map((entrega) => ({
      id: `entrega-${entrega.id}`,
      date: entrega.dataCriacao || entrega.dataEntrega || entrega.dataAtualizacao,
      tone: entrega.rotaId ? "success" : "warning",
      title: entrega.rotaId ? "Entrega vinculada a rota" : "Entrega aguardando rota",
      detail: `${getDeliveryOrderNumber(entrega)} / ${getDeliveryCustomer(entrega)}`,
      meta: `${getDeliveryBranchLabel(entrega)} / ${getDeliveryAddress(entrega)}`,
    })),
  ]
    .filter((item) => item.date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 12);
  const logisticsTimelineRows = logisticsTimeline.map((item) => ({
    Data: formatDate(item.date),
    Evento: item.title,
    Detalhe: item.detail,
    Complemento: item.meta,
    Prioridade: item.tone === "danger" ? "Crítica" : item.tone === "warning" ? "Atenção" : item.tone === "success" ? "Concluído" : "Info",
  }));
  const routeMapCards = sortRoutesByDate(branchScopedRoutes)
    .filter((rota) => !["FINALIZADA", "FINALIZADO"].includes(getRouteStatus(rota)))
    .slice(0, 6)
    .map((rota) => {
      const deliveries = entregasDaRota(rota);
      const delayed = rota.dataRota && isDateBeforeToday(rota.dataRota);
      return {
        rota,
        deliveries,
        delayed,
        stops: deliveries.length > 0 ? deliveries : Array.from({ length: getScopedRouteDeliveryCount(rota) }),
      };
    });
  const routeMapRows = routeMapCards.map((item) => ({
    Rota: item.rota.nome || item.rota.id,
    Status: getRouteStatus(item.rota),
    Motorista: getRouteDriverName(item.rota),
    Veiculo: getRouteVehicleLabel(item.rota),
    Data: formatDate(item.rota.dataRota),
    Entregas: formatNumber(item.stops.length),
    Situacao: item.delayed ? "Atrasada" : "Em dia",
  }));
  const deliveryStatusColumns = [
    { status: "PENDENTE", label: "Pendente", detail: "Aguardando planejamento" },
    { status: "EM_ROTA", label: "Em rota", detail: "Despachada para campo" },
    { status: "ENTREGUE", label: "Entregue", detail: "Finalizada com cliente" },
    { status: "ATRASADO", label: "Atrasado", detail: "Fora do prazo previsto" },
    { status: "CANCELADO", label: "Cancelado", detail: "Entrega interrompida" },
  ].map((column) => {
    const items = branchScopedDeliveries.filter((entrega) =>
      getDeliveryOperationalStatus(entrega, routeById.get(String(entrega.rotaId))) === column.status,
    );
    return {
      ...column,
      items,
      total: items.reduce((sum, entrega) => sum + Number(entrega.totalPedido || entrega.valorPedido || 0), 0),
    };
  });
  const deliveryStatusRows = deliveryStatusColumns.map((column) => ({
    Status: column.label,
    Entregas: formatNumber(column.items.length),
    Valor: formatCurrency(column.total),
    Detalhe: column.detail,
    Filial: selectedLogisticsBranchLabel,
  }));
  const routeFilterOptions = [
    { value: "todas", label: "Todas", items: todasRotas, empty: "Nenhuma rota cadastrada." },
    { value: "abertas", label: "Abertas", items: rotasFila, empty: "Nenhuma rota aberta." },
    { value: "em_rota", label: "Em rota", items: rotasEmRota, empty: "Nenhuma rota em andamento." },
    {
      value: "finalizadas",
      label: "Finalizadas",
      items: rotasFinalizadas,
      empty: "Nenhuma rota finalizada.",
    },
  ];
  const selectedRouteFilter =
    routeFilterOptions.find((option) => option.value === routeFilter) || routeFilterOptions[0];
  const rotasFiltradas = selectedRouteFilter.items;
  const logisticsExportRows = [
    ...branchScopedDeliveries.map((entrega) => ({
      Tipo: "Entrega",
      Filial: entrega.filial || "Empresa / sem filial",
      "Código": getDeliveryOrderNumber(entrega),
      Cliente: getDeliveryCustomer(entrega),
      Status: getDeliveryOperationalStatus(entrega, routeById.get(String(entrega.rotaId))),
      Prioridade: entrega.prioridade || "-",
      Rota: entrega.rotaNome || "-",
      Endereco: getDeliveryAddress(entrega),
      Valor: formatCurrency(entrega.totalPedido || 0),
    })),
    ...branchScopedRoutes.map((rota) => ({
      Tipo: "Rota",
      Filial: getRouteBranchLabel(rota),
      "Código": rota.nome || rota.id,
      Cliente: getRouteDriverName(rota),
      Status: getRouteStatus(rota),
      Prioridade: formatDate(rota.dataRota),
      Rota: rota.nome || "-",
      Endereco: getRouteVehicleLabel(rota),
      Valor: formatCurrency(rota.custoEstimado || 0),
    })),
  ];
  const routeDeliveryIds = new Set(routeFormEntregaIds);
  const entregasDisponiveis = branchScopedDeliveries.filter((entrega) => {
    const status = String(entrega.status || "PENDENTE").toUpperCase();
    const podePlanejar = !["ENTREGUE", "CANCELADO"].includes(status);
    return podePlanejar && (!entrega.rotaId || routeDeliveryIds.has(entrega.id));
  });

  return {
    branchScopedDeliveries,
    branchScopedRoutes,
    custoEstimado,
    custoPorEntrega,
    deliveryStatusColumns,
    deliveryStatusRows,
    driverPerformance,
    driverPerformanceRows,
    entregasDaRota,
    entregasDisponiveis,
    entregasPlanejadas,
    entregasSemRota,
    getRouteBranchLabel,
    getScopedRouteDeliveryCount,
    logisticsDispatchPlan,
    logisticsDispatchRows,
    logisticsExportRows,
    logisticsTimeline,
    logisticsTimelineRows,
    routeFilterOptions,
    routeGroups,
    routeMapCards,
    routeMapRows,
    rotasAtrasadas,
    rotasAtivas,
    rotasEmRota,
    rotasFila,
    rotasFiltradas,
    rotasFinalizadas,
    selectedLogisticsBranchLabel,
    selectedRouteFilter,
  };
}
