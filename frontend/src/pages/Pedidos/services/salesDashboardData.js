import { getSalesBottleneckCards } from "./salesBottlenecks";
import { getSalesModuleCards } from "./salesModuleCards";
import { getSalesOverviewInsights } from "./salesOverviewInsights";

export function getSalesDashboardData({
  bestChartPeriod,
  branchScopedOrders,
  branchScopedRecentOrders,
  fiscalRealConclusion,
  fiscalRealConclusionSummary,
  salesKpis,
  topProducts,
}) {
  const { bottleneckCards, separationOrders, strongestBottleneck } = getSalesBottleneckCards({
    branchScopedOrders,
    branchScopedRecentOrders,
    fiscalRealConclusion,
    fiscalRealConclusionSummary,
    salesKpis,
  });
  const salesOverviewInsights = getSalesOverviewInsights({
    bestChartPeriod,
    strongestBottleneck,
    topProducts,
  });

  return { bottleneckCards, salesOverviewInsights, separationOrders, strongestBottleneck };
}

export { getSalesModuleCards };
