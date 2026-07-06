import { Loader2, Plus, X } from "lucide-react";

export function CustomerCreateModal({
  form,
  message,
  onClose,
  onSubmit,
  saving,
  updateForm,
}) {
  return (
    <div className="modal-backdrop" role="presentation">
      <aside className="panel modal-panel customer-modal-panel">
        <div className="panel-title compact">
          <div>
            <h2>Novo cliente</h2>
            <p>Cadastro rápido para vendas e PDV.</p>
          </div>
          <button className="modal-close" onClick={onClose} title="Fechar" type="button">
            <X size={18} />
          </button>
        </div>

        <form className="compact-form" onSubmit={onSubmit}>
          <label className="form-control">
            <span>Nome</span>
            <input
              onChange={(event) => updateForm("nome", event.target.value)}
              placeholder="Nome completo"
              value={form.nome}
            />
          </label>

          <div className="finance-form-row">
            <label className="form-control">
              <span>CPF</span>
              <input
                onChange={(event) => updateForm("cpf", event.target.value)}
                placeholder="Somente números"
                value={form.cpf}
              />
            </label>
            <label className="form-control">
              <span>Nascimento</span>
              <input
                onChange={(event) => updateForm("dataNascimento", event.target.value)}
                type="date"
                value={form.dataNascimento}
              />
            </label>
          </div>

          <div className="finance-form-row">
            <label className="form-control">
              <span>Email</span>
              <input
                onChange={(event) => updateForm("email", event.target.value)}
                placeholder="cliente@email.com"
                value={form.email}
              />
            </label>
            <label className="form-control">
              <span>Telefone</span>
              <input
                onChange={(event) => updateForm("telefone", event.target.value)}
                placeholder="(00) 00000-0000"
                value={form.telefone}
              />
            </label>
          </div>

          <label className="form-control">
            <span>Endereco</span>
            <textarea
              onChange={(event) => updateForm("endereco", event.target.value)}
              placeholder="Rua ou avenida"
              value={form.endereco}
            />
          </label>

          <div className="finance-form-row">
            <label className="form-control">
              <span>Número</span>
              <input
                onChange={(event) => updateForm("numero", event.target.value)}
                placeholder="Número"
                value={form.numero}
              />
            </label>
            <label className="form-control">
              <span>Bairro</span>
              <input
                onChange={(event) => updateForm("bairro", event.target.value)}
                placeholder="Bairro"
                value={form.bairro}
              />
            </label>
          </div>

          <div className="finance-form-row">
            <label className="form-control">
              <span>Cidade</span>
              <input
                onChange={(event) => updateForm("cidade", event.target.value)}
                placeholder="Cidade"
                value={form.cidade}
              />
            </label>
            <label className="form-control">
              <span>UF</span>
              <input
                maxLength={2}
                onChange={(event) => updateForm("uf", event.target.value.toUpperCase())}
                placeholder="SP"
                value={form.uf}
              />
            </label>
          </div>

          <div className="finance-form-row">
            <label className="form-control">
              <span>CEP</span>
              <input
                inputMode="numeric"
                maxLength={9}
                onChange={(event) => updateForm("cep", event.target.value)}
                placeholder="00000-000"
                value={form.cep}
              />
            </label>
            <label className="form-control">
              <span>Código município</span>
              <input
                inputMode="numeric"
                maxLength={7}
                onChange={(event) => updateForm("codigoMunicipio", event.target.value)}
                placeholder="IBGE"
                value={form.codigoMunicipio}
              />
            </label>
          </div>

          <label className="form-control">
            <span>Inscricao estadual</span>
            <input
              onChange={(event) => updateForm("inscricaoEstadual", event.target.value)}
              placeholder="Opcional para contribuinte"
              value={form.inscricaoEstadual}
            />
          </label>

          {message && <p className={`form-message ${message.type}`}>{message.text}</p>}

          <button className="checkout-button" disabled={saving} type="submit">
            {saving ? <Loader2 className="spin" size={17} /> : <Plus size={17} />}
            {saving ? "Salvando..." : "Salvar cliente"}
          </button>
        </form>
      </aside>
    </div>
  );
}
