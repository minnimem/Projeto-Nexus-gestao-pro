import { orderPeriodOptions, orderStatusOptions } from "../../../constants/status";
import { isWithinLastDays } from "../../../utils/sales";

export function getFilteredOrders({
  branchScopedRecentOrders,
  orderPeriodFilter,
  orderStatusFilter,
}) {
  const selectedOrderPeriod = orderPeriodOptions.find((option) => option.value === orderPeriodFilter);
  const selectedOrderStatus = orderStatusOptions.find((option) => option.value === orderStatusFilter);
  const filteredOrders = branchScopedRecentOrders.filter((pedido) => {
    const statusOk = orderStatusFilter === "todos" || pedido.status === orderStatusFilter;
    const periodOk = isWithinLastDays(pedido.data, selectedOrderPeriod.days);
    return statusOk && periodOk;
  });
  const filteredOrdersTotal = filteredOrders.reduce((total, pedido) => total + Number(pedido.valor || 0), 0);
  const filteredOrdersPending = filteredOrders.filter((pedido) =>
    ["PENDENTE", "SEPARACAO", "SEPARADO"].includes(String(pedido.status || "")),
  ).length;

  return {
    filteredOrders,
    filteredOrdersPending,
    filteredOrdersTotal,
    selectedOrderPeriod,
    selectedOrderStatus,
  };
}
