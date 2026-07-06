import { FinanceBranchSection } from "./FinanceBranchSection";
import { FinanceCategorySection } from "./FinanceCategorySection";
import { FinanceRecurrenceSection } from "./FinanceRecurrenceSection";

export function FinanceStructureDashboardSection({
  activeRecurrences,
  branchScopedRecorrencias,
  canMutateFinance,
  categoryForm,
  filiais,
  financeBranchFilter,
  financeBranchRows,
  financeBranchSummary,
  financeCategories,
  financeCategoryFilter,
  financeCategoryRows,
  financeCategorySummary,
  handleCreateFinanceCategory,
  handleGenerateRecurrence,
  handleToggleRecurrence,
  nextRecurrences,
  recurringFinanceRows,
  saving,
  session,
  setCategoryForm,
  setFinanceBranchFilter,
  setFinanceCategoryFilter,
  setFinancePage,
  setShowCategoryForm,
  showCategoryForm,
}) {
  return (
    <>
      <FinanceBranchSection
        filiais={filiais}
        financeBranchFilter={financeBranchFilter}
        financeBranchRows={financeBranchRows}
        financeBranchSummary={financeBranchSummary}
        session={session}
        setFinanceBranchFilter={setFinanceBranchFilter}
        setFinanceCategoryFilter={setFinanceCategoryFilter}
        setFinancePage={setFinancePage}
      />

      <FinanceCategorySection
        canMutateFinance={canMutateFinance}
        categoryForm={categoryForm}
        financeCategories={financeCategories}
        financeCategoryFilter={financeCategoryFilter}
        financeCategoryRows={financeCategoryRows}
        financeCategorySummary={financeCategorySummary}
        handleCreateFinanceCategory={handleCreateFinanceCategory}
        saving={saving}
        session={session}
        setCategoryForm={setCategoryForm}
        setFinanceCategoryFilter={setFinanceCategoryFilter}
        setFinancePage={setFinancePage}
        setShowCategoryForm={setShowCategoryForm}
        showCategoryForm={showCategoryForm}
      />

      <FinanceRecurrenceSection
        activeRecurrences={activeRecurrences}
        branchScopedRecorrencias={branchScopedRecorrencias}
        canMutateFinance={canMutateFinance}
        handleGenerateRecurrence={handleGenerateRecurrence}
        handleToggleRecurrence={handleToggleRecurrence}
        nextRecurrences={nextRecurrences}
        recurringFinanceRows={recurringFinanceRows}
        saving={saving}
        session={session}
      />
    </>
  );
}
