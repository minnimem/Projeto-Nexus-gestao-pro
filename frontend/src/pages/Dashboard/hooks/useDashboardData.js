import { useEffect, useState } from "react";
import {
  loadDashboardModuleData,
  loadFinanceCriticalCount,
} from "../services/dashboardDataService";
import { loadDashboardSnapshot } from "../services/dashboardRefreshService";

export function useDashboardData({ active, session }) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [financeCriticalCount, setFinanceCriticalCount] = useState(0);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

  async function loadCurrentDashboardData() {
    return loadDashboardSnapshot({
      active,
      loadCriticalCount: loadFinanceCriticalCount,
      loadModuleData: loadDashboardModuleData,
      session,
    });
  }

  useEffect(() => {
    let ignore = false;

    async function load() {
      setStatus("loading");
      setError("");

      try {
        const snapshot = await loadCurrentDashboardData();

        if (!ignore) {
          setData(snapshot.data);
          setFinanceCriticalCount(snapshot.financeCriticalCount);
          setStatus(snapshot.status);
          setLastUpdatedAt(snapshot.lastUpdatedAt);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message);
          setStatus("error");
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [active, session.perfil]);

  async function refreshActiveModule() {
    setStatus("loading");
    setError("");

    try {
      const snapshot = await loadCurrentDashboardData();
      setData(snapshot.data);
      setFinanceCriticalCount(snapshot.financeCriticalCount);
      setStatus(snapshot.status);
      setLastUpdatedAt(snapshot.lastUpdatedAt);
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  return {
    data,
    error,
    financeCriticalCount,
    lastUpdatedAt,
    refreshActiveModule,
    status,
  };
}
