import { formatCurrency, formatNumber } from "../../../utils/formatters";
import { CommercialKanbanCard } from "./CommercialKanbanCard";

export function CommercialKanbanColumn({
  canManageCommercialFollowUp,
  stage,
  startCommercialFollowUp,
}) {
  return (
    <article className="commercial-kanban-column">
      <div className="commercial-kanban-head">
        <div>
          <span>{stage.label}</span>
          <strong>{formatNumber(stage.orders.length)} oportunidade(s)</strong>
        </div>
        <small>{formatCurrency(stage.valor)}</small>
      </div>
      <div className="commercial-kanban-list">
        {stage.orders.length === 0 ? (
          <div className="commercial-kanban-empty">Sem oportunidades nesta etapa.</div>
        ) : (
          stage.orders.slice(0, 5).map((pedido) => (
            <CommercialKanbanCard
              canManageCommercialFollowUp={canManageCommercialFollowUp}
              key={pedido.id}
              pedido={pedido}
              startCommercialFollowUp={startCommercialFollowUp}
            />
          ))
        )}
      </div>
      {stage.orders.length > 5 && (
        <small className="commercial-kanban-more">
          +{formatNumber(stage.orders.length - 5)} oportunidade(s) na lista detalhada
        </small>
      )}
    </article>
  );
}
