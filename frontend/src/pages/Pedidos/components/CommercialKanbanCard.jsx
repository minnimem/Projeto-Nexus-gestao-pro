import { StatusBadge } from "../../../components/StatusBadge/StatusBadge";
import { getCustomerInitials, getOrderProductSummary } from "../../../utils/customers";
import { formatCurrency } from "../../../utils/formatters";

export function CommercialKanbanCard({
  canManageCommercialFollowUp,
  pedido,
  startCommercialFollowUp,
}) {
  return (
    <button
      className="commercial-kanban-card"
      disabled={!canManageCommercialFollowUp}
      onClick={() => startCommercialFollowUp(pedido)}
      type="button"
    >
      <div className="customer-table-cell">
        <span className="customer-avatar">{getCustomerInitials(pedido.cliente)}</span>
        <span>
          <strong>{pedido.cliente || "Cliente não informado"}</strong>
          <small>{pedido.numero || pedido.id} / {pedido.usuario || pedido.vendedor || "Sem vendedor"}</small>
        </span>
      </div>
      <div className="commercial-kanban-meta">
        <StatusBadge status={pedido.status} />
        <strong>{formatCurrency(pedido.valor)}</strong>
      </div>
      <small>{getOrderProductSummary(pedido)}</small>
    </button>
  );
}
