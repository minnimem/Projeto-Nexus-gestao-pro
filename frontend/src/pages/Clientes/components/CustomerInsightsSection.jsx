import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { formatNumber } from "../../../utils/formatters";
import "./CustomerInsightsSection.css";

export function CustomerInsightsSection({ insights }) {
  return (
    <div className="customer-insight-panel">
      <div className="customer-insight-title">
        <span>Radar comercial</span>
        <strong>{formatNumber(insights.length)} insight(s)</strong>
      </div>
      {insights.length === 0 ? (
        <div className="customer-insight-empty">
          <CheckCircle2 size={16} />
          Carteira sem alerta comercial para este cliente.
        </div>
      ) : (
        <div className="customer-insight-list">
          {insights.map((insight) => (
            <div className={`customer-insight-item ${insight.tone}`} key={insight.title}>
              <AlertTriangle size={15} />
              <span>
                <strong>{insight.title}</strong>
                <small>{insight.detail}</small>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
