import { useState } from "react";
import { getSalesAnalyticsData } from "../services/salesAnalyticsData";
import { getSalesDashboardData, getSalesModuleCards } from "../services/salesDashboardData";
import { getSalesKpiData } from "../services/salesKpis";

export function useSalesAnalytics({
  branchCompletedOrders,
  branchScopedOrders,
  branchScopedRecentOrders,
  commercialFollowUpOrders,
  data,
  fiscalControlOrders,
  fiscalRealConclusion,
  fiscalRealConclusionSummary,
  salesBranchFilter,
  sellerRankingGoal,
  sellerRankingProgress,
  sellerRankingTotal,
}) {
  const [chartPeriod, setChartPeriod] = useState("dia");
  const analytics = getSalesAnalyticsData({
    branchCompletedOrders,
    branchScopedOrders,
    chartPeriod,
    data,
    rankingProdutos: data.rankingProdutos || [],
    salesBranchFilter,
  });
  const { salesKpis } = getSalesKpiData({
    branchCompletedOrders,
    branchScopedOrders,
    sellerRankingGoal,
    sellerRankingProgress,
    sellerRankingTotal,
  });
  const dashboard = getSalesDashboardData({
    bestChartPeriod: analytics.bestChartPeriod,
    branchScopedOrders,
    branchScopedRecentOrders,
    fiscalRealConclusion,
    fiscalRealConclusionSummary,
    salesKpis,
    topProducts: analytics.topProducts,
  });
  const salesModuleCards = getSalesModuleCards({
    bottleneckCards: dashboard.bottleneckCards,
    branchScopedRecentOrders,
    chartRows: analytics.chartRows,
    commercialFollowUpOrders,
    fiscalControlOrders,
    fiscalRealConclusionSummary,
    salesKpis,
    sellerRankingGoal,
    sellerRankingProgress,
    sellerRankingTotal,
    separationOrders: dashboard.separationOrders,
    totalChartValue: analytics.totalChartValue,
  });

  return {
    chartPeriod,
    salesModuleCards,
    salesKpis,
    setChartPeriod,
    ...analytics,
    ...dashboard,
  };
}
