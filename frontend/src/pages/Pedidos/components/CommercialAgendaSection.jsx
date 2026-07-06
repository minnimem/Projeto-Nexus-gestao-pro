import { Loader2, Mail } from "lucide-react";
import { formatNumber } from "../../../utils/formatters";
import { CommercialAgendaGrid } from "./CommercialAgendaGrid";
import { CommercialAutomationControls } from "./CommercialAutomationControls";

export function CommercialAgendaSection({
  canManageNotifications,
  commercialAgendaGroups,
  commercialAutomationRules,
  commercialAutomationSettings,
  commercialAutomationSource,
  dueCommercialFollowUps,
  handleSendCommercialNotifications,
  loadingNotificationStatus,
  notificationStatus,
  saveCommercialAutomationSettings,
  savingCommercialAutomation,
  savingOrderAction,
  updateCommercialAutomationSetting,
}) {
  return (
    <section>
      <div className="commercial-priority-head">
        <span>Agenda comercial</span>
        <small>{formatNumber(dueCommercialFollowUps.length)} hoje ou vencidos</small>
      </div>
      {canManageNotifications && (
        <button
          className="commercial-agenda-send"
          disabled={savingOrderAction === "commercial-notifications"}
          onClick={handleSendCommercialNotifications}
          type="button"
        >
          {savingOrderAction === "commercial-notifications" ? <Loader2 className="spin" size={15} /> : <Mail size={15} />}
          Disparar lembretes
        </button>
      )}

      <CommercialAgendaGrid commercialAgendaGroups={commercialAgendaGroups} />

      <CommercialAutomationControls
        commercialAutomationRules={commercialAutomationRules}
        commercialAutomationSettings={commercialAutomationSettings}
        commercialAutomationSource={commercialAutomationSource}
        loadingNotificationStatus={loadingNotificationStatus}
        notificationStatus={notificationStatus}
        saveCommercialAutomationSettings={saveCommercialAutomationSettings}
        savingCommercialAutomation={savingCommercialAutomation}
        updateCommercialAutomationSetting={updateCommercialAutomationSetting}
      />
    </section>
  );
}
