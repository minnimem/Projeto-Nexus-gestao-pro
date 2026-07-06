import { CheckCircle2, Loader2 } from "lucide-react";

export function CommercialAutomationSettingsForm({
  commercialAutomationSettings,
  commercialAutomationSource,
  loadingNotificationStatus,
  notificationStatus,
  saveCommercialAutomationSettings,
  savingCommercialAutomation,
  updateCommercialAutomationSetting,
}) {
  const statusText = loadingNotificationStatus
    ? "Consultando notificações"
    : notificationStatus?.ativo
      ? `Webhook pronto${notificationStatus.destino ? ` / ${notificationStatus.destino}` : ""}`
      : notificationStatus
        ? "Webhook pendente"
        : commercialAutomationSource === "backend"
          ? "Backend sincronizado"
          : "Fallback local";

  return (
    <div className="commercial-rule-controls">
      <label className="form-control">
        <span>Canal padrão</span>
        <select
          value={commercialAutomationSettings.channel}
          onChange={(event) => updateCommercialAutomationSetting("channel", event.target.value)}
        >
          <option value="WEBHOOK">Webhook</option>
          <option value="WHATSAPP">WhatsApp</option>
          <option value="EMAIL">E-mail</option>
        </select>
      </label>
      <label className="form-control">
        <span>Alto valor a partir de</span>
        <input
          min="0"
          step="100"
          type="number"
          value={commercialAutomationSettings.highValueThreshold}
          onChange={(event) => updateCommercialAutomationSetting("highValueThreshold", Number(event.target.value || 0))}
        />
      </label>
      <div className="commercial-rule-save">
        <span>{statusText}</span>
        <button
          className="mini-action-button"
          disabled={savingCommercialAutomation}
          onClick={saveCommercialAutomationSettings}
          type="button"
        >
          {savingCommercialAutomation ? <Loader2 className="spin" size={15} /> : <CheckCircle2 size={15} />}
          Salvar regras
        </button>
      </div>
    </div>
  );
}
