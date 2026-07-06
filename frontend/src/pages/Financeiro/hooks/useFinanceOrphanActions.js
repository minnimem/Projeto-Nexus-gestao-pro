import { useEffect, useState } from "react";
import { endpoints } from "../../../services/resources";
import { buildConfirmationText, requestConfirmation } from "../../../utils/confirmations";
import { asList, formatNumber } from "../../../utils/formatters";

export function useFinanceOrphanActions({
  onRefresh,
  orphanPreview,
  pedidosSemItens,
  setMessage,
  setSaving,
}) {
  const [selectedOrphanIds, setSelectedOrphanIds] = useState([]);

  useEffect(() => {
    const validIds = new Set(pedidosSemItens.map((pedido) => String(pedido.id)));
    setSelectedOrphanIds((current) => current.filter((id) => validIds.has(String(id))));
  }, [pedidosSemItens]);

  function handleToggleOrphanSelection(id) {
    const normalizedId = String(id || "");
    if (!normalizedId) return;
    setSelectedOrphanIds((current) =>
      current.includes(normalizedId)
        ? current.filter((item) => item !== normalizedId)
        : [...current, normalizedId],
    );
  }

  function handleToggleVisibleOrphans() {
    const visibleIds = orphanPreview.map((pedido) => String(pedido.id));
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedOrphanIds.includes(id));
    setSelectedOrphanIds((current) => {
      if (allSelected) return current.filter((id) => !visibleIds.includes(id));
      return Array.from(new Set([...current, ...visibleIds]));
    });
  }

  async function handleCancelOrphanOrders(ids, scopeLabel) {
    const uniqueIds = Array.from(new Set(asList(ids).map((id) => String(id || "")).filter(Boolean)));
    if (uniqueIds.length === 0) return;
    const confirmationLabel = scopeLabel || `${formatNumber(uniqueIds.length)} pedidos`;
    const confirmationText = buildConfirmationText("Cancelar", confirmationLabel, "sem itens cadastrados");
    if (!requestConfirmation(confirmationText)) return;
    setSaving(true);
    setMessage(null);
    try {
      const response = uniqueIds.length === 1
        ? await endpoints.pedidos.cancelarInconsistente(uniqueIds[0]).then(() => ({ cancelados: 1 }))
        : await endpoints.pedidos.cancelarInconsistentes(uniqueIds);
      const totalCancelados = Number(response.cancelados || uniqueIds.length);
      setSelectedOrphanIds((current) => current.filter((id) => !uniqueIds.includes(id)));
      setMessage({
        type: "success",
        text: totalCancelados === 1
          ? "Pedido sem itens cancelado com auditoria."
          : `${formatNumber(totalCancelados)} pedidos sem itens cancelados com auditoria.`,
      });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleCancelOrphanOrder(id) {
    await handleCancelOrphanOrders([id], "este pedido");
  }

  const visibleOrphanIds = orphanPreview.map((pedido) => String(pedido.id));
  const allVisibleOrphansSelected = visibleOrphanIds.length > 0
    && visibleOrphanIds.every((id) => selectedOrphanIds.includes(id));

  return {
    allVisibleOrphansSelected,
    handleCancelOrphanOrder,
    handleCancelOrphanOrders,
    handleToggleOrphanSelection,
    handleToggleVisibleOrphans,
    selectedOrphanIds,
  };
}
