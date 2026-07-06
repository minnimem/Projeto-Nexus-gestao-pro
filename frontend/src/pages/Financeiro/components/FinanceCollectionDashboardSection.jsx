import { initialCollectionFollowUpForm } from "../constants/financeFormDefaults";
import { FinanceCollectionAgendaSection } from "./FinanceCollectionAgendaSection";
import { FinanceCustomerCollectionSection } from "./FinanceCustomerCollectionSection";
import { FinanceDelinquencySection } from "./FinanceDelinquencySection";

export function FinanceCollectionDashboardSection({
  agingBuckets,
  branchScopedFollowUps,
  canManageNotifications,
  canMutateFinance,
  cobrancaPorCliente,
  cobrancaRows,
  collectionFollowUpForm,
  collectionRiskSummary,
  contasAReceberVencidas,
  contasAReceberVencidasDetalhadas,
  followUpRows,
  handleCreateCollectionFollowUp,
  handleFollowUpStatus,
  handleSendFollowUpNotifications,
  handleStatusAction,
  inadimplenciaRows,
  maiorAtrasoDias,
  reminderFollowUps,
  saving,
  sectionRef,
  session,
  setCollectionFollowUpForm,
  startCollectionFollowUp,
  totalAReceberVencido,
}) {
  return (
    <>
      <FinanceDelinquencySection
        agingBuckets={agingBuckets}
        canMutateFinance={canMutateFinance}
        contasAReceberVencidas={contasAReceberVencidas}
        contasAReceberVencidasDetalhadas={contasAReceberVencidasDetalhadas}
        handleStatusAction={handleStatusAction}
        inadimplenciaRows={inadimplenciaRows}
        maiorAtrasoDias={maiorAtrasoDias}
        saving={saving}
        sectionRef={sectionRef}
        session={session}
        totalAReceberVencido={totalAReceberVencido}
      />

      <FinanceCustomerCollectionSection
        canMutateFinance={canMutateFinance}
        cobrancaPorCliente={cobrancaPorCliente}
        cobrancaRows={cobrancaRows}
        collectionRiskSummary={collectionRiskSummary}
        session={session}
        startCollectionFollowUp={startCollectionFollowUp}
      />

      <FinanceCollectionAgendaSection
        branchScopedFollowUps={branchScopedFollowUps}
        canManageNotifications={canManageNotifications}
        canMutateFinance={canMutateFinance}
        collectionFollowUpForm={collectionFollowUpForm}
        followUpRows={followUpRows}
        handleCreateCollectionFollowUp={handleCreateCollectionFollowUp}
        handleFollowUpStatus={handleFollowUpStatus}
        handleSendFollowUpNotifications={handleSendFollowUpNotifications}
        reminderFollowUps={reminderFollowUps}
        resetCollectionFollowUpForm={() => setCollectionFollowUpForm(initialCollectionFollowUpForm)}
        saving={saving}
        session={session}
        setCollectionFollowUpForm={setCollectionFollowUpForm}
      />
    </>
  );
}
