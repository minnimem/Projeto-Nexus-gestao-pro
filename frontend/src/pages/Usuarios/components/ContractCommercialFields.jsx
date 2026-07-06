export function ContractCommercialFields({ contractForm, filiais, updateContractForm }) {
  return (
    <div className="finance-form-row">
      <label className="form-control">
        <span>Valor mensal</span>
        <input
          min="0"
          step="0.01"
          type="number"
          value={contractForm.valorMensal}
          onChange={(event) => updateContractForm("valorMensal", event.target.value)}
        />
      </label>
      <label className="form-control">
        <span>Filial</span>
        <select
          value={contractForm.filialId}
          onChange={(event) => updateContractForm("filialId", event.target.value)}
        >
          <option value="">Empresa</option>
          {filiais.map((filial) => (
            <option key={filial.id} value={filial.id}>
              {filial.nome}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
