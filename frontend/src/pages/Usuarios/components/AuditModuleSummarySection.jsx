import { formatNumber, formatPercent } from "../../../utils/formatters";
import { AuditExportActions } from "./AuditExportActions";

export function AuditModuleSummarySection({
  auditModuleRows,
  auditModuleSummary,
  filteredAudit,
  session,
}) {
  return (
    <section className="panel account-plan-summary">
      <div className="account-plan-head">
        <div>
          <h3>Auditoria por módulo</h3>
          <p>Ranking de eventos e ações sensíveis dentro do filtro selecionado.</p>
        </div>
        <AuditExportActions
          filenamePrefix="nexus-one-auditoria-módulos"
          rows={auditModuleRows}
          session={session}
          title="Auditoria por módulo"
        />
      </div>
      <div className="account-plan-grid collection-grid">
        {auditModuleSummary.length === 0 ? (
          <div className="empty-selection compact">Nenhum evento para resumir.</div>
        ) : (
          auditModuleSummary.slice(0, 8).map((item) => (
            <div
              className={`account-plan-item ${item.criticos > 0 ? "warning" : "success"}`}
              key={item.modulo}
            >
              <span>{item.modulo}</span>
              <strong>{formatNumber(item.eventos)} evento(s)</strong>
              <small>{formatNumber(item.criticos)} sensivel(is)</small>
              <small>
                {filteredAudit.length > 0
                  ? formatPercent((item.eventos / filteredAudit.length) * 100)
                  : "0"}
                % da auditoria filtrada
              </small>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
