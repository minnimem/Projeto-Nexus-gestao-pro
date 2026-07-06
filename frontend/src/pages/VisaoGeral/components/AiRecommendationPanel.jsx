import { Download, Printer } from "lucide-react";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { getLocalDateKey } from "../../../utils/formatters";

export function AiRecommendationPanel({ aiRecommendationRows, aiRecommendations, session }) {
  return (
    <section className="panel ai-recommendation-panel">
      <div className="account-plan-head">
        <div>
          <h3>Copiloto operacional</h3>
          <p>Recomendações automáticas calculadas a partir de vendas, estoque, financeiro e logística.</p>
        </div>
        <div className="account-plan-actions">
          <button
            disabled={aiRecommendationRows.length === 0}
            onClick={() => downloadCsv(`nexus-one-copiloto-operacional-${getLocalDateKey()}.csv`, aiRecommendationRows)}
            type="button"
          >
            <Download size={15} />
            CSV
          </button>
          <button
            disabled={aiRecommendationRows.length === 0}
            onClick={() => printRowsDocument("Copiloto operacional", aiRecommendationRows, session.empresa || "Nexus One")}
            type="button"
          >
            <Printer size={15} />
            PDF
          </button>
        </div>
      </div>
      <div className="ai-recommendation-grid">
        {aiRecommendations.map((item) => (
          <article className={`ai-recommendation-card ${item.tone}`} key={`${item.area}-${item.title}`}>
            <span>{item.area}</span>
            <strong>{item.title}</strong>
            <em>{item.metric}</em>
            <small>{item.detail}</small>
            <p>{item.action}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
