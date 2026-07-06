import { Download, Printer } from "lucide-react";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { formatNumber, getLocalDateKey } from "../../../utils/formatters";

export function CollaboratorIssuesPanel({
  collaboratorIssueExportRows,
  collaboratorIssueRows,
  criticalCollaboratorIssues,
  getUserBranchLabel,
  warningCollaboratorIssues,
}) {
  return (
    <section className="panel account-plan-summary">
      <div className="account-plan-head">
        <div>
          <h3>Fila de regularização RH</h3>
          <p>Consolida pendências por colaborador para cadastro, filial, jornada, acesso, permissão e auditoria.</p>
        </div>
        <div className="account-plan-actions">
          <span>{formatNumber(criticalCollaboratorIssues.length)} crítico(s) / {formatNumber(warningCollaboratorIssues.length)} alerta(s)</span>
          <button
            disabled={collaboratorIssueExportRows.length === 0}
            onClick={() => downloadCsv(`nexus-one-pendencias-rh-${getLocalDateKey()}.csv`, collaboratorIssueExportRows)}
            type="button"
          >
            <Download size={15} />
            CSV
          </button>
          <button
            disabled={collaboratorIssueExportRows.length === 0}
            onClick={() => printRowsDocument("Fila de regularização RH", collaboratorIssueExportRows, "Nexus One")}
            type="button"
          >
            <Printer size={15} />
            PDF
          </button>
        </div>
      </div>
      <div className="collaborator-issue-grid">
        {collaboratorIssueRows.slice(0, 8).map((row) => (
          <article className={`collaborator-issue-card ${row.severity}`} key={row.usuario.id || row.usuario.login}>
            <div>
              <span className="collaborator-avatar sm">{String(row.usuario.nome || row.usuario.login || "CO").slice(0, 2).toUpperCase()}</span>
              <span>
                <strong>{row.usuario.nome || row.usuario.login || "Colaborador"}</strong>
                <small>{row.usuario.perfil || "-"} / {getUserBranchLabel(row.usuario)}</small>
              </span>
            </div>
            <p>{row.issues.join(", ") || "Sem pendências operacionais"}</p>
            <small>{row.action}</small>
          </article>
        ))}
        {collaboratorIssueRows.length === 0 && (
          <div className="empty-selection compact">Nenhum colaborador encontrado para os filtros atuais.</div>
        )}
      </div>
    </section>
  );
}
