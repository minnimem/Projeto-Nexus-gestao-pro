import { ProductInventoryFilters } from "./ProductInventoryFilters";
import { ProductInventoryPagination } from "./ProductInventoryPagination";
import { ProductInventoryTableBody } from "./ProductInventoryTableBody";
import { ProductInventoryTableHeader } from "./ProductInventoryTableHeader";

export function ProductInventoryCatalogSection({
  companyName,
  currentPage,
  filiais,
  filteredProducts,
  getProductMinimum,
  getProductStock,
  inventoryBranchFilter,
  inventoryRows,
  onOpenTool,
  pageSize,
  paginatedProducts,
  search,
  selectedBranchLabel,
  setInventoryBranchFilter,
  setPage,
  setSearch,
  totalPages,
}) {
  return (
    <article className="panel orders-panel">
      <ProductInventoryTableHeader
        companyName={companyName}
        filteredProducts={filteredProducts}
        inventoryRows={inventoryRows}
        openInventoryTool={onOpenTool}
        selectedInventoryBranchLabel={selectedBranchLabel}
      />

      <ProductInventoryFilters
        filiais={filiais}
        inventoryBranchFilter={inventoryBranchFilter}
        search={search}
        setInventoryBranchFilter={setInventoryBranchFilter}
        setSearch={setSearch}
      />

      <ProductInventoryTableBody
        companyName={companyName}
        filteredProducts={filteredProducts}
        getFilteredProductMinimum={getProductMinimum}
        getFilteredProductStock={getProductStock}
        paginatedProducts={paginatedProducts}
      />

      <ProductInventoryPagination
        currentProductPage={currentPage}
        filteredProducts={filteredProducts}
        productPageSize={pageSize}
        productTotalPages={totalPages}
        setProductPage={setPage}
      />
    </article>
  );
}
