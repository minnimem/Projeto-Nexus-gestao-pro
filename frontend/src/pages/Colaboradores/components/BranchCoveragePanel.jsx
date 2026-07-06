import { Download, Printer } from "lucide-react";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { formatNumber, formatPercent, getLocalDateKey } from "../../../utils/formatters";

export function BranchCoveragePanel({ branchCoverage, coverageRows }) {
  return (
    <section className="panel account-plan-summary">
      <div className="account-plan-head">
        <div>
          <h3>Matriz de cobertura por filial</h3>
          <p>Valida se cada loja possui gestor, vendas, caixa, estoque e financeiro ativos.</p>
        </div>
        <div className="account-plan-actions">
          <button
            disabled={coverageRows.length === 0}
            onClick={() => downloadCsv(`nexus-one-cobertura-rh-${getLocalDateKey()}.csv`, coverageRows)}
            type="button"
          >
            <Download size={15} />
            CSV
          </button>
          <button
            disabled={coverageRows.length === 0}
            onClick={() => printRowsDocument("Cobertura operacional de colaboradores", coverageRows, "Nexus One")}
            type="button"
          >
            <Printer size={15} />
            PDF
          </button>
        </div>
      </div>
      <div className="account-plan-grid collection-grid">
        {branchCoverage.slice(0, 8).map((row) => (
          <div className={`account-plan-item ${row.gaps.length > 0 ? "warning" : "success"}`} key={row.id}>
            <span>{row.nome}</span>
            <strong>{formatPercent(row.coverageScore)}% cobertura</strong>
            <small>{formatNumber(row.ativos)} ativo(s) / {formatNumber(row.total)} total</small>
            <small>Gestão {formatNumber(row.gestores)} / vendas {formatNumber(row.vendedores)} / caixa {formatNumber(row.caixa)}</small>
            <small>{row.gaps.length > 0 ? `Falta: ${row.gaps.join(", ")}` : "Sem lacunas principais"}</small>
          </div>
        ))}
      </div>
    </section>
  );
}
