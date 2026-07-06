import { useState } from "react";
import {
  initialCommercialFollowUpForm,
  useCommercialFollowUpActions,
} from "./useCommercialFollowUpActions";
import { asList } from "../../../utils/formatters";
import { canPerform, normalizePerfil } from "../../../utils/permissions";
import { getCommercialOperations, getCommercialPriorities } from "../services/commercialFollowUp";
import { useCommercialAutomationActions } from "./useCommercialAutomationActions";

export function useSalesCommercialFollowUp({
  branchScopedOrders,
  data,
  onRefresh,
  salesBranchFilter,
  session,
  setOrderMessage,
  setSavingOrderAction,
}) {
  const [commercialFollowUpForm, setCommercialFollowUpForm] = useState(initialCommercialFollowUpForm);
  const [commercialSellerFilter, setCommercialSellerFilter] = useState("TODOS");
  const canManageNotifications = ["ADMIN", "GERENTE"].includes(normalizePerfil(session.perfil));
  const canManageCommercialFollowUp = canPerform(session, "manageCommercialFollowUp");
  const automation = useCommercialAutomationActions({
    canManageNotifications,
    onRefresh,
    salesBranchFilter,
    setOrderMessage,
    setSavingOrderAction,
  });
  const followUpActions = useCommercialFollowUpActions({
    canManageCommercialFollowUp,
    commercialFollowUpForm,
    onRefresh,
    setCommercialFollowUpForm,
    setOrderMessage,
    setSavingOrderAction,
  });
  const priorities = getCommercialPriorities({ branchScopedOrders, commercialSellerFilter });
  const operations = getCommercialOperations({
    allCommercialFollowUpOrders: priorities.allCommercialFollowUpOrders,
    canManageNotifications,
    commercialAutomationSettings: automation.commercialAutomationSettings,
    commercialFollowUpOrders: priorities.commercialFollowUpOrders,
    commercialFollowUps: asList(data.followUpsComerciais),
    salesBranchFilter,
  });

  return {
    canManageCommercialFollowUp,
    canManageNotifications,
    commercialFollowUpForm,
    commercialSellerFilter,
    setCommercialFollowUpForm,
    setCommercialSellerFilter,
    ...automation,
    ...followUpActions,
    ...priorities,
    ...operations,
  };
}
