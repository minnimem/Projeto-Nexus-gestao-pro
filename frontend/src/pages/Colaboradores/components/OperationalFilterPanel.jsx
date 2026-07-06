import { formatNumber } from "../../../utils/formatters";

export function OperationalFilterPanel({
  branchFilter,
  branchRows,
  filiais,
  perfis,
  profileFilter,
  setBranchFilter,
  setProfileFilter,
}) {
  return (
    <section className="panel account-plan-summary">
      <div className="account-plan-head">
        <div>
          <h3>Filtro operacional</h3>
          <p>Veja equipe, perfis e acessos por filial.</p>
        </div>
        <div className="account-plan-actions">
          <label className="commission-config-control">
            <span>Filial</span>
            <select value={branchFilter} onChange={(event) => setBranchFilter(event.target.value)}>
              <option value="TODAS">Todas as filiais</option>
              <option value="EMPRESA">Empresa / sem filial</option>
              {filiais.map((filial) => (
                <option key={filial.id} value={filial.id}>
                  {filial.matriz ? "Matriz" : "Filial"} - {filial.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="commission-config-control">
            <span>Perfil</span>
            <select value={profileFilter} onChange={(event) => setProfileFilter(event.target.value)}>
              {perfis.map((perfil) => (
                <option key={perfil} value={perfil}>
                  {perfil === "TODOS" ? "Todos os perfis" : perfil}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <div className="account-plan-grid compact-catalog-grid">
        {branchRows.slice(0, 8).map((row) => (
          <button
            className={branchFilter === row.id ? "account-plan-item active" : "account-plan-item"}
            key={row.id}
            onClick={() => setBranchFilter(row.id)}
            type="button"
          >
            <span>{row.nome}</span>
            <strong>{formatNumber(row.total)} colaborador(es)</strong>
            <small>{formatNumber(row.ativos)} ativos</small>
          </button>
        ))}
      </div>
    </section>
  );
}
