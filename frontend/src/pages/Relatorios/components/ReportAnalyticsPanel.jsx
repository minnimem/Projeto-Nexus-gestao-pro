import { Download, Maximize2, Minimize2, Printer } from "lucide-react";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { getLocalDateKey } from "../../../utils/formatters";

export function ReportAnalyticsPanel({
  moduleAnalyticsRows,
  reportAnalyticsFullscreen,
  setReportAnalyticsFullscreen,
  session,
}) {
  return (
    <section className={`panel account-plan-summary report-analytics-panel${reportAnalyticsFullscreen ? " is-fullscreen" : ""}`}>
      <div className="account-plan-head">
        <div>
          <h3>Analytics por módulo</h3>
          <p>Resumo transversal para vendas, clientes, estoque, financeiro, logística e equipe.</p>
        </div>
        <div className="account-plan-actions">
          <button
            className="report-fullscreen-toggle"
            onClick={() => setReportAnalyticsFullscreen((current) => !current)}
            title={reportAnalyticsFullscreen ? "Sair do modo analytics (Esc)" : "Abrir modo analytics"}
            type="button"
          >
            {reportAnalyticsFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            {reportAnalyticsFullscreen ? "Diminuir" : "Analytics"}
          </button>
          <button
            disabled={moduleAnalyticsRows.length === 0}
            onClick={() => downloadCsv(`nexus-one-analytics-modulos-${getLocalDateKey()}.csv`, moduleAnalyticsRows)}
            type="button"
          >
            <Download size={15} />
            CSV
          </button>
          <button
            disabled={moduleAnalyticsRows.length === 0}
            onClick={() => printRowsDocument("Analytics por módulo", moduleAnalyticsRows, session.empresa || "Nexus One")}
            type="button"
          >
            <Printer size={15} />
            PDF
          </button>
        </div>
      </div>
      <div className="account-plan-grid collection-grid">
        {moduleAnalyticsRows.map((item) => (
          <div className={`account-plan-item ${["Queda", "Atenção", "Recuperação", "Revisar"].includes(item.Status) ? "warning" : "success"}`} key={item.Modulo}>
            <span>{item.Modulo}</span>
            <strong>{item.Status}</strong>
            <small>{item.Metrica}</small>
            <small>{item.Valor}</small>
          </div>
        ))}
      </div>
    </section>
  );
}
