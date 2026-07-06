import { Download, Printer } from "lucide-react";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { formatNumber, getLocalDateKey } from "../../../utils/formatters";

export function PermissionsOperationsPanel({
  permissionCoverageCards,
  permissionCoverageRows,
  permissionProfileRows,
}) {
  return (
    <section className="panel account-plan-summary">
      <div className="account-plan-head">
        <div>
          <h3>Permissões operacionais</h3>
          <p>Resumo de módulos, ações sensíveis, liberações manuais e bloqueios por colaborador.</p>
        </div>
        <div className="account-plan-actions">
          <button
            disabled={permissionCoverageRows.length === 0}
            onClick={() => downloadCsv(`nexus-one-permissoes-rh-${getLocalDateKey()}.csv`, permissionCoverageRows)}
            type="button"
          >
            <Download size={15} />
            CSV
          </button>
          <button
            disabled={permissionCoverageRows.length === 0}
            onClick={() => printRowsDocument("Permissões operacionais - RH", permissionCoverageRows, "Nexus One")}
            type="button"
          >
            <Printer size={15} />
            PDF
          </button>
        </div>
      </div>
      <div className="permission-coverage-grid">
        {permissionCoverageCards.map((card) => (
          <article className={`permission-coverage-card ${card.tone}`} key={card.key}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <small>{card.detail}</small>
          </article>
        ))}
      </div>
      <div className="permission-profile-list">
        {permissionProfileRows.slice(0, 6).map((row) => (
          <article key={row.perfil}>
            <div>
              <strong>{row.perfil}</strong>
              <small>{formatNumber(row.total)} colaborador(es)</small>
            </div>
            <span>{formatNumber(row.modulos.size)} módulos / {formatNumber(row.acoes.size)} ações</span>
            <small>{row.manuais > 0 ? `${formatNumber(row.manuais)} ajuste(s) manual(is)` : "Permissão padrão do perfil"}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
