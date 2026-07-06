import { endpoints } from "../../../services/resources";
import { findFiscalDocumentByStatus } from "../services/fiscalWorkflow";

export function useFiscalXmlActions({
  onRefresh,
  setOrderMessage,
  setSavingOrderAction,
  updateFiscalStatus,
}) {
  async function handleGenerateFiscalXml(pedido) {
    if (!pedido.id) return;

    setSavingOrderAction(`xml-${pedido.id}`);
    setOrderMessage(null);
    try {
      const documento = await findFiscalDocumentByStatus({
        endpoints,
        pedidoId: pedido.id,
        status: "PREPARADO_HOMOLOGACAO",
      });
      if (!documento.id) {
        setOrderMessage({
          type: "error",
          text: "Nenhum documento fiscal preparado para gerar XML.",
        });
        return;
      }

      await endpoints.fiscal.gerarXmlHomologacao(documento.id);
      updateFiscalStatus(pedido, "EM_PROCESSAMENTO");
      await onRefresh();
      setOrderMessage({ type: "success", text: "XML fiscal de homologação gerado e aguardando transmissão externa." });
    } catch (error) {
      setOrderMessage({ type: "error", text: error.message || "Não foi possível gerar o XML fiscal." });
    } finally {
      setSavingOrderAction("");
    }
  }

  async function handleValidateFiscalXml(pedido) {
    if (!pedido.id) return;

    setSavingOrderAction(`validar-xml-${pedido.id}`);
    setOrderMessage(null);
    try {
      const documento = await findFiscalDocumentByStatus({
        endpoints,
        pedidoId: pedido.id,
        status: "EM_PROCESSAMENTO",
      });
      if (!documento.id) {
        setOrderMessage({
          type: "error",
          text: "Nenhum XML fiscal em processamento foi encontrado para validação.",
        });
        return;
      }

      const response = await endpoints.fiscal.validarXmlHomologacao(documento.id);
      updateFiscalStatus(pedido, response.status || "XML_VALIDADO");
      await onRefresh();
      setOrderMessage({ type: "success", text: "XML fiscal de homologação validado internamente." });
    } catch (error) {
      setOrderMessage({ type: "error", text: error.message || "Não foi possível validar o XML fiscal." });
    } finally {
      setSavingOrderAction("");
    }
  }

  async function handleTransmitFiscalHomologation(pedido) {
    if (!pedido.id) return;

    setSavingOrderAction(`transmitir-fiscal-${pedido.id}`);
    setOrderMessage(null);
    try {
      const documento = await findFiscalDocumentByStatus({
        endpoints,
        pedidoId: pedido.id,
        status: "XML_VALIDADO",
      });
      if (!documento.id) {
        setOrderMessage({
          type: "error",
          text: "Nenhum XML fiscal validado foi encontrado para transmissão.",
        });
        return;
      }

      const response = await endpoints.fiscal.transmitirHomologacao(documento.id);
      updateFiscalStatus(pedido, response.status || "AUTORIZADO");
      await onRefresh();
      setOrderMessage({
        type: response.status === "AUTORIZADO" ? "success" : "error",
        text: response.mensagemRetorno || "Transmissão fiscal de homologação processada.",
      });
    } catch (error) {
      setOrderMessage({ type: "error", text: error.message || "Não foi possível transmitir a homologação fiscal." });
    } finally {
      setSavingOrderAction("");
    }
  }

  return {
    handleGenerateFiscalXml,
    handleTransmitFiscalHomologation,
    handleValidateFiscalXml,
  };
}
