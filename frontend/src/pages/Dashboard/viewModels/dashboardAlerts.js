import { normalizeStatus } from "../../../components/common/StatusUi";
import {
  asList,
  formatNumber,
  getLocalDateKey,
  isDateBeforeToday,
  isDateWithinNextDays,
} from "../../../utils/formatters";

export function getAlertDismissKey(alert) {
  return `${alert.id}:${alert.signature || alert.detail || alert.tone}`;
}

function getAlertCounts(data) {
  const produtos = asList(data.produtos);
  const estoqueBaixoApi = asList(data.estoqueBaixo);
  const estoqueBaixoFallback = produtos.filter((produto) => {
    const estoque = Number(produto.estoqueAtual ?? produto.estoque ?? produto.quantidade ?? 0);
    const minimo = Number(produto.estoqueMinimo ?? produto.minimo ?? 0);
    return minimo > 0 && estoque <= minimo;
  });
  const routes = asList(data.rotas).length > 0 ? asList(data.rotas) : asList(data.logistica.rotas);

  return {
    dueCommercialFollowUps: asList(data.followUpsComerciais).filter((item) =>
      item.status === "PENDENTE" && getLocalDateKey(item.proximaAcao) === getLocalDateKey(),
    ).length,
    fiscalCertificateExpired: asList(data.configuracoesFiscais).filter((config) =>
      config.ativo && config.certificadoValidoAte && isDateBeforeToday(config.certificadoValidoAte),
    ).length,
    fiscalCertificateExpiring: asList(data.configuracoesFiscais).filter((config) =>
      config.ativo && config.certificadoValidoAte && isDateWithinNextDays(config.certificadoValidoAte, 30),
    ).length,
    internalComms: asList(data.usuarios).filter((usuario) =>
      usuario.ativo !== false
      && !usuario.bloqueado
      && (!usuario.filialId || !String(usuario.cargo || "").trim() || !String(usuario.departamento || "").trim()),
    ).length,
    overdueCommercialFollowUps: asList(data.followUpsComerciais).filter((item) =>
      item.status === "PENDENTE" && item.proximaAcao && isDateBeforeToday(item.proximaAcao),
    ).length,
    overdueFinanceFollowUps: asList(data.followUps).filter((item) =>
      item.status === "PENDENTE" && item.proximaAcao && isDateBeforeToday(item.proximaAcao),
    ).length,
    overdueRoutes: routes.filter((rota) =>
      ["ABERTA", "EM_ANDAMENTO"].includes(String(rota.status || "")) && rota.dataRota && isDateBeforeToday(rota.dataRota),
    ).length,
    pendingOrders: asList(data.pedidos).filter((pedido) =>
      ["PENDENTE", "SEPARACAO", "SEPARADO"].includes(normalizeStatus(pedido.status)),
    ).length,
    stockLow: Math.max(estoqueBaixoApi.length, estoqueBaixoFallback.length),
  };
}

