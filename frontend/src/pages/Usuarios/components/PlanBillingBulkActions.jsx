import { CheckCircle2, CircleDollarSign, Copy, Loader2, X } from "lucide-react";

export function PlanBillingBulkActions({
  clearPlanBillingSelection,
  copySelectedPlanBillingMessages,
  planBillingFilteredItems,
  savingBillingCompanyId,
  selectedPlanBillingItems,
  selectVisiblePlanBillingItems,
  updateSelectedPlanBillingStatus,
}) {
  const hasSelection = selectedPlanBillingItems.length > 0;
  const savingBulkAction = Boolean(savingBillingCompanyId);

  return (
    <>
      <button
        disabled={planBillingFilteredItems.length === 0}
        onClick={selectVisiblePlanBillingItems}
        type="button"
      >
        <CheckCircle2 size={15} />
        Selecionar fila
      </button>
      <button disabled={!hasSelection} onClick={copySelectedPlanBillingMessages} type="button">
        <Copy size={15} />
        Copiar selecionadas
      </button>
      <button
        disabled={!hasSelection || savingBulkAction}
        onClick={() =>
          updateSelectedPlanBillingStatus(
            "PENDENTE",
            "Marcado para cobrança em lote pelo painel master.",
          )
        }
        type="button"
      >
        {savingBulkAction ? <Loader2 className="spin" size={15} /> : <CircleDollarSign size={15} />}
        Cobrar lote
      </button>
      <button
        disabled={!hasSelection || savingBulkAction}
        onClick={() =>
          updateSelectedPlanBillingStatus(
            "ATIVA",
            "Assinatura regularizada em lote pelo painel master.",
          )
        }
        type="button"
      >
        {savingBulkAction ? <Loader2 className="spin" size={15} /> : <CheckCircle2 size={15} />}
        Regularizar lote
      </button>
      {hasSelection && (
        <button onClick={clearPlanBillingSelection} type="button">
          <X size={15} />
          Limpar
        </button>
      )}
    </>
  );
}
