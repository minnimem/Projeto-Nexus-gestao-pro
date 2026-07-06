import { Download, Printer } from "lucide-react";
import { formatNumber, getLocalDateKey } from "../../../utils/formatters";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";

export function PermissionMatrixSection({
  criticalPermissions,
  modulePermissionRows,
  modules,
  permissionMatrixRows,
  permissionProfiles,
  session,
}) {
  return (
    <section className="content-grid single">
      <article className="panel permission-panel">
        <div className="panel-title">
          <div>
            <h2>Matriz de permissões</h2>
            <p>Visão operacional dos acessos por perfil.</p>
          </div>
          <div className="report-actions">
            <span>{formatNumber(permissionProfiles.length)} perfis</span>
            <button
              className="report-export"
              disabled={permissionMatrixRows.length === 0}
              onClick={() => downloadCsv(`nexus-one-matriz-permissoes-${getLocalDateKey()}.csv`, permissionMatrixRows)}
              type="button"
            >
              <Download size={17} />
              CSV
            </button>
            <button
              className="report-export secondary"
              disabled={permissionMatrixRows.length === 0}
              onClick={() => printRowsDocument("Matriz de permissões", permissionMatrixRows, session.empresa || "Nexus One")}
              type="button"
            >
              <Printer size={17} />
              PDF
            </button>
          </div>
        </div>

        <div className="permission-matrix-wrap">
          <table className="permission-matrix">
            <thead>
              <tr>
                <th>Perfil</th>
                {modules.map((module) => (
                  <th key={module.value}>{module.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modulePermissionRows.map((row) => (
                <tr key={row.perfil}>
                  <td>
                    <span className={`pill ${row.perfil.toLowerCase()}`}>{row.perfil}</span>
                  </td>
                  {row.modules.map((module) => (
                    <td key={module.key}>
                      <span className={`permission-dot ${module.allowed ? "allowed" : "blocked"}`}>
                        {module.allowed ? "Sim" : "Não"}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="critical-permissions">
          {criticalPermissions.map((permission) => (
            <div key={permission.label}>
              <span>{permission.label}</span>
              <strong>{permission.profiles.join(", ")}</strong>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
