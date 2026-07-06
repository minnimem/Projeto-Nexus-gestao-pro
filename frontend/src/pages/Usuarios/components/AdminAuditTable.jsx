import { formatDate } from "../../../utils/formatters";

export function AdminAuditTable({
  auditTotalPages,
  currentAuditPage,
  filteredAudit,
  getAuditUserBranch,
  pagedAudit,
  setAuditPage,
}) {
  return (
    <>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Usuário</th>
              <th>Filial</th>
              <th>Módulo</th>
              <th>Ação</th>
              <th>Descrição</th>
            </tr>
          </thead>
          <tbody>
            {filteredAudit.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-cell">
                  Nenhum evento de auditoria registrado.
                </td>
              </tr>
            ) : (
              pagedAudit.map((evento) => (
                <tr key={evento.id}>
                  <td>{formatDate(evento.dataEvento)}</td>
                  <td>
                    <strong>{evento.usuarioLogin || "-"}</strong>
                    <small>{evento.perfil || "Sem perfil"}</small>
                  </td>
                  <td>{getAuditUserBranch(evento)}</td>
                  <td>{evento.modulo}</td>
                  <td>
                    <span className="pill aprovado">{evento.acao}</span>
                  </td>
                  <td>{evento.descricao || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="table-pagination">
        <button
          disabled={currentAuditPage === 0}
          onClick={() => setAuditPage((page) => Math.max(page - 1, 0))}
          type="button"
        >
          Anterior
        </button>
        <span>
          Pagina {currentAuditPage + 1} de {auditTotalPages}
        </span>
        <button
          disabled={currentAuditPage >= auditTotalPages - 1}
          onClick={() => setAuditPage((page) => Math.min(page + 1, auditTotalPages - 1))}
          type="button"
        >
          Próximo
        </button>
      </div>
    </>
  );
}
