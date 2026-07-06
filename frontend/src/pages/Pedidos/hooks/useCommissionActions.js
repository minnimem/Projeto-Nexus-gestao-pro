import { useEffect } from "react";
import { endpoints } from "../../../services/resources";
import {
  buildSellerGoalDrafts,
  buildSellerGoalPayload,
  validateCommissionPercent,
  validateSellerGoal,
} from "../services/commissionActions";

export function useCommissionActions({
  commissionRateInput,
  commissionPercent,
  onRefresh,
  sellerSource,
  sellers,
  sellerGoalDrafts,
  setCommissionRateInput,
  setOrderMessage,
  setSellerGoalDrafts,
  setSavingOrderAction,
}) {
  useEffect(() => {
    setCommissionRateInput(String(commissionPercent));
  }, [commissionPercent, setCommissionRateInput]);

  useEffect(() => {
    setSellerGoalDrafts(buildSellerGoalDrafts(sellers));
  }, [sellerSource, setSellerGoalDrafts]);

  async function handleSaveCommissionConfig() {
    const { error, percentual } = validateCommissionPercent(commissionRateInput);
    if (error) {
      setOrderMessage({ type: "error", text: error });
      return;
    }

    setSavingOrderAction("commission-config");
    setOrderMessage(null);
    try {
      await endpoints.comissoes.atualizarConfig({ percentualPadrao: percentual });
      setOrderMessage({ type: "success", text: "Regra de comissão atualizada." });
      await onRefresh();
    } catch (error) {
      setOrderMessage({ type: "error", text: error.message || "Não foi possível salvar a comissão." });
    } finally {
      setSavingOrderAction("");
    }
  }

  async function handleSaveSellerGoal(usuario) {
    if (!usuario.id) return;

    const { error, meta } = validateSellerGoal(sellerGoalDrafts[usuario.id]);
    if (error) {
      setOrderMessage({ type: "error", text: error });
      return;
    }

    setSavingOrderAction(`meta-${usuario.id}`);
    setOrderMessage(null);
    try {
      await endpoints.usuarios.atualizar(usuario.id, buildSellerGoalPayload({ meta, usuario }));
      setOrderMessage({ type: "success", text: "Meta do vendedor atualizada." });
      await onRefresh();
    } catch (error) {
      setOrderMessage({ type: "error", text: error.message || "Não foi possível salvar a meta." });
    } finally {
      setSavingOrderAction("");
    }
  }

  return { handleSaveCommissionConfig, handleSaveSellerGoal };
}
