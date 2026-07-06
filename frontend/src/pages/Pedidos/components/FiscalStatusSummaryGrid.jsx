import { formatNumber } from "../../../utils/formatters";

export function FiscalStatusSummaryGrid({ fiscalStatusSummary, selectedSalesBranchLabel }) {
  return (
    <div className="account-plan-grid compact-catalog-grid fiscal-status-grid">
      {fiscalStatusSummary.map((item) => (
        <div className="account-plan-item fiscal-status-card" key={item.value}>
          <span>{item.label}</span>
          <strong>{formatNumber(item.count)} pedido(s)</strong>
          <small>{selectedSalesBranchLabel}</small>
        </div>
      ))}
    </div>
  );
}
