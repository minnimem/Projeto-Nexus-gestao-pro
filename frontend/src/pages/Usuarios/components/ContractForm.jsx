import { FileText, Loader2 } from "lucide-react";
import { ContractCommercialFields } from "./ContractCommercialFields";
import { ContractIdentityFields } from "./ContractIdentityFields";
import { ContractNotesField } from "./ContractNotesField";
import { ContractPeriodFields } from "./ContractPeriodFields";

export function ContractForm({
  contractForm,
  filiais,
  handleContractSubmit,
  savingContract,
  updateContractForm,
}) {
  return (
    <form className="compact-form company-form" onSubmit={handleContractSubmit}>
      <ContractIdentityFields contractForm={contractForm} updateContractForm={updateContractForm} />
      <ContractPeriodFields contractForm={contractForm} updateContractForm={updateContractForm} />
      <ContractCommercialFields
        contractForm={contractForm}
        filiais={filiais}
        updateContractForm={updateContractForm}
      />
      <ContractNotesField contractForm={contractForm} updateContractForm={updateContractForm} />
      <button className="checkout-button" disabled={savingContract} type="submit">
        {savingContract ? <Loader2 className="spin" size={17} /> : <FileText size={17} />}
        {savingContract ? "Salvando..." : "Salvar contrato"}
      </button>
    </form>
  );
}
