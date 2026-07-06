export function PlanBillingFilterControl({ planBillingFilter, setPlanBillingFilter }) {
  return (
    <label className="commission-config-control">
      <span>Filtro</span>
      <select value={planBillingFilter} onChange={(event) => setPlanBillingFilter(event.target.value)}>
        <option value="COBRAR">A cobrar</option>
        <option value="VENCIDAS">Vencidas</option>
        <option value="VENCENDO">Vencendo</option>
        <option value="TESTE">Em teste</option>
        <option value="ATIVAS">Ativas</option>
        <option value="STARTER">Starter</option>
        <option value="BUSINESS">Business</option>
        <option value="ENTERPRISE">Enterprise</option>
        <option value="TODOS">Todas</option>
      </select>
    </label>
  );
}
