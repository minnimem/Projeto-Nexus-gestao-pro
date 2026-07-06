import "./KpiCard.css";

export function KpiCard({ icon: Icon, label, value, tone, detail, change }) {
  return (
    <article className={`kpi ${tone || ""}`}>
      <div className="kpi-icon">
        <Icon size={20} />
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
      {change && (
        <em className={`kpi-change ${change.tone || "positive"}`}>
          {change.value}
        </em>
      )}
      <small>{detail}</small>
    </article>
  );
}
