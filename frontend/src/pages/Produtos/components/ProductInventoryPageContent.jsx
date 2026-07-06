import { ProductInventoryCatalogSection } from "./ProductInventoryCatalogSection";
import { ProductInventoryOverview } from "./ProductInventoryOverview";
import { ProductInventoryWorkbenchPanel } from "./ProductInventoryWorkbenchPanel";

export function ProductInventoryPageContent({
  companyName,
  inventoryTools: tools,
  pageActions,
  pageState: state,
  pageViewModel: model,
}) {
  return (
    <div className="dashboard-view">
      <ProductInventoryOverview
        commands={{
          activeTool: tools.activeInventoryTool,
          branches: model.filiais,
          branchFilter: state.inventoryBranchFilter,
          onOpenTool: tools.openInventoryTool,
          selectedBranchLabel: model.selectedInventoryBranchLabel,
          setBranchFilter: state.setInventoryBranchFilter,
          toolButtons: tools.inventoryToolButtons,
        }}
        companyName={companyName}
        intelligence={{
          abcHighlights: model.abcHighlights,
          replenishmentSuggestions: model.replenishmentSuggestions,
          rows: model.inventoryIntelligenceRows,
          stockSeveritySummary: model.stockSeveritySummary,
          totalSalesValue: model.totalInventorySalesValue,
        }}
        kpis={{
          activeProducts: model.ativos,
          catalogValue: model.valorCatalogo,
          isStockOperator: model.isStockOperator,
          lowStockProducts: model.estoqueBaixo,
          products: model.branchFilteredProducts,
          stockBalance: model.saldoEstoque,
          suppliers: model.fornecedores,
        }}
        staleStock={{
          products: model.staleStockProducts,
          rows: model.staleStockRows,
        }}
      />

      <section className="dashboard-grid inventory-grid">
        <ProductInventoryCatalogSection
          companyName={companyName}
          currentPage={model.currentProductPage}
          filiais={model.filiais}
          filteredProducts={model.filteredProducts}
          getProductMinimum={model.getFilteredProductMinimum}
          getProductStock={model.getFilteredProductStock}
          inventoryBranchFilter={state.inventoryBranchFilter}
          inventoryRows={model.inventoryRows}
          onOpenTool={tools.openInventoryTool}
          pageSize={model.productPageSize}
          paginatedProducts={model.paginatedProducts}
          search={state.search}
          selectedBranchLabel={model.selectedInventoryBranchLabel}
          setInventoryBranchFilter={state.setInventoryBranchFilter}
          setPage={state.setProductPage}
          setSearch={state.setSearch}
          totalPages={model.productTotalPages}
        />

        <ProductInventoryWorkbenchPanel
          companyName={companyName}
          inventoryTools={tools}
          pageActions={pageActions}
          pageState={state}
          pageViewModel={model}
        />
      </section>
    </div>
  );
}
