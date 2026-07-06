import { useState } from "react";
import { getFilteredOrders } from "../services/orderFilters";
import { useOrderWorkflowActions } from "./useOrderWorkflowActions";
import { useSalesDocumentActions } from "./useSalesDocumentActions";

export function useSalesOrders({
  branchScopedRecentOrders,
  onRefresh,
  session,
  setOrderMessage,
  setSavingOrderAction,
}) {
  const [orderPeriodFilter, setOrderPeriodFilter] = useState("todos");
  const [orderStatusFilter, setOrderStatusFilter] = useState("todos");
  const documentActions = useSalesDocumentActions({
    session,
    setOrderMessage,
    setSavingOrderAction,
  });
  const workflowActions = useOrderWorkflowActions({
    onRefresh,
    setOrderMessage,
    setOrderStatusFilter,
    setSavingOrderAction,
  });
  const filteredOrderData = getFilteredOrders({
    branchScopedRecentOrders,
    orderPeriodFilter,
    orderStatusFilter,
  });

  return {
    orderPeriodFilter,
    orderStatusFilter,
    setOrderPeriodFilter,
    setOrderStatusFilter,
    ...documentActions,
    ...workflowActions,
    ...filteredOrderData,
  };
}
