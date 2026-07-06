import { formatCurrency } from "../../../utils/formatters";

export function PointOfSaleInstallments({
  paymentInstallments,
  setPaymentInstallments,
  total,
}) {
  return (
    <label className="form-control">
      <span>Parcelas</span>
      <select value={paymentInstallments} onChange={(event) => setPaymentInstallments(Number(event.target.value))}>
        {Array.from({ length: 12 }, (_, index) => index + 1).map((parcela) => (
          <option key={parcela} value={parcela}>{parcela}x de {formatCurrency(total / parcela)}</option>
        ))}
      </select>
    </label>
  );
}
