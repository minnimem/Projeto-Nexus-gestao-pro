import { Loader2, UserRound } from "lucide-react";

export function LogisticsDriverForm({ form, onFormChange, onSubmit, savingForm }) {
  return (
    <article className="inline-form-panel">
      <div className="panel-title compact">
        <div>
          <h2>Novo entregador</h2>
          <p>Equipe ativa para operação.</p>
        </div>
      </div>

      <form className="compact-form" onSubmit={onSubmit}>
        <label className="form-control">
          <span>Nome</span>
          <input
            value={form.nome}
            onChange={(event) => onFormChange((prev) => ({ ...prev, nome: event.target.value }))}
            placeholder="Nome completo"
          />
        </label>
        <div className="finance-form-row">
          <label className="form-control">
            <span>Telefone</span>
            <input
              value={form.telefone}
              onChange={(event) => onFormChange((prev) => ({ ...prev, telefone: event.target.value }))}
            />
          </label>
          <label className="form-control">
            <span>CPF</span>
            <input
              value={form.cpf}
              onChange={(event) => onFormChange((prev) => ({ ...prev, cpf: event.target.value }))}
            />
          </label>
        </div>
        <label className="form-control">
          <span>Email</span>
          <input
            value={form.email}
            onChange={(event) => onFormChange((prev) => ({ ...prev, email: event.target.value }))}
            placeholder="email@empresa.com"
          />
        </label>
        <button className="checkout-button" disabled={savingForm === "entregador"} type="submit">
          {savingForm === "entregador" ? <Loader2 className="spin" size={17} /> : <UserRound size={17} />}
          Salvar entregador
        </button>
      </form>
    </article>
  );
}
