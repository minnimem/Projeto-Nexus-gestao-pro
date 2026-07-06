import { orderPeriodOptions, orderStatusOptions } from "../../../constants/status";
import { formatCurrency, formatNumber } from "../../../utils/formatters";

export function SalesOrdersFilters({
  filteredOrdersPending,
  filteredOrdersTotal,
  orderPeriodFilter,
  orderStatusFilter,
  selectedOrderPeriod,
  selectedOrderStatus,
  setOrderPeriodFilter,
  setOrderStatusFilter,
}) {
  return (
    <>
      <div className="order-filter-grid">
        <div className="chart-tabs compact-tabs" aria-label="Filtrar pedidos por status">
          {orderStatusOptions.map((option) => (
            <button
              className={orderStatusFilter === option.value ? "active" : ""}
              key={option.value}
              onClick={() => setOrderStatusFilter(option.value)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="chart-tabs compact-tabs" aria-label="Filtrar pedidos por período">
          {orderPeriodOptions.map((option) => (
            <button
              className={orderPeriodFilter === option.value ? "active" : ""}
              key={option.value}
              onClick={() => setOrderPeriodFilter(option.value)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div className="order-filter-summary">
        <div>
          <span>Status</span>
          <strong>{selectedOrderStatus.label || "Todos"}</strong>
        </div>
        <div>
          <span>Período</span>
          <strong>{selectedOrderPeriod.label || "Tudo"}</strong>
        </div>
        <div>
          <span>Valor filtrado</span>
          <strong>{formatCurrency(filteredOrdersTotal)}</strong>
        </div>
        <div>
          <span>Pendências</span>
          <strong>{formatNumber(filteredOrdersPending)}</strong>
        </div>
      </div>
    </>
  );
}
