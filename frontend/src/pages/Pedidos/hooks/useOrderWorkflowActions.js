import { endpoints } from "../../../services/resources.js";
import { getSeparationCompletionStatus } from "../services/separationRules.js";
import { separationService } from "../services/separationService.js";

export function useOrderWorkflowActions({
  onRefresh,
  setOrderMessage,
  setOrderStatusFilter,
  setSavingOrderAction,
}) {
  async function handleConvertQuote(id) {
    if (!id) return;

    setSavingOrderAction(id);
    setOrderMessage(null);
    try {
      await endpoints.pedidos.converterOrcamento(id);
      await onRefresh();
      setOrderStatusFilter("PENDENTE");
      setOrderMessage({ type: "success", text: "Orçamento convertido em pedido pendente." });
    } catch (error) {
      setOrderMessage({ type: "error", text: error.message || "Não foi possível converter o orçamento." });
    } finally {
      setSavingOrderAction("");
    }
  }

  async function handleSeparationAction(id, action, deliveryType = "ENTREGA") {
    if (!id) return;

    setSavingOrderAction(id);
    setOrderMessage(null);
    try {
      if (action === "start") {
        await separationService.start(id);
        setOrderStatusFilter("SEPARACAO");
        setOrderMessage({ type: "success", text: "Separação do pedido iniciada." });
      } else {
        await separationService.finish(id);
        const nextStatus = getSeparationCompletionStatus(deliveryType);
        setOrderStatusFilter(nextStatus);
        setOrderMessage({
          type: "success",
          text: nextStatus === "CONCLUIDO"
            ? "Retirada no estoque concluída."
            : "Pedido separado e pronto para despacho.",
        });
      }
      await onRefresh();
    } catch (error) {
      setOrderMessage({ type: "error", text: error.message || "Não foi possível atualizar a separação." });
    } finally {
      setSavingOrderAction("");
    }
  }

  return { handleConvertQuote, handleSeparationAction };
}
