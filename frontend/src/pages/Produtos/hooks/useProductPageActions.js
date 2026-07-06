import { useProductCatalogActions } from "./useProductCatalogActions";
import { useProductPurchaseActions } from "./useProductPurchaseActions";
import { useProductStockActions } from "./useProductStockActions";

export function useProductPageActions({
  inventoryDifference,
  onRefresh,
  pageState,
  produtos,
  selectedPurchaseProduct,
}) {
  const catalogActions = useProductCatalogActions({
    brandForm: pageState.brandForm,
    onRefresh,
    productCategoryForm: pageState.productCategoryForm,
    productForm: pageState.productForm,
    produtos,
    setBrandForm: pageState.setBrandForm,
    setBrandSaving: pageState.setBrandSaving,
    setProductCategoryForm: pageState.setProductCategoryForm,
    setProductCategorySaving: pageState.setProductCategorySaving,
    setProductForm: pageState.setProductForm,
    setProductMessage: pageState.setProductMessage,
    setProductSaving: pageState.setProductSaving,
    setPurchaseForm: pageState.setPurchaseForm,
    setShowBrandForm: pageState.setShowBrandForm,
    setShowProductCategoryForm: pageState.setShowProductCategoryForm,
    setShowProductForm: pageState.setShowProductForm,
    setShowSupplierForm: pageState.setShowSupplierForm,
    setSupplierForm: pageState.setSupplierForm,
    setSupplierSaving: pageState.setSupplierSaving,
    supplierForm: pageState.supplierForm,
  });
  const purchaseActions = useProductPurchaseActions({
    onRefresh,
    purchaseForm: pageState.purchaseForm,
    purchaseItems: pageState.purchaseItems,
    selectedPurchaseProduct,
    setMessage: pageState.setMessage,
    setPurchaseForm: pageState.setPurchaseForm,
    setPurchaseItems: pageState.setPurchaseItems,
    setPurchaseSaving: pageState.setPurchaseSaving,
  });
  const stockActions = useProductStockActions({
    adjustment: pageState.adjustment,
    inventoryCountForm: pageState.inventoryCountForm,
    inventoryDifference,
    onRefresh,
    setInventoryCountForm: pageState.setInventoryCountForm,
    setInventorySaving: pageState.setInventorySaving,
    setMessage: pageState.setMessage,
    setSaving: pageState.setSaving,
    setStockProductSearch: pageState.setStockProductSearch,
    setStockTransferForm: pageState.setStockTransferForm,
    setStockTransferSaving: pageState.setStockTransferSaving,
    stockTransferForm: pageState.stockTransferForm,
  });

  return {
    ...catalogActions,
    ...purchaseActions,
    ...stockActions,
  };
}
