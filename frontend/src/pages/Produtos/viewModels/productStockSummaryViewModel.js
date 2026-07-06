import {
  getProductStockMinimum,
  getProductStockQuantity,
  getStockProductName,
  isLowStockProduct,
} from "../../../utils/stock.js";

export function createProductStockSummaryViewModel({
  branchStockByProduct,
  estoqueBaixoApi,
  getFilteredProductMinimum,
  getFilteredProductStock,
  inventoryBranchFilter,
  produtos,
}) {
  const estoqueBaixoFallback = produtos.filter(isLowStockProduct).map((produto) => ({
    id: produto.id,
    produtoId: produto.id,
    produto: produto.nome,
    nomeProduto: produto.nome,
    quantidade: getProductStockQuantity(produto),
    quantidadeAtual: getProductStockQuantity(produto),
    qtaMinimo: getProductStockMinimum(produto),
    estoqueMinimo: getProductStockMinimum(produto),
  }));

  const allLowStockItems = [
    ...estoqueBaixoApi,
    ...estoqueBaixoFallback.filter((fallback) => !estoqueBaixoApi.some(
      (item) => String(item.produtoId || item.id || getStockProductName(item)) ===
        String(fallback.produtoId || fallback.id || getStockProductName(fallback)),
    )),
  ];

  const branchLowStockFallback = produtos
    .filter((produto) => produto.ativo && getFilteredProductMinimum(produto) > 0 && getFilteredProductStock(produto) <= getFilteredProductMinimum(produto))
    .map((produto) => ({
      id: produto.id,
      produtoId: produto.id,
      produto: produto.nome,
      nomeProduto: produto.nome,
      quantidade: getFilteredProductStock(produto),
      quantidadeAtual: getFilteredProductStock(produto),
      qtaMinimo: getFilteredProductMinimum(produto),
      estoqueMinimo: getFilteredProductMinimum(produto),
    }));

  const estoqueBaixo = inventoryBranchFilter === "TODAS" ? allLowStockItems : branchLowStockFallback;
  const branchFilteredProducts = inventoryBranchFilter === "TODAS"
    ? produtos
    : produtos.filter((produto) => getFilteredProductStock(produto) > 0 || branchStockByProduct.size === 0);

  return {
    ativos: branchFilteredProducts.filter((produto) => produto.ativo).length,
    branchFilteredProducts,
    estoqueBaixo,
    saldoEstoque: branchFilteredProducts.reduce((total, produto) => total + Number(getFilteredProductStock(produto)), 0),
    valorCatalogo: branchFilteredProducts.reduce(
      (total, produto) => total + Number(produto.precoComDesconto || produto.precoVenda || 0),
      0,
    ),
  };
}
