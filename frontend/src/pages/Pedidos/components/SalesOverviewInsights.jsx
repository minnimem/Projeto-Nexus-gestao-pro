import { sectionClass } from "../../../utils/sales";

export function SalesOverviewInsights({ salesOverviewInsights, showSalesOverview }) {
  return (
    <section className={`sales-overview-insights${sectionClass(showSalesOverview)}`}>
      <div className="panel-title compact">
        <div>
          <h2>Insights comerciais</h2>
          <p>Leitura automatica para decidir o proximo movimento.</p>
        </div>
      </div>
      <div className="sales-insight-grid">
        {salesOverviewInsights.map((item) => (
          <div className={`sales-insight-card ${item.tone || ""}`} key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.detail}</small>
          </div>
        ))}
      </div>
    </section>
  );
}
