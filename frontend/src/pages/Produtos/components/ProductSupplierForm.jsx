import { Loader2, Plus, X } from "lucide-react";

export function ProductSupplierForm({ form, onClose, onSubmit, saving, setForm }) {
  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="inline-form-panel">
      <div className="panel-title compact">
        <div>
          <h2>Novo fornecedor</h2>
          <p>Cadastro usado em produtos e compras.</p>
        </div>
        <button className="modal-close" onClick={onClose} title="Fechar" type="button">
          <X size={18} />
        </button>
      </div>

      <form className="compact-form product-form" onSubmit={onSubmit}>
        <label className="form-control">
          <span>Nome</span>
          <input
            value={form.nome}
            onChange={(event) => updateField("nome", event.target.value)}
            placeholder="Fornecedor"
          />
        </label>
        <div className="finance-form-row">
          <label className="form-control">
            <span>Tipo</span>
            <select value={form.tipoDocumento} onChange={(event) => updateField("tipoDocumento", event.target.value)}>
              <option value="CNPJ">CNPJ</option>
              <option value="CPF">CPF</option>
            </select>
          </label>
          <label className="form-control">
            <span>Documento</span>
            <input
              value={form.documento}
              onChange={(event) => updateField("documento", event.target.value)}
              placeholder="Somente números"
            />
          </label>
        </div>
        <div className="finance-form-row">
          <label className="form-control">
            <span>Telefone</span>
            <input value={form.telefone} onChange={(event) => updateField("telefone", event.target.value)} />
          </label>
          <label className="form-control">
            <span>Email</span>
            <input value={form.email} onChange={(event) => updateField("email", event.target.value)} />
          </label>
        </div>
        <label className="form-control">
          <span>Endereco</span>
          <textarea value={form.endereco} onChange={(event) => updateField("endereco", event.target.value)} />
        </label>
        <button className="checkout-button" disabled={saving} type="submit">
          {saving ? <Loader2 className="spin" size={17} /> : <Plus size={17} />}
          {saving ? "Salvando..." : "Salvar fornecedor"}
        </button>
      </form>
    </div>
  );
}
