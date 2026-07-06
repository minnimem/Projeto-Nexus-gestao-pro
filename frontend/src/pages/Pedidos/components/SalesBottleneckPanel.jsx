import { CheckCircle2 } from "lucide-react";
import { formatCurrency, formatNumber } from "../../../utils/formatters";
import { sectionClass } from "../../../utils/sales";

export function SalesBottleneckPanel({ bottleneckCards, onNavigate, showSalesOverview }) {
  return (
    <section className={`sales-bottleneck-panel${sectionClass(showSalesOverview)}`}>
      <div className="panel-title compact">
        <div>
          <h2>Gargalos comerciais</h2>
          <p>Etapas com maior impacto operacional para priorizar a próxima ação.</p>
        </div>
      </div>
      <div className="sales-bottleneck-grid">
        {bottleneckCards.every((item) => Number(item.value || 0) === 0) ? (
          <div className="sales-empty-state">
            <CheckCircle2 size={22} />
            <strong>Sem gargalos comerciais</strong>
            <small>Pedidos, CRM, separação e fiscal estão sem pendências críticas neste filtro.</small>
          </div>
        ) : (
          bottleneckCards.map((item) => (
            <button
              className={`sales-bottleneck-card ${item.tone} ${Number(item.value || 0) === 0 ? "muted" : ""}`}
              key={item.key}
              onClick={() => onNavigate(item.target)}
              type="button"
            >
              <span>{item.label}</span>
              <strong>{formatNumber(item.value)}</strong>
              <small>{formatCurrency(item.amount)}</small>
              <em>{Number(item.value || 0) === 0 ? "Sem ação pendente" : item.action}</em>
            </button>
          ))
        )}
      </div>
    </section>
  );
}
