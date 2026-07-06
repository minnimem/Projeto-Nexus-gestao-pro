import { getProductStockMinimum, getProductStockQuantity } from "../../../utils/stock.js";

function getProductKeys(produto) {
  return [produto.id, produto.idProduto, produto.codigoBarras, produto.nome, produto.nomeProduto]
    .filter(Boolean)
    .map((value) => String(value));
}

export function createProductStockScopeViewModel({ estoqueSaldos, filiais, inventoryBranchFilter }) {
  const selectedInventoryBranchLabel = inventoryBranchFilter === "TODAS"
    ? "Todas as filiais"
    : inventoryBranchFilter === "EMPRESA"
      ? "Empresa / sem filial"
      : filiais.find((filial) => String(filial.id) === inventoryBranchFilter)?.nome || "Filial";

  const branchScopedStock = estoqueSaldos.filter((saldo) => {
    if (inventoryBranchFilter === "TODAS") return true;
    if (inventoryBranchFilter === "EMPRESA") return !saldo.filialId;
    return String(saldo.filialId || "") === inventoryBranchFilter;
  });

  const branchStockByProduct = branchScopedStock.reduce((map, saldo) => {
    const key = String(saldo.produtoId || saldo.idProduto || saldo.codigoBarras || saldo.produto || "");
    if (!key) return map;
    const current = map.get(key) || { quantidade: 0, minimo: null, maximo: null };
    current.quantidade += Number(saldo.quantidade || saldo.quantidadeAtual || 0);
    current.minimo = saldo.qtaMinimo ?? saldo.estoqueMinimo ?? current.minimo;
    current.maximo = saldo.qtaMaximo ?? saldo.estoqueMaximo ?? current.maximo;
    map.set(key, current);
    return map;
  }, new Map());

  function getFilteredProductStock(produto) {
    if (inventoryBranchFilter === "TODAS") return getProductStockQuantity(produto);
    const stock = getProductKeys(produto).map((key) => branchStockByProduct.get(key)).find(Boolean);
    return stock ? stock.quantidade : 0;
  }

  function getFilteredProductMinimum(produto) {
    if (inventoryBranchFilter === "TODAS") return getProductStockMinimum(produto);
    const stock = getProductKeys(produto).map((key) => branchStockByProduct.get(key)).find(Boolean);
    return Number(stock ? (stock.minimo ?? getProductStockMinimum(produto)) : getProductStockMinimum(produto));
  }

  return {
    branchScopedStock,
    branchStockByProduct,
    getFilteredProductMinimum,
    getFilteredProductStock,
    selectedInventoryBranchLabel,
  };
}
