import { errorMessage, getErrorText, successMessage } from "../../../constants/uiMessages";
import {
  initialCustomerFollowUpForm,
  initialCustomerForm,
} from "../constants/customerFormDefaults";
import { customerService } from "../services/customerService.js";
import { validateCustomerForm } from "../services/customerValidation.js";

export function useCustomerActions({
  customerFollowUpForm,
  form,
  onRefresh,
  setCustomerFollowUpForm,
  setForm,
  setMessage,
  setSaving,
  setShowCustomerForm,
}) {
  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validation = validateCustomerForm(form);
    if (!validation.valid) {
      setMessage(errorMessage(validation.message));
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      await customerService.create(validation.customer);
      setForm(initialCustomerForm);
      setMessage(successMessage("Cliente cadastrado com sucesso."));
      setShowCustomerForm(false);
      await onRefresh();
    } catch (error) {
      setMessage(errorMessage(getErrorText(error, "Não foi possível cadastrar o cliente.")));
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateCustomerFollowUp(event) {
    event.preventDefault();
    if (!customerFollowUpForm.pedidoId) {
      setMessage(errorMessage("Selecione um pedido do cliente para criar follow-up."));
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      await customerService.createFollowUp({
        pedidoId: customerFollowUpForm.pedidoId,
        canal: customerFollowUpForm.canal,
        proximaAcao: customerFollowUpForm.proximaAcao || null,
        observacao: customerFollowUpForm.observacao,
      });
      setCustomerFollowUpForm(initialCustomerFollowUpForm);
      setMessage(successMessage("Follow-up do cliente criado."));
      await onRefresh();
    } catch (error) {
      setMessage(errorMessage(getErrorText(error, "Não foi possível criar o follow-up do cliente.")));
    } finally {
      setSaving(false);
    }
  }

  return {
    handleCreateCustomerFollowUp,
    handleSubmit,
    updateForm,
  };
}
