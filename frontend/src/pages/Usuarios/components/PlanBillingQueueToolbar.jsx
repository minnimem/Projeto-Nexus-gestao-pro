import { PlanBillingBulkActions } from "./PlanBillingBulkActions";
import { PlanBillingExportActions } from "./PlanBillingExportActions";
import { PlanBillingFilterControl } from "./PlanBillingFilterControl";

export function PlanBillingQueueToolbar({
  clearPlanBillingSelection,
  copySelectedPlanBillingMessages,
  planBillingFilter,
  planBillingFilteredItems,
  planBillingRows,
  savingBillingCompanyId,
  selectedPlanBillingItems,
  selectVisiblePlanBillingItems,
  setPlanBillingFilter,
  updateSelectedPlanBillingStatus,
}) {
  return (
    <div className="account-plan-head">
      <div>
        <h3>Fila de cobrança dos planos</h3>
        <p>Controle master de assinatura por empresa, vencimento mensal, baixa e risco de atraso.</p>
      </div>
      <div className="account-plan-actions">
        <PlanBillingFilterControl
          planBillingFilter={planBillingFilter}
          setPlanBillingFilter={setPlanBillingFilter}
        />
        <PlanBillingExportActions planBillingRows={planBillingRows} />
        <PlanBillingBulkActions
          clearPlanBillingSelection={clearPlanBillingSelection}
          copySelectedPlanBillingMessages={copySelectedPlanBillingMessages}
          planBillingFilteredItems={planBillingFilteredItems}
          savingBillingCompanyId={savingBillingCompanyId}
          selectedPlanBillingItems={selectedPlanBillingItems}
          selectVisiblePlanBillingItems={selectVisiblePlanBillingItems}
          updateSelectedPlanBillingStatus={updateSelectedPlanBillingStatus}
        />
      </div>
    </div>
  );
}
