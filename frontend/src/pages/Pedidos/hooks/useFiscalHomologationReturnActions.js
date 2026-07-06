import { endpoints } from "../../../services/resources";
import { findFiscalDocumentByStatus } from "../services/fiscalWorkflow";

export function useFiscalHomologationReturnActions({
  onRefresh,
  setOrderMessage,
  setSavingOrderAction,
  updateFiscalStatus,
}) {
  async function handleFiscalHomologationReturn(pedido, status) {
    if (!pedido.id) return;

    setSavingOrderAction(`${status.toLowerCase()}-${pedido.id}`);
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
          text: "Nenhum XML fiscal validado foi encontrado para retorno manual.",
        });
        return;
      }

      if (status === "AUTORIZADO") {
        await endpoints.fiscal.autorizarHomologacao(documento.id, {
          mensagemRetorno: "Autorizado pela validação controlada da tela de Vendas.",
        });
      } else {
        await endpoints.fiscal.rejeitarHomologacao(documento.id, {
          mensagemRetorno: "Rejeitado pela validação controlada da tela de Vendas.",
        });
      }

      updateFiscalStatus(pedido, status);
      await onRefresh();
      setOrderMessage({
        type: status === "AUTORIZADO" ? "success" : "error",
        text: status === "AUTORIZADO" ?
          "Documento fiscal autorizado em homologação controlada."
          : "Documento fiscal rejeitado em homologação controlada.",
      });
    } catch (error) {
      setOrderMessage({ type: "error", text: error.message || "Não foi possível registrar o retorno fiscal." });
    } finally {
      setSavingOrderAction("");
    }
  }

  return { handleFiscalHomologationReturn };
}
