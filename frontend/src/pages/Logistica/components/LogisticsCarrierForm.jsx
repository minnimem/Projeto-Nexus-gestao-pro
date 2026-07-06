import { Loader2, PackageCheck } from "lucide-react";

export function LogisticsCarrierForm({ form, onFormChange, onSubmit, savingForm, transportadoras }) {
  return (
    <article className="inline-form-panel">
      <div className="panel-title compact">
        <div>
          <h2>Nova transportadora</h2>
          <p>Cadastro para entrega terceirizada e rastreio.</p>
        </div>
      </div>

      <form className="compact-form" onSubmit={onSubmit}>
        <label className="form-control">
          <span>Nome</span>
          <input
            value={form.nome}
            onChange={(event) => onFormChange((prev) => ({ ...prev, nome: event.target.value }))}
            placeholder="Transportadora"
          />
        </label>
        <div className="finance-form-row">
          <label className="form-control">
            <span>Documento</span>
            <input
              value={form.documento}
              onChange={(event) => onFormChange((prev) => ({ ...prev, documento: event.target.value }))}
              placeholder="CNPJ ou CPF"
            />
          </label>
          <label className="form-control">
            <span>Telefone</span>
            <input
              value={form.telefone}
              onChange={(event) => onFormChange((prev) => ({ ...prev, telefone: event.target.value }))}
            />
          </label>
        </div>
        <div className="finance-form-row">
          <label className="form-control">
            <span>Email</span>
            <input
              value={form.email}
              onChange={(event) => onFormChange((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="contato@transportadora.com"
            />
          </label>
          <label className="form-control">
            <span>Site</span>
            <input
              value={form.site}
              onChange={(event) => onFormChange((prev) => ({ ...prev, site: event.target.value }))}
              placeholder="https://"
            />
          </label>
        </div>
        <label className="form-control">
          <span>Observação</span>
          <textarea
            value={form.observacao}
            onChange={(event) => onFormChange((prev) => ({ ...prev, observacao: event.target.value }))}
            placeholder="Prazo, regiões atendidas ou contrato"
          />
        </label>
        <button className="checkout-button" disabled={savingForm === "transportadora"} type="submit">
          {savingForm === "transportadora" ? <Loader2 className="spin" size={17} /> : <PackageCheck size={17} />}
          Salvar transportadora
        </button>
      </form>

      <div className="account-plan-grid compact-catalog-grid">
        {transportadoras.length === 0 ? (
          <div className="empty-selection compact">Nenhuma transportadora cadastrada.</div>
        ) : (
          transportadoras.slice(0, 6).map((transportadora) => (
            <div className="account-plan-item" key={transportadora.id}>
              <span>{transportadora.nome}</span>
              <strong>{transportadora.telefone || transportadora.documento || "-"}</strong>
              <small>{transportadora.email || transportadora.site || "Sem contato"}</small>
            </div>
          ))
        )}
      </div>
    </article>
  );
}
