import { formatCurrency } from "../../../utils/formatters";

export function PointOfSaleCashPayment({
  change,
  receivedAmount,
  receivedAmountRef,
  setQuickReceivedAmount,
  setReceivedAmount,
  total,
}) {
  return (
    <div className="cash-received-grid">
      <label className="form-control">
        <span>Recebido</span>
        <input
          ref={receivedAmountRef}
          min="0"
          step="0.01"
          type="number"
          value={receivedAmount}
          onChange={(event) => setReceivedAmount(event.target.value)}
          placeholder="0,00"
        />
      </label>
      <div><span>Troco</span><strong>{formatCurrency(change)}</strong></div>
      <div className="cash-quick-received">
        {[total, Math.ceil(total / 10) * 10, Math.ceil(total / 50) * 50]
          .filter((value, index, values) => value > 0 && values.indexOf(value) === index)
          .map((value) => (
            <button key={value} onClick={() => setQuickReceivedAmount(value)} type="button">
              {formatCurrency(value)}
            </button>
          ))}
      </div>
    </div>
  );
}
