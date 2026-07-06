const PLAN_FEATURE_FIELDS = [
  ["fiscalLiberado", "Fiscal real"],
  ["pagamentosLiberado", "Pagamentos reais"],
  ["notificacoesLiberado", "Notificações externas"],
  ["logisticaLiberada", "Logística"],
  ["servicosLiberado", "Serviços/OS"],
  ["auditoriaAvancadaLiberada", "Auditoria avançada"],
];

export function PlanFeatureFields({ canManagePlans, planForm, updatePlanForm }) {
  return (
    <div className="account-plan-grid compact-catalog-grid">
      {PLAN_FEATURE_FIELDS.map(([field, label]) => (
        <label className="account-plan-item" key={field}>
          <span>{label}</span>
          <input
            checked={Boolean(planForm[field])}
            disabled={!canManagePlans}
            onChange={(event) => updatePlanForm(field, event.target.checked)}
            type="checkbox"
          />
          <small>{planForm[field] ? "Liberado" : "Bloqueado/condicionado"}</small>
        </label>
      ))}
    </div>
  );
}
