import { Download, Printer } from "lucide-react";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { formatDateTime, formatNumber, getLocalDateKey } from "../../../utils/formatters";

export function AuditRhPanel({
  auditoria,
  collaboratorAuditRows,
  recentSensitiveAudit,
  userAuditSummary,
  usersWithoutAudit,
}) {
  return (
    <section className="panel account-plan-summary">
      <div className="account-plan-head">
        <div>
          <h3>Auditoria RH</h3>
          <p>Últimos eventos, ações sensíveis, IP e colaboradores sem rastreabilidade recente.</p>
        </div>
        <div className="account-plan-actions">
          <button
            disabled={collaboratorAuditRows.length === 0}
            onClick={() => downloadCsv(`nexus-one-auditoria-rh-${getLocalDateKey()}.csv`, collaboratorAuditRows)}
            type="button"
          >
            <Download size={15} />
            CSV
          </button>
          <button
            disabled={collaboratorAuditRows.length === 0}
            onClick={() => printRowsDocument("Auditoria RH operacional", collaboratorAuditRows, "Nexus One")}
            type="button"
          >
            <Printer size={15} />
            PDF
          </button>
        </div>
      </div>
      <div className="audit-coverage-grid">
        <article className={auditoria.length > 0 ? "success" : "warning"}>
          <span>Eventos carregados</span>
          <strong>{formatNumber(auditoria.length)}</strong>
          <small>{auditoria.length > 0 ? "Auditoria disponível para leitura" : "Sem eventos de auditoria no carregamento"}</small>
        </article>
        <article className={usersWithoutAudit.length > 0 ? "warning" : "success"}>
          <span>Sem rastro recente</span>
          <strong>{formatNumber(usersWithoutAudit.length)}</strong>
          <small>{usersWithoutAudit.slice(0, 3).map((row) => row.usuario.nome || row.usuario.login).join(", ") || "Todos possuem evento"}</small>
        </article>
        <article className={recentSensitiveAudit.length > 0 ? "danger" : "success"}>
          <span>Ações sensíveis</span>
          <strong>{formatNumber(recentSensitiveAudit.length)}</strong>
          <small>Permissão, acesso, fiscal, financeiro ou exclusão</small>
        </article>
      </div>
      <div className="audit-event-list">
        {(recentSensitiveAudit.length > 0
          ?
          recentSensitiveAudit
          : userAuditSummary.filter((row) => row.lastEvent).slice(0, 5).map((row) => ({ evento: row.lastEvent, usuario: row.usuario }))
        ).map(({ evento, usuario }) => (
          <article key={`${usuario.id || usuario.login}-${evento.id || evento.dataEvento || evento.acao}`}>
            <span>{formatDateTime(evento.dataEvento)}</span>
            <strong>{usuario.nome || usuario.login}</strong>
            <small>{evento.modulo || "-"} / {evento.acao || "-"} / {evento.ip || evento.enderecoIp || "IP não informado"}</small>
          </article>
        ))}
        {auditoria.length === 0 && (
          <div className="empty-selection compact">Auditoria não carregada para este perfil ou ambiente.</div>
        )}
      </div>
    </section>
  );
}
