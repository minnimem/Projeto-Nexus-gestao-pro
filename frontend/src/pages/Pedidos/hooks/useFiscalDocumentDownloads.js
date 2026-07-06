import { endpoints } from "../../../services/resources";
import { downloadTextFile } from "../../../utils/exporters";
import { fiscalDocumentDownloadConfigs } from "../services/fiscalFileDownloads";

export function useFiscalDocumentDownloads({
  getLatestFiscalDocument,
  setOrderMessage,
  setSavingOrderAction,
}) {
  async function downloadDocumentField(pedido, config) {
    const documento = getLatestFiscalDocument(pedido);
    if (!documento.id || !documento[config.availableField]) {
      setOrderMessage({ type: "error", text: config.unavailableMessage });
      return;
    }

    setSavingOrderAction(`${config.actionKey}-${pedido.id}`);
    setOrderMessage(null);

    try {
      const documentoCompleto = await endpoints.fiscal.obterDocumento(documento.id);
      const content = documentoCompleto[config.contentField];
      if (!content) {
        setOrderMessage({ type: "error", text: config.missingMessage });
        return;
      }

      const filename = config.filename(documentoCompleto, pedido).toLowerCase();
      downloadTextFile(filename, content, config.mimeType);
      setOrderMessage({ type: "success", text: config.successMessage });
    } catch (error) {
      setOrderMessage({ type: "error", text: error.message || config.errorMessage });
    } finally {
      setSavingOrderAction("");
    }
  }

  function handleDownloadFiscalXml(pedido) {
    return downloadDocumentField(pedido, fiscalDocumentDownloadConfigs.xml);
  }

  function handleDownloadFiscalPayload(pedido) {
    return downloadDocumentField(pedido, fiscalDocumentDownloadConfigs.payload);
  }

  function handleDownloadFiscalReturnXml(pedido) {
    return downloadDocumentField(pedido, fiscalDocumentDownloadConfigs.returnXml);
  }

  function handleDownloadFiscalDanfe(pedido) {
    return downloadDocumentField(pedido, fiscalDocumentDownloadConfigs.danfe);
  }

  function handleDownloadFiscalCorrectionLetter(pedido) {
    return downloadDocumentField(pedido, fiscalDocumentDownloadConfigs.correctionLetter);
  }

  async function handleDownloadFiscalDossiêr(pedido) {
    const documento = getLatestFiscalDocument(pedido);
    if (!documento.id) {
      setOrderMessage({ type: "error", text: "Este pedido ainda não possui documento fiscal para dossie." });
      return;
    }

    setSavingOrderAction(`download-dossie-${pedido.id}`);
    setOrderMessage(null);
    try {
      const content = await endpoints.fiscal.dossieHomologacao(documento.id);
      const filename = `nexus-one-dossie-fiscal-${documento.modelo || "documento-fiscal"}-${documento.serie || "serie"}-${documento.numero || pedido.id}.txt`;
      downloadTextFile(filename.toLowerCase(), content);
      setOrderMessage({ type: "success", text: "Dossiê fiscal de homologação baixado." });
    } catch (error) {
      setOrderMessage({ type: "error", text: error.message || "Não foi possível baixar o dossie fiscal." });
    } finally {
      setSavingOrderAction("");
    }
  }

  return {
    handleDownloadFiscalCorrectionLetter,
    handleDownloadFiscalDanfe,
    handleDownloadFiscalDossiêr,
    handleDownloadFiscalPayload,
    handleDownloadFiscalReturnXml,
    handleDownloadFiscalXml,
  };
}
