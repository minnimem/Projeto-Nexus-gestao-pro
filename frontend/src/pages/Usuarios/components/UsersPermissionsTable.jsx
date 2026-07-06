import { UserPermissionsRow } from "./UserPermissionsRow";

export function UsersPermissionsTable({
  editableProfiles,
  filteredUsers,
  handleAccessChange,
  handleProfileChange,
  isPrivilegedPerfil,
  openEditUserForm,
  openPermissionEditor,
  savingAccessId,
  savingProfileId,
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Usuário</th>
            <th>Perfil</th>
            <th>Cargo</th>
            <th>Status</th>
            <th>Empresa</th>
            <th>Criação</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length === 0 ? (
            <tr>
              <td colSpan="7" className="empty-cell">
                Nenhum usuário cadastrado.
              </td>
            </tr>
          ) : (
            filteredUsers.map((usuario) => (
              <UserPermissionsRow
                editableProfiles={editableProfiles}
                handleAccessChange={handleAccessChange}
                handleProfileChange={handleProfileChange}
                isPrivilegedPerfil={isPrivilegedPerfil}
                key={usuario.id}
                openEditUserForm={openEditUserForm}
                openPermissionEditor={openPermissionEditor}
                savingAccessId={savingAccessId}
                savingProfileId={savingProfileId}
                usuario={usuario}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
