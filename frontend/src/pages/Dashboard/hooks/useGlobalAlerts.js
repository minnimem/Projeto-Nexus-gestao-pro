import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildDashboardAlerts,
  createDashboardAlertViewModel,
  getAlertDismissKey,
} from "../viewModels/dashboardAlerts";

export function useGlobalAlerts({ active, data, error, financeCriticalCount, status }) {
  const [showTopbarAlerts, setShowTopbarAlerts] = useState(false);
  const [topbarAlertFilter, setTopbarAlertFilter] = useState("all");
  const [dismissedTopbarAlerts, setDismissedTopbarAlerts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("nexus-one-topbar-alerts-dismissed") || "[]");
    } catch {
      return [];
    }
  });
  const topbarAlertRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("nexus-one-topbar-alerts-dismissed", JSON.stringify(dismissedTopbarAlerts));
  }, [dismissedTopbarAlerts]);

  useEffect(() => {
    function handleAlertDismiss(event) {
      if (event.key === "Escape") {
        setShowTopbarAlerts(false);
        return;
      }
      if (event.type === "mousedown" && topbarAlertRef.current && !topbarAlertRef.current.contains(event.target)) {
        setShowTopbarAlerts(false);
      }
    }

    document.addEventListener("mousedown", handleAlertDismiss);
    document.addEventListener("keydown", handleAlertDismiss);
    return () => {
      document.removeEventListener("mousedown", handleAlertDismiss);
      document.removeEventListener("keydown", handleAlertDismiss);
    };
  }, []);

  const topbarAlerts = useMemo(
    () => buildDashboardAlerts({ active, data, error, financeCriticalCount, status }),
    [active, data, error, financeCriticalCount, status],
  );

  useEffect(() => {
    const currentDismissKeys = new Set(topbarAlerts.map(getAlertDismissKey));
    setDismissedTopbarAlerts((current) => current.filter((key) => currentDismissKeys.has(key)));
  }, [topbarAlerts]);

  const alertViewModel = useMemo(
    () => createDashboardAlertViewModel(topbarAlerts, dismissedTopbarAlerts, topbarAlertFilter),
    [dismissedTopbarAlerts, topbarAlertFilter, topbarAlerts],
  );

  function dismissVisibleTopbarAlerts() {
    const dismissKeys = alertViewModel.dismissableAlerts.map(getAlertDismissKey);
    if (dismissKeys.length === 0) return;
    setDismissedTopbarAlerts((current) => Array.from(new Set([...current, ...dismissKeys])));
  }

  return {
    dismissVisibleTopbarAlerts,
    dismissedTopbarAlerts,
    filteredTopbarAlerts: alertViewModel.filteredAlerts,
    getAlertDismissKey,
    setDismissedTopbarAlerts,
    setShowTopbarAlerts,
    setTopbarAlertFilter,
    showTopbarAlerts,
    topbarActiveAlertCount: alertViewModel.activeAlertCount,
    topbarAlertBadgeTone: alertViewModel.badgeTone,
    topbarAlertFilter,
    topbarAlertPriorityText: alertViewModel.priorityText,
    topbarAlertRef,
    topbarAlerts,
    topbarAlertSummary: alertViewModel.summary,
    topbarDismissableAlerts: alertViewModel.dismissableAlerts,
    topbarDismissedAlertCount: alertViewModel.dismissedAlertCount,
  };
}
