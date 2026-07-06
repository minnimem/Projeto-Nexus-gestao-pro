export function PlanBillingFields({ canManagePlans, planForm, updatePlanForm }) {
  return (
    <div className="finance-form-row">
      <label className="form-control">
        <span>Valor mensal do plano</span>
        <input
          disabled={!canManagePlans}
          min="0"
          step="0.01"
          type="number"
          value={planForm.valorMensalPlano}
          onChange={(event) => updatePlanForm("valorMensalPlano", event.target.value)}
        />
      </label>
      <label className="form-control">
        <span>Dia de vencimento</span>
        <input
          disabled={!canManagePlans}
          max="28"
          min="1"
          type="number"
          value={planForm.diaVencimentoPlano}
          onChange={(event) => updatePlanForm("diaVencimentoPlano", event.target.value)}
        />
      </label>
      <label className="form-control">
        <span>Último pagamento</span>
        <input
          disabled={!canManagePlans}
          type="date"
          value={planForm.ultimoPagamentoPlano}
          onChange={(event) => updatePlanForm("ultimoPagamentoPlano", event.target.value)}
        />
      </label>
    </div>
  );
}
