import { endpoints } from "../../../services/resources.js";
import { buildConfirmationText, requestConfirmation } from "../../../utils/confirmations.js";
import { asList, formatNumber } from "../../../utils/formatters.js";

export function useFinanceLifecycleActions({ onRefresh, setMessage, setSaving }) {
  async function handleBulkBaixarFinanceiro(items, label) {
    const ids = asList(items).map((item) => item.id).filter(Boolean);
    if (ids.length === 0) return;
    const confirmationText = buildConfirmationText("Baixar", `${formatNumber(ids.length)} lançamentos`, label);
    if (!requestConfirmation(confirmationText)) return;
    setSaving(true);
    setMessage(null);
    try {
      await Promise.all(ids.map((id) => endpoints.financeiro.baixar(id)));
      setMessage({ type: "success", text: `${formatNumber(ids.length)} lançamentos baixados.` });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleRecurrence(item) {
    if (!item.id) return;
    setSaving(true);
    setMessage(null);
    try {
      await endpoints.financeiro.alterarRecorrenciaStatus(item.id, !item.ativo);
      setMessage({ type: "success", text: item.ativo ? "Recorrência pausada." : "Recorrência ativada." });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerateRecurrence(id, quantidade = 1) {
    if (!id) return;
    setSaving(true);
    setMessage(null);
    try {
      const gerados = await endpoints.financeiro.gerarRecorrencia(id, quantidade);
      setMessage({ type: "success", text: `${formatNumber(asList(gerados).length)} lançamento(s) gerado(s).` });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  return {
    handleBulkBaixarFinanceiro,
    handleGenerateRecurrence,
    handleToggleRecurrence,
  };
}
