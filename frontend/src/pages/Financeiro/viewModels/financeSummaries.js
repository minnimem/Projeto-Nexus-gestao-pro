import { asList, formatNumber } from "../../../utils/formatters";

export function getPedidoItemSummary(pedido) {
  const itens = asList(pedido.itens);
  if (itens.length === 0) return "Pedido sem itens cadastrados";

  return itens
    .map((item) => {
      const codigo = item.codigoBarras || item.sku || item.produtoId || "sem código";
      return `${item.produto || "Produto sem nome"} - ${codigo} (${formatNumber(item.quantidade)} un.)`;
    })
    .join(" | ");
}

export function getFinanceItemSummary(item, pedidosPorId) {
  if (!item.pedidoId) return item.categoria || "Sem pedido vinculado";
  return getPedidoItemSummary(pedidosPorId.get(String(item.pedidoId)) || {});
}

