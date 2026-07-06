export function FiscalBranchFilter({ filiais, salesBranchFilter, setSalesBranchFilter }) {
  return (
    <section className="panel account-plan-summary">
      <div className="account-plan-head">
        <div>
          <h3>Filtro fiscal</h3>
          <p>Selecione a filial para conferir somente os pedidos fiscais daquela unidade.</p>
        </div>
        <div className="account-plan-actions">
          <label className="commission-config-control">
            <span>Filial</span>
            <select value={salesBranchFilter} onChange={(event) => setSalesBranchFilter(event.target.value)}>
              <option value="TODAS">Todas as filiais</option>
              <option value="EMPRESA">Empresa / sem filial</option>
              {filiais.map((filial) => (
                <option key={filial.id} value={filial.id}>
                  {filial.matriz ? "Matriz" : "Filial"} - {filial.nome}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </section>
  );
}
