import { SellerRankingCard } from "./SellerRankingCard";

export function SellerRankingGrid({
  canManageCommission,
  commissionPercent,
  handleSaveSellerGoal,
  savingOrderAction,
  selectedSalesBranchLabel,
  sellerCommissionSummary,
  sellerGoalDrafts,
  setSellerGoalDrafts,
}) {
  return (
    <div className="account-plan-grid">
      {sellerCommissionSummary.length === 0 ? (
        <div className="empty-selection compact">Nenhuma venda concluída no período selecionado.</div>
      ) : (
        sellerCommissionSummary.slice(0, 8).map((item) => (
          <SellerRankingCard
            canManageCommission={canManageCommission}
            commissionPercent={commissionPercent}
            handleSaveSellerGoal={handleSaveSellerGoal}
            item={item}
            key={item.vendedor}
            savingOrderAction={savingOrderAction}
            selectedSalesBranchLabel={selectedSalesBranchLabel}
            sellerGoalDrafts={sellerGoalDrafts}
            setSellerGoalDrafts={setSellerGoalDrafts}
          />
        ))
      )}
    </div>
  );
}
