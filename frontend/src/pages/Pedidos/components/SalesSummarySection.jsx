import { SalesBottleneckPanel } from "./SalesBottleneckPanel";
import { SalesBranchFilterPanel } from "./SalesBranchFilterPanel";
import { SalesKpiGrid } from "./SalesKpiGrid";
import { SalesModuleOverview } from "./SalesModuleOverview";
import { SalesOverviewInsights } from "./SalesOverviewInsights";

export function SalesSummarySection({
  analytics,
  filiais,
  onNavigate,
  salesBranchFilter,
  selectedSalesBranchLabel,
  setCommercialSellerFilter,
  setSalesBranchFilter,
  showSalesAnalytics,
  showSalesOrders,
  showSalesOverview,
}) {
  const {
    bottleneckCards,
    salesKpis,
    salesModuleCards,
    salesOverviewInsights,
  } = analytics;

  return (
    <>
      <SalesKpiGrid
        salesKpis={salesKpis}
        selectedSalesBranchLabel={selectedSalesBranchLabel}
        showSalesAnalytics={showSalesAnalytics}
        showSalesOrders={showSalesOrders}
        showSalesOverview={showSalesOverview}
      />

      <SalesBranchFilterPanel
        filiais={filiais}
        salesBranchFilter={salesBranchFilter}
        setCommercialSellerFilter={setCommercialSellerFilter}
        setSalesBranchFilter={setSalesBranchFilter}
      />

      <SalesModuleOverview
        onNavigate={onNavigate}
        salesModuleCards={salesModuleCards}
        showSalesOverview={showSalesOverview}
      />

      <SalesOverviewInsights
        salesOverviewInsights={salesOverviewInsights}
        showSalesOverview={showSalesOverview}
      />

      <SalesBottleneckPanel
        bottleneckCards={bottleneckCards}
        onNavigate={onNavigate}
        showSalesOverview={showSalesOverview}
      />
    </>
  );
}
