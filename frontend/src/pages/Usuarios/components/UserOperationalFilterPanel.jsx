import { formatNumber } from "../../../utils/formatters";

export function UserOperationalFilterPanel({
  filiais,
  permissionProfiles,
  setUserBranchFilter,
  setUserProfileFilter,
  userBranchFilter,
  userBranchRows,
  userProfileFilter,
}) {
  return (
    <section className="panel account-plan-summary">
      <div className="account-plan-head">
        <div>
          <h3>Filtro operacional</h3>
          <p>Filtre colaboradores por filial e perfil para conferir acessos por loja.</p>
        </div>
        <div className="account-plan-actions">
          <label className="commission-config-control">
            <span>Filial</span>
            <select value={userBranchFilter} onChange={(event) => setUserBranchFilter(event.target.value)}>
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
            <select value={userProfileFilter} onChange={(event) => setUserProfileFilter(event.target.value)}>
              <option value="TODOS">Todos</option>
              {permissionProfiles.map((perfil) => (
                <option key={perfil} value={perfil}>
                  {perfil}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <div className="account-plan-grid compact-catalog-grid">
        {userBranchRows.slice(0, 8).map((row) => (
          <button
            className={userBranchFilter === row.id ? "account-plan-item active" : "account-plan-item"}
            key={row.id}
            onClick={() => setUserBranchFilter(row.id)}
            type="button"
          >
            <span>{row.nome}</span>
            <strong>{formatNumber(row.total)} usuário(s)</strong>
            <small>{formatNumber(row.ativos)} ativos</small>
          </button>
        ))}
      </div>
    </section>
  );
}
