import { Download, Printer } from "lucide-react";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { formatCurrency, formatNumber, formatPercent, getLocalDateKey } from "../../../utils/formatters";

export function FinanceDreSection({
  canSeeProfit,
  dreExportRows,
  dreReadinessExportRows,
  dreReadinessRows,
  dreReadinessScore,
  dreRows,
  grossMargin,
  grossProfit,
  netRevenue,
  operatingMargin,
  operatingResult,
  selectedFinanceBranchLabel,
  session,
  unclassifiedFinanceMovements,
}) {
  return (
    <section className="panel finance-reconciliation">
      <div className="panel-title">
        <div>
          <h2>DRE gerencial</h2>
          <p>Receita, custos, despesas e margem para decisão executiva.</p>
        </div>
        <div className="report-actions">
          <button className="report-export" disabled={dreExportRows.length === 0} onClick={() => downloadCsv(`nexus-one-dre-gerencial-${getLocalDateKey()}.csv`, dreExportRows)} type="button">
            <Download size={17} /> CSV
          </button>
          <button className="report-export secondary" disabled={dreExportRows.length === 0} onClick={() => printRowsDocument(`DRE gerencial - ${selectedFinanceBranchLabel}`, dreExportRows, session.empresa || "Nexus One")} type="button">
            <Printer size={17} /> PDF
          </button>
        </div>
      </div>

      <div className="reconciliation-grid">
        <div><span>Receita liquida</span><strong>{canSeeProfit ? formatCurrency(netRevenue) : "Restrito"}</strong><small>{selectedFinanceBranchLabel}</small></div>
        <div><span>Lucro bruto</span><strong>{canSeeProfit ? formatCurrency(grossProfit) : "Restrito"}</strong><small>Margem {canSeeProfit ? `${formatPercent(grossMargin)}%` : "-"}</small></div>
        <div><span>Resultado operacional</span><strong>{canSeeProfit ? formatCurrency(operatingResult) : "Restrito"}</strong><small>Margem {canSeeProfit ? `${formatPercent(operatingMargin)}%` : "-"}</small></div>
        <div><span>Prontidão contábil</span><strong>{canSeeProfit ? `${formatNumber(dreReadinessScore)}%` : "Restrito"}</strong><small>{formatNumber(unclassifiedFinanceMovements.length)} sem categoria</small></div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead><tr><th>Indicador</th><th>Valor</th><th>Detalhe</th></tr></thead>
          <tbody>
            {dreRows.map((row) => (
              <tr key={row.indicador}>
                <td><strong>{row.indicador}</strong></td>
                <td className={row.tone === "negative" ? "danger-text" : row.tone === "positive" ? "success-text" : ""}>{canSeeProfit ? formatCurrency(row.valor) : "Restrito"}</td>
                <td>{row.detalhe}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="dre-readiness-panel">
        <div className="panel-title compact">
          <div>
            <span>Leitura contábil/tributária</span>
            <p>Checklist gerencial para validar classificação antes de usar o DRE fora da operação.</p>
          </div>
          <button className="report-export" disabled={dreReadinessExportRows.length === 0} onClick={() => downloadCsv(`nexus-one-dre-prontidao-contábil-${getLocalDateKey()}.csv`, dreReadinessExportRows)} type="button">
            <Download size={15} /> CSV
          </button>
        </div>
        <div className="dre-readiness-grid">
          {dreReadinessRows.map((row) => (
            <article className={`dre-readiness-card status-${row.status.toLowerCase()}`} key={row.criterio}>
              <span>{row.criterio}</span>
              <strong>{canSeeProfit ? row.valor : "Restrito"}</strong>
              <small>{row.status} / {row.detalhe}</small>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

