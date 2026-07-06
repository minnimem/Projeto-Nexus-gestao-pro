import { Download, Printer } from "lucide-react";
import { getLocalDateKey } from "../../../utils/formatters";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";

export function PlanBillingExportActions({ planBillingRows }) {
  return (
    <>
      <button
        disabled={planBillingRows.length === 0}
        onClick={() => downloadCsv(`nexus-one-cobranca-planos-${getLocalDateKey()}.csv`, planBillingRows)}
        type="button"
      >
        <Download size={15} />
        CSV
      </button>
      <button
        disabled={planBillingRows.length === 0}
        onClick={() => printRowsDocument("Cobrança dos planos", planBillingRows, "Nexus One")}
        type="button"
      >
        <Printer size={15} />
        PDF
      </button>
    </>
  );
}
