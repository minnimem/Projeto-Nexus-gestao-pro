import { Download, Printer } from "lucide-react";
import { formatNumber, getLocalDateKey } from "../../../utils/formatters";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";

export function AccessHardeningSection({
  sensitiveHardeningRows,
  sensitivePermissionHardening,
  session,
}) {
  return (
    <section className="panel account-plan-summary">
      <div className="account-plan-head">
        <div>
          <h3>Endurecimento de acesso sensivel</h3>
          <p>Compara liberados, limite recomendado, exceções manuais e usuários inativos em permissões críticas.</p>
        </div>
        <div className="account-plan-actions">
          <button
            disabled={sensitiveHardeningRows.length === 0}
            onClick={() => downloadCsv(`nexus-one-endurecimento-acesso-${getLocalDateKey()}.csv`, sensitiveHardeningRows)}
            type="button"
          >
            <Download size={15} />
            CSV
          </button>
          <button
            disabled={sensitiveHardeningRows.length === 0}
            onClick={() => printRowsDocument("Endurecimento de acesso sensivel", sensitiveHardeningRows, session.empresa || "Nexus One")}
            type="button"
          >
            <Printer size={15} />
            PDF
          </button>
        </div>
      </div>
      <div className="access-hardening-grid">
        {sensitivePermissionHardening.map((permission) => (
          <article className={permission.status} key={permission.key}>
            <span>{permission.risk}</span>
            <strong>{permission.label}</strong>
            <small>{formatNumber(permission.allowedUsers.length)} liberado(s) / limite {formatNumber(permission.recommendedLimit)}</small>
            <small>{permission.action}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
