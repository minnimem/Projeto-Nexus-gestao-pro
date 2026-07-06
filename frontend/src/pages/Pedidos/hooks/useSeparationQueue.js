import { useMemo, useState } from "react";
import { SEPARATION_STAGE } from "../constants/separation.js";
import {
  getFilteredSeparationOrders,
  getSeparationOrdersTotal,
  getSeparationStageCounts,
} from "../services/separationQueue.js";

export function useSeparationQueue(separationOrders) {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState(SEPARATION_STAGE.ALL);
  const [deliveryFilter, setDeliveryFilter] = useState("TODOS");
  const normalizedSearch = search.trim().toLowerCase();

  const stageCounts = useMemo(() => getSeparationStageCounts(separationOrders), [separationOrders]);

  const filteredOrders = useMemo(() => getFilteredSeparationOrders({
    deliveryFilter,
    normalizedSearch,
    separationOrders,
    stageFilter,
  }), [deliveryFilter, normalizedSearch, separationOrders, stageFilter]);

  const filteredTotal = useMemo(
    () => getSeparationOrdersTotal(filteredOrders),
    [filteredOrders],
  );
  const hasFilters = Boolean(
    search || stageFilter !== SEPARATION_STAGE.ALL || deliveryFilter !== "TODOS",
  );

  function clearFilters() {
    setSearch("");
    setStageFilter(SEPARATION_STAGE.ALL);
    setDeliveryFilter("TODOS");
  }

  function toggleStage(stage) {
    setStageFilter((current) => current === stage ? SEPARATION_STAGE.ALL : stage);
  }

  return {
    clearFilters,
    deliveryFilter,
    filteredOrders,
    filteredTotal,
    hasFilters,
    search,
    setDeliveryFilter,
    setSearch,
    setStageFilter,
    stageCounts,
    stageFilter,
    toggleStage,
  };
}
