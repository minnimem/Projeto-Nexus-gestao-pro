import { renderExportActionGroup } from "../../../components/ExportActionMenu/ExportActionMenu";
import {
  downloadCsv,
  downloadExcel,
  downloadJson,
  printRowsDocument,
} from "../../../utils/exporters";
import { getLocalDateKey } from "../../../utils/formatters";

export function FiscalHistoryPanel({
  canExportTechnicalJson,
  fiscalHistory,
  fiscalHistoryRows,
  session,
}) {
  return (
    <div className="commercial-followup-history">
      <div className="account-plan-head">
        <div>
          <h3>Histórico fiscal</h3>
          <p>Alterações internas de autorização, rejeição e cancelamento.</p>
        </div>
        <div className="account-plan-actions">
          {renderExportActionGroup({
            disabled: fiscalHistoryRows.length === 0,
            onCsv: () => downloadCsv(`nexus-one-historico-fiscal-${getLocalDateKey()}.csv`, fiscalHistoryRows),
            onPdf: () => printRowsDocument("Histórico fiscal interno", fiscalHistoryRows, session.empresa || "Nexus One"),
            onExcel: () => downloadExcel(`nexus-one-historico-fiscal-${getLocalDateKey()}.xls`, fiscalHistoryRows, "Histórico fiscal"),
            onJson: canExportTechnicalJson
              ? () => downloadJson(`nexus-one-historico-fiscal-${getLocalDateKey()}.json`, fiscalHistoryRows)
              : null,
            jsonLabel: "JSON técnico",
          })}
        </div>
      </div>
      <div className="account-plan-grid commercial-followup-grid">
        {fiscalHistory.length === 0 ? (
          <div className="empty-selection compact">Nenhuma alteração fiscal registrada.</div>
        ) : (
          fiscalHistory.slice(0, 6).map((item) => (
            <div className="account-plan-item fiscal-status-card" key={item.id}>
              <span>{item.anterior} para {item.novo}</span>
              <strong>{item.pedido}</strong>
              <small>{item.cliente} / {item.filial}</small>
              <small>{item.data} / {item.usuario}</small>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
