import { renderExportActionGroup } from "../../../components/ExportActionMenu/ExportActionMenu";
import {
  downloadCsv,
  downloadExcel,
  downloadJson,
  printRowsDocument,
} from "../../../utils/exporters";
import { getLocalDateKey } from "../../../utils/formatters";

export function FiscalWorkspaceHeader({
  canExportTechnicalJson,
  fiscalControlRows,
  session,
}) {
  return (
    <div className="account-plan-head">
      <div>
        <h3>Nota fiscal</h3>
        <p>Fila de NF-e/NFC-e em homologação, XML, retorno e DANFE por pedido.</p>
      </div>
      <div className="account-plan-actions">
        {renderExportActionGroup({
          disabled: fiscalControlRows.length === 0,
          onCsv: () => downloadCsv(`nexus-one-notas-fiscais-${getLocalDateKey()}.csv`, fiscalControlRows),
          onPdf: () => printRowsDocument("Notas fiscais em homologação", fiscalControlRows, session.empresa || "Nexus One"),
          onExcel: () => downloadExcel(`nexus-one-notas-fiscais-${getLocalDateKey()}.xls`, fiscalControlRows, "Notas fiscais"),
          onJson: canExportTechnicalJson
            ? () => downloadJson(`nexus-one-notas-fiscais-${getLocalDateKey()}.json`, fiscalControlRows)
            : null,
          csvLabel: "CSV fiscal",
          pdfLabel: "PDF fiscal",
          excelLabel: "Excel fiscal",
          jsonLabel: "JSON técnico",
        })}
      </div>
    </div>
  );
}
