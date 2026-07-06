import { ProductInventoryPageContent } from "./components/ProductInventoryPageContent";
import { useProductInventoryTools } from "./hooks/useProductInventoryTools";
import { useProductPageActions } from "./hooks/useProductPageActions";
import { useProductPageState } from "./hooks/useProductPageState";
import { createProductPageViewModel } from "./viewModels/createProductPageViewModel";
import "./Produtos.css";

export function Produtos({ data, onRefresh, session }) {
  const pageState = useProductPageState();
  const pageViewModel = createProductPageViewModel({
    adjustment: pageState.adjustment,
    data,
    inventoryBranchFilter: pageState.inventoryBranchFilter,
    inventoryCountForm: pageState.inventoryCountForm,
    labelPreviewProductId: pageState.labelPreviewProductId,
    productPage: pageState.productPage,
    purchaseForm: pageState.purchaseForm,
    purchaseItems: pageState.purchaseItems,
    search: pageState.search,
    session,
    stockProductSearch: pageState.stockProductSearch,
    stockTransferForm: pageState.stockTransferForm,
  });
  const inventoryTools = useProductInventoryTools({
    lowStockCount: pageViewModel.estoqueBaixo.length,
    setShowBrandForm: pageState.setShowBrandForm,
    setShowProductCategoryForm: pageState.setShowProductCategoryForm,
    setShowProductForm: pageState.setShowProductForm,
    setShowSupplierForm: pageState.setShowSupplierForm,
  });
  const pageActions = useProductPageActions({
    inventoryDifference: pageViewModel.inventoryDifference,
    onRefresh,
    pageState,
    produtos: pageViewModel.produtos,
    selectedPurchaseProduct: pageViewModel.selectedPurchaseProduct,
  });

  return (
    <ProductInventoryPageContent
      companyName={data.empresa.nome || "Nexus One"}
      inventoryTools={inventoryTools}
      pageActions={pageActions}
      pageState={pageState}
      pageViewModel={pageViewModel}
    />
  );
}
