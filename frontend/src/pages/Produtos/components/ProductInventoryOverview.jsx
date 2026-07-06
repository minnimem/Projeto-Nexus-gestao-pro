import { ProductInventoryCommandPanel } from "./ProductInventoryCommandPanel";
import { ProductInventoryIntelligenceSection } from "./ProductInventoryIntelligenceSection";
import { ProductKpiSection } from "./ProductKpiSection";
import { ProductStaleStockSection } from "./ProductStaleStockSection";

export function ProductInventoryOverview({
  commands,
  companyName,
  intelligence,
  kpis,
  staleStock,
}) {
  return (
    <>
      <ProductKpiSection
        ativos={kpis.activeProducts}
        branchFilteredProducts={kpis.products}
        estoqueBaixo={kpis.lowStockProducts}
        fornecedores={kpis.suppliers}
        isStockOperator={kpis.isStockOperator}
        openInventoryTool={commands.onOpenTool}
        saldoEstoque={kpis.stockBalance}
        selectedInventoryBranchLabel={commands.selectedBranchLabel}
        valorCatalogo={kpis.catalogValue}
      />

      <ProductInventoryIntelligenceSection
        abcHighlights={intelligence.abcHighlights}
        companyName={companyName}
        inventoryIntelligenceRows={intelligence.rows}
        replenishmentSuggestions={intelligence.replenishmentSuggestions}
        selectedInventoryBranchLabel={commands.selectedBranchLabel}
        stockSeveritySummary={intelligence.stockSeveritySummary}
        totalInventorySalesValue={intelligence.totalSalesValue}
      />

      <ProductStaleStockSection
        companyName={companyName}
        staleStockProducts={staleStock.products}
        staleStockRows={staleStock.rows}
      />

      <ProductInventoryCommandPanel
        activeInventoryTool={commands.activeTool}
        filiais={commands.branches}
        inventoryBranchFilter={commands.branchFilter}
        inventoryToolButtons={commands.toolButtons}
        openInventoryTool={commands.onOpenTool}
        setInventoryBranchFilter={commands.setBranchFilter}
      />
    </>
  );
}
