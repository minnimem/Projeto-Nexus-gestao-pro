import { Download, Printer } from "lucide-react";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { getLocalDateKey } from "../../../utils/formatters";

export function AdminAuditHeader({ auditRows, session }) {
  return (
    <div className="panel-title">
      <div>
        <h2>Últimas ações</h2>
        <p>Auditoria de eventos críticos do sistema.</p>
      </div>
      <div className="report-actions">
        <button
          className="report-export"
          disabled={auditRows.length === 0}
          onClick={() => downloadCsv(`nexus-one-auditoria-${getLocalDateKey()}.csv`, auditRows)}
          type="button"
        >
          <Download size={17} />
          CSV
        </button>
        <button
          className="report-export secondary"
          disabled={auditRows.length === 0}
          onClick={() => printRowsDocument("Auditoria administrativa", auditRows, session.empresa || "Nexus One")}
          type="button"
        >
          <Printer size={17} />
          PDF
        </button>
      </div>
    </div>
  );
}
