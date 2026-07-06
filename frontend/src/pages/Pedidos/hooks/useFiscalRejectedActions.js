import { endpoints } from "../../../services/resources";
import { findFiscalDocumentByStatus } from "../services/fiscalWorkflow";

export function useFiscalRejectedActions({
  onRefresh,
  runLifecycleAction,
  setOrderMessage,
  updateFiscalStatus,
}) {
  async function handleInvalidateFiscalHomologation(pedido) {
    return runLifecycleAction({
      actionKey: "inutilizado",
      errorMessage: "Não foi possível inutilizar a numeração fiscal.",
      pedido,
      operation: async () => {
        const documento = await findFiscalDocumentByStatus({ endpoints, pedidoId: pedido.id, status: "REJEITADO" });
        if (!documento.id) {
          setOrderMessage({ type: "error", text: "Nenhum documento fiscal rejeitado foi encontrado para inutilização." });
          return;
        }

        await endpoints.fiscal.inutilizarHomologacao(documento.id, {
          mensagemRetorno: "Numeração inutilizada pela validação controlada da tela de Vendas.",
        });
        updateFiscalStatus(pedido, "INUTILIZADO");
        await onRefresh();
        setOrderMessage({ type: "success", text: "Numeração fiscal inutilizada em homologação controlada." });
      },
    });
  }

  async function handleReprocessFiscalRejection(pedido) {
    return runLifecycleAction({
      actionKey: "reprocessar-rejeicao",
      errorMessage: "Não foi possível reprocessar a rejeicao fiscal.",
      pedido,
      operation: async () => {
        const documento = await findFiscalDocumentByStatus({ endpoints, pedidoId: pedido.id, status: "REJEITADO" });
        if (!documento.id) {
          setOrderMessage({ type: "error", text: "Nenhum documento fiscal rejeitado foi encontrado para reprocessamento." });
          return;
        }

        const response = await endpoints.fiscal.reprocessarRejeicaoHomologacao(documento.id);
        updateFiscalStatus(pedido, response.status || "EM_PROCESSAMENTO");
        await onRefresh();
        setOrderMessage({
          type: response.pendenciasFiscais ? "error" : "success",
          text: response.mensagemRetorno || "Documento fiscal rejeitado reprocessado.",
        });
      },
    });
  }

  return {
    handleInvalidateFiscalHomologation,
    handleReprocessFiscalRejection,
  };
}
