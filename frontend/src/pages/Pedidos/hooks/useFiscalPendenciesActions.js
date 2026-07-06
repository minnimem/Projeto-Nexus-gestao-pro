import { endpoints } from "../../../services/resources";
import { downloadTextFile } from "../../../utils/exporters";
import { asList } from "../../../utils/formatters";
import { buildFiscalPendenciesContent } from "../services/fiscalFileDownloads";

export function useFiscalPendenciesActions({
  getLatestFiscalDocument,
  onRefresh,
  setOrderMessage,
  setSavingOrderAction,
  updateFiscalStatus,
}) {
  async function handleDownloadFiscalPendencies(pedido) {
    const documento = getLatestFiscalDocument(pedido);
    if (!documento.id || !documento.possuiPendenciasFiscais) {
      setOrderMessage({ type: "error", text: "Este pedido não possui pendências fiscais registradas." });
      return;
    }

    setSavingOrderAction(`download-pendencias-${pedido.id}`);
    setOrderMessage(null);
    try {
      const documentoCompleto = await endpoints.fiscal.obterDocumento(documento.id);
      if (!documentoCompleto.pendenciasFiscais) {
        setOrderMessage({ type: "error", text: "Pendências fiscais não encontradas no documento atualizado." });
        return;
      }

      const filename = `nexus-one-pendencias-fiscais-${documentoCompleto.modelo || "documento-fiscal"}-${documentoCompleto.serie || "serie"}-${documentoCompleto.numero || pedido.id}.txt`;
      const content = buildFiscalPendenciesContent({ documento: documentoCompleto, pedido });
      downloadTextFile(filename.toLowerCase(), content);
      setOrderMessage({ type: "success", text: "Pendências fiscais baixadas." });
    } catch (error) {
      setOrderMessage({ type: "error", text: error.message || "Não foi possível baixar as pendências fiscais." });
    } finally {
      setSavingOrderAction("");
    }
  }

  async function handleRevalidateFiscalPendencies(pedido) {
    if (!pedido.id) return;

    setSavingOrderAction(`revalidar-pendencias-${pedido.id}`);
    setOrderMessage(null);
    try {
      const documentos = await endpoints.fiscal.documentosPorPedido(pedido.id);
      const documento = asList(documentos).find((item) => item.possuiPendenciasFiscais);
      if (!documento.id) {
        setOrderMessage({
          type: "error",
          text: "Nenhum documento fiscal com pendências foi encontrado para revalidação.",
        });
        return;
      }

      const response = await endpoints.fiscal.revalidarPendenciasHomologacao(documento.id);
      updateFiscalStatus(pedido, response.status || "EM_PROCESSAMENTO");
      await onRefresh();
      setOrderMessage({
        type: response.pendenciasFiscais ? "error" : "success",
        text: response.mensagemRetorno || "Pendências fiscais revalidadas.",
      });
    } catch (error) {
      setOrderMessage({ type: "error", text: error.message || "Não foi possível revalidar as pendências fiscais." });
    } finally {
      setSavingOrderAction("");
    }
  }

  return {
    handleDownloadFiscalPendencies,
    handleRevalidateFiscalPendencies,
  };
}
