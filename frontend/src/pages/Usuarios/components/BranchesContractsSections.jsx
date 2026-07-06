import { BranchesSection } from "./BranchesSection";
import { ContractsSection } from "./ContractsSection";

export function BranchesContractsSections({
  branchForm,
  branchRows,
  contractForm,
  contractRows,
  contratos,
  empresa,
  filiais,
  handleBranchSubmit,
  handleContractSubmit,
  savingBranch,
  savingContract,
  session,
  updateBranchForm,
  updateContractForm,
}) {
  return (
    <>
      <BranchesSection
        branchForm={branchForm}
        branchRows={branchRows}
        empresa={empresa}
        filiais={filiais}
        handleBranchSubmit={handleBranchSubmit}
        savingBranch={savingBranch}
        session={session}
        updateBranchForm={updateBranchForm}
      />

      <ContractsSection
        contractForm={contractForm}
        contractRows={contractRows}
        contratos={contratos}
        empresa={empresa}
        filiais={filiais}
        handleContractSubmit={handleContractSubmit}
        savingContract={savingContract}
        session={session}
        updateContractForm={updateContractForm}
      />
    </>
  );
}
