import { asList } from "../../../utils/formatters";

export function getLatestFiscalDocumentForOrder({ documentosFiscaisPorPedido, pedido }) {
  return asList(documentosFiscaisPorPedido[pedido.id])[0] || null;
}

export function getFiscalModelForOrder({
  fiscalModelByOrder,
  getLatestFiscalDocument,
  pedido,
}) {
  return getLatestFiscalDocument(pedido).modelo || fiscalModelByOrder[pedido.id] || "NFE";
}

export function buildFiscalActions({ fileActions, realActions, workflowActions }) {
  return {
    cancelHomologation: workflowActions.handleCancelFiscalHomologation,
    consultHomologation: workflowActions.handleConsultFiscalHomologation,
    consultRealReadiness: realActions.handleConsultFiscalRealReadiness,
    downloadCorrectionLetter: fileActions.handleDownloadFiscalCorrectionLetter,
    downloadDanfe: fileActions.handleDownloadFiscalDanfe,
    downloadDossiêr: fileActions.handleDownloadFiscalDossiêr,
    downloadPayload: fileActions.handleDownloadFiscalPayload,
    downloadPendencies: fileActions.handleDownloadFiscalPendencies,
    downloadRealChecklist: realActions.handleDownloadFiscalRealChecklist,
    downloadRealManifest: realActions.handleDownloadFiscalRealPackageManifest,
    downloadRealPackage: realActions.handleDownloadFiscalRealPackage,
    downloadReturnXml: fileActions.handleDownloadFiscalReturnXml,
    downloadXml: fileActions.handleDownloadFiscalXml,
    fiscalContingency: workflowActions.handleFiscalContingency,
    generateDanfe: workflowActions.handleGenerateFiscalDanfe,
    generateXml: workflowActions.handleGenerateFiscalXml,
    homologationReturn: workflowActions.handleFiscalHomologationReturn,
    invalidateHomologation: workflowActions.handleInvalidateFiscalHomologation,
    issueCorrectionLetter: workflowActions.handleIssueFiscalCorrectionLetter,
    prepareHomologation: workflowActions.handlePrepareFiscalHomologation,
    regularizeContingency: workflowActions.handleRegularizeFiscalContingency,
    reprocessRejection: workflowActions.handleReprocessFiscalRejection,
    revalidatePendencies: fileActions.handleRevalidateFiscalPendencies,
    transmitHomologation: workflowActions.handleTransmitFiscalHomologation,
    validateRealPackage: realActions.handleValidateFiscalRealPackageIntegrity,
    validateXml: workflowActions.handleValidateFiscalXml,
  };
}
