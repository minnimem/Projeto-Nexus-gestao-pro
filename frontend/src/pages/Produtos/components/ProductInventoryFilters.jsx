import { Search } from "lucide-react";

export function ProductInventoryFilters({
  filiais,
  inventoryBranchFilter,
  search,
  setInventoryBranchFilter,
  setSearch,
}) {
  return (
    <div className="customer-filter-row">
      <label className="search-field">
        <Search size={17} />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nome ou código de barras"
        />
      </label>
      <label className="form-control">
        <span>Filial</span>
        <select value={inventoryBranchFilter} onChange={(event) => setInventoryBranchFilter(event.target.value)}>
          <option value="TODAS">Todas</option>
          <option value="EMPRESA">Empresa / sem filial</option>
          {filiais.map((filial) => (
            <option key={filial.id} value={filial.id}>
              {filial.matriz ? "Matriz" : "Filial"} - {filial.nome}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
