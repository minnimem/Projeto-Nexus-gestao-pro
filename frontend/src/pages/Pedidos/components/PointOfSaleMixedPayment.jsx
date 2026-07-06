import { formatCurrency } from "../../../utils/formatters";
import { getPaymentMethodLabel } from "../../../utils/payments";

export function PointOfSaleMixedPayment({
  mixedPaymentDifference,
  mixedPayments,
  mixedPaymentTotal,
  setMixedPayments,
  total,
}) {
  return (
    <div className="mixed-payment-grid">
      {Object.keys(mixedPayments).map((method) => (
        <label className="form-control" key={method}>
          <span>{getPaymentMethodLabel(method)}</span>
          <input
            min="0"
            step="0.01"
            type="number"
            value={mixedPayments[method]}
            onChange={(event) => setMixedPayments((prev) => ({ ...prev, [method]: event.target.value }))}
            placeholder="0,00"
          />
        </label>
      ))}
      <div className="mixed-payment-total"><span>Distribuido</span><strong>{formatCurrency(mixedPaymentTotal)}</strong></div>
      <div className="mixed-payment-total"><span>Total da venda</span><strong>{formatCurrency(total)}</strong></div>
      <div className={`mixed-payment-balance ${Math.abs(mixedPaymentDifference) < 0.009 ? "ok" : "pending"}`}>
        <span>{mixedPaymentDifference >= 0 ? "Excedente" : "Falta"}</span>
        <strong>{formatCurrency(Math.abs(mixedPaymentDifference))}</strong>
      </div>
    </div>
  );
}
