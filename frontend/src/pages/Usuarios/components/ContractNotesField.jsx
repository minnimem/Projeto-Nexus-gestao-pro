export function ContractNotesField({ contractForm, updateContractForm }) {
  return (
    <label className="form-control">
      <span>Observação</span>
      <textarea
        value={contractForm.observacao}
        onChange={(event) => updateContractForm("observacao", event.target.value)}
      />
    </label>
  );
}
