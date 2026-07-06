import { normalizePerfil } from "../../../utils/permissions";
import {
  asList,
  formatCurrency,
  formatDate,
  formatDateTime,
  isDateBeforeToday,
} from "../../../utils/formatters";
import {
  createServiceDashboardViewModel,
  getServiceEvidence,
  getServiceSla,
  parseServicePriority,
} from "../viewModels/serviceViewModel";

export function useServiceDashboardData({
  data,
  form,
  historyClienteId,
  historyEndDate,
  historyStartDate,
  historyStatus,
  historyTecnicoId,
  search,
  statusFilter,
}) {
  const ordens = asList(data.ordens);
  const clientes = asList(data.clientes);
  const produtos = asList(data.produtos);
  const tecnicos = asList(data.usuarios).filter((usuario) =>
    ["ADMIN", "GERENTE", "VENDEDOR", "TECNICO"].includes(normalizePerfil(usuario.perfil)),
  );
  const filiais = asList(data.filiais);
  const contratos = asList(data.contratos);
  const activeStatuses = new Set(["ABERTA", "EM_ANALISE", "APROVADA", "EM_EXECUCAO"]);
  const finishedStatuses = new Set(["CONCLUIDA", "FATURADA"]);
  const overdueOrders = ordens.filter((ordem) =>
    ordem.prazo && activeStatuses.has(String(ordem.status || "")) && isDateBeforeToday(ordem.prazo),
  );
  const activeOrders = ordens.filter((ordem) => activeStatuses.has(String(ordem.status || "")));
  const finishedOrders = ordens.filter((ordem) => finishedStatuses.has(String(ordem.status || "")));
  const estimatedValue = ordens.reduce((total, ordem) => total + Number(ordem.valorEstimado || 0), 0);
  const criticalOrders = ordens.filter((ordem) => parseServicePriority(ordem.observacao) === "CRITICA");
  const nextSlaOrders = [...activeOrders]
    .sort((first, second) => (getServiceSla(first).days ?? 999) - (getServiceSla(second).days ?? 999))
    .slice(0, 4);
  const timelineFocusOrder = nextSlaOrders[0] || activeOrders[0] || ordens[0];
  const servicePartsTotalCost = asList(form.pecasItens).reduce((total, item) => total + Number(item.quantity || 0) * Number(item.unitCost || 0), 0);
  const servicePartsTotalSale = asList(form.pecasItens).reduce((total, item) => total + Number(item.quantity || 0) * Number(item.unitSale || 0), 0);
  const dashboard = createServiceDashboardViewModel({
    contratos,
    finishedStatuses,
    historyClienteId,
    historyEndDate,
    historyStartDate,
    historyStatus,
    historyTecnicoId,
    ordens,
    timelineFocusOrder,
  });
  const filteredOrders = ordens.filter((ordem) => {
    const matchesStatus = statusFilter === "TODOS" || String(ordem.status || "") === statusFilter;
    const text = `${ordem.numero || ""} ${ordem.titulo || ""} ${ordem.cliente || ""} ${ordem.tecnico || ""}`.toLowerCase();
    return matchesStatus && text.includes(search.toLowerCase());
  });
  const exportRows = filteredOrders.map((ordem) => {
    const evidence = getServiceEvidence(ordem);
    return {
      Numero: ordem.numero || ordem.id,
      Cliente: ordem.cliente || "-",
      Técnico: ordem.tecnico || "-",
      Filial: ordem.filial || "Empresa / sem filial",
      Status: ordem.status || "-",
      Tipo: ordem.tipoServico || "-",
      Garantia: ordem.garantiaCoberta ? "Sim" : "Não",
      "Garantia até": ordem.garantiaAte ? formatDate(ordem.garantiaAte) : "-",
      Recorrente: ordem.recorrente ? "Sim" : "Não",
      "Próxima recorrência": ordem.proximaRecorrencia ? formatDate(ordem.proximaRecorrencia) : "-",
      Prioridade: parseServicePriority(ordem.observacao),
      SLA: getServiceSla(ordem).label,
      Prazo: formatDate(ordem.prazo),
      Valor: formatCurrency(ordem.valorEstimado || 0),
      Peças: evidence.pecas || "-",
      Evidências: evidence.evidencias || "-",
      "Assinatura cliente": evidence.assinaturaCliente ? "Sim" : "Não",
      "Responsável assinatura": evidence.assinaturaClienteNome || "-",
      "Documento assinatura": evidence.assinaturaClienteDocumento || "-",
      "Data assinatura": evidence.assinaturaClienteRegistradaEm ? formatDateTime(evidence.assinaturaClienteRegistradaEm) : "-",
      Título: ordem.titulo || "-",
    };
  });

  return {
    ...dashboard,
    activeOrders,
    clientes,
    contratos,
    criticalOrders,
    estimatedValue,
    exportRows,
    filiais,
    filteredOrders,
    finishedOrders,
    nextSlaOrders,
    ordens,
    overdueOrders,
    produtos,
    servicePartsTotalCost,
    servicePartsTotalSale,
    tecnicos,
    timelineFocusOrder,
  };
}
