import { ContractForm } from "./ContractForm";
import { ContractsHeader } from "./ContractsHeader";
import { ContractsList } from "./ContractsList";

export function ContractsSection({
  contractForm,
  contractRows,
  contratos,
  empresa,
  filiais,
  handleContractSubmit,
  savingContract,
  session,
  updateContractForm,
}) {
  return (
    <section className="content-grid single">
      <article className="panel">
        <ContractsHeader contractRows={contractRows} empresa={empresa} session={session} />
        <ContractForm
          contractForm={contractForm}
          filiais={filiais}
          handleContractSubmit={handleContractSubmit}
          savingContract={savingContract}
          updateContractForm={updateContractForm}
        />
        <ContractsList contratos={contratos} />
      </article>
    </section>
  );
}
