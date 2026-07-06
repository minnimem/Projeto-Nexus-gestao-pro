import { formatNumber } from "../../../utils/formatters";

export function generateProductBarcode(produtos) {
  const year = new Date().getFullYear();
  const prefix = `NX${year}`;
  const nextNumber =
    produtos
      .map((produto) => produto.codigoBarras || "")
      .filter((codigo) => codigo.startsWith(prefix))
      .map((codigo) => Number(codigo.slice(prefix.length)))
      .filter(Number.isFinite)
      .reduce((max, value) => Math.max(max, value), 0) + 1;

  return `${prefix}${String(nextNumber).padStart(5, "0")}`;
}

export function formatProfit(value) {
  const numeric = Number(value || 0);
  const percent = numeric > 0 && numeric <= 10 ? numeric * 100 : numeric;
  return `${formatNumber(percent)}%`;
}
