import { createFinanceAccountsViewModel } from "../viewModels/financeAccountsViewModel";
import { createFinanceActionPlanViewModel } from "../viewModels/financeActionPlanViewModel";
import { createFinanceCollectionViewModel } from "../viewModels/financeCollectionViewModel";
import { createFinanceDreViewModel } from "../viewModels/financeDreViewModel";
import { createFinanceForecastViewModel } from "../viewModels/financeForecastViewModel";
import { createFinanceMovementViewModel } from "../viewModels/financeViewModel";
import { createFinancePageContext } from "../viewModels/financePageContext";
import { createFinanceReconciliationSummaryViewModel } from "../viewModels/financeReconciliationSummaryViewModel";
import { createFinanceReconciliationViewModel } from "../viewModels/financeReconciliationViewModel";
import { getFinanceItemSummary, getPedidoItemSummary } from "../viewModels/financeSummaries";
import { useFinancePanelRefs } from "./useFinanceNavigation";
import { useFinancePedidoHydration } from "./useFinancePedidoHydration";

export function useFinanceDashboardData({
  data,
  financeBranchFilter,
  financeCategoryFilter,
  financeFilter,
  financePage,
  getOrphanHistoryPagination,
  orphanHistoryFilter,
  session,
}) {
  const context = createFinancePageContext(data, session);
  const {
    auditoria,
    caixas,
    filiais,
    financeCategories,
    followUps,
    movimentacoes,
    pedidos,
    recorrencias,
  } = context;

  const movement = createFinanceMovementViewModel({
    filiais,
    financeBranchFilter,
    financeCategories,
    financeCategoryFilter,
    financeFilter,
    financePage,
    followUps,
    movimentacoes,
    recorrencias,
  });

  const refs = useFinancePanelRefs();

  const dre = createFinanceDreViewModel({
    branchScopedMovimentacoes: movement.branchScopedMovimentacoes,
    caixas,
    pedidos,
    selectedFinanceBranchLabel: movement.selectedFinanceBranchLabel,
  });

  const forecast = createFinanceForecastViewModel({
    activeRecurrences: movement.activeRecurrences,
    branchScopedMovimentacoes: movement.branchScopedMovimentacoes,
    now: new Date(),
  });

  const accounts = createFinanceAccountsViewModel(movement.branchScopedMovimentacoes);

  const pedidoIdsComFinanceiro = new Set(
    movement.branchScopedMovimentacoes
      .filter((item) => item.tipo === "RECEITA" && item.status === "APROVADO" && item.pedidoId)
      .map((item) => String(item.pedidoId)),
  );

  const { pedidosPorId } = useFinancePedidoHydration({
    pedidoIdsComFinanceiro,
    pedidos,
    vendasRecebidas: dre.vendasRecebidas,
  });

  const collection = createFinanceCollectionViewModel({
    branchScopedFollowUps: movement.branchScopedFollowUps,
    contasAReceberVencidas: accounts.contasAReceberVencidas,
    pedidosPorId,
  });

  const reconciliation = createFinanceReconciliationViewModel({
    auditoria,
    branchScopedMovimentacoes: movement.branchScopedMovimentacoes,
    caixas,
    orphanHistoryFilter,
    pedidoIdsComFinanceiro,
    pedidosPorId,
    session,
    vendasRecebidas: dre.vendasRecebidas,
  });

  const actionPlan = createFinanceActionPlanViewModel({
    caixasComDivergencia: reconciliation.caixasComDivergencia,
    caixasComDivergenciaRows: reconciliation.caixasComDivergenciaRows,
    canceladosAdministrativamenteRows: reconciliation.canceladosAdministrativamenteRows,
    cashDivergenceRef: refs.cashDivergenceRef,
    contasAPagarVencidas: accounts.contasAPagarVencidas,
    contasAReceberVencidas: accounts.contasAReceberVencidas,
    dueFollowUps: collection.dueFollowUps,
    filteredOrphanCancellationEvents: reconciliation.filteredOrphanCancellationEvents,
    financeiroSemPedido: reconciliation.financeiroSemPedido,
    forecastBalance30Days: forecast.forecastBalance30Days,
    operatingResult: dre.operatingResult,
    orphanHistoryRef: refs.orphanHistoryRef,
    orphanOrdersRef: refs.orphanOrdersRef,
    orphanlessRevenueRef: refs.orphanlessRevenueRef,
    pedidosSemItens: reconciliation.pedidosSemItens,
    pedidosSemItensRows: reconciliation.pedidosSemItensRows,
    receitasSemPedidoRows: reconciliation.receitasSemPedidoRows,
    salesWithoutFinanceRef: refs.salesWithoutFinanceRef,
    selectedFinanceBranchLabel: movement.selectedFinanceBranchLabel,
    totalAPagarVencido: accounts.totalAPagarVencido,
    totalAReceberVencido: accounts.totalAReceberVencido,
    vendasSemFinanceiro: reconciliation.vendasSemFinanceiro,
    vendasSemFinanceiroRows: reconciliation.vendasSemFinanceiroRows,
  });

  const orphanHistory = getOrphanHistoryPagination(reconciliation.filteredOrphanCancellationEvents);

  const reconciliationSummary = createFinanceReconciliationSummaryViewModel({
    caixas,
    caixasComDivergencia: reconciliation.caixasComDivergencia,
    criticalInconsistencyCount: actionPlan.criticalInconsistencyCount,
    filteredOrphanCancellationEvents: reconciliation.filteredOrphanCancellationEvents,
    financeiroSemPedido: reconciliation.financeiroSemPedido,
    mediumInconsistencyCount: actionPlan.mediumInconsistencyCount,
    movimentacoes,
    pedidosSemItens: reconciliation.pedidosSemItens,
    totalCaixaVendas: dre.totalCaixaVendas,
    totalFinanceiroReceitas: accounts.totalFinanceiroReceitas,
    totalVendasRecebidas: dre.totalVendasRecebidas,
    vendasRecebidas: dre.vendasRecebidas,
    vendasSemFinanceiro: reconciliation.vendasSemFinanceiro,
  });

  return {
    ...context,
    ...movement,
    ...refs,
    ...dre,
    ...forecast,
    ...accounts,
    ...collection,
    ...reconciliation,
    ...actionPlan,
    ...orphanHistory,
    ...reconciliationSummary,
    getFinanceItemSummaryForMovement: (item) => getFinanceItemSummary(item, pedidosPorId),
    getPedidoItemSummary,
    pedidosPorId,
  };
}
