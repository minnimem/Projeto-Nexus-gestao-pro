export const DEFAULT_STOCK_MINIMUM = 5;

export function getStockProductName(item) {
  return (
    item.produto?.nomeProduto ||
    item.produto?.nome ||
    item.nomeProduto ||
    item.nome ||
    "Produto sem nome"
  );
}

export function getStockQuantity(item) {
  return item.quantidadeAtual ?? item.quantidade ?? item.saldo ?? 0;
}

export function getStockMinimum(item) {
  return Number(
    item.estoqueMinimo ??
      item.qtaMinimo ??
      item.limiteMinimo ??
      item.produto?.estoqueMinimo ??
      item.produto?.qtaMinimo ??
      DEFAULT_STOCK_MINIMUM,
  );
}

export function getProductStockQuantity(produto) {
  return produto.quantidadeEstoque ?? produto.estoqueAtual ?? getStockQuantity(produto);
}

export function getProductStockMinimum(produto) {
  return getStockMinimum(produto);
}

export function isLowStockProduct(produto) {
  const minimum = getProductStockMinimum(produto);
  return produto.ativo && minimum > 0 && getProductStockQuantity(produto) <= minimum;
}
