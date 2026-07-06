import { formatDateTime, formatNumber } from "../../../utils/formatters";
import { AuditExportActions } from "./AuditExportActions";

export function AuditEntitySummarySection({ auditEntityRows, auditEntitySummary, session }) {
  return (
    <section className="panel account-plan-summary">
      <div className="account-plan-head">
        <div>
          <h3>Histórico por entidade</h3>
          <p>Agrupa alterações por módulo e registro para rastrear impactos sensíveis.</p>
        </div>
        <AuditExportActions
          filenamePrefix="nexus-one-auditoria-entidades"
          rows={auditEntityRows}
          session={session}
          title="Histórico por entidade"
        />
      </div>
      <div className="audit-entity-grid">
        {auditEntitySummary.length === 0 ? (
          <div className="empty-selection compact">Nenhuma entidade auditada no filtro atual.</div>
        ) : (
          auditEntitySummary.slice(0, 8).map((item) => (
            <article className={item.criticos > 0 ? "warning" : "success"} key={item.key}>
              <span>{item.modulo}</span>
              <strong>{item.registroId}</strong>
              <small>
                {formatNumber(item.eventos)} evento(s) / {formatNumber(item.criticos)} sensivel(is)
              </small>
              <small>{item.ultimaAcao} em {item.ultimaData ? formatDateTime(item.ultimaData) : "-"}</small>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
