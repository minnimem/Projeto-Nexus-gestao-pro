import { getLocalDateKey } from "../../../utils/formatters";
import {
  getCommercialAgendaGroups,
  getCommercialAutomationRules,
  getCommercialClientTimeline,
  getCommercialReminderCards,
  getDueCommercialFollowUps,
} from "./commercialFollowUpAgenda";
import {
  getCommercialFollowUpSummary,
  getPriorityByClient,
  getPriorityBySeller,
} from "./commercialFollowUpPriorities";
import {
  getBranchScopedCommercialFollowUps,
  getCommercialFollowUpHistoryRows,
  getCommercialFollowUpRows,
  getCommercialFunnelStages,
} from "./commercialFollowUpOperations";

const commercialFollowUpStatuses = new Set(["ORCAMENTO", "PENDENTE", "SEPARACAO", "SEPARADO"]);

export function getCommercialPriorities({
  branchScopedOrders,
  commercialSellerFilter,
}) {
  const allCommercialFollowUpOrders = branchScopedOrders
    .filter((pedido) => commercialFollowUpStatuses.has(String(pedido.status || "")))
    .sort((a, b) => String(b.data || "").localeCompare(String(a.data || "")));
  const commercialFollowUpOrders = allCommercialFollowUpOrders
    .filter((pedido) => commercialSellerFilter === "TODOS"
      || String(pedido.usuario || pedido.vendedor || "Vendedor não informado") === commercialSellerFilter)
    .sort((a, b) => String(b.data || "").localeCompare(String(a.data || "")));
  const commercialFollowUpSummary = getCommercialFollowUpSummary(commercialFollowUpOrders);
  const priorityBySeller = getPriorityBySeller(commercialFollowUpSummary);
  const priorityByClient = getPriorityByClient(commercialFollowUpOrders);

  return {
    allCommercialFollowUpOrders,
    commercialFollowUpOrders,
    commercialFollowUpSummary,
    priorityByClient,
    priorityBySeller,
  };
}

export function getCommercialOperations({
  allCommercialFollowUpOrders,
  canManageNotifications,
  commercialAutomationSettings,
  commercialFollowUpOrders,
  commercialFollowUps,
  salesBranchFilter,
}) {
  const commercialFollowUpRows = getCommercialFollowUpRows(commercialFollowUpOrders);
  const commercialFunnelStages = getCommercialFunnelStages(commercialFollowUpOrders);
  const branchScopedCommercialFollowUps = getBranchScopedCommercialFollowUps({ commercialFollowUps, salesBranchFilter });
  const commercialFollowUpHistoryRows = getCommercialFollowUpHistoryRows(branchScopedCommercialFollowUps);
  const pendingCommercialFollowUps = branchScopedCommercialFollowUps.filter((item) => item.status === "PENDENTE");
  const todayKey = getLocalDateKey();
  const dueCommercialFollowUps = getDueCommercialFollowUps(pendingCommercialFollowUps, todayKey);
  const commercialAgendaGroups = getCommercialAgendaGroups({ pendingCommercialFollowUps, todayKey });
  const commercialAutomationRules = getCommercialAutomationRules({
    canManageNotifications,
    commercialAgendaGroups,
    commercialAutomationSettings,
    commercialFollowUpOrders,
    pendingCommercialFollowUps,
  });
  const commercialReminderCards = getCommercialReminderCards(pendingCommercialFollowUps);
  const commercialClientTimeline = getCommercialClientTimeline(branchScopedCommercialFollowUps);
  const commercialSellerOptions = [
    "TODOS",
    ...Array.from(new Set(allCommercialFollowUpOrders.map((pedido) => pedido.usuario || pedido.vendedor || "Vendedor não informado"))),
  ];

  return {
    branchScopedCommercialFollowUps,
    commercialAgendaGroups,
    commercialAutomationRules,
    commercialClientTimeline,
    commercialFollowUpHistoryRows,
    commercialFollowUpRows,
    commercialFunnelStages,
    commercialReminderCards,
    commercialSellerOptions,
    dueCommercialFollowUps,
    pendingCommercialFollowUps,
  };
}
