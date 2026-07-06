export const fiscalStatusStorageKey = "nexus-one-fiscal-status-by-order";
export const fiscalHistoryStorageKey = "nexus-one-fiscal-history";

export function loadFiscalStatusByOrder() {
  try {
    return JSON.parse(localStorage.getItem(fiscalStatusStorageKey) || "{}");
  } catch {
    return {};
  }
}

export function loadFiscalHistory() {
  try {
    return JSON.parse(localStorage.getItem(fiscalHistoryStorageKey) || "[]");
  } catch {
    return [];
  }
}

export function persistFiscalStatusByOrder(fiscalStatusByOrder) {
  localStorage.setItem(fiscalStatusStorageKey, JSON.stringify(fiscalStatusByOrder));
}

export function persistFiscalHistory(fiscalHistory) {
  localStorage.setItem(fiscalHistoryStorageKey, JSON.stringify(fiscalHistory));
}

export function getFiscalStatusObservation(status) {
  if (status === "REJEITADO") return "Revisar dados cadastrais/itens antes da autorização real.";
  if (status === "CANCELADO") return "Cancelamento interno registrado para conferência.";
  if (status === "INUTILIZADO") return "Numeração inutilizada em homologação controlada.";
  if (status === "CONTINGENCIA") return "Documento fiscal registrado em contingência para regularização posterior.";
  if (status === "AUTORIZADO") return "Autorização interna simulada.";
  if (status === "PREPARADO_HOMOLOGACAO") return "Documento fiscal preparado para homologação.";
  return "Status fiscal retornou para pendente.";
}

export function buildFiscalHistoryItem({ pedido, previous, session, status }) {
  const orderId = pedido.id;
  return {
    id: `${orderId}-${Date.now()}`,
    orderId,
    pedido: pedido.numero || pedido.id,
    cliente: pedido.cliente || "Cliente não informado",
    filial: pedido.filial || "Empresa / sem filial",
    anterior: previous,
    novo: status,
    usuario: session.nome || session.login || session.perfil || "Usuário",
    data: new Date().toLocaleString("pt-BR"),
    observacao: getFiscalStatusObservation(status),
  };
}
