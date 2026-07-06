import { Loader2, ShieldCheck, X } from "lucide-react";

export function UserPermissionEditor({
  actionPermissionKey,
  closePermissionEditor,
  handlePermissionSave,
  modulePermissionKey,
  permissionDraft,
  savingPermissionId,
  selectedPermissionUser,
  updatePermissionDraft,
  userPermissionActions,
  userPermissionModules,
}) {
  if (!selectedPermissionUser) {
    return null;
  }

  return (
    <div className="permission-editor">
      <div className="panel-title compact">
        <div>
          <h2>Permissões manuais</h2>
          <p>{selectedPermissionUser.nome || selectedPermissionUser.login} usa o perfil {selectedPermissionUser.perfil} como base.</p>
        </div>
        <div className="panel-actions">
          <button className="report-export secondary" onClick={closePermissionEditor} type="button">
            <X size={16} />
            Fechar
          </button>
          <button
            className="panel-action-button"
            disabled={savingPermissionId === selectedPermissionUser.id}
            onClick={handlePermissionSave}
            type="button"
          >
            {savingPermissionId === selectedPermissionUser.id ? <Loader2 className="spin" size={16} /> : <ShieldCheck size={16} />}
            Salvar permissoes
          </button>
        </div>
      </div>
      <div className="permission-editor-grid">
        <div>
          <h3>Módulos</h3>
          <div className="permission-editor-list">
            {userPermissionModules.map((module) => {
              const key = modulePermissionKey(module.value);
              return (
                <label className="permission-editor-row" key={key}>
                  <span>{module.label}</span>
                  <select
                    value={permissionDraft[key] || "PADRAO"}
                    onChange={(event) => updatePermissionDraft(key, event.target.value)}
                  >
                    <option value="PADRAO">Padrao</option>
                    <option value="LIBERAR">Liberar</option>
                    <option value="BLOQUEAR">Bloquear</option>
                  </select>
                </label>
              );
            })}
          </div>
        </div>
        <div>
          <h3>Ações críticas</h3>
          <div className="permission-editor-list">
            {userPermissionActions.map((action) => {
              const key = actionPermissionKey(action.key);
              return (
                <label className="permission-editor-row" key={key}>
                  <span>{action.label}</span>
                  <select
                    value={permissionDraft[key] || "PADRAO"}
                    onChange={(event) => updatePermissionDraft(key, event.target.value)}
                  >
                    <option value="PADRAO">Padrao</option>
                    <option value="LIBERAR">Liberar</option>
                    <option value="BLOQUEAR">Bloquear</option>
                  </select>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
