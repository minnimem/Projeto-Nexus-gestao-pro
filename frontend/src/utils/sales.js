import { formatShortDate } from "./formatters.js";

function getSaleAmount(item) {
  return Number(item.total || item.valorTotal || item.valor || 0);
}

function getSaleDateKey(item) {
  return String(item.data || item.dia || item.periodo || "").slice(0, 10);
}

function formatMonth(value) {
  const [year, month] = String(value).split("-");
  if (!year || !month) return value;
  return new Intl.DateTimeFormat("pt-BR", { month: "short", year: "2-digit" }).format(
    new Date(Number(year), Number(month) - 1, 1),
  );
}

export function groupSalesByPeriod(items, period) {
  const grouped = new Map();
  const isMonthlyPeriod = period === "mes" || period === "mês";

  items.forEach((item) => {
    const dateKey = getSaleDateKey(item);
    if (!dateKey) return;
    const key = period === "ano" ? dateKey.slice(0, 4) : isMonthlyPeriod ? dateKey.slice(0, 7) : dateKey;
    grouped.set(key, (grouped.get(key) || 0) + getSaleAmount(item));
  });

  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => ({
      key,
      label: period === "dia" ? formatShortDate(key) : isMonthlyPeriod ? formatMonth(key) : key,
      value,
    }));
}

export function isWithinLastDays(value, days) {
  if (!value || !days) return true;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return true;
  const limit = new Date();
  limit.setHours(0, 0, 0, 0);
  limit.setDate(limit.getDate() - Number(days));
  return date >= limit;
}

export function sectionClass(visible) {
  return visible ? "" : " sales-section-hidden";
}

export function getDefaultQuoteValidity() {
  const date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return date.toISOString().slice(0, 10);
}

export function getPriorityPayload(value) {
  const priorities = {
    BAIXA: "Baixa",
    NORMAL: "Normal",
    ALTA: "Alta",
    URGENTE: "Urgente",
  };
  return priorities[value] || value || "Normal";
}
