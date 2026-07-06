import { endpoints } from "../../../services/resources";
import { findFiscalDocumentByStatus } from "../services/fiscalWorkflow";

export function useFiscalAuthorizedActions({
  getLatestFiscalDocument,
  onRefresh,
  runLifecycleAction,
  setOrderMessage,
  updateFiscalStatus,
}) {
  async function handleCancelFiscalHomologation(pedido) {
    return runLifecycleAction({
      actionKey: "cancelado",
      errorMessage: "Não foi possível cancelar o documento fiscal.",
      pedido,
      operation: async () => {
        const documento = await findFiscalDocumentByStatus({ endpoints, pedidoId: pedido.id, status: "AUTORIZADO" });
        if (!documento.id) {
          setOrderMessage({ type: "error", text: "Nenhum documento fiscal autorizado foi encontrado para cancelamento." });
          return;
        }

        await endpoints.fiscal.cancelarHomologacao(documento.id, {
          mensagemRetorno: "Cancelado pela validação controlada da tela de Vendas.",
        });
        updateFiscalStatus(pedido, "CANCELADO");
        await onRefresh();
        setOrderMessage({ type: "success", text: "Documento fiscal cancelado em homologação controlada." });
      },
    });
  }

  async function handleGenerateFiscalDanfe(pedido) {
    return runLifecycleAction({
      actionKey: "danfe",
      errorMessage: "Não foi possível gerar o DANFE de homologação.",
      pedido,
      operation: async () => {
        const documento = await findFiscalDocumentByStatus({ endpoints, pedidoId: pedido.id, status: "AUTORIZADO" });
        if (!documento.id) {
          setOrderMessage({ type: "error", text: "Nenhum documento fiscal autorizado foi encontrado para gerar DANFE." });
          return;
        }

        await endpoints.fiscal.gerarDanfeHomologacao(documento.id);
        await onRefresh();
        setOrderMessage({ type: "success", text: "Documento auxiliar fiscal de homologação gerado." });
      },
    });
  }

  async function handleIssueFiscalCorrectionLetter(pedido) {
    const documento = getLatestFiscalDocument(pedido);
    if (!documento.id || documento.status !== "AUTORIZADO" || documento.modelo !== "NFE") {
      setOrderMessage({ type: "error", text: "CC-e controlada exige NF-e autorizada." });
      return;
    }

    setOrderMessage({
      type: "error",
      text: "Use o fluxo fiscal dedicado para informar a correção da NF-e com justificativa completa.",
    });
  }

  return {
    handleCancelFiscalHomologation,
    handleGenerateFiscalDanfe,
    handleIssueFiscalCorrectionLetter,
  };
}
