import { FinanceChargePanel } from "./FinanceChargePanel";
import { FinanceEntryForm } from "./FinanceEntryForm";
import { FinanceMovementsPanel } from "./FinanceMovementsPanel";

export function FinanceOperationsSection({
  branchScopedMovimentacoes,
  canMutateFinance,
  canReverseFinance,
  copyChargeText,
  currentFinancePage,
  filiais,
  financeCategoryOptions,
  financeFilter,
  financeFilterLabel,
  financeMovementRows,
  financePageSize,
  financeTotalPages,
  filteredMovimentacoes,
  editingFinanceId,
  form,
  getFinanceItemSummary,
  handleEditFinanceItem,
  handleGenerateCharge,
  handleStatusAction,
  handleSubmit,
  message,
  pagedMovimentacoes,
  saving,
  selectedCharge,
  selectedFinanceBranchLabel,
  session,
  setFinancePage,
  setEditingFinanceId,
  setForm,
  setMessage,
  setSelectedCharge,
  setShowFinanceForm,
  showFinanceForm,
}) {
  return (
    <section className={`dashboard-grid finance-grid ${showFinanceForm ? "" : "single-panel-grid"}`}>
      <FinanceMovementsPanel
        branchScopedMovimentacoes={branchScopedMovimentacoes}
        canMutateFinance={canMutateFinance}
        canReverseFinance={canReverseFinance}
        currentFinancePage={currentFinancePage}
        financeFilter={financeFilter}
        financeFilterLabel={financeFilterLabel}
        financeMovementRows={financeMovementRows}
        financePageSize={financePageSize}
        financeTotalPages={financeTotalPages}
        filteredMovimentacoes={filteredMovimentacoes}
        getFinanceItemSummary={getFinanceItemSummary}
        handleEditFinanceItem={handleEditFinanceItem}
        handleGenerateCharge={handleGenerateCharge}
        handleOpenFinanceForm={() => {
          setEditingFinanceId(null);
          setShowFinanceForm(true);
          setMessage(null);
        }}
        handleStatusAction={handleStatusAction}
        pagedMovimentacoes={pagedMovimentacoes}
        saving={saving}
        selectedFinanceBranchLabel={selectedFinanceBranchLabel}
        session={session}
        setFinancePage={setFinancePage}
        setSelectedCharge={setSelectedCharge}
      />

      {showFinanceForm && canMutateFinance && (
        <FinanceEntryForm
          filiais={filiais}
          financeCategoryOptions={financeCategoryOptions}
          form={form}
          editingFinanceId={editingFinanceId}
          handleClose={() => {
            setEditingFinanceId(null);
            setShowFinanceForm(false);
            setMessage(null);
          }}
          handleSubmit={handleSubmit}
          message={message}
          saving={saving}
          setForm={setForm}
        />
      )}

      {selectedCharge && (
        <FinanceChargePanel
          copyChargeText={copyChargeText}
          handleClose={() => setSelectedCharge(null)}
          selectedCharge={selectedCharge}
        />
      )}
    </section>
  );
}
