import { formatCurrency, formatNumber } from "../../../utils/formatters";

export function SellerRankingCard({
  canManageCommission,
  commissionPercent,
  handleSaveSellerGoal,
  item,
  savingOrderAction,
  selectedSalesBranchLabel,
  sellerGoalDrafts,
  setSellerGoalDrafts,
}) {
  return (
    <div className="account-plan-item seller-ranking-card">
      <span>{item.vendedor}</span>
      <strong>{formatCurrency(item.total)}</strong>
      <small>
        {formatNumber(item.pedidos)} pedidos / {formatCurrency(item.comissao)} comissão / {formatNumber(commissionPercent)}%
      </small>
      <small>{Array.from(item.filiais || []).join(" | ") || selectedSalesBranchLabel}</small>
      <div className="seller-goal-progress">
        <span style={{ width: `${Math.min(item.atingimento, 100)}%` }} />
      </div>
      <small>
        Meta {item.meta > 0 ? formatCurrency(item.meta) : "-"} / {item.meta > 0 ? `${formatNumber(item.atingimento)}%` : "sem meta"}
      </small>
      {canManageCommission && item.usuario && (
        <div className="seller-goal-editor">
          <input
            min="0"
            step="0.01"
            type="number"
            value={sellerGoalDrafts[item.usuario.id] || ""}
            onChange={(event) => setSellerGoalDrafts((current) => ({ ...current, [item.usuario.id]: event.target.value }))}
            placeholder="Meta"
          />
          <button
            disabled={savingOrderAction === `meta-${item.usuario.id}`}
            onClick={() => handleSaveSellerGoal(item.usuario)}
            type="button"
          >
            {savingOrderAction === `meta-${item.usuario.id}` ? "..." : "Salvar"}
          </button>
        </div>
      )}
    </div>
  );
}
