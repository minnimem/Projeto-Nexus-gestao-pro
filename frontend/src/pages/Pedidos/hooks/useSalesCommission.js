import { useState } from "react";
import { asList } from "../../../utils/formatters";
import { normalizePerfil } from "../../../utils/permissions";
import { getSellerPerformance } from "../services/sellerPerformance";
import { useCommissionActions } from "./useCommissionActions";

export function useSalesCommission({
  branchScopedOrders,
  data,
  onRefresh,
  selectedSalesBranchLabel,
  session,
  setOrderMessage,
  setSavingOrderAction,
}) {
  const [commissionRateInput, setCommissionRateInput] = useState("");
  const [sellerGoalDrafts, setSellerGoalDrafts] = useState({});
  const [sellerRankingFilter, setSellerRankingFilter] = useState({ inicio: "", fim: "" });
  const commissionPercent = Number(data.comissaoConfig?.percentualPadrao || 3);
  const canManageCommission = ["ADMIN", "GERENTE"].includes(normalizePerfil(session.perfil));
  const usuarios = asList(data.usuarios);
  const sellers = usuarios.filter((usuario) =>
    ["VENDEDOR", "GERENTE"].includes(String(usuario.perfil || "")),
  );
  const { handleSaveCommissionConfig, handleSaveSellerGoal } = useCommissionActions({
    commissionPercent,
    commissionRateInput,
    onRefresh,
    sellerSource: usuarios,
    sellers,
    sellerGoalDrafts,
    setCommissionRateInput,
    setOrderMessage,
    setSellerGoalDrafts,
    setSavingOrderAction,
  });
  const performance = getSellerPerformance({
    branchScopedOrders,
    commissionPercent,
    selectedSalesBranchLabel,
    sellerRankingFilter,
    sellers,
  });

  return {
    canManageCommission,
    commissionPercent,
    commissionRateInput,
    handleSaveCommissionConfig,
    handleSaveSellerGoal,
    sellerGoalDrafts,
    sellerRankingFilter,
    setCommissionRateInput,
    setSellerGoalDrafts,
    setSellerRankingFilter,
    ...performance,
  };
}
