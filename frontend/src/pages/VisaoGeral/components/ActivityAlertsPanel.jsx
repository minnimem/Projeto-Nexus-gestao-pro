import { formatDateTime, formatNumber } from "../../../utils/formatters";

export function ActivityAlertsPanel({
  activeAutomationAlerts,
  dismissedAutomationAlerts,
  dismissAutomationAlert,
  recentActivityRows,
  restoreAutomationAlerts,
  showActivity,
  showAlerts,
}) {
  if (!showActivity && !showAlerts) return null;

  return (
    <section className="overview-activity-grid">
      {showActivity && (
        <article className="panel recent-activity-panel">
          <div className="panel-title compact">
            <div>
              <h2>Atividades recentes</h2>
              <p>Vendas, estoque e financeiro em uma leitura operacional.</p>
            </div>
            <span>{formatNumber(recentActivityRows.length)} eventos</span>
          </div>

          <div className="table-wrap compact-table">
            <table>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Descrição</th>
                  <th>Usuário</th>
                  <th>Data</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentActivityRows.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-cell">Nenhuma atividade recente para exibir.</td>
                  </tr>
                ) : (
                  recentActivityRows.map((item) => (
                    <tr key={item.id}>
                      <td><span className="status-pill">{item.tipo}</span></td>
                      <td>{item.descricao}</td>
                      <td>{item.usuario}</td>
                      <td>{formatDateTime(item.data)}</td>
                      <td>{item.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>
      )}

      {showAlerts && (
        <aside className="panel compact-alert-panel">
          <div className="panel-title compact">
            <div>
              <h2>Alertas</h2>
              <p>Prioridades automáticas.</p>
            </div>
            <span>{formatNumber(activeAutomationAlerts.length)}</span>
          </div>

          <div className="compact-alert-list">
            {activeAutomationAlerts.length === 0 ? (
              <div className="empty-selection compact">Sem alertas ativos.</div>
            ) : (
              activeAutomationAlerts.slice(0, 4).map((alert) => (
                <div className={`compact-alert-card ${alert.tone}`} key={alert.id}>
                  <div>
                    <strong>{alert.title}</strong>
                    <small>{alert.detail}</small>
                  </div>
                  <button onClick={() => dismissAutomationAlert(alert.id)} type="button">
                    Ocultar
                  </button>
                </div>
              ))
            )}
          </div>

          {dismissedAutomationAlerts.length > 0 && (
            <button className="compact-restore-button" onClick={restoreAutomationAlerts} type="button">
              Reativar alertas ocultos
            </button>
          )}
        </aside>
      )}
    </section>
  );
}
