import { formatDate } from "../../../utils/formatters";
import { UserAccessActions } from "./UserAccessActions";
import { UserProfileCell } from "./UserProfileCell";

export function UserPermissionsRow({
  editableProfiles,
  handleAccessChange,
  handleProfileChange,
  isPrivilegedPerfil,
  openEditUserForm,
  openPermissionEditor,
  savingAccessId,
  savingProfileId,
  usuario,
}) {
  return (
    <tr>
      <td>
        <strong>{usuario.nome || usuario.login}</strong>
        <small>{usuario.login}</small>
      </td>
      <td>
        <UserProfileCell
          editableProfiles={editableProfiles}
          handleProfileChange={handleProfileChange}
          isPrivilegedPerfil={isPrivilegedPerfil}
          savingProfileId={savingProfileId}
          usuario={usuario}
        />
      </td>
      <td>
        <strong>{usuario.cargo || "-"}</strong>
        <small>{usuario.departamento || "Sem departamento"}</small>
      </td>
      <td>
        <span className={`pill ${usuario.bloqueado ? "cancelado" : "aprovado"}`}>
          {usuario.bloqueado ? "BLOQUEADO" : usuario.ativo === false ? "INATIVO" : "ATIVO"}
        </span>
      </td>
      <td>
        <strong>{usuario.empresa || "-"}</strong>
        <small>{usuario.filial || "Empresa / sem filial"}</small>
      </td>
      <td>{formatDate(usuario.dataCriacao)}</td>
      <td>
        <UserAccessActions
          handleAccessChange={handleAccessChange}
          isPrivilegedPerfil={isPrivilegedPerfil}
          openEditUserForm={openEditUserForm}
          openPermissionEditor={openPermissionEditor}
          savingAccessId={savingAccessId}
          usuario={usuario}
        />
      </td>
    </tr>
  );
}
