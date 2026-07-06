import { Download, Printer } from "lucide-react";
import { getLocalDateKey } from "../../../utils/formatters";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";

export function BranchExportActions({ branchRows, empresa, session }) {
  return (
    <div className="account-plan-actions">
      <button
        disabled={branchRows.length === 0}
        onClick={() => downloadCsv(`nexus-one-filiais-${getLocalDateKey()}.csv`, branchRows)}
        type="button"
      >
        <Download size={15} />
        CSV
      </button>
      <button
        disabled={branchRows.length === 0}
        onClick={() =>
          printRowsDocument(
            "Lojas e filiais",
            branchRows,
            empresa.nome || session.empresa || "Nexus One",
          )
        }
        type="button"
      >
        <Printer size={15} />
        PDF
      </button>
    </div>
  );
}
