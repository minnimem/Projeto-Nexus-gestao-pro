import { formatNumber } from "../../../utils/formatters";

export function SalesContextStrip({ activeSalesView, salesContext }) {
  const ActiveSalesIcon = activeSalesView.icon;

  return (
    <section className="sales-context-strip">
      <div className="sales-context-copy">
        <span>
          <ActiveSalesIcon size={16} />
          {activeSalesView.label}
        </span>
        <strong>{salesContext.title}</strong>
        <small>{salesContext.detail}</small>
      </div>
      <div className="sales-context-stats">
        {(salesContext.stats || []).map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{typeof value === "number" ? formatNumber(value) : value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
