import { Download, Printer } from "lucide-react";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { getLocalDateKey } from "../../../utils/formatters";

export function LogisticsOperationalFilterPanel({
  companyName,
  exportRows,
  filiais,
  logisticsBranchFilter,
  onLogisticsBranchFilterChange,
}) {
  return (
    <section className="panel account-plan-summary">
      <div className="account-plan-head">
        <div>
          <h3>Filtro operacional</h3>
          <p>Filtre rotas, entregas disponíveis e romaneios por filial.</p>
        </div>
        <div className="account-plan-actions">
          <label className="commission-config-control">
            <span>Filial</span>
            <select value={logisticsBranchFilter} onChange={(event) => onLogisticsBranchFilterChange(event.target.value)}>
              <option value="TODAS">Todas as filiais</option>
              <option value="EMPRESA">Empresa / sem filial</option>
              {filiais.map((filial) => (
                <option key={filial.id} value={filial.id}>
                  {filial.matriz ? "Matriz" : "Filial"} - {filial.nome}
                </option>
              ))}
            </select>
          </label>
          <button
            disabled={exportRows.length === 0}
            onClick={() => downloadCsv(`nexus-one-logistica-${getLocalDateKey()}.csv`, exportRows)}
            type="button"
          >
            <Download size={15} />
            CSV
          </button>
          <button
            disabled={exportRows.length === 0}
            onClick={() => printRowsDocument("Logística por filial", exportRows, companyName)}
            type="button"
          >
            <Printer size={15} />
            PDF
          </button>
        </div>
      </div>
    </section>
  );
}
