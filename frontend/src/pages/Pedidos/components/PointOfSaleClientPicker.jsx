import { Search } from "lucide-react";
import { getClientId, getClientName } from "../../../utils/customers";

export function PointOfSaleClientPicker({
  cashMode,
  clientSearch,
  clientSearchRef,
  filteredClientes,
  selectedClienteId,
  setClientSearch,
  setSelectedClienteId,
}) {
  return (
    <label className="form-control client-picker-control">
      <span>{cashMode ? "Cliente da venda" : "Cliente"}</span>
      <div className="client-search-box">
        <Search size={17} />
        <input
          ref={clientSearchRef}
          value={clientSearch}
          onChange={(event) => {
            setClientSearch(event.target.value);
            setSelectedClienteId("");
          }}
          placeholder="Digite o nome do cliente"
        />
      </div>
      {clientSearch && !selectedClienteId && (
        <div className="client-results">
          {filteredClientes.length === 0 ? (
            <button className="client-result empty" disabled type="button">Nenhum cliente encontrado</button>
          ) : (
            filteredClientes.map((cliente) => (
              <button
                className="client-result"
                key={getClientId(cliente)}
                onClick={() => {
                  setSelectedClienteId(getClientId(cliente));
                  setClientSearch(getClientName(cliente));
                }}
                type="button"
              >
                <strong>{getClientName(cliente)}</strong>
                <small>{cliente.cpf || cliente.email || "Cliente cadastrado"}</small>
              </button>
            ))
          )}
        </div>
      )}
    </label>
  );
}
