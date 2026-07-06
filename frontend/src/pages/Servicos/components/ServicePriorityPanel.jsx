import { formatNumber } from "../../../utils/formatters";
import { getServiceSla } from "../viewModels/serviceViewModel";

export function ServicePriorityPanel({ criticalOrders, nextSlaOrders }) {
  return (
    <div className="service-priority-panel">
      <section>
        <div className="commercial-priority-head">
          <span>SLA em foco</span>
          <small>{formatNumber(nextSlaOrders.length)} OS ativas</small>
        </div>
        <div className="commercial-priority-list">
          {nextSlaOrders.length === 0 ? (
            <div className="commercial-priority-empty">Sem OS ativa com prazo.</div>
          ) : (
            nextSlaOrders.map((ordem) => {
              const sla = getServiceSla(ordem);
              return (
                <div className={`commercial-priority-card service-sla-${sla.tone}`} key={ordem.id}>
                  <strong>{ordem.numero || ordem.id}</strong>
                  <span>{ordem.titulo || "-"}</span>
                  <small>{ordem.tecnico || "Sem técnico"} / {sla.label}</small>
                </div>
              );
            })
          )}
        </div>
      </section>
      <section>
        <div className="commercial-priority-head">
          <span>Prioridade crítica</span>
          <small>{formatNumber(criticalOrders.length)} OS</small>
        </div>
        <div className="commercial-priority-list">
          {criticalOrders.length === 0 ? (
            <div className="commercial-priority-empty">Nenhuma OS crítica aberta.</div>
          ) : (
            criticalOrders.slice(0, 4).map((ordem) => (
              <div className="commercial-priority-card service-priority-critical" key={ordem.id}>
                <strong>{ordem.numero || ordem.id}</strong>
                <span>{ordem.cliente || "-"}</span>
                <small>{getServiceSla(ordem).label}</small>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
