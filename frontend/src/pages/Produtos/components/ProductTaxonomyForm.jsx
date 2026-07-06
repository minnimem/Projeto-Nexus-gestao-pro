import { Loader2, Plus, X } from "lucide-react";

export function ProductTaxonomyForm({
  buttonLabel,
  description,
  descriptionPlaceholder,
  form,
  namePlaceholder,
  onClose,
  onSubmit,
  saving,
  setForm,
  title,
}) {
  return (
    <div className="inline-form-panel">
      <div className="panel-title compact">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
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
            onChange={(event) => setForm((current) => ({ ...current, nome: event.target.value }))}
            placeholder={namePlaceholder}
          />
        </label>
        <label className="form-control">
          <span>Descrição</span>
          <textarea
            value={form.descricao}
            onChange={(event) => setForm((current) => ({ ...current, descricao: event.target.value }))}
            placeholder={descriptionPlaceholder}
          />
        </label>
        <button className="checkout-button" disabled={saving} type="submit">
          {saving ? <Loader2 className="spin" size={17} /> : <Plus size={17} />}
          {saving ? "Salvando..." : buttonLabel}
        </button>
      </form>
    </div>
  );
}
