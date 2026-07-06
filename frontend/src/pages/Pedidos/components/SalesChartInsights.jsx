export function SalesChartInsights({ chartInsights }) {
  return (
    <div className="sales-insight-grid">
      {chartInsights.map((item) => (
        <div className={`sales-insight-card ${item.tone || ""}`} key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          <small>{item.detail}</small>
        </div>
      ))}
    </div>
  );
}
