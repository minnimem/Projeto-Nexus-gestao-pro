import { getCustomerInitials, getOrderProductSummary } from "../../../utils/customers";

export function SeparationCustomerCell({ pedido }) {
  return (
    <div className="customer-table-cell">
      <span className="customer-avatar">{getCustomerInitials(pedido.cliente)}</span>
      <span>
        <strong>{pedido.cliente || "Cliente não informado"}</strong>
        <small>{pedido.numero || pedido.id}</small>
        <small>{getOrderProductSummary(pedido)}</small>
      </span>
    </div>
  );
}
