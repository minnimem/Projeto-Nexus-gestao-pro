import { useSalesOverviewController } from "../hooks/useSalesOverviewController";
import { createFiscalActionRenderers } from "./createFiscalActionRenderers";
import { FiscalOnlyView } from "./FiscalOnlyView";
import { SalesOverviewContent } from "./SalesOverviewContent";

export function SalesOverview({ data, onRefresh, session, fiscalOnly = false, section = "overview", onNavigate }) {
  const {
    analytics,
    canExportTechnicalJson,
    commercial,
    commission,
    fiscal,
    orderMessage,
    orders,
    salesBranchFilter,
    savingOrderAction,
    scope,
    setSalesBranchFilter,
  } = useSalesOverviewController({ data, onRefresh, session });
  const fiscalActionRenderers = createFiscalActionRenderers({
    actions: fiscal.fiscalActions,
    getFiscalStatus: fiscal.getFiscalStatus,
    getLatestFiscalDocument: fiscal.getLatestFiscalDocument,
    savingOrderAction,
  });
  if (fiscalOnly) {
    return (
      <FiscalOnlyView
        canExportTechnicalJson={canExportTechnicalJson}
        filiais={scope.filiais}
        fiscalActionRenderers={fiscalActionRenderers}
        fiscal={fiscal}
        handlePrintFiscalMirror={orders.handlePrintFiscalMirror}
        orderMessage={orderMessage}
        salesBranchFilter={salesBranchFilter}
        savingOrderAction={savingOrderAction}
        selectedSalesBranchLabel={scope.selectedSalesBranchLabel}
        session={session}
        setSalesBranchFilter={setSalesBranchFilter}
      />
    );
  }

  return (
    <SalesOverviewContent
      analytics={analytics}
      canExportTechnicalJson={canExportTechnicalJson}
      commercial={commercial}
      commission={commission}
      data={data}
      filiais={scope.filiais}
      fiscal={fiscal}
      fiscalActionRenderers={fiscalActionRenderers}
      onNavigate={onNavigate}
      orderMessage={orderMessage}
      orders={orders}
      salesBranchFilter={salesBranchFilter}
      savingOrderAction={savingOrderAction}
      section={section}
      selectedSalesBranchLabel={scope.selectedSalesBranchLabel}
      session={session}
      setSalesBranchFilter={setSalesBranchFilter}
    />
  );
}
