import { Pencil, Search, X } from "lucide-react";
import { StatusBadge } from "../../../components/StatusBadge/StatusBadge";
import { formatNumber } from "../../../utils/formatters";

export function CompaniesTablePanel({
  companyPlanFilter,
  companySearch,
  companyStatusFilter,
  empresas,
  filteredCompanies,
  getCompanyRiskSignals,
  selectedCompany,
  setCompanyPlanFilter,
  setCompanySearch,
  setCompanyStatusFilter,
  setSelectedCompanyId,
}) {
  return (
    <>
      <div className="finance-form-row">
        <label className="form-control">
          <span>Buscar empresa</span>
          <div className="input-with-icon">
            <Search size={15} />
            <input
              value={companySearch}
              onChange={(event) => setCompanySearch(event.target.value)}
              placeholder="Nome, CNPJ, email ou cidade"
            />
          </div>
        </label>
        <label className="form-control">
          <span>Plano</span>
          <select value={companyPlanFilter} onChange={(event) => setCompanyPlanFilter(event.target.value)}>
            <option value="TODOS">Todos</option>
            <option value="STARTER">Starter</option>
            <option value="BUSINESS">Business</option>
            <option value="ENTERPRISE">Enterprise</option>
          </select>
        </label>
        <label className="form-control">
          <span>Status</span>
          <select value={companyStatusFilter} onChange={(event) => setCompanyStatusFilter(event.target.value)}>
            <option value="TODOS">Todos</option>
            <option value="TESTE">Teste</option>
            <option value="ATIVA">Ativa</option>
            <option value="PENDENTE">Pendente</option>
            <option value="SUSPENSA">Suspensa</option>
            <option value="CANCELADA">Cancelada</option>
            <option value="INATIVA">Inativa</option>
          </select>
        </label>
      </div>

      <div className="section-toolbar">
        <span>{formatNumber(filteredCompanies.length)} de {formatNumber(empresas.length)} empresa(s)</span>
        {(companySearch || companyPlanFilter !== "TODOS" || companyStatusFilter !== "TODOS") && (
          <button
            className="ghost-button"
            onClick={() => {
              setCompanySearch("");
              setCompanyPlanFilter("TODOS");
              setCompanyStatusFilter("TODOS");
            }}
            type="button"
          >
            <X size={14} />
            Limpar filtros
          </button>
        )}
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Empresa</th>
              <th>Plano</th>
              <th>Status</th>
              <th>Uso</th>
              <th>Risco</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.length === 0 ? (
              <tr>
                <td colSpan="6">Nenhuma empresa encontrada com os filtros atuais.</td>
              </tr>
            ) : filteredCompanies.map((empresa) => (
              <tr className={selectedCompany.id === empresa.id ? "selected-row" : ""} key={empresa.id}>
                <td>
                  <strong>{empresa.nome || "Empresa"}</strong>
                  <small>{empresa.cnpj || empresa.email || "Sem identificador fiscal"}</small>
                </td>
                <td>
                  <span className="pill info">{empresa.planoComercial || "STARTER"}</span>
                </td>
                <td>
                  <StatusBadge status={empresa.statusAssinatura || "TESTE"} />
                </td>
                <td>
                  <small>{formatNumber(empresa.usuariosAtivos || 0)} usuário(s) / {formatNumber(empresa.filiais || 0)} filial(is)</small>
                </td>
                <td>
                  <div className="risk-signal-list">
                    {getCompanyRiskSignals(empresa).slice(0, 3).map((signal) => (
                      <span className={`risk-signal ${signal.tone}`} key={`${empresa.id}-${signal.label}`}>
                        {signal.label}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <button className="ghost-button" onClick={() => setSelectedCompanyId(empresa.id)} type="button">
                    <Pencil size={14} />
                    Gerir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
