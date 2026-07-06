import { formatCurrency, formatNumber } from "../../../utils/formatters";

export function SellerRankingSummary({
  sellerRankingGoal,
  sellerRankingProgress,
  sellerRankingTotal,
}) {
  return (
    <div className="sales-period-summary seller-ranking-summary">
      <div>
        <span>Vendas no período</span>
        <strong>{formatCurrency(sellerRankingTotal)}</strong>
      </div>
      <div>
        <span>Meta somada</span>
        <strong>{sellerRankingGoal > 0 ? formatCurrency(sellerRankingGoal) : "-"}</strong>
      </div>
      <div>
        <span>Atingimento</span>
        <strong>{sellerRankingGoal > 0 ? `${formatNumber(sellerRankingProgress)}%` : "-"}</strong>
      </div>
    </div>
  );
}
