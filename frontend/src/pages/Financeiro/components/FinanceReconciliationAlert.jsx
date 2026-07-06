import { AlertTriangle } from "lucide-react";
import { formatNumber } from "../../../utils/formatters";

export function FinanceReconciliationAlert({
  criticalInconsistencyCount,
  focusInconsistencyPanel,
  mediumInconsistencyCount,
}) {
  if (criticalInconsistencyCount <= 0) return null;

  return (
    <div className="warning-box finance-warning-box">
      <div className="finance-warning-copy">
        <strong>{formatNumber(criticalInconsistencyCount)} inconsistências de alto risco exigem ação.</strong>
        <small>
          {mediumInconsistencyCount > 0 ?
            `${formatNumber(mediumInconsistencyCount)} pendências adicionais aguardam revisão.`
            : "Abra o painel abaixo para tratar os pontos mais urgentes."}
        </small>
      </div>
      <button className="mini-action-button" onClick={focusInconsistencyPanel} type="button">
        <AlertTriangle size={16} />
        Ir para painel
      </button>
    </div>
  );
}

