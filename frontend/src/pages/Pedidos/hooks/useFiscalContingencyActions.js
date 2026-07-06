import { endpoints } from "../../../services/resources";
import { findFiscalDocumentByStatus } from "../services/fiscalWorkflow";

export function useFiscalContingencyActions({
  onRefresh,
  setOrderMessage,
  setSavingOrderAction,
  updateFiscalStatus,
}) {
  async function handleFiscalContingency(pedido) {
    if (!pedido.id) return;

    setSavingOrderAction(`contingencia-${pedido.id}`);
    setOrderMessage(null);
    try {
      const documento = await findFiscalDocumentByStatus({ endpoints, pedidoId: pedido.id, status: "XML_VALIDADO" });
      if (!documento.id) {
        setOrderMessage({ type: "error", text: "Nenhum XML fiscal validado foi encontrado para contingência." });
        return;
      }

      const response = await endpoints.fiscal.contingenciaHomologacao(documento.id, {
        mensagemRetorno: "Contingência registrada pela tela de Vendas por indisponibilidade fiscal.",
        observacao: "Regularizar a nota quando o provedor fiscal voltar.",
      });
      updateFiscalStatus(pedido, response.status || "CONTINGENCIA");
      await onRefresh();
      setOrderMessage({ type: "success", text: response.mensagemRetorno || "Documento fiscal registrado em contingência." });
    } catch (error) {
      setOrderMessage({ type: "error", text: error.message || "Não foi possível registrar contingência fiscal." });
    } finally {
      setSavingOrderAction("");
    }
  }

  async function handleRegularizeFiscalContingency(pedido) {
    if (!pedido.id) return;

    setSavingOrderAction(`regularizar-contingencia-${pedido.id}`);
    setOrderMessage(null);
    try {
      const documento = await findFiscalDocumentByStatus({ endpoints, pedidoId: pedido.id, status: "CONTINGENCIA" });
      if (!documento.id) {
        setOrderMessage({ type: "error", text: "Nenhum documento fiscal em contingência foi encontrado para regularização." });
        return;
      }

      const response = await endpoints.fiscal.regularizarContingenciaHomologacao(documento.id);
      updateFiscalStatus(pedido, response.status || "AUTORIZADO");
      await onRefresh();
      setOrderMessage({
        type: response.status === "AUTORIZADO" ? "success" : "error",
        text: response.mensagemRetorno || "Contingência fiscal regularizada.",
      });
    } catch (error) {
      setOrderMessage({ type: "error", text: error.message || "Não foi possível regularizar a contingência fiscal." });
    } finally {
      setSavingOrderAction("");
    }
  }

  return { handleFiscalContingency, handleRegularizeFiscalContingency };
}
