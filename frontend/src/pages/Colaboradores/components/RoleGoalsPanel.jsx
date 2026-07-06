import { Download, Printer } from "lucide-react";
import { StatusBadge } from "../../../components/StatusBadge/StatusBadge";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { formatNumber, getLocalDateKey } from "../../../utils/formatters";

export function RoleGoalsPanel({ roleGoalCards, roleGoalRows }) {
  return (
    <section className="panel account-plan-summary">
      <div className="account-plan-head">
        <div>
          <h3>Metas por perfil</h3>
          <p>Leitura rápida de metas comerciais e cobertura operacional por função.</p>
        </div>
        <div className="account-plan-actions">
          <button
            disabled={roleGoalRows.length === 0}
            onClick={() => downloadCsv(`nexus-one-metas-rh-${getLocalDateKey()}.csv`, roleGoalRows)}
            type="button"
          >
            <Download size={15} />
            CSV
          </button>
          <button
            disabled={roleGoalRows.length === 0}
            onClick={() => printRowsDocument("Metas por perfil - RH operacional", roleGoalRows, "Nexus One")}
            type="button"
          >
            <Printer size={15} />
            PDF
          </button>
        </div>
      </div>
      <div className="role-goal-grid">
        {roleGoalCards.map((card) => (
          <article className={`role-goal-card ${card.tone}`} key={card.key}>
            <div>
              <span>{card.label}</span>
              <StatusBadge status={card.tone === "success" ? "ATIVO" : card.tone === "warning" ? "PENDENTE" : "BLOQUEADO"} label={card.tone === "success" ? "Ok" : card.tone === "warning" ? "Meta pendente" : "Sem cobertura"} />
            </div>
            <strong>{card.formatter(card.value)}</strong>
            <small>{card.target} / {formatNumber(card.active.length)} ativo(s)</small>
            <small>{card.people.slice(0, 3).join(", ") || "Nenhum colaborador ativo"}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
