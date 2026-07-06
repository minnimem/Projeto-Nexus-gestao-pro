import { formatNumber } from "../../../utils/formatters";

export function FiscalControlStatusSummary({
  primaryFiscalStatusSummary,
  secondaryFiscalStatusSummary,
  selectedSalesBranchLabel,
}) {
  return (
    <>
      <div className="account-plan-grid compact-catalog-grid fiscal-primary-grid">
        {primaryFiscalStatusSummary.map((item) => (
          <div className="account-plan-item fiscal-status-card" key={item.value}>
            <span>{item.label}</span>
            <strong>{formatNumber(item.count)} pedido(s)</strong>
            <small>{selectedSalesBranchLabel}</small>
          </div>
        ))}
      </div>
      <div className="fiscal-secondary-strip">
        {secondaryFiscalStatusSummary.map((item) => (
          <span key={item.value}>
            {item.label}: <strong>{formatNumber(item.count)}</strong>
          </span>
        ))}
      </div>
    </>
  );
}
