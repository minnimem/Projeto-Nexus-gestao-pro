import { Loader2, ShieldCheck } from "lucide-react";

const PLAN_LIMIT_FIELDS = [
  ["limiteUsuarios", "Usuários"],
  ["limiteFiliais", "Filiais"],
  ["limiteCaixas", "Caixas"],
  ["limiteProdutos", "Produtos"],
];

const PLAN_ADDON_FIELDS = [
  ["fiscalLiberado", "Fiscal real"],
  ["pagamentosLiberado", "Pagamentos reais"],
  ["notificacoesLiberado", "Notificações externas"],
  ["logisticaLiberada", "Logística"],
  ["servicosLiberado", "Serviços/OS"],
  ["auditoriaAvancadaLiberada", "Auditoria avançada"],
];

export function CompanyPlanFormPanel({
  handlePlanSubmit,
  planDraft,
  planObservation,
  savingPlan,
  selectedCompany,
  setPlanObservation,
  updatePlanDraft,
}) {
  return (
    <section className="content-grid single">
      <article className="panel">
        <div className="panel-title">
          <div>
            <h2>Plano e adicionais</h2>
            <p>Upgrade, assinatura, limites comerciais e adicionais simples.</p>
          </div>
          <span>{selectedCompany.nome || "-"}</span>
        </div>

        <form className="compact-form company-form" onSubmit={handlePlanSubmit}>
          <div className="finance-form-row">
            <label className="form-control">
              <span>Plano</span>
              <select value={planDraft.planoComercial} onChange={(event) => updatePlanDraft("planoComercial", event.target.value)}>
                <option value="STARTER">Starter</option>
                <option value="BUSINESS">Business</option>
                <option value="ENTERPRISE">Enterprise</option>
              </select>
            </label>
            <label className="form-control">
              <span>Status</span>
              <select value={planDraft.statusAssinatura} onChange={(event) => updatePlanDraft("statusAssinatura", event.target.value)}>
                <option value="TESTE">Teste</option>
                <option value="ATIVA">Ativa</option>
                <option value="PENDENTE">Pendente</option>
                <option value="SUSPENSA">Suspensa</option>
                <option value="CANCELADA">Cancelada</option>
              </select>
            </label>
          </div>

          <div className="finance-form-row">
            {PLAN_LIMIT_FIELDS.map(([field, label]) => (
              <label className="form-control" key={field}>
                <span>{label}</span>
                <input min="0" type="number" value={planDraft[field]} onChange={(event) => updatePlanDraft(field, event.target.value)} />
              </label>
            ))}
          </div>

          <div className="finance-form-row">
            <label className="form-control">
              <span>Valor mensal do plano</span>
              <input min="0" step="0.01" type="number" value={planDraft.valorMensalPlano} onChange={(event) => updatePlanDraft("valorMensalPlano", event.target.value)} />
            </label>
            <label className="form-control">
              <span>Dia de vencimento</span>
              <input max="28" min="1" type="number" value={planDraft.diaVencimentoPlano} onChange={(event) => updatePlanDraft("diaVencimentoPlano", event.target.value)} />
            </label>
            <label className="form-control">
              <span>Último pagamento</span>
              <input type="date" value={planDraft.ultimoPagamentoPlano} onChange={(event) => updatePlanDraft("ultimoPagamentoPlano", event.target.value)} />
            </label>
          </div>

          <div className="account-plan-grid compact-catalog-grid">
            {PLAN_ADDON_FIELDS.map(([field, label]) => (
              <label className="account-plan-item" key={field}>
                <span>{label}</span>
                <input checked={Boolean(planDraft[field])} onChange={(event) => updatePlanDraft(field, event.target.checked)} type="checkbox" />
                <small>{planDraft[field] ? "Adicional ativo" : "Adicional bloqueado"}</small>
              </label>
            ))}
          </div>

          <label className="form-control">
            <span>Motivo da mudança comercial</span>
            <input
              value={planObservation}
              onChange={(event) => setPlanObservation(event.target.value)}
              placeholder="Ex.: upgrade contratado, cortesia, negociação anual"
            />
          </label>

          <button className="checkout-button" disabled={savingPlan || !selectedCompany.id} type="submit">
            {savingPlan ? <Loader2 className="spin" size={17} /> : <ShieldCheck size={17} />}
            {savingPlan ? "Salvando..." : "Salvar plano da empresa"}
          </button>
        </form>
      </article>
    </section>
  );
}
