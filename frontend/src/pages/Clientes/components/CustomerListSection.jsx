import {
  ClipboardList,
  MapPin,
  Plus,
  Search,
} from "lucide-react";
import { formatDate } from "../../../utils/formatters";
import {
  getClientId,
  getClientName,
  getCustomerInitials,
} from "../../../utils/customers";
import "./CustomerIdentity.css";
import "./CustomerListSection.css";

export function CustomerListSection({
  branchFilter,
  customers,
  filiais,
  getCustomerBranchLabel,
  getCustomerCommercialProfile,
  onCreateCustomer,
  search,
  selectedCustomer,
  setBranchFilter,
  setSearch,
  setSelectedCustomerId,
}) {
  return (
    <article className="panel orders-panel">
      <div className="panel-title">
        <div>
          <h2>Carteira de clientes</h2>
          <p>Cadastro limpo vindo do Spring Boot, sem relacionamento pesado.</p>
        </div>
        <div className="panel-actions">
          <span>{customers.length} clientes</span>
          <button className="panel-action-button secondary" onClick={onCreateCustomer} type="button">
            <Plus size={17} />
            Novo cliente
          </button>
        </div>
      </div>

      <div className="customer-filter-row">
        <label className="search-field">
          <Search size={17} />
          <input
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome, CPF ou email"
            value={search}
          />
        </label>
        <label className="form-control">
          <span>Filial</span>
          <select value={branchFilter} onChange={(event) => setBranchFilter(event.target.value)}>
            <option value="TODAS">Todas</option>
            <option value="EMPRESA">Empresa / sem filial</option>
            {filiais.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.matriz ? "Matriz" : "Filial"} - {branch.nome}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Contato</th>
              <th>Filial</th>
              <th>Endereco</th>
              <th>Nascimento</th>
              <th>Cadastro</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-cell">Nenhum cliente encontrado.</td>
              </tr>
            ) : customers.map((customer) => {
              const clientId = getClientId(customer);
              const isSelected = selectedCustomer
                && String(clientId) === String(getClientId(selectedCustomer));
              const profile = getCustomerCommercialProfile(customer);

              return (
                <tr className={isSelected ? "customer-row-selected" : ""} key={clientId}>
                  <td>
                    <div className="customer-table-cell customer-name-cell">
                      <span className="customer-avatar">{getCustomerInitials(getClientName(customer))}</span>
                      <span>
                        <strong>{getClientName(customer)}</strong>
                        <small>{customer.cpf || "-"}</small>
                        <em className={`customer-level-badge ${profile.tone}`} title={profile.detail}>
                          {profile.label}
                        </em>
                      </span>
                    </div>
                  </td>
                  <td>
                    <strong>{customer.email || "-"}</strong>
                    <small>{customer.telefone || "Sem telefone"}</small>
                  </td>
                  <td>{getCustomerBranchLabel(customer)}</td>
                  <td>
                    <span className="code-cell">
                      <MapPin size={14} />
                      {customer.endereco || "-"}
                    </span>
                    <small>{[customer.cidade, customer.uf].filter(Boolean).join("/") || customer.cep || "Fiscal pendente"}</small>
                  </td>
                  <td>{formatDate(customer.dataNascimento)}</td>
                  <td>{formatDate(customer.dataCriacao)}</td>
                  <td>
                    <button
                      className={`mini-action-button customer-history-button ${isSelected ? "active" : ""}`}
                      onClick={() => setSelectedCustomerId(clientId)}
                      type="button"
                    >
                      <ClipboardList size={14} />
                      {isSelected ? "Aberto" : "Histórico"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </article>
  );
}
