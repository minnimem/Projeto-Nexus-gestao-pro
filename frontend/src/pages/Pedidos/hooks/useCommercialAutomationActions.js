import { useCommercialAutomationSettings } from "./useCommercialAutomationSettings";
import { useCommercialNotifications } from "./useCommercialNotifications";

export function useCommercialAutomationActions({
  canManageNotifications,
  onRefresh,
  salesBranchFilter,
  setOrderMessage,
  setSavingOrderAction,
}) {
  const settings = useCommercialAutomationSettings({
    onRefresh,
    salesBranchFilter,
    setOrderMessage,
  });
  const notifications = useCommercialNotifications({
    canManageNotifications,
    onRefresh,
    setOrderMessage,
    setSavingOrderAction,
  });

  return {
    ...settings,
    ...notifications,
  };
}
