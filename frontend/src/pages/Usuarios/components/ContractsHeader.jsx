import { Download, Printer } from "lucide-react";
import { getLocalDateKey } from "../../../utils/formatters";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";

export function ContractsHeader({ contractRows, empresa, session }) {
  return (
    <div className="panel-title">
      <div>
        <h2>Contratos</h2>
        <p>Controle contratos operacionais, locação, SaaS e fornecedores críticos.</p>
      </div>
      <div className="account-plan-actions">
        <button
          disabled={contractRows.length === 0}
          onClick={() => downloadCsv(`nexus-one-contratos-${getLocalDateKey()}.csv`, contractRows)}
          type="button"
        >
          <Download size={15} />
          CSV
        </button>
        <button
          disabled={contractRows.length === 0}
          onClick={() => printRowsDocument("Contratos", contractRows, empresa.nome || session.empresa || "Nexus One")}
          type="button"
        >
          <Printer size={15} />
          PDF
        </button>
      </div>
    </div>
  );
}
