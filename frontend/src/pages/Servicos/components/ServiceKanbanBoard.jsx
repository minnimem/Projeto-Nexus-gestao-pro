import { formatCurrency, formatNumber } from "../../../utils/formatters";
import { serviceKanbanColumns } from "../constants/serviceConstants";
import { getServiceSla, parseServiceChecklist, parseServicePriority } from "../viewModels/serviceViewModel";

export function ServiceKanbanBoard({ onStatusFilterChange, ordens }) {
  return (
    <div className="commercial-kanban-board service-kanban-board">
      {serviceKanbanColumns.map((column) => {
        const columnOrders = ordens.filter((ordem) => String(ordem.status || "") === column.key);
        return (
          <article className="commercial-kanban-column" key={column.key}>
            <div className="commercial-kanban-head">
              <span>{column.label}</span>
              <strong>{formatNumber(columnOrders.length)}</strong>
              <small>{formatCurrency(columnOrders.reduce((total, ordem) => total + Number(ordem.valorEstimado || 0), 0))}</small>
            </div>
            <div className="commercial-kanban-list">
              {columnOrders.length === 0 ? (
                <div className="commercial-kanban-empty">Sem OS nesta etapa.</div>
              ) : (
                columnOrders.slice(0, 5).map((ordem) => {
                  const sla = getServiceSla(ordem);
                  const checklistItems = parseServiceChecklist(ordem.checklist);
                  const doneCount = checklistItems.filter((item) => item.done).length;
                  return (
                    <button className="commercial-kanban-card service-kanban-card" key={ordem.id} onClick={() => onStatusFilterChange(column.key)} type="button">
                      <small>{ordem.numero || ordem.id}</small>
                      <strong>{ordem.titulo || "-"}</strong>
                      <div className="commercial-kanban-meta">
                        <span className={`service-priority-pill priority-${parseServicePriority(ordem.observacao).toLowerCase()}`}>
                          {parseServicePriority(ordem.observacao)}
                        </span>
                        <strong className={`service-sla-pill service-sla-${sla.tone}`}>{sla.label}</strong>
                      </div>
                      {checklistItems.length > 0 && (
                        <small>{formatNumber(doneCount)}/{formatNumber(checklistItems.length)} checklist</small>
                      )}
                    </button>
                  );
                })
              )}
              {columnOrders.length > 5 && (
                <small className="commercial-kanban-more">+{formatNumber(columnOrders.length - 5)} OS na lista</small>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
