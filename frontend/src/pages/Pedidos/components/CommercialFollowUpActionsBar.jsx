import { renderExportActionGroup } from "../../../components/ExportActionMenu/ExportActionMenu";
import { downloadCsv, downloadExcel, printRowsDocument } from "../../../utils/exporters";
import { getLocalDateKey } from "../../../utils/formatters";

export function CommercialFollowUpActionsBar({
  commercialFollowUpRows,
  commercialSellerFilter,
  commercialSellerOptions,
  setCommercialSellerFilter,
}) {
  return (
    <div className="account-plan-actions">
      <label className="commission-config-control">
        <span>Vendedor</span>
        <select value={commercialSellerFilter} onChange={(event) => setCommercialSellerFilter(event.target.value)}>
          {commercialSellerOptions.map((vendedor) => (
            <option key={vendedor} value={vendedor}>
              {vendedor === "TODOS" ? "Todos" : vendedor}
            </option>
          ))}
        </select>
      </label>
      {renderExportActionGroup({
        disabled: commercialFollowUpRows.length === 0,
        onCsv: () => downloadCsv(`nexus-one-follow-up-comercial-${getLocalDateKey()}.csv`, commercialFollowUpRows),
        onPdf: () => printRowsDocument("Follow-up comercial por vendedor", commercialFollowUpRows, "Nexus One"),
        onExcel: () => downloadExcel(`nexus-one-follow-up-comercial-${getLocalDateKey()}.xls`, commercialFollowUpRows, "Follow-up comercial"),
      })}
    </div>
  );
}
