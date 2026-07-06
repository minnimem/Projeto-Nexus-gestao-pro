import { renderExportActionGroup } from "../../../components/ExportActionMenu/ExportActionMenu";
import {
  downloadCsv,
  downloadExcel,
  downloadJson,
  printRowsDocument,
} from "../../../utils/exporters";
import { getLocalDateKey } from "../../../utils/formatters";

export function FiscalControlHeader({
  canExportTechnicalJson,
  fiscalControlRows,
  session,
}) {
  return (
    <div className="account-plan-head">
      <div>
        <h3>Controle fiscal interno</h3>
        <p>Status de autorização/rejeição para conferência antes da integração SEFAZ.</p>
      </div>
      <div className="account-plan-actions">
        {renderExportActionGroup({
          disabled: fiscalControlRows.length === 0,
          onCsv: () => downloadCsv(`nexus-one-controle-fiscal-${getLocalDateKey()}.csv`, fiscalControlRows),
          onPdf: () => printRowsDocument("Controle fiscal interno", fiscalControlRows, session.empresa || "Nexus One"),
          onExcel: () => downloadExcel(`nexus-one-controle-fiscal-${getLocalDateKey()}.xls`, fiscalControlRows, "Controle fiscal interno"),
          onJson: canExportTechnicalJson
            ? () => downloadJson(`nexus-one-controle-fiscal-${getLocalDateKey()}.json`, fiscalControlRows)
            : null,
          jsonLabel: "JSON técnico",
        })}
      </div>
    </div>
  );
}
