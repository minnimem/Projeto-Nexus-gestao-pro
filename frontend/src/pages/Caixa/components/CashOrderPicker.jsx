import { Search } from "lucide-react";
import { formatCurrency, formatNumber } from "../../../utils/formatters";

export function CashOrderPicker({
  filteredPendingOrders,
  onSearch,
  onSelectOrder,
  pendingOrderListRef,
  pendingSearch,
  pendingSearchRef,
  selectedPendingOrder,
  setShowOrderPicker,
}) {
  return (
    <div className="cash-order-picker">
      <label className="search-field cash-pending-search">
        <Search size={17} />
        <input
          ref={pendingSearchRef}
          value={pendingSearch}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Buscar pedido, cliente ou vendedor"
        />
      </label>
      <div className="cash-order-picker-hints">
        <span><kbd>Setas</kbd> navegar</span>
        <span><kbd>Enter</kbd> selecionar</span>
        <span><kbd>Esc</kbd> fechar</span>
      </div>
      <div className="pending-order-list" ref={pendingOrderListRef}>
        {filteredPendingOrders.length === 0 ? (
          <div className="empty-selection compact">Nenhum pagamento pendente encontrado.</div>
        ) : (
          filteredPendingOrders.map((pedido) => (
            <button
              className={String(selectedPendingOrder.id) === String(pedido.id) ? "pending-order active" : "pending-order"}
              data-order-id={pedido.id}
              key={pedido.id}
              onClick={() => {
                onSelectOrder(pedido.id);
                setShowOrderPicker(false);
              }}
              type="button"
            >
              <span>
                <strong>{pedido.cliente || "Cliente não informado"}</strong>
                <small>{pedido.numero || pedido.id}</small>
              </span>
              <em>{formatCurrency(pedido.valor)}</em>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
