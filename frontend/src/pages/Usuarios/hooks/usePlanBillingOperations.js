import { useState } from "react";
import { endpoints } from "../../../services/resources";
import { formatNumber } from "../../../utils/formatters";
import {
  buildPlanBillingMessage,
  buildPlanBillingPayload,
  buildPlanBillingViewModel,
} from "../utils/planBillingViewModel";

export function usePlanBillingOperations({ masterEmpresas, onRefresh, setMessage }) {
  const [planBillingFilter, setPlanBillingFilter] = useState("COBRAR");
  const [savingBillingCompanyId, setSavingBillingCompanyId] = useState(null);
  const [planBillingNotes, setPlanBillingNotes] = useState({});
  const [selectedPlanBillingIds, setSelectedPlanBillingIds] = useState([]);

  const {
    planBillingDueSoonItems,
    planBillingDueSoonTotal,
    planBillingFilteredItems,
    planBillingItems,
    planBillingMonthlyTotal,
    planBillingOpenItems,
    planBillingOpenTotal,
    planBillingOverdueItems,
    planBillingOverdueTotal,
    planBillingRecommendedAction,
    planBillingRows,
    planBillingTrialTotal,
    selectedPlanBillingItems,
  } = buildPlanBillingViewModel(masterEmpresas, planBillingFilter, selectedPlanBillingIds);

  async function handlePlanBillingStatusChange(empresaPlano, statusAssinatura, observacaoComercial) {
    if (!empresaPlano.id) {
      return;
    }

    setSavingBillingCompanyId(empresaPlano.id);
    setMessage(null);

    try {
      await endpoints.empresa.masterAtualizarPlano(
        empresaPlano.id,
        buildPlanBillingPayload(empresaPlano, statusAssinatura, observacaoComercial),
      );
      setMessage({
        type: "success",
        text: `Assinatura de ${empresaPlano.nome || "empresa"} atualizada para ${statusAssinatura}.`,
      });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSavingBillingCompanyId(null);
    }
  }

  async function copyPlanBillingMessage(item) {
    const text = buildPlanBillingMessage(item);
    if (!text) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setMessage({ type: "success", text: `Mensagem de cobranca de ${item.nome || "empresa"} copiada.` });
    } catch (err) {
      setMessage({ type: "error", text: "Não foi possível copiar automaticamente." });
    }
  }

  function togglePlanBillingSelection(companyId) {
    const key = String(companyId || "");
    if (!key) return;
    setSelectedPlanBillingIds((current) =>
      current.includes(key) ? current.filter((id) => id !== key) : [...current, key]
    );
  }

  function selectVisiblePlanBillingItems() {
    setSelectedPlanBillingIds(planBillingFilteredItems.map((item) => String(item.id || "")).filter(Boolean));
  }

  function clearPlanBillingSelection() {
    setSelectedPlanBillingIds([]);
  }

  async function copySelectedPlanBillingMessages() {
    if (selectedPlanBillingItems.length === 0) {
      setMessage({ type: "error", text: "Selecione pelo menos uma empresa para copiar mensagens." });
      return;
    }

    const text = selectedPlanBillingItems
      .map((item, index) => `${index + 1}. ${buildPlanBillingMessage(item)}`)
      .join("\n\n");

    try {
      await navigator.clipboard.writeText(text);
      setMessage({ type: "success", text: `${formatNumber(selectedPlanBillingItems.length)} mensagem(ns) de cobranca copiadas.` });
    } catch (err) {
      setMessage({ type: "error", text: "Não foi possível copiar automaticamente." });
    }
  }

  async function updateSelectedPlanBillingStatus(statusAssinatura, observacaoComercial) {
    if (selectedPlanBillingItems.length === 0) {
      setMessage({ type: "error", text: "Selecione pelo menos uma empresa para atualizar em lote." });
      return;
    }

    setSavingBillingCompanyId("BULK");
    setMessage(null);
    try {
      for (const item of selectedPlanBillingItems) {
        await endpoints.empresa.masterAtualizarPlano(
          item.id,
          buildPlanBillingPayload(item, statusAssinatura, observacaoComercial),
        );
      }
      setSelectedPlanBillingIds([]);
      setMessage({ type: "success", text: `${formatNumber(selectedPlanBillingItems.length)} assinatura(s) atualizada(s) em lote.` });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSavingBillingCompanyId(null);
    }
  }

  function updatePlanBillingNote(companyId, value) {
    setPlanBillingNotes((current) => ({
      ...current,
      [companyId]: value,
    }));
  }

  async function savePlanBillingNote(item) {
    if (!item.id) {
      return;
    }
    const note = String(planBillingNotes[item.id] || "").trim();
    if (!note) {
      setMessage({ type: "error", text: "Informe uma observação antes de registrar." });
      return;
    }

    await handlePlanBillingStatusChange(item, item.statusAssinaturaNormalizado || "PENDENTE", `Cobranca: ${note}`);
    setPlanBillingNotes((current) => ({
      ...current,
      [item.id]: "",
    }));
  }

  return {
    clearPlanBillingSelection,
    copyPlanBillingMessage,
    copySelectedPlanBillingMessages,
    handlePlanBillingStatusChange,
    planBillingDueSoonItems,
    planBillingDueSoonTotal,
    planBillingFilter,
    planBillingFilteredItems,
    planBillingItems,
    planBillingMonthlyTotal,
    planBillingNotes,
    planBillingOpenItems,
    planBillingOpenTotal,
    planBillingOverdueItems,
    planBillingOverdueTotal,
    planBillingRecommendedAction,
    planBillingRows,
    planBillingTrialTotal,
    savePlanBillingNote,
    savingBillingCompanyId,
    selectedPlanBillingIds,
    selectedPlanBillingItems,
    selectVisiblePlanBillingItems,
    setPlanBillingFilter,
    togglePlanBillingSelection,
    updatePlanBillingNote,
    updateSelectedPlanBillingStatus,
  };
}
