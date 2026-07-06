import "./ProductInventoryCommandPanel.css";

export function ProductInventoryCommandPanel({
  activeInventoryTool,
  filiais,
  inventoryBranchFilter,
  inventoryToolButtons,
  openInventoryTool,
  setInventoryBranchFilter,
}) {
  return (
    <section className="inventory-command-panel">
      <div>
        <strong>Operações de estoque</strong>
        <span>Escolha uma ação para abrir o formulario certo.</span>
      </div>
      <label className="inventory-branch-filter">
        <span>Filial</span>
        <select value={inventoryBranchFilter} onChange={(event) => setInventoryBranchFilter(event.target.value)}>
          <option value="TODAS">Todas as filiais</option>
          <option value="EMPRESA">Empresa / sem filial</option>
          {filiais.map((filial) => (
            <option key={filial.id} value={filial.id}>
              {filial.matriz ? "Matriz" : "Filial"} - {filial.nome}
            </option>
          ))}
        </select>
      </label>
      <div className="inventory-command-grid">
        {inventoryToolButtons.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              className={activeInventoryTool === tool.key ? "active" : ""}
              key={tool.key}
              onClick={() => openInventoryTool(tool.key)}
              type="button"
            >
              <Icon size={18} />
              <span>
                <strong>{tool.label}</strong>
                <small>{tool.detail}</small>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
