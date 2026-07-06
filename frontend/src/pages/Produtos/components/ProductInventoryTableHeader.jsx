import { Download, Plus, Printer } from "lucide-react";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { getLocalDateKey } from "../../../utils/formatters";
import { printProductLabels } from "../../../utils/productLabels";

export function ProductInventoryTableHeader({
  companyName,
  filteredProducts,
  inventoryRows,
  openInventoryTool,
  selectedInventoryBranchLabel,
}) {
  return (
    <div className="panel-title">
      <div>
        <h2>Produtos e estoque</h2>
        <p>Balanço de estoque com quantidade atual para conferência física. Filtro: {selectedInventoryBranchLabel}.</p>
      </div>
      <div className="panel-actions">
        <span>{filteredProducts.length} itens / 10 por pagina</span>
        <button
          className="panel-action-button secondary"
          disabled={filteredProducts.length === 0}
          onClick={() => printProductLabels(filteredProducts, companyName)}
          type="button"
        >
          <Printer size={17} />
          Etiquetas
        </button>
        <button
          className="panel-action-button secondary"
          disabled={inventoryRows.length === 0}
          onClick={() => downloadCsv(`nexus-one-balanco-estoque-${getLocalDateKey()}.csv`, inventoryRows)}
          type="button"
        >
          <Download size={17} />
          CSV
        </button>
        <button
          className="panel-action-button secondary"
          disabled={inventoryRows.length === 0}
          onClick={() => printRowsDocument("Balanco de estoque", inventoryRows, companyName)}
          type="button"
        >
          <Printer size={17} />
          PDF
        </button>
        <button className="panel-action-button" onClick={() => openInventoryTool("product")} type="button">
          <Plus size={17} />
          Novo produto
        </button>
      </div>
    </div>
  );
}
