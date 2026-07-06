import { Download, Printer } from "lucide-react";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { formatCurrency, formatNumber, getLocalDateKey } from "../../../utils/formatters";

export function FinanceBranchSection({
  filiais,
  financeBranchFilter,
  financeBranchRows,
  financeBranchSummary,
  session,
  setFinanceBranchFilter,
  setFinanceCategoryFilter,
  setFinancePage,
}) {
  function selectBranch(value) {
    setFinanceBranchFilter(value);
    setFinanceCategoryFilter("");
    setFinancePage(0);
  }

  return (
    <section className="panel account-plan-summary">
      <div className="account-plan-head">
        <div>
          <h3>Analise por filial</h3>
          <p>Filtre o financeiro e exporte um consolidado por loja.</p>
        </div>
        <div className="account-plan-actions">
          <label className="commission-config-control">
            Filial
            <select value={financeBranchFilter} onChange={(event) => selectBranch(event.target.value)}>
              <option value="TODAS">Todas</option>
              <option value="EMPRESA">Empresa</option>
              {filiais.map((filial) => (
                <option key={filial.id} value={filial.id}>{filial.matriz ? "Matriz" : "Filial"} - {filial.nome}</option>
              ))}
            </select>
          </label>
          <button disabled={financeBranchRows.length === 0} onClick={() => downloadCsv(`nexus-one-financeiro-filiais-${getLocalDateKey()}.csv`, financeBranchRows)} type="button">
            <Download size={15} /> CSV
          </button>
          <button disabled={financeBranchRows.length === 0} onClick={() => printRowsDocument("Financeiro por filial", financeBranchRows, session.empresa || "Nexus One")} type="button">
            <Printer size={15} /> PDF
          </button>
        </div>
      </div>

      <div className="account-plan-grid">
        {financeBranchSummary.length === 0 ? (
          <div className="empty-selection compact">Nenhuma movimentação encontrada para filial.</div>
        ) : (
          financeBranchSummary.slice(0, 8).map((item) => (
            <button className={financeBranchFilter === String(item.id) ? "account-plan-item active" : "account-plan-item"} key={item.id} onClick={() => selectBranch(String(item.id))} type="button">
              <span>{item.filial}</span>
              <strong>{formatCurrency(item.receitas - item.despesas)}</strong>
              <small>{formatNumber(item.registros)} registros / pendente {formatCurrency(item.pendentes)}</small>
            </button>
          ))
        )}
      </div>
    </section>
  );
}

