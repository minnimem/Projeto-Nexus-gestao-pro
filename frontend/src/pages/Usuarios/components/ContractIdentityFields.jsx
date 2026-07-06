export function ContractIdentityFields({ contractForm, updateContractForm }) {
  return (
    <>
      <div className="finance-form-row">
        <label className="form-control">
          <span>Contrato</span>
          <input
            value={contractForm.nome}
            onChange={(event) => updateContractForm("nome", event.target.value)}
            placeholder="Locação loja centro"
          />
        </label>
        <label className="form-control">
          <span>Número</span>
          <input
            value={contractForm.numero}
            onChange={(event) => updateContractForm("numero", event.target.value)}
          />
        </label>
      </div>
      <div className="finance-form-row">
        <label className="form-control">
          <span>Tipo</span>
          <input
            value={contractForm.tipo}
            onChange={(event) => updateContractForm("tipo", event.target.value)}
          />
        </label>
        <label className="form-control">
          <span>Status</span>
          <select
            value={contractForm.status}
            onChange={(event) => updateContractForm("status", event.target.value)}
          >
            <option value="ATIVO">Ativo</option>
            <option value="PENDENTE">Pendente</option>
            <option value="ENCERRADO">Encerrado</option>
          </select>
        </label>
      </div>
    </>
  );
}
