import { FiscalQueueTable } from "./FiscalQueueTable";
import { FiscalRealConclusionSummary } from "./FiscalRealConclusionSummary";
import { FiscalStatusSummaryGrid } from "./FiscalStatusSummaryGrid";
import { FiscalWorkspaceHeader } from "./FiscalWorkspaceHeader";

export function FiscalWorkspace({
  canExportTechnicalJson,
  expanded = false,
  fiscalControlOrders,
  fiscalControlRows,
  fiscalActionRenderers,
  fiscalModelOptions,
  fiscalNextConclusion,
  fiscalRealConclusionSummary,
  fiscalStatusSummary,
  fiscalStatusOptions,
  getFiscalModelForOrder,
  getFiscalRealConclusion,
  getFiscalStatus,
  getLatestFiscalDocument,
  handlePrintFiscalMirror,
  orderMessage,
  savingOrderAction,
  selectedSalesBranchLabel,
  session,
  setFiscalModelByOrder,
  updateFiscalStatus,
}) {
  const visibleFiscalOrders = fiscalControlOrders.slice(0, expanded ? 16 : 6);

  return (
    <section className="panel account-plan-summary fiscal-command-center">
      <FiscalWorkspaceHeader
        canExportTechnicalJson={canExportTechnicalJson}
        fiscalControlRows={fiscalControlRows}
        session={session}
      />

      <FiscalStatusSummaryGrid
        fiscalStatusSummary={fiscalStatusSummary}
        selectedSalesBranchLabel={selectedSalesBranchLabel}
      />

      <FiscalRealConclusionSummary
        fiscalNextConclusion={fiscalNextConclusion}
        fiscalRealConclusionSummary={fiscalRealConclusionSummary}
      />

      {orderMessage && <p className={`form-message ${orderMessage.type}`}>{orderMessage.text}</p>}

      <FiscalQueueTable
        fiscalActionRenderers={fiscalActionRenderers}
        fiscalModelOptions={fiscalModelOptions}
        fiscalStatusOptions={fiscalStatusOptions}
        getFiscalModelForOrder={getFiscalModelForOrder}
        getFiscalRealConclusion={getFiscalRealConclusion}
        getFiscalStatus={getFiscalStatus}
        getLatestFiscalDocument={getLatestFiscalDocument}
        handlePrintFiscalMirror={handlePrintFiscalMirror}
        savingOrderAction={savingOrderAction}
        setFiscalModelByOrder={setFiscalModelByOrder}
        updateFiscalStatus={updateFiscalStatus}
        visibleFiscalOrders={visibleFiscalOrders}
      />
    </section>
  );
}
