import { Download, Printer } from "lucide-react";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { formatNumber, getLocalDateKey } from "../../../utils/formatters";

export function OrganizationPanel({ organizationGroups, organizationRows }) {
  return (
    <section className="panel account-plan-summary">
      <div className="account-plan-head">
        <div>
          <h3>Organograma operacional</h3>
          <p>Leitura por filial, perfil e cargo para localizar lideranças e times ativos.</p>
        </div>
        <div className="account-plan-actions">
          <button
            disabled={organizationRows.length === 0}
            onClick={() => downloadCsv(`nexus-one-organograma-rh-${getLocalDateKey()}.csv`, organizationRows)}
            type="button"
          >
            <Download size={15} />
            CSV
          </button>
          <button
            disabled={organizationRows.length === 0}
            onClick={() => printRowsDocument("Organograma operacional", organizationRows, "Nexus One")}
            type="button"
          >
            <Printer size={15} />
            PDF
          </button>
        </div>
      </div>
      <div className="account-plan-grid collection-grid">
        {organizationGroups.length === 0 ? (
          <div className="empty-selection compact">Nenhum colaborador ativo para organizar.</div>
        ) : (
          organizationGroups.slice(0, 12).map((group) => (
            <div className={`account-plan-item ${["ADMIN", "GERENTE"].includes(group.perfil) ? "info" : ""}`} key={group.key}>
              <div className="collaborator-org-head">
                <span className="collaborator-avatar sm">{String(group.nomes[0] || group.perfil).slice(0, 2).toUpperCase()}</span>
                <span>{group.filial}</span>
              </div>
              <strong>{group.cargo}</strong>
              <small>{group.perfil} / {formatNumber(group.total)} pessoa(s)</small>
              <small>{group.nomes.slice(0, 4).join(", ")}{group.nomes.length > 4 ? "..." : ""}</small>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
