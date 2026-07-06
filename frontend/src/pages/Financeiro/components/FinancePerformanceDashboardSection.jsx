import { FinanceActionPlanSection } from "./FinanceActionPlanSection";
import { FinanceDreSection } from "./FinanceDreSection";
import { FinanceForecastSection } from "./FinanceForecastSection";

export function FinancePerformanceDashboardSection({
  canMutateFinance,
  canSeeProfit,
  currentMonthEnd,
  currentMonthResult,
  currentMonthStart,
  dreExportRows,
  dreReadinessExportRows,
  dreReadinessRows,
  dreReadinessScore,
  dreRows,
  financialActionPlan,
  financialActionPlanRows,
  forecastBalance30Days,
  forecastExpense30Days,
  forecastRecurrences30Days,
  forecastRevenue30Days,
  grossMargin,
  grossProfit,
  handleFinancialPlanAction,
  handleFollowUpStatus,
  monthlyComparisonRows,
  netRevenue,
  operatingMargin,
  operatingResult,
  previousMonthEnd,
  previousMonthResult,
  previousMonthStart,
  reminderFollowUps,
  resultVariation,
  saving,
  scrollToCollectionAgenda,
  selectedFinanceBranchLabel,
  session,
  unclassifiedFinanceMovements,
}) {
  return (
    <>
      <FinanceActionPlanSection
        financialActionPlan={financialActionPlan}
        financialActionPlanRows={financialActionPlanRows}
        handleFinancialPlanAction={handleFinancialPlanAction}
        selectedFinanceBranchLabel={selectedFinanceBranchLabel}
        session={session}
      />

      <FinanceDreSection
        canSeeProfit={canSeeProfit}
        dreExportRows={dreExportRows}
        dreReadinessExportRows={dreReadinessExportRows}
        dreReadinessRows={dreReadinessRows}
        dreReadinessScore={dreReadinessScore}
        dreRows={dreRows}
        grossMargin={grossMargin}
        grossProfit={grossProfit}
        netRevenue={netRevenue}
        operatingMargin={operatingMargin}
        operatingResult={operatingResult}
        selectedFinanceBranchLabel={selectedFinanceBranchLabel}
        session={session}
        unclassifiedFinanceMovements={unclassifiedFinanceMovements}
      />

      <FinanceForecastSection
        canMutateFinance={canMutateFinance}
        canSeeProfit={canSeeProfit}
        currentMonthEnd={currentMonthEnd}
        currentMonthResult={currentMonthResult}
        currentMonthStart={currentMonthStart}
        forecastBalance30Days={forecastBalance30Days}
        forecastExpense30Days={forecastExpense30Days}
        forecastRecurrences30Days={forecastRecurrences30Days}
        forecastRevenue30Days={forecastRevenue30Days}
        handleFollowUpStatus={handleFollowUpStatus}
        monthlyComparisonRows={monthlyComparisonRows}
        previousMonthEnd={previousMonthEnd}
        previousMonthResult={previousMonthResult}
        previousMonthStart={previousMonthStart}
        reminderFollowUps={reminderFollowUps}
        resultVariation={resultVariation}
        saving={saving}
        scrollToCollectionAgenda={scrollToCollectionAgenda}
        selectedFinanceBranchLabel={selectedFinanceBranchLabel}
        session={session}
      />
    </>
  );
}
