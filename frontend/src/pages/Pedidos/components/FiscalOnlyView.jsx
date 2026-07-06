import { fiscalModelOptions, fiscalStatusOptions } from "../../../constants/fiscal";
import { FiscalBranchFilter } from "./FiscalBranchFilter";
import { FiscalWorkspace } from "./FiscalWorkspace";

export function FiscalOnlyView({
  canExportTechnicalJson,
  filiais,
  fiscalActionRenderers,
  fiscal,
  handlePrintFiscalMirror,
  orderMessage,
  salesBranchFilter,
  savingOrderAction,
  selectedSalesBranchLabel,
  session,
  setSalesBranchFilter,
}) {
  return (
    <div className="dashboard-view">
      <FiscalBranchFilter
        filiais={filiais}
        salesBranchFilter={salesBranchFilter}
        setSalesBranchFilter={setSalesBranchFilter}
      />
      <FiscalWorkspace
        canExportTechnicalJson={canExportTechnicalJson}
        expanded
        fiscalActionRenderers={fiscalActionRenderers}
        fiscalControlOrders={fiscal.fiscalControlOrders}
        fiscalControlRows={fiscal.fiscalControlRows}
        fiscalModelOptions={fiscalModelOptions}
        fiscalNextConclusion={fiscal.fiscalNextConclusion}
        fiscalRealConclusionSummary={fiscal.fiscalRealConclusionSummary}
        fiscalStatusSummary={fiscal.fiscalStatusSummary}
        fiscalStatusOptions={fiscalStatusOptions}
        getFiscalModelForOrder={fiscal.getFiscalModelForOrder}
        getFiscalRealConclusion={fiscal.getFiscalRealConclusion}
        getFiscalStatus={fiscal.getFiscalStatus}
        getLatestFiscalDocument={fiscal.getLatestFiscalDocument}
        handlePrintFiscalMirror={handlePrintFiscalMirror}
        orderMessage={orderMessage}
        savingOrderAction={savingOrderAction}
        selectedSalesBranchLabel={selectedSalesBranchLabel}
        session={session}
        setFiscalModelByOrder={fiscal.setFiscalModelByOrder}
        updateFiscalStatus={fiscal.updateFiscalStatus}
      />
    </div>
  );
}
