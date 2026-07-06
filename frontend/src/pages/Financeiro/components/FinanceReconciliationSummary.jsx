import { Download, Printer } from "lucide-react";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { formatCurrency, formatNumber, getLocalDateKey } from "../../../utils/formatters";

export function FinanceReconciliationSummary({
  caixaFinanceiroDiff,
  handleReconciliationAction,
  reconciliationActionPlan,
  reconciliationLabel,
  reconciliationRows,
  reconciliationScore,
  reconciliationTone,
  session,
  vendasCaixaDiff,
}) {
  const actionPlan = reconciliationActionPlan.length > 0
    reconciliationActionPlan
    : [{
        key: "reconciled",
        severity: "success",
        title: "Conciliação sem ação pendente",
        detail: "Vendas, caixa e financeiro estão alinhados dentro dos dados carregados.",
        actionLabel: "",
        action: "",
      }];

  return (
    <>
      <div className="panel-title">
        <div>
          <h2>Conciliação financeira</h2>
          <p>Compare vendas finalizadas, caixa e receitas aprovadas.</p>
        </div>
        <div className="report-actions">
          <button
            className="report-export"
            disabled={reconciliationRows.length === 0}
            onClick={() => downloadCsv(`nexus-one-conciliacao-${getLocalDateKey()}.csv`, reconciliationRows)}
            type="button"
          >
            <Download size={17} />
            CSV
          </button>
          <button
            className="report-export secondary"
            disabled={reconciliationRows.length === 0}
            onClick={() => printRowsDocument("Conciliação financeira", reconciliationRows, session.empresa || "Nexus One")}
            type="button"
          >
            <Printer size={17} />
            PDF
          </button>
        </div>
      </div>

      <div className="reconciliation-grid">
        <div>
          <span>Saúde da conciliação</span>
          <strong className={reconciliationTone === "success" ? "success-text" : reconciliationTone === "danger" ? "danger-text" : ""}>
            {formatNumber(reconciliationScore)}%
          </strong>
          <small>{reconciliationLabel}</small>
        </div>
        <div>
          <span>Diferenca vendas x caixa</span>
          <strong className={Math.abs(vendasCaixaDiff) > 0.009 ? "danger-text" : "success-text"}>
            {formatCurrency(vendasCaixaDiff)}
          </strong>
          <small>Pedidos recebidos contra caixa</small>
        </div>
        <div>
          <span>Diferenca caixa x financeiro</span>
          <strong className={Math.abs(caixaFinanceiroDiff) > 0.009 ? "danger-text" : "success-text"}>
            {formatCurrency(caixaFinanceiroDiff)}
          </strong>
          <small>Caixa contra receitas aprovadas</small>
        </div>
      </div>

      <div className="compact-alert-list reconciliation-action-list">
        {actionPlan.map((item) => (
          <div className={`compact-alert-card ${item.severity}`} key={item.key}>
            <span>
              <strong>{item.title}</strong>
              <small>{item.detail}</small>
            </span>
            {item.action && (
              <button onClick={() => handleReconciliationAction(item.action)} type="button">
                {item.actionLabel}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="reconciliation-grid">
        {reconciliationRows.map((row) => (
          <div key={row.indicador}>
            <span>{row.indicador}</span>
            <strong>{row.valor}</strong>
            <small>{row.detalhe}</small>
          </div>
        ))}
      </div>
    </>
  );
}

