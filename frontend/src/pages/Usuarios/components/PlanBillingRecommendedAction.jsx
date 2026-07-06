import { ArrowUpRight } from "lucide-react";

export function PlanBillingRecommendedAction({
  planBillingDueSoonItems,
  planBillingOpenItems,
  planBillingOverdueItems,
  planBillingRecommendedAction,
  setPlanBillingFilter,
}) {
  const priorityFilter =
    planBillingOverdueItems.length > 0 ?
      "VENCIDAS"
      : planBillingDueSoonItems.length > 0 ?
        "VENCENDO"
        : "TESTE";

  return (
    <section className="account-plan-summary">
      <div className="account-plan-head">
        <div>
          <h3>Próxima ação recomendada</h3>
          <p>{planBillingRecommendedAction}</p>
        </div>
        <div className="account-plan-actions">
          <button
            disabled={planBillingOpenItems.length === 0}
            onClick={() => setPlanBillingFilter(priorityFilter)}
            type="button"
          >
            <ArrowUpRight size={15} />
            Abrir prioridade
          </button>
        </div>
      </div>
    </section>
  );
}
