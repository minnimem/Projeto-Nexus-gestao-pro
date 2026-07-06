import { liberationStatuses } from "../../../constants/admin";
import { ControlPanelSection } from "./ControlPanelSection";

export function UserControlPanelContainer({
  companyAdmin,
  controlPanelTab,
  dashboard,
  planBilling,
  setControlPanelTab,
}) {
  return (
    <ControlPanelSection
      canManagePlans={dashboard.canManagePlans}
      clearPlanBillingSelection={planBilling.clearPlanBillingSelection}
      controlPanelTab={controlPanelTab}
      copyPlanBillingMessage={planBilling.copyPlanBillingMessage}
      copySelectedPlanBillingMessages={planBilling.copySelectedPlanBillingMessages}
      handlePlanBillingStatusChange={planBilling.handlePlanBillingStatusChange}
      handleReleaseSubmit={companyAdmin.handleReleaseSubmit}
      liberationRows={dashboard.liberationRows}
      liberationStatuses={liberationStatuses}
      planBillingDueSoonItems={planBilling.planBillingDueSoonItems}
      planBillingDueSoonTotal={planBilling.planBillingDueSoonTotal}
      planBillingFilter={planBilling.planBillingFilter}
      planBillingFilteredItems={planBilling.planBillingFilteredItems}
      planBillingItems={planBilling.planBillingItems}
      planBillingMonthlyTotal={planBilling.planBillingMonthlyTotal}
      planBillingNotes={planBilling.planBillingNotes}
      planBillingOpenItems={planBilling.planBillingOpenItems}
      planBillingOpenTotal={planBilling.planBillingOpenTotal}
      planBillingOverdueItems={planBilling.planBillingOverdueItems}
      planBillingOverdueTotal={planBilling.planBillingOverdueTotal}
      planBillingRecommendedAction={planBilling.planBillingRecommendedAction}
      planBillingRows={planBilling.planBillingRows}
      planBillingTrialTotal={planBilling.planBillingTrialTotal}
      releaseDrafts={companyAdmin.releaseDrafts}
      savePlanBillingNote={planBilling.savePlanBillingNote}
      savingBillingCompanyId={planBilling.savingBillingCompanyId}
      savingReleaseModule={companyAdmin.savingReleaseModule}
      selectedPlanBillingIds={planBilling.selectedPlanBillingIds}
      selectedPlanBillingItems={planBilling.selectedPlanBillingItems}
      selectVisiblePlanBillingItems={planBilling.selectVisiblePlanBillingItems}
      setControlPanelTab={setControlPanelTab}
      setPlanBillingFilter={planBilling.setPlanBillingFilter}
      togglePlanBillingSelection={planBilling.togglePlanBillingSelection}
      updatePlanBillingNote={planBilling.updatePlanBillingNote}
      updateReleaseDraft={companyAdmin.updateReleaseDraft}
      updateSelectedPlanBillingStatus={planBilling.updateSelectedPlanBillingStatus}
    />
  );
}
