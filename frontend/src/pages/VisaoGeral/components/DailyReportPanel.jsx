import { Download, Printer } from "lucide-react";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { formatDate } from "../../../utils/formatters";

export function DailyReportPanel({ dailyReportDate, dailyReportRows, session, todayKey }) {
  return (
    <section className="panel daily-report-panel">
      <div className="account-plan-head">
        <div>
          <h3>Relatório diário automático</h3>
          <p>Resumo operacional do dia gerado ao abrir a visão geral.</p>
        </div>
        <div className="account-plan-actions">
          <span>{dailyReportDate === todayKey ? `Gerado em ${formatDate(todayKey)}` : "Gerando..."}</span>
          <button onClick={() => downloadCsv(`nexus-one-relatorio-diario-${todayKey}.csv`, dailyReportRows)} type="button">
            <Download size={15} />
            CSV
          </button>
          <button onClick={() => printRowsDocument(`Relatório diário ${formatDate(todayKey)}`, dailyReportRows, session.empresa || "Nexus One")} type="button">
            <Printer size={15} />
            PDF
          </button>
        </div>
      </div>
      <div className="daily-report-grid">
        {dailyReportRows.slice(1).map((row) => (
          <div className="daily-report-card" key={row.Indicador}>
            <span>{row.Indicador}</span>
            <strong>{row.Valor}</strong>
            <small>{row.Detalhe}</small>
          </div>
        ))}
      </div>
    </section>
  );
}
