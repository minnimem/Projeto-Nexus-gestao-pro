import { renderExportActionGroup } from "../../../components/ExportActionMenu/ExportActionMenu";
import { downloadCsv, downloadExcel, printRowsDocument } from "../../../utils/exporters";
import { formatNumber, getLocalDateKey } from "../../../utils/formatters";

export function CommercialFollowUpHistoryHeader({
  commercialFollowUpHistoryRows,
  dueCommercialFollowUps,
  pendingCommercialFollowUps,
}) {
  return (
    <div className="panel-title compact">
      <div>
        <h3>Histórico persistido</h3>
        <p>{formatNumber(pendingCommercialFollowUps.length)} pendentes / {formatNumber(dueCommercialFollowUps.length)} hoje ou vencidos.</p>
      </div>
      <div className="account-plan-actions">
        {renderExportActionGroup({
          disabled: commercialFollowUpHistoryRows.length === 0,
          onCsv: () => downloadCsv(`nexus-one-follow-up-comercial-historico-${getLocalDateKey()}.csv`, commercialFollowUpHistoryRows),
          onPdf: () => printRowsDocument("Histórico de follow-up comercial", commercialFollowUpHistoryRows, "Nexus One"),
          onExcel: () => downloadExcel(`nexus-one-follow-up-comercial-historico-${getLocalDateKey()}.xls`, commercialFollowUpHistoryRows, "Histórico de follow-up"),
        })}
      </div>
    </div>
  );
}
