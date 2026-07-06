import { Download, Printer } from "lucide-react";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { formatCurrency, formatNumber, getLocalDateKey } from "../../../utils/formatters";

export function OperationalBiPanel({
  activeAutomationAlerts,
  operationalBiExportRows,
  operationalBiRows,
  operationalBiScore,
  operationalBiStatus,
  operationalBiTone,
  projectedRevenue,
  session,
}) {
  return (
    <section className="panel operational-bi-panel">
      <div className="account-plan-head">
        <div>
          <h3>BI operacional</h3>
          <p>Score executivo por área para decidir prioridade do dia.</p>
        </div>
        <div className="account-plan-actions">
          <span className={`bi-score-pill ${operationalBiTone}`}>{operationalBiScore}/100 - {operationalBiStatus}</span>
          <button
            disabled={operationalBiExportRows.length === 0}
            onClick={() => downloadCsv(`nexus-one-bi-operacional-${getLocalDateKey()}.csv`, operationalBiExportRows)}
            type="button"
          >
            <Download size={15} />
            CSV
          </button>
          <button
            disabled={operationalBiExportRows.length === 0}
            onClick={() => printRowsDocument("BI operacional", operationalBiExportRows, session.empresa || "Nexus One")}
            type="button"
          >
            <Printer size={15} />
            PDF
          </button>
        </div>
      </div>
      <div className="operational-bi-grid">
        <article className={`operational-bi-main ${operationalBiTone}`}>
          <span>Saúde geral</span>
          <strong>{operationalBiStatus}</strong>
          <small>{formatCurrency(projectedRevenue)} projetado para 30 dias</small>
          <p>{activeAutomationAlerts.length > 0 ? `${formatNumber(activeAutomationAlerts.length)} alerta(s) pedem ação hoje.` : "Operação sem alerta crítico ativo."}</p>
        </article>
        <div className="operational-bi-list">
          {operationalBiRows.map((item) => (
            <article className={item.score < 50 ? "danger" : item.score < 70 ? "warning" : item.score < 85 ? "info" : "success"} key={item.area}>
              <div>
                <span>{item.area}</span>
                <strong>{item.status}</strong>
                <small>{item.metric}</small>
              </div>
              <em>{item.score}</em>
              <p>{item.action}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
