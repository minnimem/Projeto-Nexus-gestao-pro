import { formatNumber } from "../../../utils/formatters";

export const commercialAutomationDefaults = {
  overdue: true,
  today: true,
  highValue: true,
  missingDate: false,
  highValueThreshold: 1000,
  channel: "WEBHOOK",
};

export function loadCommercialAutomationSettings() {
  try {
    return {
      ...commercialAutomationDefaults,
      ...JSON.parse(localStorage.getItem("nexus-one-commercial-automation-settings") || "{}"),
    };
  } catch {
    return commercialAutomationDefaults;
  }
}

export function persistCommercialAutomationSettings(settings) {
  localStorage.setItem("nexus-one-commercial-automation-settings", JSON.stringify(settings));
}

export function getCommercialAutomationBranchId(salesBranchFilter) {
  return salesBranchFilter === "TODAS" || salesBranchFilter === "EMPRESA" ? null : salesBranchFilter;
}

export function mergeCommercialAutomationSettings(current, response) {
  return {
    ...current,
    overdue: response.overdue ?? current.overdue,
    today: response.today ?? current.today,
    highValue: response.highValue ?? current.highValue,
    missingDate: response.missingDate ?? current.missingDate,
    highValueThreshold: response.highValueThreshold ?? current.highValueThreshold,
    channel: response.channel || current.channel,
  };
}

export function getCommercialNotificationResultMessage(result) {
  if (!result.ativo) {
    return { type: "error", text: "Notificações externas estão desativadas ou sem webhook configurado." };
  }

  if (Number(result.totalEnviado || 0) === 0) {
    return { type: "success", text: "Nenhum follow-up vencido ou de hoje aguardava notificação." };
  }

  return {
    type: "success",
    text: `${formatNumber(result.comerciaisEnviadas)} notificação(ões) comercial(is) enviada(s). Total geral: ${formatNumber(result.totalEnviado)}.`,
  };
}
