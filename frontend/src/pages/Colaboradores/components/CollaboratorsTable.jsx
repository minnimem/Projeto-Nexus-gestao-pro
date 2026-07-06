import { Search } from "lucide-react";
import { formatDate, formatNumber } from "../../../utils/formatters";

export function CollaboratorsTable({
  filteredUsers,
  getCollaboratorAccessTone,
  getCollaboratorAvatarUrl,
  getCollaboratorInitials,
  getCollaboratorShift,
  getCollaboratorWorkStatus,
  search,
  setSearch,
  usuarios,
}) {
  return (
    <section className="content-grid single">
      <article className="panel">
        <div className="panel-title compact">
          <div>
            <h2>Equipe da empresa</h2>
            <p>Visualização rápida dos colaboradores, perfis e status de acesso.</p>
          </div>
          <span className="counter">{formatNumber(filteredUsers.length)} de {formatNumber(usuarios.length)} registros</span>
        </div>

        <div className="table-toolbar">
          <div className="search-input">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome, login, perfil ou filial"
            />
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Colaborador</th>
                <th>Perfil</th>
                <th>Cargo</th>
                <th>Contato</th>
                <th>Filial</th>
                <th>Status</th>
                <th>Início</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-cell">
                    Nenhum colaborador encontrado.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((usuario) => {
                  const avatarUrl = getCollaboratorAvatarUrl(usuario);
                  return (
                    <tr key={usuario.id}>
                      <td>
                        <div className="collaborator-name-cell">
                          {avatarUrl ? (
                            <img alt="" className={`collaborator-avatar ${getCollaboratorAccessTone(usuario)}`} src={avatarUrl} />
                          ) : (
                            <span className={`collaborator-avatar ${getCollaboratorAccessTone(usuario)}`}>{getCollaboratorInitials(usuario)}</span>
                          )}
                          <span>
                            <strong>{usuario.nome || usuario.login}</strong>
                            <small>{usuario.login}</small>
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`pill ${String(usuario.perfil || "").toLowerCase()}`}>
                          {usuario.perfil || "-"}
                        </span>
                      </td>
                      <td>
                        <strong>{usuario.cargo || "-"}</strong>
                        <small>{usuario.departamento || "Sem departamento"}</small>
                      </td>
                      <td>
                        <strong>{usuario.telefone || "-"}</strong>
                        <small>{usuario.email || "Sem email"}</small>
                      </td>
                      <td>
                        <strong>{usuario.filial || "Empresa / sem filial"}</strong>
                        <small>{usuario.empresa || "-"}</small>
                      </td>
                      <td>
                        <span className={`pill ${usuario.bloqueado ? "cancelado" : "aprovado"}`}>
                          {usuario.bloqueado ? "BLOQUEADO" : usuario.ativo === false ? "INATIVO" : "ATIVO"}
                        </span>
                        <small>{getCollaboratorWorkStatus(usuario).label} / {getCollaboratorShift(usuario)}</small>
                      </td>
                      <td>{formatDate(usuario.dataInicio || usuario.dataCriacao)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
