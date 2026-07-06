import { ReceiptText } from "lucide-react";
import { formatCurrency, formatNumber } from "../../../utils/formatters";
import { printCashReceipt } from "../../../utils/salesDocuments";

export function CashOperationSummary({
  caixa,
  cashStatusCards,
  lastCashReceipt,
  paymentReportRows,
  paymentReportTotal,
  session,
  todayPaymentMovements,
}) {
  return (
    <>
      <section className="cash-status-grid" aria-label="Status operacional do caixa">
        {cashStatusCards.map((card) => (
          <div className={`cash-status-card ${card.tone}`} key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <small>{card.detail}</small>
          </div>
        ))}
      </section>

      <section className="cash-receipts-strip">
        <div className="cash-receipts-total">
          <span>Recebimentos hoje</span>
          <strong>{formatCurrency(paymentReportTotal)}</strong>
          <small>{formatNumber(todayPaymentMovements.length)} venda(s)/pagamento(s)</small>
        </div>
        <div className="cash-receipts-methods">
          {paymentReportRows.length === 0 ? (
            <div className="empty-selection compact">Nenhum recebimento registrado hoje.</div>
          ) : (
            paymentReportRows.slice(0, 5).map((row) => (
              <div className="cash-receipts-method" key={row.method}>
                <span>{row.label}</span>
                <strong>{formatCurrency(row.total)}</strong>
                <small>{formatNumber(row.count)} recebimento(s)</small>
              </div>
            ))
          )}
        </div>
        <button
          className="report-export secondary"
          disabled={!lastCashReceipt}
          onClick={() => printCashReceipt(lastCashReceipt, caixa.empresaNome || session.empresa || "Nexus One")}
          type="button"
        >
          <ReceiptText size={17} />
          Último comprovante
        </button>
      </section>
    </>
  );
}
