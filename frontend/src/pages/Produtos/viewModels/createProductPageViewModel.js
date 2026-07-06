import { createProductInventoryIntelligenceViewModel } from "./productInventoryIntelligenceViewModel";
import { createProductInventoryListViewModel } from "./productInventoryListViewModel";
import { createProductPageContext } from "./productPageContext";
import { createProductPurchaseSummaryViewModel } from "./productPurchaseSummaryViewModel";
import { createProductStockScopeViewModel } from "./productStockScopeViewModel";
import { createProductStockSummaryViewModel } from "./productStockSummaryViewModel";
import { createProductToolSelectionViewModel } from "./productToolSelectionViewModel";

export function createProductPageViewModel({
  adjustment,
  data,
  inventoryBranchFilter,
  inventoryCountForm,
  labelPreviewProductId,
  productPage,
  purchaseForm,
  purchaseItems,
  search,
  session,
  stockProductSearch,
  stockTransferForm,
}) {
  const context = createProductPageContext(data, session);
  const stockScope = createProductStockScopeViewModel({
    estoqueSaldos: context.estoqueSaldos,
    filiais: context.filiais,
    inventoryBranchFilter,
  });
  const stockSummary = createProductStockSummaryViewModel({
    branchStockByProduct: stockScope.branchStockByProduct,
    estoqueBaixoApi: context.estoqueBaixoApi,
    getFilteredProductMinimum: stockScope.getFilteredProductMinimum,
    getFilteredProductStock: stockScope.getFilteredProductStock,
    inventoryBranchFilter,
    produtos: context.produtos,
  });
  const toolSelection = createProductToolSelectionViewModel({
    adjustment,
    compras: context.compras,
    estoqueSaldos: context.estoqueSaldos,
    fornecedores: context.fornecedores,
    inventoryCountForm,
    produtos: context.produtos,
    purchaseForm,
    stockProductSearch,
    stockTransferForm,
  });
  const inventoryList = createProductInventoryListViewModel({
    branchFilteredProducts: stockSummary.branchFilteredProducts,
    branchScopedStock: stockScope.branchScopedStock,
    getFilteredProductMinimum: stockScope.getFilteredProductMinimum,
    getFilteredProductStock: stockScope.getFilteredProductStock,
    labelPreviewProductId,
    pedidos: context.pedidos,
    productPage,
    produtos: context.produtos,
    search,
    selectedInventoryBranchLabel: stockScope.selectedInventoryBranchLabel,
  });
  const inventoryIntelligence = createProductInventoryIntelligenceViewModel({
    branchFilteredProducts: stockSummary.branchFilteredProducts,
    getFilteredProductMinimum: stockScope.getFilteredProductMinimum,
    getFilteredProductStock: stockScope.getFilteredProductStock,
    pedidos: context.pedidos,
    purchaseCostByProduct: toolSelection.purchaseCostByProduct,
  });
  const purchaseSummary = createProductPurchaseSummaryViewModel({
    compras: context.compras,
    purchaseItems,
    selectedInventoryBranchLabel: stockScope.selectedInventoryBranchLabel,
  });

  return {
    ...context,
    ...stockScope,
    ...stockSummary,
    ...toolSelection,
    ...inventoryList,
    ...inventoryIntelligence,
    ...purchaseSummary,
  };
}
