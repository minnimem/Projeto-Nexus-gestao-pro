import { useEffect, useState } from "react";
import { normalizePerfil } from "../../../utils/permissions";

export const defaultOverviewWidgetOrder = [
  "bi",
  "ai",
  "trend",
  "health",
  "activity",
  "alerts",
  "daily",
  "branches",
  "orders",
  "priorities",
];

export function useOverviewWidgetLayout({ perfil, todayKey }) {
  const [dismissedAutomationAlerts, setDismissedAutomationAlerts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("nexus-one-automation-alerts-dismissed") || "[]");
    } catch {
      return [];
    }
  });
  const widgetStorageKey = `nexus-one-overview-widgets-${normalizePerfil(perfil) || "GERAL"}`;
  const [widgetLayout, setWidgetLayout] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(widgetStorageKey) || "{}");
      const order = Array.isArray(saved.order)
        ?
        saved.order.filter((item) => defaultOverviewWidgetOrder.includes(item))
        : defaultOverviewWidgetOrder;
      const hidden = Array.isArray(saved.hidden)
        ?
        saved.hidden.filter((item) => defaultOverviewWidgetOrder.includes(item))
        : [];
      return {
        order: [...order, ...defaultOverviewWidgetOrder.filter((item) => !order.includes(item))],
        hidden,
      };
    } catch {
      return { order: defaultOverviewWidgetOrder, hidden: [] };
    }
  });
  const [dailyReportDate, setDailyReportDate] = useState(() =>
    localStorage.getItem("nexus-one-daily-report-date") || "",
  );

  useEffect(() => {
    localStorage.setItem("nexus-one-automation-alerts-dismissed", JSON.stringify(dismissedAutomationAlerts));
  }, [dismissedAutomationAlerts]);

  useEffect(() => {
    localStorage.setItem(widgetStorageKey, JSON.stringify(widgetLayout));
  }, [widgetStorageKey, widgetLayout]);

  useEffect(() => {
    if (dailyReportDate === todayKey) return;
    localStorage.setItem("nexus-one-daily-report-date", todayKey);
    setDailyReportDate(todayKey);
  }, [dailyReportDate, todayKey]);

  function dismissAutomationAlert(id) {
    setDismissedAutomationAlerts((current) => Array.from(new Set([...current, id])));
  }

  function restoreAutomationAlerts() {
    setDismissedAutomationAlerts([]);
  }

  function toggleWidget(id) {
    setWidgetLayout((current) => ({
      ...current,
      hidden: current.hidden.includes(id)
        ?
        current.hidden.filter((item) => item !== id)
        : [...current.hidden, id],
    }));
  }

  function moveWidget(id, direction) {
    setWidgetLayout((current) => {
      const order = [...current.order];
      const index = order.indexOf(id);
      const nextIndex = direction === "up" ? index - 1 : index + 1;
      if (index < 0 || nextIndex < 0 || nextIndex >= order.length) return current;
      [order[index], order[nextIndex]] = [order[nextIndex], order[index]];
      return { ...current, order };
    });
  }

  function resetWidgets() {
    setWidgetLayout({ order: defaultOverviewWidgetOrder, hidden: [] });
  }

  return {
    dailyReportDate,
    dismissedAutomationAlerts,
    dismissAutomationAlert,
    moveWidget,
    resetWidgets,
    restoreAutomationAlerts,
    toggleWidget,
    widgetLayout,
  };
}
