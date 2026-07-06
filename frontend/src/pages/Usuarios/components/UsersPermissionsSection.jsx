import { Plus } from "lucide-react";
import { formatNumber } from "../../../utils/formatters";
import { UserPermissionEditor } from "./UserPermissionEditor";
import { UsersPermissionsTable } from "./UsersPermissionsTable";

export function UsersPermissionsSection({
  actionPermissionKey,
  closePermissionEditor,
  editableProfiles,
  filteredUsers,
  handleAccessChange,
  handlePermissionSave,
  handleProfileChange,
  isPrivilegedPerfil,
  modulePermissionKey,
  openCreateUserForm,
  openEditUserForm,
  openPermissionEditor,
  permissionDraft,
  savingAccessId,
  savingPermissionId,
  savingProfileId,
  selectedPermissionUser,
  updatePermissionDraft,
  userPermissionActions,
  userPermissionModules,
  usuarios,
}) {
  return (
    <section className="content-grid single">
      <article className="panel orders-panel">
        <div className="panel-title">
          <div>
            <h2>Usuários e permissões</h2>
            <p>Controle administrativo por perfil e empresa.</p>
          </div>
          <div className="panel-actions">
            <span>{formatNumber(filteredUsers.length)} de {formatNumber(usuarios.length)} contas</span>
            <button
              className="panel-action-button"
              onClick={openCreateUserForm}
              type="button"
            >
              <Plus size={16} />
              Novo colaborador
            </button>
          </div>
        </div>

        <UsersPermissionsTable
          editableProfiles={editableProfiles}
          filteredUsers={filteredUsers}
          handleAccessChange={handleAccessChange}
          handleProfileChange={handleProfileChange}
          isPrivilegedPerfil={isPrivilegedPerfil}
          openEditUserForm={openEditUserForm}
          openPermissionEditor={openPermissionEditor}
          savingAccessId={savingAccessId}
          savingProfileId={savingProfileId}
        />

        <UserPermissionEditor
          actionPermissionKey={actionPermissionKey}
          closePermissionEditor={closePermissionEditor}
          handlePermissionSave={handlePermissionSave}
          modulePermissionKey={modulePermissionKey}
          permissionDraft={permissionDraft}
          savingPermissionId={savingPermissionId}
          selectedPermissionUser={selectedPermissionUser}
          updatePermissionDraft={updatePermissionDraft}
          userPermissionActions={userPermissionActions}
          userPermissionModules={userPermissionModules}
        />
      </article>
    </section>
  );
}
