const PLAN_LIMIT_FIELDS = [
  ["limiteUsuarios", "Usuários"],
  ["limiteFiliais", "Filiais"],
  ["limiteCaixas", "Caixas"],
  ["limiteProdutos", "Produtos"],
];

export function PlanLimitFields({ canManagePlans, planForm, updatePlanForm }) {
  return (
    <div className="finance-form-row">
      {PLAN_LIMIT_FIELDS.map(([field, label]) => (
        <label className="form-control" key={field}>
          <span>{label}</span>
          <input
            disabled={!canManagePlans}
            min="0"
            type="number"
            value={planForm[field]}
            onChange={(event) => updatePlanForm(field, event.target.value)}
          />
        </label>
      ))}
    </div>
  );
}
