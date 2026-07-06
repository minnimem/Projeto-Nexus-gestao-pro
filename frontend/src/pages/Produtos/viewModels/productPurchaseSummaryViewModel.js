import {
  asList,
  formatCurrency,
  formatDateTime,
  formatNumber,
} from "../../../utils/formatters.js";

function calculateAverageCost(items) {
  if (items.length === 0) {
    return null;
  }

  const total = items.reduce(
    (sum, item) => sum + Number(item.subtotal || 0),
    0,
  );
  const quantity = items.reduce(
    (sum, item) => sum + Number(item.quantidade || 0),
    0,
  );

  return total / Math.max(quantity, 1);
}

export function createProductPurchaseSummaryViewModel({
  compras,
  purchaseItems,
  selectedInventoryBranchLabel,
}) {
  const purchaseTotal = purchaseItems.reduce(
    (total, item) => total + Number(item.subtotal || 0),
    0,
  );
  const purchaseHistoryRows = compras.map((purchase) => {
    const items = asList(purchase.itens);
    const averageCost = calculateAverageCost(items);

    return {
      Data: formatDateTime(purchase.dataCompra),
      Filial: purchase.filial || selectedInventoryBranchLabel,
      Fornecedor: purchase.fornecedor || "-",
      Documento: purchase.numeroDocumento || "-",
      Itens: formatNumber(items.length),
      Status: purchase.status || "-",
      Pagamento: purchase.metodoPagamento || "-",
      "Custo médio": averageCost == null ? "-" : formatCurrency(averageCost),
      Total: formatCurrency(purchase.valorTotal),
    };
  });

  return {
    purchaseHistoryRows,
    purchaseTotal,
  };
}
