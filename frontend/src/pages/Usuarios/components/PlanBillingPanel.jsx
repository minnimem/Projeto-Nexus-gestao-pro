import { PlanBillingKpis } from "./PlanBillingKpis";
import { PlanBillingQueueToolbar } from "./PlanBillingQueueToolbar";
import { PlanBillingRecommendedAction } from "./PlanBillingRecommendedAction";
import { PlanBillingTable } from "./PlanBillingTable";

export function PlanBillingPanel({
  clearPlanBillingSelection,
  copyPlanBillingMessage,
  copySelectedPlanBillingMessages,
  handlePlanBillingStatusChange,
  planBillingDueSoonItems,
  planBillingDueSoonTotal,
  planBillingFilter,
  planBillingFilteredItems,
  planBillingItems,
  planBillingMonthlyTotal,
  planBillingNotes,
  planBillingOpenItems,
  planBillingOpenTotal,
  planBillingOverdueItems,
  planBillingOverdueTotal,
  planBillingRecommendedAction,
  planBillingRows,
  planBillingTrialTotal,
  savePlanBillingNote,
  savingBillingCompanyId,
  selectedPlanBillingIds,
  selectedPlanBillingItems,
  selectVisiblePlanBillingItems,
  setPlanBillingFilter,
  togglePlanBillingSelection,
  updatePlanBillingNote,
  updateSelectedPlanBillingStatus,
}) {
  return (
    <div className="dashboard-grid">
      <PlanBillingKpis
        planBillingDueSoonItems={planBillingDueSoonItems}
        planBillingDueSoonTotal={planBillingDueSoonTotal}
        planBillingItems={planBillingItems}
        planBillingMonthlyTotal={planBillingMonthlyTotal}
        planBillingOpenItems={planBillingOpenItems}
        planBillingOpenTotal={planBillingOpenTotal}
        planBillingOverdueItems={planBillingOverdueItems}
        planBillingOverdueTotal={planBillingOverdueTotal}
        planBillingTrialTotal={planBillingTrialTotal}
      />

      <PlanBillingRecommendedAction
        planBillingDueSoonItems={planBillingDueSoonItems}
        planBillingOpenItems={planBillingOpenItems}
        planBillingOverdueItems={planBillingOverdueItems}
        planBillingRecommendedAction={planBillingRecommendedAction}
        setPlanBillingFilter={setPlanBillingFilter}
      />

      <PlanBillingQueueToolbar
        clearPlanBillingSelection={clearPlanBillingSelection}
        copySelectedPlanBillingMessages={copySelectedPlanBillingMessages}
        planBillingFilter={planBillingFilter}
        planBillingFilteredItems={planBillingFilteredItems}
        planBillingRows={planBillingRows}
        savingBillingCompanyId={savingBillingCompanyId}
        selectedPlanBillingItems={selectedPlanBillingItems}
        selectVisiblePlanBillingItems={selectVisiblePlanBillingItems}
        setPlanBillingFilter={setPlanBillingFilter}
        updateSelectedPlanBillingStatus={updateSelectedPlanBillingStatus}
      />

      <PlanBillingTable
        copyPlanBillingMessage={copyPlanBillingMessage}
        handlePlanBillingStatusChange={handlePlanBillingStatusChange}
        planBillingFilteredItems={planBillingFilteredItems}
        planBillingNotes={planBillingNotes}
        savePlanBillingNote={savePlanBillingNote}
        savingBillingCompanyId={savingBillingCompanyId}
        selectedPlanBillingIds={selectedPlanBillingIds}
        togglePlanBillingSelection={togglePlanBillingSelection}
        updatePlanBillingNote={updatePlanBillingNote}
      />
    </div>
  );
}
