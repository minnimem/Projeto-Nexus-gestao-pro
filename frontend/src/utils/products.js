export function getProductId(produto) {
  return produto.id || produto.idProduto;
}

export function getProductPrice(produto) {
  return Number(produto.precoComDesconto ?? produto.precoVenda ?? 0);
}

export function parseProductSearchCommand(value) {
  const raw = String(value || "").trim();
  const match = raw.match(/^(\d{1,3})\s*[x*]\s*(.+)$/i);

  if (!match) return { quantity: 1, term: raw };

  return {
    quantity: Math.max(1, Number(match[1] || 1)),
    term: match[2].trim(),
  };
}
