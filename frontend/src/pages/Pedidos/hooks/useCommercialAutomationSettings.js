import { useEffect, useState } from "react";
import { endpoints } from "../../../services/resources";
import {
  getCommercialAutomationBranchId,
  loadCommercialAutomationSettings,
  mergeCommercialAutomationSettings,
  persistCommercialAutomationSettings,
} from "../services/commercialAutomation";

export function useCommercialAutomationSettings({
  onRefresh,
  salesBranchFilter,
  setOrderMessage,
}) {
  const [commercialAutomationSettings, setCommercialAutomationSettings] = useState(loadCommercialAutomationSettings);
  const [commercialAutomationSource, setCommercialAutomationSource] = useState("local");
  const [savingCommercialAutomation, setSavingCommercialAutomation] = useState(false);

  useEffect(() => {
    persistCommercialAutomationSettings(commercialAutomationSettings);
  }, [commercialAutomationSettings]);

  useEffect(() => {
    let active = true;
    const filialId = getCommercialAutomationBranchId(salesBranchFilter);

    async function loadSettings() {
      try {
        const response = await endpoints.pedidos.configuracaoFollowUp(filialId);
        if (!active || !response) return;
        setCommercialAutomationSettings((current) => mergeCommercialAutomationSettings(current, response));
        setCommercialAutomationSource("backend");
      } catch {
        if (active) setCommercialAutomationSource("local");
      }
    }

    loadSettings();
    return () => {
      active = false;
    };
  }, [salesBranchFilter]);

  function updateCommercialAutomationSetting(field, value) {
    setCommercialAutomationSettings((current) => ({ ...current, [field]: value }));
  }

  async function saveCommercialAutomationSettings() {
    const filialId = getCommercialAutomationBranchId(salesBranchFilter);
    setSavingCommercialAutomation(true);
    setOrderMessage(null);
    try {
      const response = await endpoints.pedidos.atualizarConfiguracaoFollowUp({
        ...commercialAutomationSettings,
        filialId,
      });
      setCommercialAutomationSettings((current) => mergeCommercialAutomationSettings(current, response));
      setCommercialAutomationSource("backend");
      setOrderMessage({ type: "success", text: "Regras comerciais salvas no backend." });
      await onRefresh();
    } catch (error) {
      setCommercialAutomationSource("local");
      setOrderMessage({ type: "error", text: error.message || "Regras mantidas localmente; backend indisponivel." });
    } finally {
      setSavingCommercialAutomation(false);
    }
  }

  return {
    commercialAutomationSettings,
    commercialAutomationSource,
    saveCommercialAutomationSettings,
    savingCommercialAutomation,
    updateCommercialAutomationSetting,
  };
}
