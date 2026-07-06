import { Download, Printer, X } from "lucide-react";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { getLocalDateKey } from "../../../utils/formatters";

export function CashClosingReportSection({
  cashClosingRows,
  displayedCashReport,
  onClearSelectedReport,
  selectedCashReport,
}) {
  if (!displayedCashReport) return null;

  return (
    <section className="panel cash-closing-report">
      <div className="panel-title">
        <div>
          <h2>{selectedCashReport ? "Relatório de caixa consultado" : "Relatório de fechamento"}</h2>
          <p>Conferência do caixa com entradas, saídas e divergência.</p>
        </div>
        <div className="report-actions">
          {selectedCashReport && (
            <button
              className="report-export secondary"
              onClick={onClearSelectedReport}
              type="button"
            >
              <X size={17} />
              Atual
            </button>
          )}
          <button
            className="report-export"
            onClick={() => downloadCsv(`nexus-one-fechamento-caixa-${displayedCashReport.id || getLocalDateKey()}.csv`, cashClosingRows)}
            type="button"
          >
            <Download size={17} />
            CSV
          </button>
          <button
            className="report-export secondary"
            onClick={() => printRowsDocument("Relatório de fechamento de caixa", cashClosingRows, displayedCashReport.empresaNome || "Nexus One")}
            type="button"
          >
            <Printer size={17} />
            PDF
          </button>
        </div>
      </div>

      <div className="closing-report-grid">
        {cashClosingRows.map((row) => (
          <div key={row.item}>
            <span>{row.item}</span>
            <strong>{row.valor}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
