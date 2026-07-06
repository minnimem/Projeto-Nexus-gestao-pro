import { endpoints } from "../../../services/resources.js";
import { formatNumber } from "../../../utils/formatters.js";
import { initialFinanceCategoryForm, initialFinanceForm } from "../constants/financeFormDefaults.js";
import {
  buildFinanceCategoryPayload,
  buildFinanceLaunchPayloads,
  buildFinanceRecurrencePayload,
  buildFinanceUpdatePayload,
  getFinanceLaunchMode,
  getFinanceStatusActionEndpointName,
  getFinanceStatusActionMessage,
  validateFinanceForm,
} from "../services/financeRules.js";

export function useFinanceEntryActions({
  categoryForm,
  editingFinanceId,
  form,
  onRefresh,
  session,
  setCategoryForm,
  setEditingFinanceId,
  setFinanceCategoryFilter,
  setForm,
  setMessage,
  setSaving,
  setSelectedCharge,
  setShowCategoryForm,
}) {
  async function handleSubmit(event) {
    event.preventDefault();
    const validationError = validateFinanceForm(form);
    if (validationError) {
      setMessage({ type: "error", text: validationError });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const { isRecurring } = getFinanceLaunchMode(form);
      if (editingFinanceId) {
        await endpoints.financeiro.atualizar(editingFinanceId, buildFinanceUpdatePayload({ form, session }));
        setEditingFinanceId(null);
        setForm(initialFinanceForm);
        setMessage({ type: "success", text: "Lancamento financeiro atualizado." });
        await onRefresh();
        return;
      }

      if (isRecurring) {
        await endpoints.financeiro.criarRecorrencia(buildFinanceRecurrencePayload({ form, session }));
        setForm(initialFinanceForm);
        setMessage({ type: "success", text: "Regra de recorrência criada e primeiro lançamento gerado." });
        await onRefresh();
        return;
      }

      const launches = buildFinanceLaunchPayloads({ form, session });
      await Promise.all(launches.map((payload) => endpoints.financeiro.criar(payload)));
      setForm(initialFinanceForm);
      setMessage({
        type: "success",
        text: launches.length === 1
          ? "Lançamento financeiro registrado."
          : `${formatNumber(launches.length)} lançamentos financeiros gerados automaticamente.`,
      });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateFinanceCategory(event) {
    event.preventDefault();
    if (!categoryForm.nome.trim()) {
      setMessage({ type: "error", text: "Informe o nome da categoria financeira." });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const categoria = await endpoints.categorias.criar(buildFinanceCategoryPayload(categoryForm));
      setForm((prev) => ({ ...prev, categoria: categoria.nome || categoryForm.nome.trim() }));
      setFinanceCategoryFilter(categoria.nome || categoryForm.nome.trim());
      setCategoryForm(initialFinanceCategoryForm);
      setShowCategoryForm(false);
      setMessage({ type: "success", text: "Categoria financeira cadastrada." });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusAction(id, action) {
    if (!id) return;
    setSaving(true);
    setMessage(null);
    try {
      const endpointName = getFinanceStatusActionEndpointName(action);
      await endpoints.financeiro[endpointName](id);
      setMessage({ type: "success", text: getFinanceStatusActionMessage(action) });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerateCharge(item) {
    if (!item.id) return;
    setSaving(true);
    setMessage(null);
    try {
      const cobranca = await endpoints.financeiro.gerarCobranca(item.id);
      setSelectedCharge(cobranca);
      setMessage({ type: "success", text: "Cobrança gerada para envio ao cliente." });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function copyChargeText(text, label) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setMessage({ type: "success", text: `${label} copiado.` });
    } catch {
      setMessage({ type: "error", text: "Não foi possível copiar automaticamente." });
    }
  }

  return {
    copyChargeText,
    handleCreateFinanceCategory,
    handleGenerateCharge,
    handleStatusAction,
    handleSubmit,
  };
}
