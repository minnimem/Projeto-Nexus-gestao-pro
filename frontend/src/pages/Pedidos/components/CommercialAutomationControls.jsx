import { CommercialAutomationRuleGrid } from "./CommercialAutomationRuleGrid";
import { CommercialAutomationSettingsForm } from "./CommercialAutomationSettingsForm";

export function CommercialAutomationControls({
  commercialAutomationRules,
  commercialAutomationSettings,
  commercialAutomationSource,
  loadingNotificationStatus,
  notificationStatus,
  saveCommercialAutomationSettings,
  savingCommercialAutomation,
  updateCommercialAutomationSetting,
}) {
  return (
    <>
      <CommercialAutomationSettingsForm
        commercialAutomationSettings={commercialAutomationSettings}
        commercialAutomationSource={commercialAutomationSource}
        loadingNotificationStatus={loadingNotificationStatus}
        notificationStatus={notificationStatus}
        saveCommercialAutomationSettings={saveCommercialAutomationSettings}
        savingCommercialAutomation={savingCommercialAutomation}
        updateCommercialAutomationSetting={updateCommercialAutomationSetting}
      />
      <CommercialAutomationRuleGrid
        commercialAutomationRules={commercialAutomationRules}
        updateCommercialAutomationSetting={updateCommercialAutomationSetting}
      />
    </>
  );
}
