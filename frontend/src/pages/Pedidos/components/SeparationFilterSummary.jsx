import { formatCurrency, formatNumber } from "../../../utils/formatters";

export function SeparationFilterSummary({ filteredOrders, filteredTotal }) {
  return (
    <div className="separation-filter-summary">
      <span>{formatNumber(filteredOrders.length)} pedido(s)</span>
      <strong>{formatCurrency(filteredTotal)}</strong>
    </div>
  );
}
