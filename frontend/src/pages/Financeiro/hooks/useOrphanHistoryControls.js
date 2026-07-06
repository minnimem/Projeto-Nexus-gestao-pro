import { useEffect, useState } from "react";
import { getLocalDateKey } from "../../../utils/formatters";

const initialFilter = {
  busca: "",
  inicio: "",
  fim: "",
  preset: "TODOS",
};

export function useOrphanHistoryControls() {
  const [orphanHistoryPage, setOrphanHistoryPage] = useState(0);
  const [orphanHistoryFilter, setOrphanHistoryFilter] = useState(initialFilter);

  useEffect(() => {
    setOrphanHistoryPage(0);
  }, [orphanHistoryFilter]);

  function applyOrphanHistoryPreset(preset) {
    const now = new Date();
    const today = getLocalDateKey(now);
    let inicio = "";
    let fim = today;
    if (preset === "HOJE") {
      inicio = today;
    } else if (preset === "SEMANA") {
      const start = new Date(now);
      const day = start.getDay();
      const diff = day === 0 ? 6 : day - 1;
      start.setDate(start.getDate() - diff);
      inicio = getLocalDateKey(start);
    } else if (preset === "MES") {
      inicio = getLocalDateKey(new Date(now.getFullYear(), now.getMonth(), 1));
    } else {
      fim = "";
    }
    setOrphanHistoryFilter((current) => ({ ...current, preset, inicio, fim }));
  }

  function getOrphanHistoryPagination(events) {
    const pageSize = 10;
    const orphanHistoryTotalPages = Math.max(Math.ceil(events.length / pageSize), 1);
    const currentOrphanHistoryPage = Math.min(orphanHistoryPage, orphanHistoryTotalPages - 1);
    const pagedOrphanCancellationEvents = events.slice(
      currentOrphanHistoryPage * pageSize,
      currentOrphanHistoryPage * pageSize + pageSize,
    );
    return {
      currentOrphanHistoryPage,
      orphanHistoryTotalPages,
      pagedOrphanCancellationEvents,
    };
  }

  return {
    applyOrphanHistoryPreset,
    getOrphanHistoryPagination,
    orphanHistoryFilter,
    setOrphanHistoryFilter,
    setOrphanHistoryPage,
  };
}

