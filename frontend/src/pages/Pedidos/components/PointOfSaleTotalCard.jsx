import { formatCurrency } from "../../../utils/formatters";

export function PointOfSaleTotalCard({ descontoValor, subtotal, total }) {
  return (
    <div className="total-card">
      <div><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div>
      <div><span>Desconto</span><strong>{formatCurrency(descontoValor)}</strong></div>
      <div className="grand-total"><span>Total</span><strong>{formatCurrency(total)}</strong></div>
    </div>
  );
}
