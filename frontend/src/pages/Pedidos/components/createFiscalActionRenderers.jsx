import { FiscalConsultButton } from "./FiscalConsultButton";
import { FiscalFileButtons } from "./FiscalFileButtons";
import { FiscalHomologationButton } from "./FiscalHomologationButton";
import { FiscalLifecycleButtons } from "./FiscalLifecycleButtons";
import { FiscalRealButtons } from "./FiscalRealButtons";
import { FiscalReturnButtons } from "./FiscalReturnButtons";

export function createFiscalActionRenderers({
  actions,
  getFiscalStatus,
  getLatestFiscalDocument,
  savingOrderAction,
}) {
  return {
    consult: (pedido) => (
      <FiscalConsultButton
        getLatestFiscalDocument={getLatestFiscalDocument}
        handleConsultFiscalHomologation={actions.consultHomologation}
        pedido={pedido}
        savingOrderAction={savingOrderAction}
      />
    ),
    files: (pedido) => (
      <FiscalFileButtons
        getLatestFiscalDocument={getLatestFiscalDocument}
        handleDownloadFiscalCorrectionLetter={actions.downloadCorrectionLetter}
        handleDownloadFiscalDanfe={actions.downloadDanfe}
        handleDownloadFiscalDossiêr={actions.downloadDossiêr}
        handleDownloadFiscalPayload={actions.downloadPayload}
        handleDownloadFiscalPendencies={actions.downloadPendencies}
        handleDownloadFiscalReturnXml={actions.downloadReturnXml}
        handleDownloadFiscalXml={actions.downloadXml}
        handleRevalidateFiscalPendencies={actions.revalidatePendencies}
        pedido={pedido}
        savingOrderAction={savingOrderAction}
      />
    ),
    homologation: (pedido) => (
      <FiscalHomologationButton
        getFiscalStatus={getFiscalStatus}
        handlePrepareFiscalHomologation={actions.prepareHomologation}
        pedido={pedido}
        savingOrderAction={savingOrderAction}
      />
    ),
    lifecycle: (pedido) => (
      <FiscalLifecycleButtons
        getFiscalStatus={getFiscalStatus}
        getLatestFiscalDocument={getLatestFiscalDocument}
        handleCancelFiscalHomologation={actions.cancelHomologation}
        handleGenerateFiscalDanfe={actions.generateDanfe}
        handleInvalidateFiscalHomologation={actions.invalidateHomologation}
        handleIssueFiscalCorrectionLetter={actions.issueCorrectionLetter}
        handleRegularizeFiscalContingency={actions.regularizeContingency}
        handleReprocessFiscalRejection={actions.reprocessRejection}
        pedido={pedido}
        savingOrderAction={savingOrderAction}
      />
    ),
    real: (pedido) => (
      <FiscalRealButtons
        getLatestFiscalDocument={getLatestFiscalDocument}
        handleConsultFiscalRealReadiness={actions.consultRealReadiness}
        handleDownloadFiscalRealChecklist={actions.downloadRealChecklist}
        handleDownloadFiscalRealPackage={actions.downloadRealPackage}
        handleDownloadFiscalRealPackageManifest={actions.downloadRealManifest}
        handleValidateFiscalRealPackageIntegrity={actions.validateRealPackage}
        pedido={pedido}
        savingOrderAction={savingOrderAction}
      />
    ),
    returns: (pedido) => (
      <FiscalReturnButtons
        getFiscalStatus={getFiscalStatus}
        handleFiscalContingency={actions.fiscalContingency}
        handleFiscalHomologationReturn={actions.homologationReturn}
        handleGenerateFiscalXml={actions.generateXml}
        handleTransmitFiscalHomologation={actions.transmitHomologation}
        handleValidateFiscalXml={actions.validateXml}
        pedido={pedido}
        savingOrderAction={savingOrderAction}
      />
    ),
  };
}