export function buildDashboardAlerts({ active, data, error, financeCriticalCount, status }) {
  const counts = getAlertCounts(data);
  const alerts = [];

  if (status === "error") {
    alerts.push({ id: "module-error", title: "Módulo com atenção", detail: error || "Falha ao carregar dados do módulo atual.", signature: `${active}:${error || "erro"}`, tone: "danger", module: active, actionLabel: "Ver módulo" });
  }
  if (counts.stockLow > 0) {
    alerts.push({ id: "stock-low", title: "Reposição de estoque", detail: `${formatNumber(counts.stockLow)} produto(s) abaixo do mínimo operacional.`, signature: counts.stockLow, tone: "warning", module: "produtos", actionLabel: "Abrir estoque" });
  }
  if (counts.pendingOrders > 0) {
    alerts.push({ id: "orders-pending", title: "Pedidos em andamento", detail: `${formatNumber(counts.pendingOrders)} pedido(s) pendente(s), em separação ou separado(s).`, signature: counts.pendingOrders, tone: "info", module: "pedidos", actionLabel: "Abrir vendas" });
  }
  if (financeCriticalCount > 0) {
    alerts.push({ id: "finance-critical", title: "Financeiro crítico", detail: `${formatNumber(financeCriticalCount)} alerta(s) financeiro(s) para revisar.`, signature: financeCriticalCount, tone: "warning", module: "financeiro", actionLabel: "Abrir financeiro" });
  }
  if (counts.overdueCommercialFollowUps > 0) {
    alerts.push({ id: "commercial-followups-overdue", title: "Follow-ups comerciais atrasados", detail: `${formatNumber(counts.overdueCommercialFollowUps)} follow-up(s) comercial(is) com próxima acao vencida.`, signature: counts.overdueCommercialFollowUps, tone: "danger", module: "pedidos", actionLabel: "Abrir CRM" });
  } else if (counts.dueCommercialFollowUps > 0) {
    alerts.push({ id: "commercial-followups-today", title: "Follow-ups comerciais para hoje", detail: `${formatNumber(counts.dueCommercialFollowUps)} contato(s) comercial(is) programado(s) para hoje.`, signature: counts.dueCommercialFollowUps, tone: "info", module: "pedidos", actionLabel: "Abrir CRM" });
  }
  if (counts.overdueFinanceFollowUps > 0) {
    alerts.push({ id: "finance-followups-overdue", title: "Cobranças atrasadas", detail: `${formatNumber(counts.overdueFinanceFollowUps)} follow-up(s) de cobranca com próxima acao vencida.`, signature: counts.overdueFinanceFollowUps, tone: "warning", module: "financeiro", actionLabel: "Abrir financeiro" });
  }
  if (counts.overdueRoutes > 0) {
    alerts.push({ id: "routes-overdue", title: "Rotas atrasadas", detail: `${formatNumber(counts.overdueRoutes)} rota(s) ativa(s) com data anterior a hoje.`, signature: counts.overdueRoutes, tone: "warning", module: "logistica", actionLabel: "Abrir logística" });
  }
  if (counts.fiscalCertificateExpired > 0) {
    alerts.push({ id: "fiscal-certificate-expired", title: "Certificado fiscal vencido", detail: `${formatNumber(counts.fiscalCertificateExpired)} configuração(ões) fiscal(is) ativa(s) com certificado vencido.`, signature: counts.fiscalCertificateExpired, tone: "danger", module: "usuarios", actionLabel: "Abrir admin" });
  } else if (counts.fiscalCertificateExpiring > 0) {
    alerts.push({ id: "fiscal-certificate-expiring", title: "Certificado fiscal vencendo", detail: `${formatNumber(counts.fiscalCertificateExpiring)} configuração(ões) fiscal(is) ativa(s) vencem em até 30 dias.`, signature: counts.fiscalCertificateExpiring, tone: "warning", module: "usuarios", actionLabel: "Abrir admin" });
  }
  if (counts.internalComms > 0) {
    alerts.push({ id: "internal-comms", title: "Comunicado interno", detail: `${formatNumber(counts.internalComms)} colaborador(es) ativo(s) precisam de alinhamento de filial, cargo ou departamento.`, signature: counts.internalComms, tone: "info", module: "colaboradores", actionLabel: "Abrir colaboradores" });
  }
  if (status === "loading") {
    alerts.push({ id: "syncing", title: "Sincronizando dados", detail: "O módulo atual está buscando dados reais da API.", signature: active, tone: "info" });
  }
  if (alerts.length === 0) {
    alerts.push({ id: "all-clear", title: "Sistema online", detail: "Nenhum alerta crítico no topo agora.", tone: "success" });
  }

  return alerts;
}

export function createDashboardAlertViewModel(alerts, dismissedAlerts, filter) {
  const visibleAlerts = alerts.filter((alert) =>
    alert.tone === "success" || !dismissedAlerts.includes(getAlertDismissKey(alert)),
  );
  const dismissableAlerts = visibleAlerts.filter((alert) => alert.tone !== "success");
  const summary = {
    danger: visibleAlerts.filter((alert) => alert.tone === "danger").length,
    warning: visibleAlerts.filter((alert) => alert.tone === "warning").length,
    info: visibleAlerts.filter((alert) => alert.tone === "info").length,
  };
  const badgeTone = summary.danger > 0 ? "danger" : summary.warning > 0 ? "warning" : summary.info > 0 ? "info" : "success";
  const priorityText = summary.danger > 0 ?
    "Ação crítica recomendada"
    : summary.warning > 0 ?
      "Atencoes operacionais abertas"
      : summary.info > 0 ?
        "Informações para acompanhamento"
        : "Operação sem alertas ativos";

  return {
    activeAlertCount: dismissableAlerts.length,
    badgeTone,
    dismissableAlerts,
    dismissedAlertCount: alerts.filter((alert) =>
      alert.tone !== "success" && dismissedAlerts.includes(getAlertDismissKey(alert)),
    ).length,
    filteredAlerts: filter === "all" ? visibleAlerts : visibleAlerts.filter((alert) => alert.tone === filter),
    priorityText,
    summary,
  };
}
