import { Download, Printer } from "lucide-react";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { formatNumber, getLocalDateKey } from "../../../utils/formatters";

export function HierarchyPanel({ hierarchyGroups, hierarchyRows }) {
  return (
    <section className="panel account-plan-summary">
      <div className="account-plan-head">
        <div>
          <h3>Hierarquia por setor</h3>
          <p>Organiza líder, supervisor e subordinados por filial e departamento.</p>
        </div>
        <div className="account-plan-actions">
          <button
            disabled={hierarchyRows.length === 0}
            onClick={() => downloadCsv(`nexus-one-hierarquia-rh-${getLocalDateKey()}.csv`, hierarchyRows)}
            type="button"
          >
            <Download size={15} />
            CSV
          </button>
          <button
            disabled={hierarchyRows.length === 0}
            onClick={() => printRowsDocument("Hierarquia por setor - RH operacional", hierarchyRows, "Nexus One")}
            type="button"
          >
            <Printer size={15} />
            PDF
          </button>
        </div>
      </div>
      <div className="hierarchy-grid">
        {hierarchyGroups.length === 0 ? (
          <div className="empty-selection compact">Nenhum colaborador ativo para hierarquia.</div>
        ) : (
          hierarchyGroups.slice(0, 8).map((group) => (
            <article className={group.lideres.length === 0 ? "warning" : "success"} key={group.key}>
              <div>
                <span>{group.filial}</span>
                <strong>{group.setor}</strong>
              </div>
              <div className="hierarchy-line leader">
                <span>Líder</span>
                <strong>{group.lideres.join(", ") || "Sem líder definido"}</strong>
              </div>
              <div className="hierarchy-line">
                <span>Supervisor</span>
                <strong>{group.supervisores.join(", ") || "Sem supervisor definido"}</strong>
              </div>
              <small>{formatNumber(group.equipe.length)} subordinado(s): {group.equipe.slice(0, 4).join(", ") || "sem equipe"}</small>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
