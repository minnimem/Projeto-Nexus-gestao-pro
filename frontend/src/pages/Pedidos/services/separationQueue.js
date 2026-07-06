import { getOrderProductSummary } from "../../../utils/customers.js";
import { SEPARATION_STAGE } from "../constants/separation.js";
import { getSeparationStage, normalizeDeliveryType } from "./separationRules.js";

export function getSeparationStageCounts(separationOrders) {
  return separationOrders.reduce((counts, pedido) => {
    const stage = getSeparationStage(pedido);
    counts[stage] += 1;
    return counts;
  }, {
    [SEPARATION_STAGE.WAITING]: 0,
    [SEPARATION_STAGE.IN_PROGRESS]: 0,
    [SEPARATION_STAGE.READY]: 0,
  });
}

export function getFilteredSeparationOrders({
  deliveryFilter,
  normalizedSearch,
  separationOrders,
  stageFilter,
}) {
  const hasSearch = Boolean(normalizedSearch);

  return separationOrders.filter((pedido) => {
    const stage = getSeparationStage(pedido);
    const deliveryType = normalizeDeliveryType(pedido.tipoEntrega);
    const matchesStage = stageFilter === SEPARATION_STAGE.ALL || stage === stageFilter;
    const matchesDelivery = deliveryFilter === "TODOS" || deliveryType === deliveryFilter;

    if (!matchesStage || !matchesDelivery) {
      return false;
    }

    if (!hasSearch) {
      return true;
    }

    const searchable = [
      pedido.numero,
      pedido.id,
      pedido.cliente,
      getOrderProductSummary(pedido),
    ].filter(Boolean).join(" ").toLowerCase();

    return searchable.includes(normalizedSearch);
  });
}

export function getSeparationOrdersTotal(orders) {
  return orders.reduce((total, pedido) => total + Number(pedido.valor || 0), 0);
}
