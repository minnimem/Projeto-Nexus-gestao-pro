import {
  formatCurrency,
  formatDate,
  formatShortDate,
  getLocalDateKey,
} from "../../../utils/formatters.js";
import { getPaymentMethodLabel } from "../../../utils/payments.js";

export const SALES_REPORT_OPTIONS = [
  { value: "diario", label: "Diario" },
  { value: "semanal", label: "Semanal" },
  { value: "mensal", label: "Mensal" },
  { value: "anual", label: "Anual" },
];

const completedSaleStatuses = new Set(["FINALIZADA", "RECEBIDO", "ENTREGUE", "CONCLUIDO"]);

export function isCompletedSale(pedido) {
  return completedSaleStatuses.has(String(pedido.status || ""));
}

function formatMonth(value) {
  const [year, month] = String(value).split("-");
  if (!year || !month) return value;
  return new Intl.DateTimeFormat("pt-BR", { month: "short", year: "2-digit" }).format(
    new Date(Number(year), Number(month) - 1, 1),
  );
}

function getSalesPeriodKey(value, salesReportPeriod) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  if (salesReportPeriod === "mensal") {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }

  if (salesReportPeriod === "anual") {
    return String(date.getFullYear());
  }

  if (salesReportPeriod === "semanal") {
    const start = new Date(date);
    const weekday = start.getDay() || 7;
    start.setDate(start.getDate() - weekday + 1);
    return getLocalDateKey(start);
  }

  return getLocalDateKey(date);
}

function getSalesPeriodLabel(key, salesReportPeriod) {
  if (salesReportPeriod === "mensal") return formatMonth(key);
  if (salesReportPeriod === "anual") return key;
  if (salesReportPeriod === "semanal") return `Semana de ${formatShortDate(key)}`;
  return formatDate(key);
}

export function buildSalesPeriodViewModel({
  pedidos,
  salesReportFilter,
  salesReportPeriod,
}) {
  const vendasConcluidas = pedidos.filter((pedido) => {
    if (!isCompletedSale(pedido)) return false;

    const saleKey = getLocalDateKey(pedido.data);
    if (!saleKey) return false;
    if (salesReportFilter.inicio && saleKey < salesReportFilter.inicio) return false;
    if (salesReportFilter.fim && saleKey > salesReportFilter.fim) return false;
    return true;
  });

  const salesReportRows = Array.from(
    vendasConcluidas.reduce((acc, pedido) => {
      const key = getSalesPeriodKey(pedido.data, salesReportPeriod);
      if (!key) return acc;

      const current = acc.get(key) || {
        Periodo: getSalesPeriodLabel(key, salesReportPeriod),
        vendas: 0,
        total: 0,
        formasPagamento: {},
      };
      const metodo = getPaymentMethodLabel(pedido.metodoPagamento);
      const valor = Number(pedido.valor || 0);

      current.vendas += 1;
      current.total += valor;
      current.formasPagamento[metodo] = (current.formasPagamento[metodo] || 0) + valor;
      acc.set(key, current);
      return acc;
    }, new Map()).entries(),
  )
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([, row]) => ({
      Periodo: row.Periodo,
      vendas: row.vendas,
      total: row.total,
      formasPagamento: Object.entries(row.formasPagamento)
        .map(([metodo, valor]) => `${metodo}: ${formatCurrency(valor)}`)
        .join(" | "),
    }));

  const salesReportTotal = salesReportRows.reduce((total, row) => total + row.total, 0);
  const salesReportCount = salesReportRows.reduce((total, row) => total + row.vendas, 0);
  const bestPeriodRow = [...salesReportRows].sort((a, b) => b.total - a.total)[0] || null;

  return {
    bestPeriodRow,
    salesReportCount,
    salesReportRows,
    salesReportTotal,
    vendasConcluidas,
  };
}
