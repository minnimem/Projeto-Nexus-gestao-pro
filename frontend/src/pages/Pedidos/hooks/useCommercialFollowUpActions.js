import { endpoints } from "../../../services/resources";
import {
  buildCommercialFollowUpFormFromOrder,
  buildCommercialFollowUpPayload,
  initialCommercialFollowUpForm,
} from "../services/commercialFollowUpForm";

export { initialCommercialFollowUpForm };

export function useCommercialFollowUpActions({
  canManageCommercialFollowUp,
  commercialFollowUpForm,
  onRefresh,
  setCommercialFollowUpForm,
  setOrderMessage,
  setSavingOrderAction,
}) {
  function startCommercialFollowUp(pedido) {
    if (!pedido.id) {
      setOrderMessage({ type: "error", text: "Pedido não encontrado para follow-up comercial." });
      return;
    }

    setCommercialFollowUpForm(buildCommercialFollowUpFormFromOrder(pedido));
  }

  async function handleCreateCommercialFollowUp(event) {
    event.preventDefault();
    if (!canManageCommercialFollowUp) {
      setOrderMessage({ type: "error", text: "Perfil sem permissão para gerir follow-up comercial." });
      return;
    }
    if (!commercialFollowUpForm.pedidoId) {
      setOrderMessage({ type: "error", text: "Selecione um pedido para registrar follow-up." });
      return;
    }

    setSavingOrderAction("commercial-follow-up");
    setOrderMessage(null);
    try {
      await endpoints.pedidos.criarFollowUp(buildCommercialFollowUpPayload(commercialFollowUpForm));
      setCommercialFollowUpForm(initialCommercialFollowUpForm);
      setOrderMessage({ type: "success", text: "Follow-up comercial registrado." });
      await onRefresh();
    } catch (error) {
      setOrderMessage({ type: "error", text: error.message || "Não foi possível registrar follow-up comercial." });
    } finally {
      setSavingOrderAction("");
    }
  }

  async function handleCommercialFollowUpStatus(id, action) {
    if (!id) return;
    if (!canManageCommercialFollowUp) {
      setOrderMessage({ type: "error", text: "Perfil sem permissão para atualizar follow-up comercial." });
      return;
    }

    setSavingOrderAction(`commercial-follow-up-${id}`);
    setOrderMessage(null);
    try {
      if (action === "concluir") {
        await endpoints.pedidos.concluirFollowUp(id);
        setOrderMessage({ type: "success", text: "Follow-up comercial concluído." });
      } else {
        await endpoints.pedidos.cancelarFollowUp(id);
        setOrderMessage({ type: "success", text: "Follow-up comercial cancelado." });
      }
      await onRefresh();
    } catch (error) {
      setOrderMessage({ type: "error", text: error.message || "Não foi possível atualizar o follow-up comercial." });
    } finally {
      setSavingOrderAction("");
    }
  }

  return {
    handleCommercialFollowUpStatus,
    handleCreateCommercialFollowUp,
    startCommercialFollowUp,
  };
}
