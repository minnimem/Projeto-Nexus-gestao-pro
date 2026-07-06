import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { AlertToneIcon } from "../common/StatusUi";
import { formatNumber } from "../../utils/formatters";
import "./HeaderAlerts.css";

export function HeaderAlerts({
  activeModule,
  activePeriodLabel,
  activateModule,
  dismissVisibleAlerts,
  dismissedAlerts,
  filteredAlerts,
  getDismissKey,
  lastUpdatedAt,
  setDismissedAlerts,
  setFilter,
  setShowAlerts,
  showAlerts,
  status,
  activeAlertCount,
  alertBadgeTone,
  alertFilter,
  alertPriorityText,
  alertRef,
  alerts,
  alertSummary,
  dismissableAlerts,
  dismissedAlertCount,
  visibleModules,
}) {
  const updatedLabel = status === "loading"
    ? "sincronizando"
    : lastUpdatedAt
      ? `atualizado ${new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(lastUpdatedAt)}`
      : "aguardando sync";

  function toggleAlerts() {
    setShowAlerts((current) => {
      const next = !current;
      if (next) setFilter("all");
      return next;
    });
  }

  function dismissAlert(alert) {
    setDismissedAlerts((current) => Array.from(new Set([...current, getDismissKey(alert)])));
  }

  return (
    <div className="topbar-alert-wrapper" ref={alertRef}>
      <button
        className={`topbar-alert-button ${activeAlertCount > 0 ? "has-alert" : ""}`}
        onClick={toggleAlerts}
        title="Notificações"
        type="button"
      >
        <AlertTriangle size={16} />
        {activeAlertCount > 0 && (
          <span className={`topbar-alert-count ${alertBadgeTone}`}>{formatNumber(activeAlertCount)}</span>
        )}
      </button>

      {showAlerts && (
        <div className="topbar-alert-menu">
          <div className="topbar-alert-head">
            <strong>Central de alertas</strong>
            <span>{formatNumber(alerts.length)}</span>
          </div>
          <div className="topbar-alert-context">
            <span>{activeModule.label || "Módulo"}</span>
            <small>{activePeriodLabel} / {updatedLabel}</small>
          </div>
          <div className={`topbar-alert-priority ${alertBadgeTone}`}>
            <AlertToneIcon tone={alertBadgeTone} />
            <strong>{alertPriorityText}</strong>
          </div>
          <div className="topbar-alert-ops">
            <span>
              <strong>{formatNumber(activeAlertCount)}</strong>
              <small>abertos</small>
            </span>
            <span>
              <strong>{formatNumber(dismissedAlertCount)}</strong>
              <small>vistos</small>
            </span>
            <button disabled={dismissableAlerts.length === 0} onClick={dismissVisibleAlerts} type="button">
              Marcar todos
            </button>
          </div>

          {dismissedAlerts.length > 0 && (
            <button className="topbar-alert-restore" onClick={() => setDismissedAlerts([])} type="button">
              Restaurar vistos
            </button>
          )}

          <div className="topbar-alert-summary">
            <button className={alertFilter === "all" ? "active" : ""} onClick={() => setFilter("all")} type="button">
              {formatNumber(activeAlertCount)} todos
            </button>
            <button
              className={`${alertSummary.danger > 0 ? "danger" : ""}${alertFilter === "danger" ? " active" : ""}`}
              onClick={() => setFilter("danger")}
              type="button"
            >
              {formatNumber(alertSummary.danger)} crítico(s)
            </button>
            <button
              className={`${alertSummary.warning > 0 ? "warning" : ""}${alertFilter === "warning" ? " active" : ""}`}
              onClick={() => setFilter("warning")}
              type="button"
            >
              {formatNumber(alertSummary.warning)} atenção
            </button>
            <button
              className={`${alertSummary.info > 0 ? "info" : ""}${alertFilter === "info" ? " active" : ""}`}
              onClick={() => setFilter("info")}
              type="button"
            >
              {formatNumber(alertSummary.info)} info
            </button>
          </div>

          <div className="topbar-alert-list">
            {filteredAlerts.length === 0 ? (
              <div className="topbar-alert-empty">
                <CheckCircle2 size={16} />
                <strong>Nada neste filtro</strong>
                <small>Escolha outro tipo de alerta ou veja todos.</small>
              </div>
            ) : filteredAlerts.map((alert) => (
              <div className={`topbar-alert-item ${alert.tone}`} key={alert.id}>
                <div className="topbar-alert-item-head">
                  <AlertToneIcon tone={alert.tone} />
                  <div className="topbar-alert-copy">
                    <strong>{alert.title}</strong>
                    <small>{alert.detail}</small>
                  </div>
                  <em>{alert.tone === "danger" ? "Crítico" : alert.tone === "warning" ? "Atenção" : alert.tone === "info" ? "Info" : "Ok"}</em>
                </div>
                {alert.module && visibleModules.some((module) => module.value === alert.module) && (
                  <button
                    className="topbar-alert-action"
                    onClick={() => {
                      activateModule(alert.module);
                      setShowAlerts(false);
                    }}
                    type="button"
                  >
                    {alert.actionLabel || "Abrir"}
                  </button>
                )}
                {alert.tone !== "success" && (
                  <button className="topbar-alert-dismiss" onClick={() => dismissAlert(alert)} type="button">
                    Visto
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
