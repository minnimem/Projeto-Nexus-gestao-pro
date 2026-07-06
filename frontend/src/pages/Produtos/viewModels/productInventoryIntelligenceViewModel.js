import {
  asList,
  formatCurrency,
  formatNumber,
} from "../../../utils/formatters";

const COMPLETED_INVENTORY_STATUSES = new Set([
  "FINALIZADA",
  "RECEBIDO",
  "ENTREGUE",
  "CONCLUIDO",
]);

function getProductKeys(product) {
  return [product.id, product.idProduto, product.codigoBarras, product.nome, product.nomeProduto]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());
}

function createProductSalesMap(orders) {
  return orders
    .filter((order) => COMPLETED_INVENTORY_STATUSES.has(String(order.status || "")))
    .reduce((map, order) => {
      asList(order.itens).forEach((item) => {
        const quantity = Number(item.quantidade || 0);
        const value = Number(
          item.subtotal ??
          item.valorTotal ??
          (Number(item.precoUnit || item.preco || 0) * quantity),
        );

        getProductKeys({
          id: item.produtoId,
          idProduto: item.idProduto,
          codigoBarras: item.codigoBarras,
          nome: item.produto,
          nomeProduto: item.nomeProduto,
        }).forEach((key) => {
          const current = map.get(key) || { quantidade: 0, valor: 0 };
          current.quantidade += quantity;
          current.valor += value;
          map.set(key, current);
        });
      });
      return map;
    }, new Map());
}

export function createProductInventoryIntelligenceViewModel({
  branchFilteredProducts,
  getFilteredProductMinimum,
  getFilteredProductStock,
  pedidos,
  purchaseCostByProduct,
}) {
  const productSalesMap = createProductSalesMap(pedidos);
  const insightsBase = branchFilteredProducts.map((product) => {
    const keys = getProductKeys(product);
    const sales = keys.map((key) => productSalesMap.get(key)).find(Boolean)
      || { quantidade: 0, valor: 0 };
    const purchaseCost = keys.map((key) => purchaseCostByProduct.get(key)).find(Boolean)
      || { quantidade: 0, total: 0 };
    const currentStock = Number(getFilteredProductStock(product) || 0);
    const minimumStock = Number(getFilteredProductMinimum(product) || 0);
    const dailyConsumption = sales.quantidade > 0 ? sales.quantidade / 30 : 0;
    const daysUntilStockout = dailyConsumption > 0
      ? Math.floor(currentStock / dailyConsumption)
      : null;
    const suggestedReplenishment = Math.max(
      0,
      Math.ceil(Math.max(minimumStock * 2, dailyConsumption * 21 + minimumStock) - currentStock),
    );
    const stockStatus = minimumStock > 0 && currentStock <= Math.max(0, minimumStock * 0.5) ?
      "CRITICO"
      : minimumStock > 0 && currentStock <= minimumStock ?
        "BAIXO"
        : "NORMAL";

    return {
      produto: product,
      estoqueAtual: currentStock,
      minimo: minimumStock,
      vendasQuantidade: sales.quantidade,
      vendasValor: sales.valor,
      custoMedio: purchaseCost.quantidade > 0
        ? purchaseCost.total / purchaseCost.quantidade
        : Number(product.precoCusto || product.custo || 0),
      ultimaCompra: purchaseCost.ultimaCompra,
      consumoDia: dailyConsumption,
      diasRuptura: daysUntilStockout,
      reposicaoSugerida: suggestedReplenishment,
      statusEstoque: stockStatus,
    };
  });
  const totalInventorySalesValue = insightsBase.reduce(
    (total, item) => total + item.vendasValor,
    0,
  );
  let accumulatedSalesValue = 0;
  const inventoryInsights = insightsBase
    .sort((a, b) => b.vendasValor - a.vendasValor)
    .map((item) => {
      accumulatedSalesValue += item.vendasValor;
      const share = totalInventorySalesValue > 0
        ? accumulatedSalesValue / totalInventorySalesValue
        : 0;
      const curva = item.vendasValor <= 0 ?
        "Sem giro"
        : share <= 0.8 ?
          "A"
          : share <= 0.95 ?
            "B"
            : "C";
      return { ...item, curva };
    });
  const stockSeveritySummary = {
    critico: inventoryInsights.filter((item) => item.statusEstoque === "CRITICO").length,
    baixo: inventoryInsights.filter((item) => item.statusEstoque === "BAIXO").length,
    normal: inventoryInsights.filter((item) => item.statusEstoque === "NORMAL").length,
  };
  const severityOrder = { CRITICO: 0, BAIXO: 1, NORMAL: 2 };
  const replenishmentSuggestions = inventoryInsights
    .filter((item) => item.reposicaoSugerida > 0 || item.statusEstoque !== "NORMAL")
    .sort((a, b) => (
      severityOrder[a.statusEstoque] - severityOrder[b.statusEstoque]
      || b.reposicaoSugerida - a.reposicaoSugerida
    ))
    .slice(0, 8);
  const abcHighlights = inventoryInsights
    .filter((item) => item.vendasValor > 0)
    .slice(0, 8);
  const inventoryIntelligenceRows = inventoryInsights.map((item) => ({
    Produto: item.produto.nome || "Produto sem nome",
    Curva: item.curva,
    Status: item.statusEstoque,
    Estoque: formatNumber(item.estoqueAtual),
    Mínimo: formatNumber(item.minimo),
    Giro: `${formatNumber(item.vendasQuantidade)} un.`,
    "Venda estimada": formatCurrency(item.vendasValor),
    "Custo médio": item.custoMedio > 0 ? formatCurrency(item.custoMedio) : "-",
    "Ruptura estimada": item.diasRuptura == null
      ? "Sem giro"
      : `${formatNumber(item.diasRuptura)} dia(s)`,
    "Reposição sugerida": formatNumber(item.reposicaoSugerida),
    Fornecedor: item.produto.fornecedor || "-",
  }));

  return {
    abcHighlights,
    inventoryIntelligenceRows,
    replenishmentSuggestions,
    stockSeveritySummary,
    totalInventorySalesValue,
  };
}
