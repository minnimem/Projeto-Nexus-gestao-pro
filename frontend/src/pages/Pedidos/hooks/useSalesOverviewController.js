import { useState } from "react";
import { isAdminPerfil } from "../../../utils/permissions";
import { getSalesScopeData } from "../services/salesScope";
import { useSalesAnalytics } from "./useSalesAnalytics";
import { useSalesCommercialFollowUp } from "./useSalesCommercialFollowUp";
import { useSalesCommission } from "./useSalesCommission";
import { useSalesFiscal } from "./useSalesFiscal";
import { useSalesOrders } from "./useSalesOrders";

export function useSalesOverviewController({ data, onRefresh, session }) {
  const [salesBranchFilter, setSalesBranchFilter] = useState("TODAS");
  const [savingOrderAction, setSavingOrderAction] = useState("");
  const [orderMessage, setOrderMessage] = useState(null);
  const scope = getSalesScopeData({ data, salesBranchFilter });
  const commercial = useSalesCommercialFollowUp({
    branchScopedOrders: scope.branchScopedOrders,
    data,
    onRefresh,
    salesBranchFilter,
    session,
    setOrderMessage,
    setSavingOrderAction,
  });
  const commission = useSalesCommission({
    branchScopedOrders: scope.branchScopedOrders,
    data,
    onRefresh,
    selectedSalesBranchLabel: scope.selectedSalesBranchLabel,
    session,
    setOrderMessage,
    setSavingOrderAction,
  });
  const orders = useSalesOrders({
    branchScopedRecentOrders: scope.branchScopedRecentOrders,
    onRefresh,
    session,
    setOrderMessage,
    setSavingOrderAction,
  });
  const fiscal = useSalesFiscal({
    branchScopedRecentOrders: scope.branchScopedRecentOrders,
    data,
    onRefresh,
    session,
    setOrderMessage,
    setSavingOrderAction,
  });
  const analytics = useSalesAnalytics({
    branchCompletedOrders: scope.branchCompletedOrders,
    branchScopedOrders: scope.branchScopedOrders,
    branchScopedRecentOrders: scope.branchScopedRecentOrders,
    commercialFollowUpOrders: commercial.commercialFollowUpOrders,
    data,
    fiscalControlOrders: fiscal.fiscalControlOrders,
    fiscalRealConclusion: fiscal.fiscalRealConclusion,
    fiscalRealConclusionSummary: fiscal.fiscalRealConclusionSummary,
    salesBranchFilter,
    sellerRankingGoal: commission.sellerRankingGoal,
    sellerRankingProgress: commission.sellerRankingProgress,
    sellerRankingTotal: commission.sellerRankingTotal,
  });

  return {
    analytics,
    canExportTechnicalJson: isAdminPerfil(session.perfil),
    commercial,
    commission,
    fiscal,
    orderMessage,
    orders,
    salesBranchFilter,
    savingOrderAction,
    scope,
    setSalesBranchFilter,
  };
}
