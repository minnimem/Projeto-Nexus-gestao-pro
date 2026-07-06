import { formatCurrency, formatDateTime, formatNumber } from "../../../utils/formatters";

export function CommercialSellerSummary({
  commercialFollowUpSummary,
  commercialSellerFilter,
  selectedSalesBranchLabel,
  setCommercialSellerFilter,
}) {
  return (
    <div className="account-plan-grid commercial-followup-grid">
      {commercialFollowUpSummary.length === 0 ? (
        <div className="empty-selection compact">Nenhum orçamento ou pedido em aberto para follow-up.</div>
      ) : (
        commercialFollowUpSummary.slice(0, 8).map((item) => (
          <button
            className={commercialSellerFilter === item.vendedor ? "account-plan-item active" : "account-plan-item"}
            key={item.vendedor}
            onClick={() => setCommercialSellerFilter(item.vendedor)}
            type="button"
          >
            <span>{item.vendedor}</span>
            <strong>{formatCurrency(item.valorAberto)}</strong>
            <small>
              {formatNumber(item.orcamentos)} orç. / {formatNumber(item.pendentes)} pend. / {formatNumber(item.separacao)} separação
            </small>
            <small>{selectedSalesBranchLabel}</small>
            <small>Último contato {item.ultimoContato ? formatDateTime(item.ultimoContato) : "-"}</small>
          </button>
        ))
      )}
    </div>
  );
}
