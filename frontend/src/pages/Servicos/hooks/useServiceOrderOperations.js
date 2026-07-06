import { endpoints } from "../../../services/resources.js";
import { initialServiceOrderForm } from "../constants/serviceConstants.js";
import {
  buildServiceChecklistPayload,
  buildServiceOrderPayload,
  getServiceActionSuccessMessage,
  validateServiceOrderForm,
} from "../services/serviceOrderRules.js";

export function useServiceOrderOperations({
  form,
  onRefresh,
  session,
  setForm,
  setFormStep,
  setMessage,
  setSaving,
  setSavingChecklist,
  setSavingStatus,
  setUploadingAttachment,
}) {
  async function handleCreateServiceOrder(event) {
    event.preventDefault();

    const validation = validateServiceOrderForm(form);
    if (validation.error) {
      setMessage({ type: "error", text: validation.error });
      setFormStep(validation.step);
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      await endpoints.ordensServico.criar(buildServiceOrderPayload({ form, session }));
      setForm(initialServiceOrderForm);
      setFormStep("cliente");
      setMessage({ type: "success", text: "Ordem de serviço aberta." });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(ordem, status) {
    setSavingStatus(`${ordem.id}-${status}`);
    setMessage(null);

    try {
      await endpoints.ordensServico.atualizarStatus(ordem.id, { status });
      setMessage({ type: "success", text: `OS ${ordem.numero || ""} atualizada para ${status}.` });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSavingStatus("");
    }
  }

  async function handleInvoiceServiceOrder(ordem) {
    setSavingStatus(`${ordem.id}-FATURAR`);
    setMessage(null);

    try {
      const response = await endpoints.ordensServico.faturar(ordem.id);
      setMessage({ type: "success", text: getServiceActionSuccessMessage("invoice", ordem, response) });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSavingStatus("");
    }
  }

  async function handleConsumeServiceParts(ordem) {
    setSavingStatus(`${ordem.id}-BAIXAR-PECAS`);
    setMessage(null);

    try {
      const response = await endpoints.ordensServico.baixarPecas(ordem.id);
      setMessage({ type: "success", text: getServiceActionSuccessMessage("consumeParts", ordem, response) });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSavingStatus("");
    }
  }

  async function handleServiceAttachmentUpload(ordem, file) {
    if (!file) return;
    setUploadingAttachment(ordem.id);
    setMessage(null);

    try {
      const response = await endpoints.ordensServico.enviarAnexo(ordem.id, file);
      setMessage({ type: "success", text: getServiceActionSuccessMessage("attachment", ordem, response) });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setUploadingAttachment("");
    }
  }

  async function handleServiceSignatureUpload(ordem, file) {
    if (!file) return;
    setUploadingAttachment(`${ordem.id}-assinatura`);
    setMessage(null);

    try {
      const response = await endpoints.ordensServico.enviarAssinatura(ordem.id, file, {
        nomeResponsavel: ordem.assinaturaClienteNome || ordem.cliente || "",
        documentoResponsavel: ordem.assinaturaClienteDocumento || "",
        observacao: "Assinatura digitalizada anexada pela OS.",
      });
      setMessage({ type: "success", text: getServiceActionSuccessMessage("signature", ordem, response) });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setUploadingAttachment("");
    }
  }

  async function handleChecklistToggle(ordem, index) {
    const checklistPayload = buildServiceChecklistPayload({ index, ordem, session });
    if (checklistPayload.error) return;

    setSavingChecklist(`${ordem.id}-${index}`);
    setMessage(null);

    try {
      await endpoints.ordensServico.atualizar(ordem.id, checklistPayload.payload);
      setMessage({ type: "success", text: `Checklist da OS ${ordem.numero || ""} atualizado.` });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSavingChecklist("");
    }
  }

  return {
    handleChecklistToggle,
    handleConsumeServiceParts,
    handleCreateServiceOrder,
    handleInvoiceServiceOrder,
    handleServiceAttachmentUpload,
    handleServiceSignatureUpload,
    handleStatusChange,
  };
}
