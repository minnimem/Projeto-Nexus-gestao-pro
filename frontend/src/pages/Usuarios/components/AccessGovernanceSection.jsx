import { Download, Printer } from "lucide-react";
import { formatNumber, getLocalDateKey } from "../../../utils/formatters";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";

export function AccessGovernanceSection({
  criticalAuditEvents,
  manualPermissionRows,
  permissionGovernancePlan,
  session,
  usersWithManualPermissions,
  usuariosSemFilial,
}) {
  return (
    <section className="panel compact-alert-panel">
      <div className="panel-title compact">
        <div>
          <h2>Governanca de acesso</h2>
          <p>Riscos de permissão, usuários sem rastreabilidade e eventos sensíveis.</p>
        </div>
        <div className="account-plan-actions">
          <button
            disabled={manualPermissionRows.length === 0}
            onClick={() => downloadCsv(`nexus-one-permissoes-manuais-${getLocalDateKey()}.csv`, manualPermissionRows)}
            type="button"
          >
            <Download size={15} />
            CSV
          </button>
          <button
            disabled={manualPermissionRows.length === 0}
            onClick={() => printRowsDocument("Permissões manuais", manualPermissionRows, session.empresa || "Nexus One")}
            type="button"
          >
            <Printer size={15} />
            PDF
          </button>
        </div>
      </div>
      <div className="reconciliation-grid compact-metrics-grid">
        <div>
          <span>Permissões manuais</span>
          <strong className={usersWithManualPermissions.length > 0 ? "danger-text" : "success-text"}>
            {formatNumber(usersWithManualPermissions.length)}
          </strong>
          <small>Liberações/bloqueios fora do perfil</small>
        </div>
        <div>
          <span>Eventos críticos</span>
          <strong>{formatNumber(criticalAuditEvents.length)}</strong>
          <small>No filtro atual de auditoria</small>
        </div>
        <div>
          <span>Usuários sem filial</span>
          <strong className={usuariosSemFilial > 0 ? "danger-text" : "success-text"}>{formatNumber(usuariosSemFilial)}</strong>
          <small>Impacta rastreabilidade por loja</small>
        </div>
      </div>
      <div className="compact-alert-list">
        {(permissionGovernancePlan.length > 0
          ? permissionGovernancePlan
          : [{
              key: "governance-ok",
              severity: "success",
              title: "Governanca sem alertas principais",
              detail: "Permissões e auditoria não indicam riscos no filtro atual.",
            }]
        ).map((item) => (
          <div className={`compact-alert-card ${item.severity}`} key={item.key}>
            <span>
              <strong>{item.title}</strong>
              <small>{item.detail}</small>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
