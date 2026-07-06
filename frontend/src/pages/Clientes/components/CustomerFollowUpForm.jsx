import { Loader2, Plus } from "lucide-react";
import { formatCurrency, formatNumber } from "../../../utils/formatters";
import "./CustomerFollowUpForm.css";

export function CustomerFollowUpForm({
  form,
  onSubmit,
  openOrders,
  pendingCount,
  saving,
  setForm,
}) {
  return (
    <form className="customer-followup-form" onSubmit={onSubmit}>
      <div className="customer-followup-head">
        <div>
          <span>Follow-up</span>
          <strong>{formatNumber(pendingCount)} pendente(s)</strong>
        </div>
        <small>{openOrders.length > 0 ? "Contato vinculado ao pedido" : "Sem pedido aberto"}</small>
      </div>
      <label className="form-control">
        <span>Pedido</span>
        <select
          value={form.pedidoId}
          onChange={(event) => setForm((current) => ({ ...current, pedidoId: event.target.value }))}
        >
          <option value="">Selecione</option>
          {openOrders.map((order) => (
            <option key={order.id} value={order.id}>
              {order.numero || order.id} - {formatCurrency(order.valor)}
            </option>
          ))}
        </select>
      </label>
      <div className="finance-form-row">
        <label className="form-control">
          <span>Canal</span>
          <select
            value={form.canal}
            onChange={(event) => setForm((current) => ({ ...current, canal: event.target.value }))}
          >
            <option>WhatsApp</option>
            <option>Email</option>
            <option>Telefone</option>
            <option>Visita</option>
          </select>
        </label>
        <label className="form-control">
          <span>Próxima ação</span>
          <input
            onChange={(event) => setForm((current) => ({ ...current, proximaAcao: event.target.value }))}
            type="date"
            value={form.proximaAcao}
          />
        </label>
      </div>
      <label className="form-control">
        <span>Observação</span>
        <textarea
          onChange={(event) => setForm((current) => ({ ...current, observacao: event.target.value }))}
          placeholder="Próxima conversa, proposta ou pendência"
          value={form.observacao}
        />
      </label>
      <button className="report-export secondary" disabled={saving || openOrders.length === 0} type="submit">
        {saving ? <Loader2 className="spin" size={16} /> : <Plus size={16} />}
        Criar follow-up
      </button>
    </form>
  );
}
