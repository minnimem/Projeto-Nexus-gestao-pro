import { ProductCatalogWorkbench } from "./ProductCatalogWorkbench";
import { ProductPurchaseWorkbench } from "./ProductPurchaseWorkbench";
import { ProductStockOperationsWorkbench } from "./ProductStockOperationsWorkbench";

export function ProductInventoryWorkbenchPanel({
  companyName,
  inventoryTools: tools,
  pageActions: actions,
  pageState: state,
  pageViewModel: model,
}) {
  return (
    <aside className="panel side-panel inventory-workbench-panel">
      {tools.activeInventoryTool === "product" && (
        <ProductCatalogWorkbench
          brand={{
            form: state.brandForm,
            onClose: () => state.setShowBrandForm(false),
            onSubmit: actions.handleCreateBrand,
            open: () => state.setShowBrandForm(true),
            saving: state.brandSaving,
            setForm: state.setBrandForm,
            visible: state.showBrandForm,
          }}
          category={{
            form: state.productCategoryForm,
            onClose: () => state.setShowProductCategoryForm(false),
            onSubmit: actions.handleCreateProductCategory,
            open: () => state.setShowProductCategoryForm(true),
            saving: state.productCategorySaving,
            setForm: state.setProductCategoryForm,
            visible: state.showProductCategoryForm,
          }}
          product={{
            brands: model.marcas,
            categories: model.productCategories,
            form: state.productForm,
            message: state.productMessage,
            onClose: () => tools.openInventoryTool("adjustment"),
            onGenerateBarcode: actions.handleGenerateBarcode,
            onSubmit: actions.handleCreateProduct,
            saving: state.productSaving,
            suppliers: model.fornecedores,
            updateForm: actions.updateProductForm,
            visible: state.showProductForm,
          }}
          supplier={{
            form: state.supplierForm,
            onClose: () => state.setShowSupplierForm(false),
            onSubmit: actions.handleCreateSupplier,
            open: () => state.setShowSupplierForm(true),
            saving: state.supplierSaving,
            setForm: state.setSupplierForm,
            visible: state.showSupplierForm,
          }}
        />
      )}

      <ProductPurchaseWorkbench
        activeTool={tools.activeInventoryTool}
        companyName={companyName}
        entry={{
          form: state.purchaseForm,
          items: state.purchaseItems,
          onAddItem: actions.handleAddPurchaseItem,
          onRemoveItem: actions.handleRemovePurchaseItem,
          onSubmit: actions.handlePurchaseEntry,
          products: model.produtos,
          saving: state.purchaseSaving,
          selectedProduct: model.selectedPurchaseProduct,
          selectedProductCost: model.selectedPurchaseProductCost,
          selectedSupplier: model.selectedPurchaseSupplier,
          setForm: state.setPurchaseForm,
          suppliers: model.fornecedores,
          total: model.purchaseTotal,
        }}
        history={{
          branchLabel: model.selectedInventoryBranchLabel,
          purchases: model.compras,
          rows: model.purchaseHistoryRows,
        }}
      />

      <ProductStockOperationsWorkbench
        activeTool={tools.activeInventoryTool}
        adjustment={{
          form: state.adjustment,
          message: state.message,
          onSubmit: actions.handleAdjustment,
          saving: state.saving,
          search: state.stockProductSearch,
          searchResults: model.stockSearchResults,
          selectedProduct: model.selectedProduct,
          setForm: state.setAdjustment,
          setSearch: state.setStockProductSearch,
        }}
        alerts={{
          canManageNotifications: model.canManageNotifications,
          lowStockProducts: model.estoqueBaixo,
          onSendNotifications: actions.handleSendStockNotifications,
          saving: state.saving,
        }}
        companyName={companyName}
        count={{
          difference: model.inventoryDifference,
          form: state.inventoryCountForm,
          onSubmit: actions.handleInventoryCount,
          products: model.produtos,
          saving: state.inventorySaving,
          selectedProduct: model.selectedInventoryProduct,
          setForm: state.setInventoryCountForm,
        }}
        labels={{
          previewProduct: model.labelPreviewProduct,
          products: model.filteredProducts,
          setPreviewProductId: state.setLabelPreviewProductId,
        }}
        transfer={{
          form: state.stockTransferForm,
          locations: model.transferLocations,
          onSubmit: actions.handleStockTransfer,
          products: model.produtos,
          saving: state.stockTransferSaving,
          selectedOriginStock: model.selectedTransferOriginStock,
          selectedProduct: model.selectedTransferProduct,
          setForm: state.setStockTransferForm,
          stockLocationRows: model.stockLocationRows,
        }}
      />
    </aside>
  );
}
