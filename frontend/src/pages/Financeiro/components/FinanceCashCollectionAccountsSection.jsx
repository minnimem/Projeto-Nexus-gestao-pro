import { FinanceAccountsSection } from "./FinanceAccountsSection";
import { FinanceCashFlowSection } from "./FinanceCashFlowSection";
import { FinanceCollectionDashboardSection } from "./FinanceCollectionDashboardSection";

export function FinanceCashCollectionAccountsSection({
  actions,
  dashboard,
  saving,
  session,
  state,
}) {
  return (
    <>
      <FinanceCashFlowSection
        cashFlowDays={dashboard.cashFlowDays}
        cashFlowRows={dashboard.cashFlowRows}
        cashFlowSaldo={dashboard.cashFlowSaldo}
        cashFlowTotalEntradas={dashboard.cashFlowTotalEntradas}
        cashFlowTotalSaidas={dashboard.cashFlowTotalSaidas}
        sectionRef={dashboard.cashFlowRef}
        session={session}
      />

      <FinanceCollectionDashboardSection
        agingBuckets={dashboard.agingBuckets}
        branchScopedFollowUps={dashboard.branchScopedFollowUps}
        canManageNotifications={dashboard.canManageNotifications}
        canMutateFinance={dashboard.canMutateFinance}
        cobrancaPorCliente={dashboard.cobrancaPorCliente}
        cobrancaRows={dashboard.cobrancaRows}
        collectionFollowUpForm={state.collectionFollowUpForm}
        collectionRiskSummary={dashboard.collectionRiskSummary}
        contasAReceberVencidas={dashboard.contasAReceberVencidas}
        contasAReceberVencidasDetalhadas={dashboard.contasAReceberVencidasDetalhadas}
        followUpRows={dashboard.followUpRows}
        handleCreateCollectionFollowUp={actions.handleCreateCollectionFollowUp}
        handleFollowUpStatus={actions.handleFollowUpStatus}
        handleSendFollowUpNotifications={actions.handleSendFollowUpNotifications}
        handleStatusAction={actions.handleStatusAction}
        inadimplenciaRows={dashboard.inadimplenciaRows}
        maiorAtrasoDias={dashboard.maiorAtrasoDias}
        reminderFollowUps={dashboard.reminderFollowUps}
        saving={saving}
        sectionRef={dashboard.collectionAgendaRef}
        session={session}
        setCollectionFollowUpForm={state.setCollectionFollowUpForm}
        startCollectionFollowUp={actions.startCollectionFollowUp}
        totalAReceberVencido={dashboard.totalAReceberVencido}
      />

      <FinanceAccountsSection
        canMutateFinance={dashboard.canMutateFinance}
        contasAPagar={dashboard.contasAPagar}
        contasAPagarVencidas={dashboard.contasAPagarVencidas}
        contasAReceber={dashboard.contasAReceber}
        contasAReceberVencidas={dashboard.contasAReceberVencidas}
        handleStatusAction={actions.handleStatusAction}
        proximasContasAPagar={dashboard.proximasContasAPagar}
        proximasContasAReceber={dashboard.proximasContasAReceber}
        saving={saving}
        totalAPagar={dashboard.totalAPagar}
        totalAReceber={dashboard.totalAReceber}
      />
    </>
  );
}
