import { formatCurrency } from "../../../utils/formatters";

export function getCommercialAutomationRules({
  canManageNotifications,
  commercialAgendaGroups,
  commercialAutomationSettings,
  commercialFollowUpOrders,
  pendingCommercialFollowUps,
}) {
  const highValueFollowUpThreshold = Number(commercialAutomationSettings.highValueThreshold || 1000);

  return [
    {
      key: "overdue",
      label: "Follow-up vencido",
      description: "Notificar vendedor/gestor quando a próxima ação venceu.",
      count: commercialAgendaGroups.find((group) => group.key === "overdue").items.length || 0,
      status: commercialAutomationSettings.overdue
        ? canManageNotifications ? `Ativa / ${commercialAutomationSettings.channel}` : "Ativa / somente ADMIN-GERENTE"
        : "Desativada",
      enabled: Boolean(commercialAutomationSettings.overdue),
      settingKey: "overdue",
      tone: "danger",
    },
    {
      key: "today",
      label: "Ação de hoje",
      description: "Lembrar oportunidades que precisam contato hoje.",
      count: commercialAgendaGroups.find((group) => group.key === "today").items.length || 0,
      status: commercialAutomationSettings.today
        ? canManageNotifications ? `Ativa / ${commercialAutomationSettings.channel}` : "Ativa / somente ADMIN-GERENTE"
        : "Desativada",
      enabled: Boolean(commercialAutomationSettings.today),
      settingKey: "today",
      tone: "warning",
    },
    {
      key: "high-value",
      label: "Alto valor aberto",
      description: `Priorizar oportunidades acima de ${formatCurrency(highValueFollowUpThreshold)}.`,
      count: commercialFollowUpOrders.filter((pedido) => Number(pedido.valor || 0) >= highValueFollowUpThreshold).length,
      status: commercialAutomationSettings.highValue ? "Ativa / prioridade comercial" : "Desativada",
      enabled: Boolean(commercialAutomationSettings.highValue),
      settingKey: "highValue",
      tone: "info",
    },
    {
      key: "missing-date",
      label: "Sem próxima ação",
      description: "Cobrar preenchimento da data para não perder oportunidade.",
      count: pendingCommercialFollowUps.filter((item) => !item.proximaAcao).length,
      status: commercialAutomationSettings.missingDate ? "Ativa / higiene do CRM" : "Desativada",
      enabled: Boolean(commercialAutomationSettings.missingDate),
      settingKey: "missingDate",
      tone: "neutral",
    },
  ];
}
