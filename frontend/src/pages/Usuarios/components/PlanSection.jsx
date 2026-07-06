import { Loader2, ShieldCheck } from "lucide-react";
import {
  PlanBillingFields,
  PlanFeatureFields,
  PlanLimitFields,
  PlanStatusFields,
} from "./PlanFormFields";

export function PlanSection({
  canManagePlans,
  empresa,
  handlePlanSubmit,
  planForm,
  savingPlan,
  session,
  updatePlanForm,
}) {
  return (
    <>
      {canManagePlans && (
        <section className="content-grid single">
          <article className="panel">
            <div className="panel-title">
              <div>
                <h2>Plano comercial</h2>
                <p>Limites e liberações aplicados ao contrato ativo da empresa.</p>
              </div>
              <span>{empresa.planoComercial || session.plano.planoComercial || "STARTER"}</span>
            </div>

            <form className="compact-form company-form" onSubmit={handlePlanSubmit}>
              <PlanStatusFields
                canManagePlans={canManagePlans}
                planForm={planForm}
                updatePlanForm={updatePlanForm}
              />
              <PlanLimitFields
                canManagePlans={canManagePlans}
                planForm={planForm}
                updatePlanForm={updatePlanForm}
              />
              <PlanBillingFields
                canManagePlans={canManagePlans}
                planForm={planForm}
                updatePlanForm={updatePlanForm}
              />
              <PlanFeatureFields
                canManagePlans={canManagePlans}
                planForm={planForm}
                updatePlanForm={updatePlanForm}
              />

              {canManagePlans ? (
                <button className="checkout-button" disabled={savingPlan} type="submit">
                  {savingPlan ? <Loader2 className="spin" size={17} /> : <ShieldCheck size={17} />}
                  {savingPlan ? "Salvando..." : "Salvar plano"}
                </button>
              ) : (
                <div className="empty-selection compact">
                  Liberação de plano exige permissão tecnica manual <strong>action:managePlans</strong>.
                </div>
              )}
            </form>
          </article>
        </section>
      )}
    </>
  );
}
