import { Download, Printer } from "lucide-react";
import { formatNumber, getLocalDateKey } from "../../../utils/formatters";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";

export function SensitivePermissionsSection({
  sensitivePermissionCards,
  sensitivePermissionRows,
  session,
}) {
  return (
    <section className="panel account-plan-summary">
      <div className="account-plan-head">
        <div>
          <h3>Mapa de permissões sensíveis</h3>
          <p>Quem pode operar recursos críticos e onde ha ajustes manuais de acesso.</p>
        </div>
        <div className="account-plan-actions">
          <button
            disabled={sensitivePermissionRows.length === 0}
            onClick={() => downloadCsv(`nexus-one-permissoes-sensíveis-${getLocalDateKey()}.csv`, sensitivePermissionRows)}
            type="button"
          >
            <Download size={15} />
            CSV
          </button>
          <button
            disabled={sensitivePermissionRows.length === 0}
            onClick={() => printRowsDocument("Mapa de permissões sensíveis", sensitivePermissionRows, session.empresa || "Nexus One")}
            type="button"
          >
            <Printer size={15} />
            PDF
          </button>
        </div>
      </div>
      <div className="sensitive-permission-grid">
        {sensitivePermissionCards.map((permission) => (
          <article className={permission.tone} key={permission.key}>
            <div>
              <span>{permission.risk}</span>
              <strong>{permission.label}</strong>
            </div>
            <strong>{formatNumber(permission.allowedUsers.length)} liberado(s)</strong>
            <small>{permission.allowedUsers.slice(0, 4).map((usuario) => usuario.nome || usuario.login).join(", ") || "Sem usuário liberado"}</small>
            <small>{permission.manualUsers.length > 0 ? `${formatNumber(permission.manualUsers.length)} ajuste(s) manual(is)` : "Acesso padrão por perfil"}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
