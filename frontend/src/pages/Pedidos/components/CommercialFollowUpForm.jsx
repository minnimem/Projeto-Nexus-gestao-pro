import { Loader2, Plus, X } from "lucide-react";

export function CommercialFollowUpForm({
  canManageCommercialFollowUp,
  form,
  onCancel,
  onSubmit,
  saving,
  setForm,
}) {
  if (!canManageCommercialFollowUp || !form.pedidoId) return null;

  return (
    <form className="compact-form product-form collection-followup-form" onSubmit={onSubmit}>
      <div className="finance-form-row">
        <label className="form-control">
          <span>Cliente</span>
          <input readOnly value={form.cliente} />
        </label>
        <label className="form-control">
          <span>Canal</span>
          <select
            value={form.canal}
            onChange={(event) => setForm((current) => ({ ...current, canal: event.target.value }))}
          >
            <option value="WhatsApp">WhatsApp</option>
            <option value="Telefone">Telefone</option>
            <option value="Email">Email</option>
            <option value="Presencial">Presencial</option>
          </select>
        </label>
        <label className="form-control">
          <span>Próxima ação</span>
          <input
            type="date"
            value={form.proximaAcao}
            onChange={(event) => setForm((current) => ({ ...current, proximaAcao: event.target.value }))}
          />
        </label>
      </div>
      <label className="form-control">
        <span>Observação</span>
        <textarea
          value={form.observacao}
          onChange={(event) => setForm((current) => ({ ...current, observacao: event.target.value }))}
        />
      </label>
      <div className="cash-action-buttons compact-bulk-actions">
        <button className="checkout-button" disabled={saving} type="submit">
          {saving ? <Loader2 className="spin" size={17} /> : <Plus size={17} />}
          Registrar follow-up
        </button>
        <button className="report-export secondary" onClick={onCancel} type="button">
          <X size={17} />
          Cancelar
        </button>
      </div>
    </form>
  );
}
