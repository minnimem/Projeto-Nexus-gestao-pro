import {
  formatCurrency,
  formatDateTime,
  formatNumber,
} from "../../../utils/formatters";
import {
  getClientName,
  getCustomerInitials,
} from "../../../utils/customers";
import "./CustomerIdentity.css";
import "./CustomerCommercialSummary.css";

export function CustomerCommercialSummary({
  averageTicket,
  completedOrdersCount,
  customer,
  lastOrder,
  ordersCount,
  profile,
  revenue,
  tags,
}) {
  return (
    <>
      {customer && (
        <div className="customer-crm-card">
          <div className="customer-crm-head">
            <span className="customer-avatar large">{getCustomerInitials(getClientName(customer))}</span>
            <div>
              <span>Ficha comercial</span>
              <strong>{getClientName(customer)}</strong>
              <small>{customer.email || customer.telefone || "Contato incompleto"}</small>
            </div>
            {profile && (
              <em className={`customer-level-badge ${profile.tone}`}>{profile.label}</em>
            )}
          </div>
          <div className="customer-tag-row">
            {tags.length === 0 ? (
              <span className="customer-tag neutral">Sem tag</span>
            ) : tags.map((tag) => (
              <span className={`customer-tag ${tag.tone}`} key={tag.label}>{tag.label}</span>
            ))}
          </div>
        </div>
      )}

      <div className="reconciliation-grid compact-metrics-grid">
        <div>
          <span>Pedidos</span>
          <strong>{formatNumber(ordersCount)}</strong>
          <small>{formatNumber(completedOrdersCount)} concluidos</small>
        </div>
        <div>
          <span>Total comprado</span>
          <strong>{formatCurrency(revenue)}</strong>
          <small>histórico carregado</small>
        </div>
        <div>
          <span>Ticket médio</span>
          <strong>{formatCurrency(averageTicket)}</strong>
          <small>pedidos concluidos</small>
        </div>
      </div>

      {lastOrder ? (
        <div className="due-account-list">
          <div className="due-account-card">
            <strong>Última compra</strong>
            <span className="due-account-date">{formatDateTime(lastOrder.data)}</span>
            <small className="due-account-status">
              {lastOrder.status || "-"} / {formatCurrency(lastOrder.valor)}
            </small>
          </div>
        </div>
      ) : (
        <div className="empty-selection compact">Nenhuma compra encontrada para este cliente.</div>
      )}
    </>
  );
}
