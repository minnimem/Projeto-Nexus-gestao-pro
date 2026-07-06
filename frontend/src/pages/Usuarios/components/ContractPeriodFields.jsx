export function ContractPeriodFields({ contractForm, updateContractForm }) {
  return (
    <div className="finance-form-row">
      <label className="form-control">
        <span>Início</span>
        <input
          type="date"
          value={contractForm.dataInicio}
          onChange={(event) => updateContractForm("dataInicio", event.target.value)}
        />
      </label>
      <label className="form-control">
        <span>Fim</span>
        <input
          type="date"
          value={contractForm.dataFim}
          onChange={(event) => updateContractForm("dataFim", event.target.value)}
        />
      </label>
    </div>
  );
}
