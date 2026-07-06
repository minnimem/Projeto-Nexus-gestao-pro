import { Download, Printer } from "lucide-react";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { formatDate, getLocalDateKey } from "../../../utils/formatters";

export function LogisticsTimelinePanel({
  companyName,
  logisticsTimeline,
  logisticsTimelineRows,
  selectedLogisticsBranchLabel,
}) {
  return (
    <section className="panel account-plan-summary">
      <div className="account-plan-head">
        <div>
          <h3>Histórico operacional</h3>
          <p>Linha do tempo recente de rotas, atrasos, entregas vinculadas e pendências.</p>
        </div>
        <div className="account-plan-actions">
          <button
            disabled={logisticsTimelineRows.length === 0}
            onClick={() => downloadCsv(`nexus-one-historico-logistico-${getLocalDateKey()}.csv`, logisticsTimelineRows)}
            type="button"
          >
            <Download size={15} />
            CSV
          </button>
          <button
            disabled={logisticsTimelineRows.length === 0}
            onClick={() => printRowsDocument(`Histórico logístico - ${selectedLogisticsBranchLabel}`, logisticsTimelineRows, companyName)}
            type="button"
          >
            <Printer size={15} />
            PDF
          </button>
        </div>
      </div>
      <div className="commercial-followup-history">
        {logisticsTimeline.length === 0 ? (
          <div className="empty-selection compact">Nenhum evento logístico recente.</div>
        ) : (
          logisticsTimeline.map((item) => (
            <div className={`compact-alert-card ${item.tone}`} key={item.id}>
              <span>
                <strong>{item.title}</strong>
                <small>{formatDate(item.date)} / {item.detail}</small>
                <small>{item.meta}</small>
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
