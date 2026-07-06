import { useFiscalDocumentDownloads } from "./useFiscalDocumentDownloads";
import { useFiscalPendenciesActions } from "./useFiscalPendenciesActions";

export function useFiscalFileActions({
  getLatestFiscalDocument,
  onRefresh,
  setOrderMessage,
  setSavingOrderAction,
  updateFiscalStatus,
}) {
  const {
    handleDownloadFiscalCorrectionLetter,
    handleDownloadFiscalDanfe,
    handleDownloadFiscalDossiêr,
    handleDownloadFiscalPayload,
    handleDownloadFiscalReturnXml,
    handleDownloadFiscalXml,
  } = useFiscalDocumentDownloads({
    getLatestFiscalDocument,
    setOrderMessage,
    setSavingOrderAction,
  });

  const {
    handleDownloadFiscalPendencies,
    handleRevalidateFiscalPendencies,
  } = useFiscalPendenciesActions({
    getLatestFiscalDocument,
    onRefresh,
    setOrderMessage,
    setSavingOrderAction,
    updateFiscalStatus,
  });

  return {
    handleDownloadFiscalCorrectionLetter,
    handleDownloadFiscalDanfe,
    handleDownloadFiscalDossiêr,
    handleDownloadFiscalPayload,
    handleDownloadFiscalPendencies,
    handleDownloadFiscalReturnXml,
    handleDownloadFiscalXml,
    handleRevalidateFiscalPendencies,
  };
}
