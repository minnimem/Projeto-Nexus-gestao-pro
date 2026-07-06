export function SalesBranchFilterPanel({
  filiais,
  salesBranchFilter,
  setCommercialSellerFilter,
  setSalesBranchFilter,
}) {
  return (
    <section className="panel account-plan-summary">
      <div className="account-plan-head">
        <div>
          <h3>Filtro operacional</h3>
          <p>Filtre vendas, ranking, follow-up e pedidos por filial.</p>
        </div>
        <div className="account-plan-actions">
          <label className="commission-config-control">
            <span>Filial</span>
            <select
              value={salesBranchFilter}
              onChange={(event) => {
                setSalesBranchFilter(event.target.value);
                setCommercialSellerFilter("TODOS");
              }}
            >
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
