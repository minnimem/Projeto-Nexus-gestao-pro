import { formatCurrency, formatNumber } from "../../../utils/formatters";

export function CashPaymentReportPanel({
  paymentReportRows,
  paymentReportTotal,
  todayPaymentMovements,
}) {
  return (
    <div className="payment-report-panel">
      <div className="payment-report-head">
        <div>
          <span>Recebido hoje</span>
          <strong>{formatCurrency(paymentReportTotal)}</strong>
        </div>
        <em>{formatNumber(todayPaymentMovements.length)} vendas/pagamentos</em>
      </div>

      {paymentReportRows.length === 0 ? (
        <div className="empty-selection compact">Nenhum recebimento registrado hoje.</div>
      ) : (
        <div className="payment-report-list">
          {paymentReportRows.map((row) => (
            <div className="payment-report-row" key={row.method}>
              <span>{row.label}</span>
              <small>{formatNumber(row.count)} recebimento(s)</small>
              <strong>{formatCurrency(row.total)}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
