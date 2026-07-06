import { endpoints } from "../../../services/resources.js";
import { formatNumber } from "../../../utils/formatters.js";
import { initialCollectionFollowUpForm } from "../constants/financeFormDefaults.js";
import {
  buildCollectionFollowUpDraft,
  buildCollectionFollowUpPayload,
  getCollectionFollowUpEndpointName,
} from "../services/financeRules.js";

export function useFinanceCollectionActions({
  collectionFollowUpForm,
  onRefresh,
  setCollectionFollowUpForm,
  setMessage,
  setSaving,
}) {
  function startCollectionFollowUp(item) {
    const draft = buildCollectionFollowUpDraft({ item });
    if (draft.error) {
      setMessage({ type: "error", text: draft.error });
      return;
    }
    setCollectionFollowUpForm(draft);
    setMessage(null);
  }

  async function handleCreateCollectionFollowUp(event) {
    event.preventDefault();
    const payload = buildCollectionFollowUpPayload(collectionFollowUpForm);
    if (payload.error) {
      setMessage({ type: "error", text: payload.error });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      await endpoints.financeiro.criarFollowUp(payload);
      setCollectionFollowUpForm(initialCollectionFollowUpForm);
      setMessage({ type: "success", text: "Follow-up de cobrança agendado." });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleFollowUpStatus(id, action) {
    if (!id) return;
    setSaving(true);
    setMessage(null);
    try {
      await endpoints.financeiro[getCollectionFollowUpEndpointName(action)](id);
      setMessage({ type: "success", text: action === "concluir" ? "Follow-up concluído." : "Follow-up cancelado." });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleSendFollowUpNotifications() {
    setSaving(true);
    setMessage(null);
    try {
      const result = await endpoints.notificacoes.enviarFollowUps();
      if (!result.ativo) {
        setMessage({ type: "error", text: "Notificações externas estão desativadas ou sem webhook configurado." });
      } else if (Number(result.totalEnviado || 0) === 0) {
        setMessage({ type: "success", text: "Nenhum follow-up vencido ou de hoje aguardava notificação." });
      } else {
        setMessage({
          type: "success",
          text: `${formatNumber(result.totalEnviado)} notificação(ões) enviada(s): ${formatNumber(result.cobrancasEnviadas)} cobrança(s) e ${formatNumber(result.comerciaisEnviadas)} comercial(is).`,
        });
      }
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Não foi possível enviar notificações externas." });
    } finally {
      setSaving(false);
    }
  }

  return {
    handleCreateCollectionFollowUp,
    handleFollowUpStatus,
    handleSendFollowUpNotifications,
    startCollectionFollowUp,
  };
}
