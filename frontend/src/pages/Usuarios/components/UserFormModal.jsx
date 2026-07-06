import { Loader2, ShieldCheck, X } from "lucide-react";
import {
  UserAccessFields,
  UserContactFields,
  UserProfessionalFields,
} from "./UserFormFields";

export function UserFormModal({
  closeUserForm,
  editingUser,
  filiais,
  form,
  handleSubmit,
  message,
  saving,
  updateForm,
}) {
  return (
    <div className="modal-backdrop" role="presentation">
      <aside className="panel modal-panel collaborator-modal">
        <div className="panel-title compact">
          <div>
            <h2>{editingUser ? "Editar colaborador" : "Novo colaborador"}</h2>
            <p>
              {editingUser
                ?
                "Atualize perfil, cargo e dados profissionais."
                : "Cadastro completo com acesso, cargo e dados profissionais."}
            </p>
          </div>
          <button
            className="modal-close"
            onClick={closeUserForm}
            title="Fechar"
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <form className="compact-form" onSubmit={handleSubmit}>
          <UserAccessFields
            editingUser={editingUser}
            filiais={filiais}
            form={form}
            updateForm={updateForm}
          />
          <UserProfessionalFields form={form} updateForm={updateForm} />
          <UserContactFields form={form} updateForm={updateForm} />

          {message && <p className={`form-message ${message.type}`}>{message.text}</p>}

          <button className="checkout-button" disabled={saving} type="submit">
            {saving ? <Loader2 className="spin" size={17} /> : <ShieldCheck size={17} />}
            {saving ? "Salvando..." : editingUser ? "Atualizar colaborador" : "Salvar colaborador"}
          </button>
        </form>
      </aside>
    </div>
  );
}
