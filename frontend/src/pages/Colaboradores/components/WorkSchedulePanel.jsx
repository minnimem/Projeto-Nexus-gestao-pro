import { Download, Printer } from "lucide-react";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { formatNumber, getLocalDateKey } from "../../../utils/formatters";

export function WorkSchedulePanel({ shiftSummary, workScheduleRows, workStatusCards }) {
  const visibleShifts = shiftSummary.length > 0
    ?
    shiftSummary.slice(0, 6)
    : [{ shift: "Sem jornada", total: 0, ativos: 0, profiles: new Set() }];

  return (
    <section className="panel account-plan-summary">
      <div className="account-plan-head">
        <div>
          <h3>Escala e vínculos</h3>
          <p>Resumo de jornada, turnos, férias, afastamentos, desligamentos e acessos inativos.</p>
        </div>
        <div className="account-plan-actions">
          <button
            disabled={workScheduleRows.length === 0}
            onClick={() => downloadCsv(`nexus-one-escala-rh-${getLocalDateKey()}.csv`, workScheduleRows)}
            type="button"
          >
            <Download size={15} />
            CSV
          </button>
          <button
            disabled={workScheduleRows.length === 0}
            onClick={() => printRowsDocument("Escala e vínculos - RH operacional", workScheduleRows, "Nexus One")}
            type="button"
          >
            <Printer size={15} />
            PDF
          </button>
        </div>
      </div>
      <div className="work-status-grid">
        {workStatusCards.map((card) => (
          <article className={`work-status-card ${card.tone}`} key={card.key}>
            <span>{card.label}</span>
            <strong>{formatNumber(card.items.length)}</strong>
            <small>{card.people.slice(0, 3).join(", ") || "Sem registros"}</small>
          </article>
        ))}
      </div>
      <div className="shift-summary-grid">
        {visibleShifts.map((row) => (
          <article key={row.shift}>
            <span>{row.shift}</span>
            <strong>{formatNumber(row.ativos)} ativo(s)</strong>
            <small>{formatNumber(row.total)} pessoa(s) / {Array.from(row.profiles).slice(0, 4).join(", ") || "sem perfil"}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
