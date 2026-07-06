import { sectionClass } from "../../../utils/sales";

export function SalesModuleOverview({ onNavigate, salesModuleCards, showSalesOverview }) {
  return (
    <section className={`sales-module-overview${sectionClass(showSalesOverview)}`}>
      {salesModuleCards.map((item) => {
        const Icon = item.icon;
        return (
          <button
            className={`sales-module-card ${item.tone || "neutral"}`}
            key={item.key}
            onClick={() => onNavigate(item.key)}
            type="button"
          >
            <span className="sales-module-card-icon"><Icon size={18} /></span>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.detail}</small>
            <em>Abrir módulo</em>
          </button>
        );
      })}
    </section>
  );
}
