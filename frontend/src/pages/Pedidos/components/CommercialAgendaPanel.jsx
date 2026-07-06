import { CommercialAgendaSection } from "./CommercialAgendaSection";
import { CommercialClientTimeline } from "./CommercialClientTimeline";

export function CommercialAgendaPanel({
  canManageNotifications,
  commercialAgendaGroups,
  commercialAutomationRules,
  commercialAutomationSettings,
  commercialAutomationSource,
  commercialClientTimeline,
  commercialReminderCards,
  dueCommercialFollowUps,
  handleSendCommercialNotifications,
  loadingNotificationStatus,
  notificationStatus,
  saveCommercialAutomationSettings,
  savingCommercialAutomation,
  savingOrderAction,
  updateCommercialAutomationSetting,
}) {
  if (commercialReminderCards.length === 0 && commercialClientTimeline.length === 0) return null;

  return (
    <div className="commercial-timeline-panel">
      <CommercialAgendaSection
        canManageNotifications={canManageNotifications}
        commercialAgendaGroups={commercialAgendaGroups}
        commercialAutomationRules={commercialAutomationRules}
        commercialAutomationSettings={commercialAutomationSettings}
        commercialAutomationSource={commercialAutomationSource}
        dueCommercialFollowUps={dueCommercialFollowUps}
        handleSendCommercialNotifications={handleSendCommercialNotifications}
        loadingNotificationStatus={loadingNotificationStatus}
        notificationStatus={notificationStatus}
        saveCommercialAutomationSettings={saveCommercialAutomationSettings}
        savingCommercialAutomation={savingCommercialAutomation}
        savingOrderAction={savingOrderAction}
        updateCommercialAutomationSetting={updateCommercialAutomationSetting}
      />
      <CommercialClientTimeline commercialClientTimeline={commercialClientTimeline} />
    </div>
  );
}
