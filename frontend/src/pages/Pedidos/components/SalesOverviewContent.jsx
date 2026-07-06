import { CommercialFollowUpSection } from "./CommercialFollowUpSection";
import { SalesAnalyticsSection } from "./SalesAnalyticsSection";
import { SalesFiscalControlSection } from "./SalesFiscalControlSection";
import { SalesOrdersSection } from "./SalesOrdersSection";
import { SalesSeparationSection } from "./SalesSeparationSection";
import { SalesSummarySection } from "./SalesSummarySection";
import { SellerRankingSection } from "./SellerRankingSection";

export function SalesOverviewContent({
  analytics,
  canExportTechnicalJson,
  commercial,
  commission,
  data,
  fiscal,
  fiscalActionRenderers,
  onNavigate,
  orderMessage,
  orders,
  salesBranchFilter,
  savingOrderAction,
  section,
  selectedSalesBranchLabel,
  session,
  setSalesBranchFilter,
  filiais,
}) {
  const activeSalesSection = section || "overview";
  const showSalesOverview = activeSalesSection === "overview" || activeSalesSection === "all";
  const showSalesAnalytics = activeSalesSection === "analytics";
  const showSellerRanking = activeSalesSection === "ranking";
  const showCommercialFollowUp = activeSalesSection === "followup";
  const showFiscalControl = activeSalesSection === "fiscal";
  const showSalesOrders = activeSalesSection === "orders";
  const showSalesSeparation = activeSalesSection === "separation";

  return (
    <div className="dashboard-view">
      <SalesSummarySection
        analytics={analytics}
        filiais={filiais}
        onNavigate={onNavigate}
        salesBranchFilter={salesBranchFilter}
        selectedSalesBranchLabel={selectedSalesBranchLabel}
        setCommercialSellerFilter={commercial.setCommercialSellerFilter}
        setSalesBranchFilter={setSalesBranchFilter}
        showSalesAnalytics={showSalesAnalytics}
        showSalesOrders={showSalesOrders}
        showSalesOverview={showSalesOverview}
      />

      <SalesAnalyticsSection analytics={analytics} showSalesAnalytics={showSalesAnalytics} />

      <SellerRankingSection
        commission={commission}
        savingOrderAction={savingOrderAction}
        selectedSalesBranchLabel={selectedSalesBranchLabel}
        showSellerRanking={showSellerRanking}
      />

      <CommercialFollowUpSection
        commercial={commercial}
        savingOrderAction={savingOrderAction}
        selectedSalesBranchLabel={selectedSalesBranchLabel}
        showCommercialFollowUp={showCommercialFollowUp}
      />

      <SalesFiscalControlSection
        canExportTechnicalJson={canExportTechnicalJson}
        fiscal={fiscal}
        selectedSalesBranchLabel={selectedSalesBranchLabel}
        session={session}
        showFiscalControl={showFiscalControl}
      />

      <SalesSeparationSection
        handlePrintFiscalMirror={orders.handlePrintFiscalMirror}
        handleSeparationAction={orders.handleSeparationAction}
        orderMessage={orderMessage}
        savingOrderAction={savingOrderAction}
        separationOrders={analytics.separationOrders}
        showSalesSeparation={showSalesSeparation}
      />

      <SalesOrdersSection
        fiscalActionRenderers={fiscalActionRenderers}
        fiscal={fiscal}
        orderMessage={orderMessage}
        orders={orders}
        rankingProdutos={data.rankingProdutos || []}
        savingOrderAction={savingOrderAction}
        showSalesOrders={showSalesOrders}
        ticketMedio={data.ticketMedio}
        vendasPorDia={analytics.vendasPorDia}
      />
    </div>
  );
}
