import { FinanceKpiSection } from "./components/FinanceKpiSection";
import { FinancePerformanceDashboardSection } from "./components/FinancePerformanceDashboardSection";
import { FinanceStructureDashboardSection } from "./components/FinanceStructureDashboardSection";
import { FinanceAlertsSection } from "./components/FinanceAlertsSection";
import { FinanceCashCollectionAccountsSection } from "./components/FinanceCashCollectionAccountsSection";
import { FinanceReconciliationOperationsSection } from "./components/FinanceReconciliationOperationsSection";
import { useFinanceDashboardData } from "./hooks/useFinanceDashboardData";
import { useFinanceEntryActions } from "./hooks/useFinanceEntryActions";
import { useFinanceCollectionActions } from "./hooks/useFinanceCollectionActions";
import { useFinanceLifecycleActions } from "./hooks/useFinanceLifecycleActions";
import { useFinanceOrphanActions } from "./hooks/useFinanceOrphanActions";
import { useFinanceNavigation } from "./hooks/useFinanceNavigation";
import { useFinancePageState } from "./hooks/useFinancePageState";
import { buildFinanceEditForm } from "./services/financeRules";
import "./Financeiro.css";

export function Financeiro({ data, session, onRefresh }) {
  const {
    categoryForm,
    collectionFollowUpForm,
    editingFinanceId,
    financeBranchFilter,
    financeCategoryFilter,
    financeFilter,
    financePage,
    form,
    message,
    orphanHistoryControls,
    saving,
    selectedCharge,
    setCategoryForm,
    setCollectionFollowUpForm,
    setEditingFinanceId,
    setFinanceBranchFilter,
    setFinanceCategoryFilter,
    setFinanceFilter,
    setFinancePage,
    setForm,
    setMessage,
    setSaving,
    setSelectedCharge,
    setShowCategoryForm,
    setShowFinanceForm,
    showCategoryForm,
    showFinanceForm,
  } = useFinancePageState();
  const {
    getOrphanHistoryPagination,
    orphanHistoryFilter,
    setOrphanHistoryFilter,
  } = orphanHistoryControls;
  const financeDashboard = useFinanceDashboardData({
    data,
    financeBranchFilter,
    financeCategoryFilter,
    financeFilter,
    financePage,
    getOrphanHistoryPagination,
    orphanHistoryFilter,
    session,
  });
  const {
    activeRecurrences,
    branchScopedMovimentacoes,
    branchScopedRecorrencias,
    canMutateFinance,
    canReverseFinance,
    canSeeProfit,
    contasAPagarAVencer,
    contasAPagarVencidas,
    contasAReceber,
    contasAReceberAVencer,
    contasAReceberVencidas,
    currentMonthEnd,
    currentMonthResult,
    currentMonthStart,
    despesaAprovadaFiltrada,
    dreExportRows,
    dreReadinessExportRows,
    dreReadinessRows,
    dreReadinessScore,
    dreRows,
    dueFollowUps,
    filiais,
    financeBranchRows,
    financeBranchSummary,
    financeCategories,
    financeCategoryOptions,
    financeCategoryRows,
    financeCategorySummary,
    financialActionPlan,
    financialActionPlanRows,
    forecastBalance30Days,
    forecastExpense30Days,
    forecastRecurrences30Days,
    forecastRevenue30Days,
    grossMargin,
    grossProfit,
    inconsistencyCards,
    inconsistencyPanelRef,
    lucroFiltrado,
    monthlyComparisonRows,
    netRevenue,
    nextRecurrences,
    operatingMargin,
    operatingResult,
    orphanPreview,
    pagedMovimentacoes,
    pendingFollowUps,
    pedidosSemItens,
    previousMonthEnd,
    previousMonthResult,
    previousMonthStart,
    receitaAprovadaFiltrada,
    recurringFinanceRows,
    reminderFollowUps,
    resultVariation,
    selectedFinanceBranchLabel,
    totalAPagar,
    totalAPagarAVencer,
    totalAPagarVencido,
    totalAReceber,
    totalAReceberAVencer,
    totalAReceberVencido,
    totalContasAVencer,
    totalContasVencidas,
    unclassifiedFinanceMovements,
    upcomingFollowUps,
  } = financeDashboard;
  const {
    focusInconsistencyCard,
    focusInconsistencyPanel,
    handleFinancialPlanAction,
    handleReconciliationAction,
    scrollToCollectionAgenda,
  } = useFinanceNavigation({
    cashFlowRef,
    collectionAgendaRef,
    inconsistencyCards,
    inconsistencyPanelRef,
    orphanHistoryFilter,
    setFinanceCategoryFilter,
    setFinanceFilter,
    setFinancePage,
    setOrphanHistoryFilter,
  });
  const {
    copyChargeText,
    handleCreateFinanceCategory,
    handleGenerateCharge,
    handleStatusAction,
    handleSubmit,
  } = useFinanceEntryActions({
    categoryForm,
    editingFinanceId,
    form,
    onRefresh,
    session,
    setCategoryForm,
    setEditingFinanceId,
    setFinanceCategoryFilter,
    setForm,
    setMessage,
    setSaving,
    setSelectedCharge,
    setShowCategoryForm,
  });

  function handleEditFinanceItem(item) {
    setEditingFinanceId(item.id);
    setForm(buildFinanceEditForm(item));
    setShowFinanceForm(true);
    setMessage(null);
  }

  const {
    handleCreateCollectionFollowUp,
    handleFollowUpStatus,
    handleSendFollowUpNotifications,
    startCollectionFollowUp,
  } = useFinanceCollectionActions({
    collectionFollowUpForm,
    onRefresh,
    setCollectionFollowUpForm,
    setMessage,
    setSaving,
  });

  const {
    handleBulkBaixarFinanceiro,
    handleGenerateRecurrence,
    handleToggleRecurrence,
  } = useFinanceLifecycleActions({
    onRefresh,
    setMessage,
    setSaving,
  });

  const {
    allVisibleOrphansSelected,
    handleCancelOrphanOrder,
    handleCancelOrphanOrders,
    handleToggleOrphanSelection,
    handleToggleVisibleOrphans,
    selectedOrphanIds,
  } = useFinanceOrphanActions({
    onRefresh,
    orphanPreview,
    pedidosSemItens,
    setMessage,
    setSaving,
  });

  return (
    <div className="dashboard-view">
      <FinanceKpiSection
        canSeeProfit={canSeeProfit}
        contasAReceber={contasAReceber}
        contasAReceberVencidas={contasAReceberVencidas}
        despesaAprovadaFiltrada={despesaAprovadaFiltrada}
        dueFollowUps={dueFollowUps}
        financeCategories={financeCategories}
        financeCategoryOptions={financeCategoryOptions}
        lucroFiltrado={lucroFiltrado}
        pendingFollowUps={pendingFollowUps}
        receitaAprovadaFiltrada={receitaAprovadaFiltrada}
        selectedFinanceBranchLabel={selectedFinanceBranchLabel}
        totalAReceber={totalAReceber}
        upcomingFollowUps={upcomingFollowUps}
      />

      <FinancePerformanceDashboardSection
        canMutateFinance={canMutateFinance}
        canSeeProfit={canSeeProfit}
        currentMonthEnd={currentMonthEnd}
        currentMonthResult={currentMonthResult}
        currentMonthStart={currentMonthStart}
        dreExportRows={dreExportRows}
        dreReadinessExportRows={dreReadinessExportRows}
        dreReadinessRows={dreReadinessRows}
        dreReadinessScore={dreReadinessScore}
        dreRows={dreRows}
        financialActionPlan={financialActionPlan}
        financialActionPlanRows={financialActionPlanRows}
        forecastBalance30Days={forecastBalance30Days}
        forecastExpense30Days={forecastExpense30Days}
        forecastRecurrences30Days={forecastRecurrences30Days}
        forecastRevenue30Days={forecastRevenue30Days}
        grossMargin={grossMargin}
        grossProfit={grossProfit}
        handleFinancialPlanAction={handleFinancialPlanAction}
        handleFollowUpStatus={handleFollowUpStatus}
        monthlyComparisonRows={monthlyComparisonRows}
        netRevenue={netRevenue}
        operatingMargin={operatingMargin}
        operatingResult={operatingResult}
        previousMonthEnd={previousMonthEnd}
        previousMonthResult={previousMonthResult}
        previousMonthStart={previousMonthStart}
        reminderFollowUps={reminderFollowUps}
        resultVariation={resultVariation}
        saving={saving}
        scrollToCollectionAgenda={scrollToCollectionAgenda}
        selectedFinanceBranchLabel={selectedFinanceBranchLabel}
        session={session}
        unclassifiedFinanceMovements={unclassifiedFinanceMovements}
      />

      <FinanceStructureDashboardSection
        activeRecurrences={activeRecurrences}
        branchScopedRecorrencias={branchScopedRecorrencias}
        canMutateFinance={canMutateFinance}
        categoryForm={categoryForm}
        filiais={filiais}
        financeBranchFilter={financeBranchFilter}
        financeBranchRows={financeBranchRows}
        financeBranchSummary={financeBranchSummary}
        financeCategories={financeCategories}
        financeCategoryFilter={financeCategoryFilter}
        financeCategoryRows={financeCategoryRows}
        financeCategorySummary={financeCategorySummary}
        handleCreateFinanceCategory={handleCreateFinanceCategory}
        handleGenerateRecurrence={handleGenerateRecurrence}
        handleToggleRecurrence={handleToggleRecurrence}
        nextRecurrences={nextRecurrences}
        recurringFinanceRows={recurringFinanceRows}
        saving={saving}
        session={session}
        setCategoryForm={setCategoryForm}
        setFinanceBranchFilter={setFinanceBranchFilter}
        setFinanceCategoryFilter={setFinanceCategoryFilter}
        setFinancePage={setFinancePage}
        setShowCategoryForm={setShowCategoryForm}
        showCategoryForm={showCategoryForm}
      />

      <FinanceAlertsSection
        canMutateFinance={canMutateFinance}
        contasAPagarAVencer={contasAPagarAVencer}
        contasAPagarVencidas={contasAPagarVencidas}
        contasAReceberAVencer={contasAReceberAVencer}
        contasAReceberVencidas={contasAReceberVencidas}
        handleBulkBaixarFinanceiro={handleBulkBaixarFinanceiro}
        saving={saving}
        setFinanceCategoryFilter={setFinanceCategoryFilter}
        setFinanceFilter={setFinanceFilter}
        setFinancePage={setFinancePage}
        totalAPagarAVencer={totalAPagarAVencer}
        totalAPagarVencido={totalAPagarVencido}
        totalAReceberAVencer={totalAReceberAVencer}
        totalAReceberVencido={totalAReceberVencido}
        totalContasAVencer={totalContasAVencer}
        totalContasVencidas={totalContasVencidas}
      />

      <FinanceCashCollectionAccountsSection
        actions={{
          handleCreateCollectionFollowUp,
          handleFollowUpStatus,
          handleSendFollowUpNotifications,
          handleStatusAction,
          startCollectionFollowUp,
        }}
        dashboard={financeDashboard}
        saving={saving}
        session={session}
        state={{
          collectionFollowUpForm,
          setCollectionFollowUpForm,
        }}
      />

      <FinanceReconciliationOperationsSection
        actions={{
          copyChargeText,
          focusInconsistencyCard,
          focusInconsistencyPanel,
          handleGenerateCharge,
          handleEditFinanceItem,
          handleReconciliationAction,
          handleStatusAction,
          handleSubmit,
        }}
        dashboard={financeDashboard}
        orphanActions={{
          allVisibleOrphansSelected,
          handleCancelOrphanOrder,
          handleCancelOrphanOrders,
          handleToggleOrphanSelection,
          handleToggleVisibleOrphans,
          selectedOrphanIds,
        }}
        orphanHistoryControls={orphanHistoryControls}
        saving={saving}
        session={session}
        state={{
          financeFilter,
          editingFinanceId,
          form,
          message,
          selectedCharge,
          setFinancePage,
          setEditingFinanceId,
          setForm,
          setMessage,
          setSelectedCharge,
          setShowFinanceForm,
          showFinanceForm,
        }}
      />
    </div>
  );
}
