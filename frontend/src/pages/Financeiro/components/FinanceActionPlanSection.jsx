import { Download, Printer } from "lucide-react";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { getLocalDateKey } from "../../../utils/formatters";

const emptyActionPlan = [{
  key: "all-clear",
  severity: "success",
  title: "Financeiro sem ação crítica imédiata",
  detail: "DRE, previsão, cobranças e conciliação não indicam bloqueio urgente.",
  actionLabel: "Ok",
  action: "",
}];

export function FinanceActionPlanSection({
  financialActionPlan,
  financialActionPlanRows,
  handleFinancialPlanAction,
  selectedFinanceBranchLabel,
  session,
}) {
  return (
    <section className="panel compact-alert-panel">
      <div className="panel-title compact">
        <div>
          <h2>Plano de ação financeiro</h2>
          <p>Prioridades geradas a partir de DRE, cobrança, previsão e conciliação.</p>
        </div>
        <div className="account-plan-actions">
          <button
            disabled={financialActionPlanRows.length === 0}
            onClick={() => downloadCsv(`nexus-one-plano-acao-financeiro-${getLocalDateKey()}.csv`, financialActionPlanRows)}
            type="button"
          >
            <Download size={15} /> CSV
          </button>
          <button
            disabled={financialActionPlanRows.length === 0}
            onClick={() => printRowsDocument(`Plano de ação financeiro - ${selectedFinanceBranchLabel}`, financialActionPlanRows, session.empresa || "Nexus One")}
            type="button"
          >
            <Printer size={15} /> PDF
          </button>
        </div>
      </div>
      <div className="compact-alert-list">
        {(financialActionPlan.length > 0 ? financialActionPlan : emptyActionPlan).map((item) => (
          <div className={`compact-alert-card ${item.severity}`} key={item.key}>
            <span>
              <strong>{item.title}</strong>
              <small>{item.detail}</small>
            </span>
            {item.action && (
              <button onClick={() => handleFinancialPlanAction(item.action)} type="button">
                {item.actionLabel}
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

