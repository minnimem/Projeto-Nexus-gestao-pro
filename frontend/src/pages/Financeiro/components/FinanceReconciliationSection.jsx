import { FinanceInconsistencyPanel } from "./FinanceInconsistencyPanel";
import { FinanceOrphanHistoryPanel } from "./FinanceOrphanHistoryPanel";
import { FinanceOrphanOrdersPanel } from "./FinanceOrphanOrdersPanel";
import { FinanceReconciliationDetailsPanels } from "./FinanceReconciliationDetailsPanels";
import { FinanceReconciliationSummary } from "./FinanceReconciliationSummary";
import { FinanceSalesWithoutFinancePanel } from "./FinanceSalesWithoutFinancePanel";

export function FinanceReconciliationSection({
  allVisibleOrphansSelected,
  applyOrphanHistoryPreset,
  caixasComDivergencia,
  caixaFinanceiroDiff,
  cashDivergenceRef,
  currentOrphanHistoryPage,
  filteredOrphanCancellationEvents,
  financeiroSemPedido,
  focusInconsistencyCard,
  getPedidoItemSummary,
  handleCancelOrphanOrder,
  handleCancelOrphanOrders,
  handleReconciliationAction,
  handleToggleOrphanSelection,
  handleToggleVisibleOrphans,
  inconsistencyCards,
  inconsistencyPanelRef,
  inconsistencyRows,
  isAdmin,
  orphanCancellationRows,
  orphanHistoryFilter,
  orphanHistoryRef,
  orphanHistoryTotalPages,
  orphanlessRevenueRef,
  orphanOrdersRef,
  orphanPreview,
  orphanReportRows,
  pagedOrphanCancellationEvents,
  pedidosSemItens,
  reconciliationActionPlan,
  reconciliationLabel,
  reconciliationRows,
  reconciliationScore,
  reconciliationTone,
  salesWithoutFinanceRef,
  saving,
  sectionSession,
  selectedOrphanIds,
  setOrphanHistoryFilter,
  setOrphanHistoryPage,
  vendasCaixaDiff,
  vendasSemFinanceiro,
}) {
  return (
    <section className="panel finance-reconciliation">
      <FinanceReconciliationSummary
        caixaFinanceiroDiff={caixaFinanceiroDiff}
        handleReconciliationAction={handleReconciliationAction}
        reconciliationActionPlan={reconciliationActionPlan}
        reconciliationLabel={reconciliationLabel}
        reconciliationRows={reconciliationRows}
        reconciliationScore={reconciliationScore}
        reconciliationTone={reconciliationTone}
        session={sectionSession}
        vendasCaixaDiff={vendasCaixaDiff}
      />

      <FinanceInconsistencyPanel
        focusInconsistencyCard={focusInconsistencyCard}
        inconsistencyCards={inconsistencyCards}
        inconsistencyRows={inconsistencyRows}
        sectionRef={inconsistencyPanelRef}
        session={sectionSession}
      />

      <div className="dashboard-grid reconciliation-detail-grid">
        <FinanceSalesWithoutFinancePanel
          getPedidoItemSummary={getPedidoItemSummary}
          sectionRef={salesWithoutFinanceRef}
          vendasSemFinanceiro={vendasSemFinanceiro}
        />

        <FinanceOrphanOrdersPanel
          allVisibleOrphansSelected={allVisibleOrphansSelected}
          handleCancelOrphanOrder={handleCancelOrphanOrder}
          handleCancelOrphanOrders={handleCancelOrphanOrders}
          handleToggleOrphanSelection={handleToggleOrphanSelection}
          handleToggleVisibleOrphans={handleToggleVisibleOrphans}
          isAdmin={isAdmin}
          orphanPreview={orphanPreview}
          orphanReportRows={orphanReportRows}
          pedidosSemItens={pedidosSemItens}
          saving={saving}
          sectionRef={orphanOrdersRef}
          selectedOrphanIds={selectedOrphanIds}
          session={sectionSession}
        />

        {isAdmin && (
          <FinanceOrphanHistoryPanel
            applyOrphanHistoryPreset={applyOrphanHistoryPreset}
            currentOrphanHistoryPage={currentOrphanHistoryPage}
            filteredOrphanCancellationEvents={filteredOrphanCancellationEvents}
            orphanCancellationRows={orphanCancellationRows}
            orphanHistoryFilter={orphanHistoryFilter}
            orphanHistoryTotalPages={orphanHistoryTotalPages}
            pagedOrphanCancellationEvents={pagedOrphanCancellationEvents}
            sectionRef={orphanHistoryRef}
            session={sectionSession}
            setOrphanHistoryFilter={setOrphanHistoryFilter}
            setOrphanHistoryPage={setOrphanHistoryPage}
          />
        )}

        <FinanceReconciliationDetailsPanels
          caixasComDivergencia={caixasComDivergencia}
          cashDivergenceRef={cashDivergenceRef}
          financeiroSemPedido={financeiroSemPedido}
          orphanlessRevenueRef={orphanlessRevenueRef}
        />
      </div>
    </section>
  );
}
