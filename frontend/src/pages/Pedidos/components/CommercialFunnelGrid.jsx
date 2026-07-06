import { formatCurrency, formatDateTime, formatNumber } from "../../../utils/formatters";

export function CommercialFunnelGrid({ commercialFunnelStages }) {
  return (
    <div className="account-plan-grid commercial-funnel-grid">
      {commercialFunnelStages.map((stage) => (
        <div className="account-plan-item commercial-funnel-card" key={stage.key}>
          <span>{stage.label}</span>
          <strong>{formatCurrency(stage.valor)}</strong>
          <small>{formatNumber(stage.orders.length)} oportunidades / ticket {formatCurrency(stage.ticketMedio)}</small>
          <small>{stage.action}</small>
          <small>Última movimentação {stage.latest ? formatDateTime(stage.latest) : "-"}</small>
        </div>
      ))}
    </div>
  );
}
