import { formatNumber } from "../../../utils/formatters.js";
import { getProductId, getProductPrice, parseProductSearchCommand } from "../../../utils/products.js";
import { getProductStockQuantity } from "../../../utils/stock.js";

export function normalizeCartQuantity(value) {
  return Math.max(1, Math.floor(Number(value || 1)));
}

export function getStockLimitMessage(name, estoqueDisponivel) {
  return `${name} possui apenas ${formatNumber(estoqueDisponivel)} un. em estoque.`;
}

export function upsertCartItem(cart, itemToAdd) {
  const existingItem = cart.find((item) => item.produtoId === itemToAdd.produtoId);
  if (!existingItem) return [...cart, itemToAdd];

  return cart.map((item) =>
    item.produtoId === itemToAdd.produtoId
      ? { ...item, quantidade: item.quantidade + itemToAdd.quantidade }
      : item,
  );
}

export function removeCartItem(cart, produtoId) {
  return cart.filter((item) => item.produtoId !== produtoId);
}

export function updateCartItemQuantity(cart, produtoId, nextQuantity) {
  const normalizedQuantity = normalizeCartQuantity(nextQuantity);
  return cart.map((item) =>
    item.produtoId === produtoId ? { ...item, quantidade: normalizedQuantity } : item,
  );
}

export function validateProductForCart({ cart, produto, quantity = 1 }) {
  const produtoId = getProductId(produto);
  const estoqueDisponivel = Number(getProductStockQuantity(produto) || 0);
  const quantityToAdd = normalizeCartQuantity(quantity);

  if (!produtoId) return { error: "Produto sem identificador válido." };
  if (estoqueDisponivel <= 0) return { error: `${produto.nome || "Produto"} sem estoque disponível.` };
  if (quantityToAdd > estoqueDisponivel) {
    return { error: getStockLimitMessage(produto.nome || "Produto", estoqueDisponivel) };
  }

  const existingCartItem = cart.find((item) => item.produtoId === produtoId);
  if (existingCartItem && existingCartItem.quantidade + quantityToAdd > estoqueDisponivel) {
    return { error: getStockLimitMessage(existingCartItem.nome, estoqueDisponivel) };
  }

  return { estoqueDisponivel, produtoId, quantityToAdd };
}

export function buildCartItem({ estoqueDisponivel, produto, produtoId, quantityToAdd }) {
  return {
    produtoId,
    nome: produto.nome || "Produto sem nome",
    codigoBarras: produto.codigoBarras,
    preco: getProductPrice(produto),
    quantidade: quantityToAdd,
    estoqueDisponivel,
  };
}

export function findProductFromSearch({ productSearch, produtos }) {
  const { quantity, term } = parseProductSearchCommand(productSearch);
  const query = term.trim();
  if (!query) return { quantity, query: "", productToAdd: null };

  const normalizedQuery = query.toLowerCase();
  let exactBarcodeMatch = null;
  let exactNameMatch = null;
  let singlePartialMatch = null;
  let partialMatches = 0;

  for (const produto of produtos) {
    if (produto.ativo === false) continue;

    const barcode = String(produto.codigoBarras || "").toLowerCase();
    const name = String(produto.nome || "").toLowerCase();

    if (!exactBarcodeMatch && barcode === normalizedQuery) {
      exactBarcodeMatch = produto;
    }
    if (!exactNameMatch && name === normalizedQuery) {
      exactNameMatch = produto;
    }
    if (`${name} ${barcode}`.includes(normalizedQuery)) {
      partialMatches += 1;
      singlePartialMatch = partialMatches === 1 ? produto : null;
    }
  }

  return {
    quantity,
    query,
    productToAdd: exactBarcodeMatch || exactNameMatch || singlePartialMatch,
  };
}
