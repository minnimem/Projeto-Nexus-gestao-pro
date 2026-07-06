export function PlanStatusFields({ canManagePlans, planForm, updatePlanForm }) {
  return (
    <div className="finance-form-row">
      <label className="form-control">
        <span>Plano</span>
        <select
          disabled={!canManagePlans}
          value={planForm.planoComercial}
          onChange={(event) => updatePlanForm("planoComercial", event.target.value)}
        >
          <option value="STARTER">Starter</option>
          <option value="BUSINESS">Business</option>
          <option value="ENTERPRISE">Enterprise</option>
        </select>
      </label>
      <label className="form-control">
        <span>Status</span>
        <select
          disabled={!canManagePlans}
          value={planForm.statusAssinatura}
          onChange={(event) => updatePlanForm("statusAssinatura", event.target.value)}
        >
          <option value="TESTE">Teste</option>
          <option value="ATIVA">Ativa</option>
          <option value="PENDENTE">Pendente</option>
          <option value="SUSPENSA">Suspensa</option>
          <option value="CANCELADA">Cancelada</option>
        </select>
      </label>
    </div>
  );
}
