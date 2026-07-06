import { Download, Printer } from "lucide-react";
import { getLocalDateKey } from "../../../utils/formatters";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";

export function AuditExportActions({ filenamePrefix, rows, session, title }) {
  return (
    <div className="account-plan-actions">
      <button
        disabled={rows.length === 0}
        onClick={() => downloadCsv(`${filenamePrefix}-${getLocalDateKey()}.csv`, rows)}
        type="button"
      >
        <Download size={15} />
        CSV
      </button>
      <button
        disabled={rows.length === 0}
        onClick={() => printRowsDocument(title, rows, session.empresa || "Nexus One")}
        type="button"
      >
        <Printer size={15} />
        PDF
      </button>
    </div>
  );
}
