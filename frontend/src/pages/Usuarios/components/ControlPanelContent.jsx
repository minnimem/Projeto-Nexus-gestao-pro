import { ModuleLiberationPanel } from "./ModuleLiberationPanel";
import { PlanBillingPanel } from "./PlanBillingPanel";

export function ControlPanelContent({
  canManagePlans,
  clearPlanBillingSelection,
  controlPanelTab,
  copyPlanBillingMessage,
  copySelectedPlanBillingMessages,
  handlePlanBillingStatusChange,
  handleReleaseSubmit,
  liberationRows,
  liberationStatuses,
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
  releaseDrafts,
  savePlanBillingNote,
  savingBillingCompanyId,
  savingReleaseModule,
  selectedPlanBillingIds,
  selectedPlanBillingItems,
  selectVisiblePlanBillingItems,
  setPlanBillingFilter,
  togglePlanBillingSelection,
  updatePlanBillingNote,
  updateReleaseDraft,
  updateSelectedPlanBillingStatus,
}) {
  if (controlPanelTab === "liberacoes") {
    return (
      <ModuleLiberationPanel
        canManagePlans={canManagePlans}
        handleReleaseSubmit={handleReleaseSubmit}
        liberationRows={liberationRows}
        liberationStatuses={liberationStatuses}
        releaseDrafts={releaseDrafts}
        savingReleaseModule={savingReleaseModule}
        updateReleaseDraft={updateReleaseDraft}
      />
    );
  }

  return (
    <PlanBillingPanel
      clearPlanBillingSelection={clearPlanBillingSelection}
      copyPlanBillingMessage={copyPlanBillingMessage}
      copySelectedPlanBillingMessages={copySelectedPlanBillingMessages}
      handlePlanBillingStatusChange={handlePlanBillingStatusChange}
      planBillingDueSoonItems={planBillingDueSoonItems}
      planBillingDueSoonTotal={planBillingDueSoonTotal}
      planBillingFilter={planBillingFilter}
      planBillingFilteredItems={planBillingFilteredItems}
      planBillingItems={planBillingItems}
      planBillingMonthlyTotal={planBillingMonthlyTotal}
      planBillingNotes={planBillingNotes}
      planBillingOpenItems={planBillingOpenItems}
      planBillingOpenTotal={planBillingOpenTotal}
      planBillingOverdueItems={planBillingOverdueItems}
      planBillingOverdueTotal={planBillingOverdueTotal}
      planBillingRecommendedAction={planBillingRecommendedAction}
      planBillingRows={planBillingRows}
      planBillingTrialTotal={planBillingTrialTotal}
      savePlanBillingNote={savePlanBillingNote}
      savingBillingCompanyId={savingBillingCompanyId}
      selectedPlanBillingIds={selectedPlanBillingIds}
      selectedPlanBillingItems={selectedPlanBillingItems}
      selectVisiblePlanBillingItems={selectVisiblePlanBillingItems}
      setPlanBillingFilter={setPlanBillingFilter}
      togglePlanBillingSelection={togglePlanBillingSelection}
      updatePlanBillingNote={updatePlanBillingNote}
      updateSelectedPlanBillingStatus={updateSelectedPlanBillingStatus}
    />
  );
}
