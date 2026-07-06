export function UserProfileCell({
  editableProfiles,
  handleProfileChange,
  isPrivilegedPerfil,
  savingProfileId,
  usuario,
}) {
  if (isPrivilegedPerfil(usuario.perfil)) {
    return (
      <span className={`pill ${String(usuario.perfil || "").toLowerCase()}`}>
        {usuario.perfil}
      </span>
    );
  }

  return (
    <select
      className="table-profile-select"
      disabled={savingProfileId === usuario.id}
      value={usuario.perfil || "VENDEDOR"}
      onChange={(event) => handleProfileChange(usuario, event.target.value)}
    >
      {editableProfiles.map((perfil) => (
        <option key={perfil} value={perfil}>
          {perfil}
        </option>
      ))}
    </select>
  );
}
