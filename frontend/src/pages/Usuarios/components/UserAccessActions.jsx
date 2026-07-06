import {
  CheckCircle2,
  Loader2,
  LockKeyhole,
  Pencil,
  ShieldCheck,
} from "lucide-react";

export function UserAccessActions({
  handleAccessChange,
  isPrivilegedPerfil,
  openEditUserForm,
  openPermissionEditor,
  savingAccessId,
  usuario,
}) {
  const privileged = isPrivilegedPerfil(usuario.perfil);
  const accessRevoked = usuario.ativo === false || usuario.bloqueado;

  if (privileged) {
    return <div className="table-actions">-</div>;
  }

  return (
    <div className="table-actions">
      <button
        className="table-icon-button"
        onClick={() => openEditUserForm(usuario)}
        title="Editar colaborador"
        type="button"
      >
        <Pencil size={15} />
      </button>
      <button
        className="table-icon-button"
        onClick={() => openPermissionEditor(usuario)}
        title="Permissões manuais"
        type="button"
      >
        <ShieldCheck size={15} />
      </button>
      <button
        className="table-icon-button"
        disabled={savingAccessId === usuario.id}
        onClick={() => handleAccessChange(usuario, accessRevoked)}
        title={accessRevoked ? "Conceder acesso" : "Revogar acesso"}
        type="button"
      >
        {savingAccessId === usuario.id ? (
          <Loader2 className="spin" size={15} />
        ) : accessRevoked ? (
          <CheckCircle2 size={15} />
        ) : (
          <LockKeyhole size={15} />
        )}
      </button>
    </div>
  );
}
