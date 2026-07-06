import { Download, Printer } from "lucide-react";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { formatNumber, getLocalDateKey } from "../../../utils/formatters";

export function FinanceInconsistencyPanel({
  focusInconsistencyCard,
  inconsistencyCards,
  inconsistencyRows,
  sectionRef,
  session,
}) {
  return (
    <article className="panel soft-panel" ref={sectionRef}>
      <div className="panel-title compact">
        <div>
          <h2>Painel de inconsistências</h2>
          <p>Resumo unico das pendências e tratamentos administrativos do financeiro.</p>
        </div>
        <div className="report-actions compact-report-actions">
          <button
            className="report-export"
            disabled={inconsistencyRows.length === 0}
            onClick={() => downloadCsv(`nexus-one-inconsistencias-${getLocalDateKey()}.csv`, inconsistencyRows)}
            type="button"
          >
            <Download size={17} />
            CSV
          </button>
          <button
            className="report-export secondary"
            disabled={inconsistencyRows.length === 0}
            onClick={() => printRowsDocument("Painel de inconsistências", inconsistencyRows, session.empresa || "Nexus One")}
            type="button"
          >
            <Printer size={17} />
            PDF
          </button>
        </div>
      </div>
      <div className="reports-grid">
        {inconsistencyCards.map((card) => {
          const Icon = card.icon;
          return (
            <article className={`report-card severity-${card.severity}`} key={card.key}>
              <div className="report-card-head">
                <div className="preview-icon">
                  <Icon size={22} />
                </div>
                <div>
                  <h2>{card.title}</h2>
                  <p>{card.detail}</p>
                </div>
              </div>
              <div className={`report-card-stat severity-${card.severity}`}>
                <span>Registros</span>
                <strong>{formatNumber(card.count)}</strong>
                <small>{card.status}</small>
              </div>
              <button
                className="mini-action-button"
                onClick={() => focusInconsistencyCard(card.key)}
                type="button"
              >
                Ver lista
              </button>
            </article>
          );
        })}
      </div>
    </article>
  );
}

