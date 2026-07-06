import { asList } from "../../../utils/formatters";
import { getProductStockQuantity } from "../../../utils/stock";

export function createProductToolSelectionViewModel({
  adjustment,
  compras,
  estoqueSaldos,
  fornecedores,
  inventoryCountForm,
  produtos,
  purchaseForm,
  stockProductSearch,
  stockTransferForm,
}) {
  const selectedProduct = produtos.find((produto) => produto.id === adjustment.produtoId);
  const selectedPurchaseProduct = produtos.find((produto) => produto.id === purchaseForm.produtoId);
  const selectedPurchaseSupplier = fornecedores.find((fornecedor) => fornecedor.id === purchaseForm.fornecedorId);
  const selectedInventoryProduct = produtos.find((produto) => produto.id === inventoryCountForm.produtoId);
  const selectedTransferProduct = produtos.find((produto) => produto.id === stockTransferForm.produtoId);

  const purchaseCostByProduct = compras.reduce((map, compra) => {
    asList(compra.itens).forEach((item) => {
      const quantidade = Number(item.quantidade || 0);
      const subtotal = Number(item.subtotal ?? quantidade * Number(item.precoUnitario || item.valorUnitario || 0));
      const keys = [item.produtoId, item.idProduto, item.codigoBarras, item.produto, item.nomeProduto]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());

      keys.forEach((key) => {
        const current = map.get(key) || { quantidade: 0, total: 0, ultimaCompra: null, fornecedor: "" };
        current.quantidade += quantidade;
        current.total += subtotal;
        if (!current.ultimaCompra || String(compra.dataCompra || "") > String(current.ultimaCompra || "")) {
          current.ultimaCompra = compra.dataCompra;
          current.fornecedor = compra.fornecedor || current.fornecedor;
        }
        map.set(key, current);
      });
    });
    return map;
  }, new Map());

  const selectedPurchaseProductCost = selectedPurchaseProduct
    ?
    [selectedPurchaseProduct.id, selectedPurchaseProduct.idProduto, selectedPurchaseProduct.codigoBarras, selectedPurchaseProduct.nome, selectedPurchaseProduct.nomeProduto]
      .filter(Boolean)
      .map((value) => purchaseCostByProduct.get(String(value).toLowerCase()))
      .find(Boolean)
    : null;

  const transferLocations = Array.from(new Set(["GERAL", ...estoqueSaldos.map((saldo) => saldo.localizacao).filter(Boolean)]));
  const selectedTransferOriginStock = estoqueSaldos.find(
    (saldo) => String(saldo.produtoId) === String(stockTransferForm.produtoId) &&
      String(saldo.localizacao || "GERAL").toUpperCase() === String(stockTransferForm.origem || "GERAL").toUpperCase(),
  );

  return {
    inventoryDifference: selectedInventoryProduct && inventoryCountForm.quantidadeContada !== ""
      ?
      Number(inventoryCountForm.quantidadeContada) - getProductStockQuantity(selectedInventoryProduct)
      : 0,
    purchaseCostByProduct,
    selectedInventoryProduct,
    selectedProduct,
    selectedPurchaseProduct,
    selectedPurchaseProductCost,
    selectedPurchaseSupplier,
    selectedTransferOriginStock,
    selectedTransferProduct,
    stockSearchResults: produtos.filter((produto) => {
      const text = `${produto.nome || ""} ${produto.codigoBarras || ""}`.toLowerCase();
      return text.includes(stockProductSearch.toLowerCase());
    }).slice(0, 8),
    transferLocations,
  };
}
