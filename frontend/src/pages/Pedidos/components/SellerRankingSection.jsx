import { sectionClass } from "../../../utils/sales";
import { SellerRankingGrid } from "./SellerRankingGrid";
import { SellerRankingHeader } from "./SellerRankingHeader";
import { SellerRankingPeriodFilter } from "./SellerRankingPeriodFilter";
import { SellerRankingSummary } from "./SellerRankingSummary";

export function SellerRankingSection({
  commission,
  savingOrderAction,
  selectedSalesBranchLabel,
  showSellerRanking,
}) {
  const {
    canManageCommission,
    commissionPercent,
    commissionRateInput,
    handleSaveCommissionConfig,
    handleSaveSellerGoal,
    sellerCommissionRows,
    sellerCommissionSummary,
    sellerGoalDrafts,
    sellerRankingFilter,
    sellerRankingGoal,
    sellerRankingProgress,
    sellerRankingTotal,
    setCommissionRateInput,
    setSellerGoalDrafts,
    setSellerRankingFilter,
  } = commission;

  return (
    <section className={`panel account-plan-summary${sectionClass(showSellerRanking)}`}>
      <SellerRankingHeader
        canManageCommission={canManageCommission}
        commissionRateInput={commissionRateInput}
        handleSaveCommissionConfig={handleSaveCommissionConfig}
        savingOrderAction={savingOrderAction}
        sellerCommissionRows={sellerCommissionRows}
        setCommissionRateInput={setCommissionRateInput}
      />

      <SellerRankingPeriodFilter
        sellerRankingFilter={sellerRankingFilter}
        setSellerRankingFilter={setSellerRankingFilter}
      />

      <SellerRankingSummary
        sellerRankingGoal={sellerRankingGoal}
        sellerRankingProgress={sellerRankingProgress}
        sellerRankingTotal={sellerRankingTotal}
      />

      <SellerRankingGrid
        canManageCommission={canManageCommission}
        commissionPercent={commissionPercent}
        handleSaveSellerGoal={handleSaveSellerGoal}
        savingOrderAction={savingOrderAction}
        selectedSalesBranchLabel={selectedSalesBranchLabel}
        sellerCommissionSummary={sellerCommissionSummary}
        sellerGoalDrafts={sellerGoalDrafts}
        setSellerGoalDrafts={setSellerGoalDrafts}
      />
    </section>
  );
}
