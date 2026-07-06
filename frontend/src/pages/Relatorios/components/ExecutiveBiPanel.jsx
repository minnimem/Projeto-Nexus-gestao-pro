import { Download, Printer } from "lucide-react";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { formatCurrency, formatDate, formatPercent, getLocalDateKey } from "../../../utils/formatters";

export function ExecutiveBiPanel({
  currentRevenue,
  currentTicket,
  executiveEndKey,
  executiveHighlightCards,
  executiveInsightRows,
  executiveStartKey,
  previousEndKey,
  previousRevenue,
  previousStartKey,
  revenueVariation,
  selectedReportBranchLabel,
  session,
}) {
  return (
    <section className="panel compact-alert-panel">
      <div className="panel-title compact">
        <div>
          <h2>BI executivo</h2>
          <p>Comparativo do período atual contra o período anterior equivalente.</p>
        </div>
        <div className="account-plan-actions">
          <button
            disabled={executiveInsightRows.length === 0}
            onClick={() => downloadCsv(`nexus-one-bi-executivo-${getLocalDateKey()}.csv`, executiveInsightRows)}
            type="button"
          >
            <Download size={15} />
            CSV
          </button>
          <button
            disabled={executiveInsightRows.length === 0}
            onClick={() => printRowsDocument(`BI executivo - ${selectedReportBranchLabel}`, executiveInsightRows, session.empresa || "Nexus One")}
            type="button"
          >
            <Printer size={15} />
            PDF
          </button>
        </div>
      </div>
      <div className="reconciliation-grid executive-bi-grid">
        <div>
          <span>Receita atual</span>
          <strong>{formatCurrency(currentRevenue)}</strong>
          <small>{formatDate(executiveStartKey)} até {formatDate(executiveEndKey)}</small>
        </div>
        <div>
          <span>Período anterior</span>
          <strong>{formatCurrency(previousRevenue)}</strong>
          <small>{formatDate(previousStartKey)} até {formatDate(previousEndKey)}</small>
        </div>
        <div>
          <span>Variação</span>
          <strong className={revenueVariation < 0 ? "danger-text" : "success-text"}>
            {revenueVariation >= 0 ? "+" : "-"}{formatPercent(revenueVariation)}%
          </strong>
          <small>Ticket médio {formatCurrency(currentTicket)}</small>
        </div>
        {executiveHighlightCards.map((card) => (
          <div className={`executive-bi-card ${card.tone}`} key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <small>{card.detail}</small>
          </div>
        ))}
      </div>
      <div className="compact-alert-list">
        {executiveInsightRows.map((item) => (
          <div className={`compact-alert-card ${String(item.Tendencia).includes("Aten") || String(item.Tendencia).includes("Recuperar") || String(item.Tendencia).startsWith("-") ? "warning" : "success"}`} key={`${item.Area}-${item.Indicador}`}>
            <span>
              <strong>{item.Area} - {item.Indicador}</strong>
              <small>Atual {item.Atual} / comparativo {item.Comparativo} / tendência {item.Tendencia}</small>
              <small>{item.Acao}</small>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
