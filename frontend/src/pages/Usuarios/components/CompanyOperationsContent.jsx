import { BranchesContractsSections } from "./BranchesContractsSections";
import { CompanySection } from "./CompanySection";
import { CommercialHistorySection } from "./CommercialHistorySection";
import { FiscalConfigSection } from "./FiscalConfigSection";
import { FiscalReadinessSection } from "./FiscalReadinessSection";
import { PlanSection } from "./PlanSection";

export function CompanyOperationsContent({
  companyAdmin,
  dashboard,
  fiscalOps,
  session,
}) {
  return (
    <>
      <CompanySection
        companyForm={companyAdmin.companyForm}
        empresa={dashboard.empresa}
        handleCompanySubmit={companyAdmin.handleCompanySubmit}
        savingCompany={companyAdmin.savingCompany}
        session={session}
        updateCompanyForm={companyAdmin.updateCompanyForm}
      />

      <PlanSection
        canManagePlans={dashboard.canManagePlans}
        empresa={dashboard.empresa}
        handlePlanSubmit={companyAdmin.handlePlanSubmit}
        planForm={companyAdmin.planForm}
        savingPlan={companyAdmin.savingPlan}
        session={session}
        updatePlanForm={companyAdmin.updatePlanForm}
      />

      <FiscalReadinessSection
        empresa={dashboard.empresa}
        fiscalPendingCount={dashboard.fiscalPendingCount}
        fiscalReadinessRows={dashboard.fiscalReadinessRows}
        session={session}
      />

      <CommercialHistorySection
        commercialHistory={dashboard.commercialHistory}
        commercialHistoryRows={dashboard.commercialHistoryRows}
        selectedCompany={dashboard.selectedCompany}
      />

      <FiscalConfigSection
        checkFiscalService={fiscalOps.checkFiscalService}
        checkingFiscalServiceConfigId={fiscalOps.checkingFiscalServiceConfigId}
        configuracoesFiscais={dashboard.configuracoesFiscais}
        editFiscalConfig={fiscalOps.editFiscalConfig}
        editingFiscalConfig={fiscalOps.editingFiscalConfig}
        empresa={dashboard.empresa}
        filiais={dashboard.filiais}
        fiscalConfigForm={fiscalOps.fiscalConfigForm}
        fiscalConfigRows={dashboard.fiscalConfigRows}
        fiscalConfigStatusById={fiscalOps.fiscalConfigStatusById}
        fiscalServiceStatusById={fiscalOps.fiscalServiceStatusById}
        handleFiscalConfigSubmit={fiscalOps.handleFiscalConfigSubmit}
        resetFiscalConfigForm={fiscalOps.resetFiscalConfigForm}
        savingFiscalConfig={fiscalOps.savingFiscalConfig}
        session={session}
        updateFiscalConfigForm={fiscalOps.updateFiscalConfigForm}
        validateFiscalConfig={fiscalOps.validateFiscalConfig}
        validatingFiscalConfigId={fiscalOps.validatingFiscalConfigId}
      />

      <BranchesContractsSections
        branchForm={companyAdmin.branchForm}
        branchRows={dashboard.branchRows}
        contractForm={companyAdmin.contractForm}
        contractRows={dashboard.contractRows}
        contratos={dashboard.contratos}
        empresa={dashboard.empresa}
        filiais={dashboard.filiais}
        handleBranchSubmit={companyAdmin.handleBranchSubmit}
        handleContractSubmit={companyAdmin.handleContractSubmit}
        savingBranch={companyAdmin.savingBranch}
        savingContract={companyAdmin.savingContract}
        session={session}
        updateBranchForm={companyAdmin.updateBranchForm}
        updateContractForm={companyAdmin.updateContractForm}
      />
    </>
  );
}
