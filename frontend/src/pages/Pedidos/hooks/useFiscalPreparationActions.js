import { endpoints } from "../../../services/resources";
import { findFiscalConfigForOrder } from "../services/fiscalWorkflow";

export function useFiscalPreparationActions({
  configuracoesFiscais,
  getFiscalModelForOrder,
  onRefresh,
  setOrderMessage,
  setSavingOrderAction,
  updateFiscalStatus,
}) {
  async function handlePrepareFiscalHomologation(pedido) {
    if (!pedido.id) return;

    const selectedModel = getFiscalModelForOrder(pedido);
    const config = findFiscalConfigForOrder({
      configuracoesFiscais,
      modelo: selectedModel,
      pedido,
    });
    if (!config.id) {
      setOrderMessage({
        type: "error",
        text: `Nenhuma configuração fiscal ${selectedModel} ativa em homologação foi encontrada para este pedido.`,
      });
      return;
    }

    setSavingOrderAction(`homologação-${pedido.id}`);
    setOrderMessage(null);
    try {
      const documento = await endpoints.fiscal.prepararHomologacao({
        pedidoId: pedido.id,
        configuracaoFiscalId: config.id,
        modelo: config.modelo || selectedModel,
        observacao: "Preparado pela tela de Vendas.",
      });
      updateFiscalStatus(pedido, "PREPARADO_HOMOLOGACAO");
      await onRefresh();
      setOrderMessage({
        type: "success",
        text: `Documento fiscal preparado para homologação: ${documento.modelo} série ${documento.série} número ${documento.número}.`,
      });
    } catch (error) {
      setOrderMessage({ type: "error", text: error.message || "Não foi possível preparar o documento fiscal." });
    } finally {
      setSavingOrderAction("");
    }
  }

  return { handlePrepareFiscalHomologation };
}
