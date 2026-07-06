import { useState } from "react";
import { initialFiscalConfigForm } from "../../../constants/admin";
import { endpoints } from "../../../services/resources";
import { asList } from "../../../utils/formatters";
import { buildFiscalConfigPayload } from "../utils/fiscalConfigPayload";
import { buildFiscalConfigFormDraft } from "../utils/formDrafts";

export function useFiscalConfigOperations({ empresaId, onRefresh, setMessage }) {
  const [fiscalConfigForm, setFiscalConfigForm] = useState(initialFiscalConfigForm);
  const [savingFiscalConfig, setSavingFiscalConfig] = useState(false);
  const [validatingFiscalConfigId, setValidatingFiscalConfigId] = useState(null);
  const [checkingFiscalServiceConfigId, setCheckingFiscalServiceConfigId] = useState(null);
  const [editingFiscalConfig, setEditingFiscalConfig] = useState(null);
  const [fiscalConfigStatusById, setFiscalConfigStatusById] = useState({});
  const [fiscalServiceStatusById, setFiscalServiceStatusById] = useState({});

  function updateFiscalConfigForm(field, value) {
    setFiscalConfigForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleFiscalConfigSubmit(event) {
    event.preventDefault();

    if (!empresaId) {
      setMessage({ type: "error", text: "Empresa não identificada para configuração fiscal." });
      return;
    }

    if (fiscalConfigForm.proximoNumero && Number(fiscalConfigForm.proximoNumero) < 1) {
      setMessage({ type: "error", text: "Próximo número fiscal deve ser maior que zero." });
      return;
    }

    setSavingFiscalConfig(true);
    setMessage(null);

    try {
      const payload = buildFiscalConfigPayload(fiscalConfigForm, empresaId);
      if (editingFiscalConfig.id) {
        await endpoints.fiscal.atualizarConfiguracao(editingFiscalConfig.id, payload);
      } else {
        await endpoints.fiscal.salvarConfiguracao(payload);
      }
      setFiscalConfigForm(initialFiscalConfigForm);
      setEditingFiscalConfig(null);
      setMessage({
        type: "success",
        text: editingFiscalConfig.id ? "Configuração fiscal atualizada." : "Configuração fiscal cadastrada.",
      });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSavingFiscalConfig(false);
    }
  }

  function editFiscalConfig(config) {
    setEditingFiscalConfig(config);
    setFiscalConfigForm(buildFiscalConfigFormDraft(config));
    setMessage(null);
  }

  function resetFiscalConfigForm() {
    setFiscalConfigForm(initialFiscalConfigForm);
    setEditingFiscalConfig(null);
    setMessage(null);
  }

  async function validateFiscalConfig(config) {
    if (!config.id) {
      return;
    }

    setValidatingFiscalConfigId(config.id);
    setMessage(null);

    try {
      const status = await endpoints.fiscal.statusConfiguracao(config.id);
      setFiscalConfigStatusById((prev) => ({ ...prev, [config.id]: status }));
      setMessage({
        type: status.prontoHomologacao ? "success" : "error",
        text: status.prontoHomologacao
          ? "Configuração pronta para homologação fiscal."
          : `Pendências fiscais: ${asList(status.pendencias).join(" ")}`,
      });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setValidatingFiscalConfigId(null);
    }
  }

  async function checkFiscalService(config) {
    if (!config.id) {
      return;
    }

    setCheckingFiscalServiceConfigId(config.id);
    setMessage(null);

    try {
      const status = await endpoints.fiscal.statusServicoConfiguracao(config.id);
      setFiscalServiceStatusById((prev) => ({ ...prev, [config.id]: status }));
      setMessage({
        type: status.disponivel ? "success" : "error",
        text: status.disponivel
          ? `Serviço fiscal disponível em homologação controlada: ${status.endpoint || "endpoint não informado"}.`
          : `Serviço fiscal indisponível: ${asList(status.pendencias).join(" ")}`,
      });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setCheckingFiscalServiceConfigId(null);
    }
  }

  return {
    checkFiscalService,
    checkingFiscalServiceConfigId,
    editFiscalConfig,
    editingFiscalConfig,
    fiscalConfigForm,
    fiscalConfigStatusById,
    fiscalServiceStatusById,
    handleFiscalConfigSubmit,
    resetFiscalConfigForm,
    savingFiscalConfig,
    updateFiscalConfigForm,
    validateFiscalConfig,
    validatingFiscalConfigId,
  };
}
