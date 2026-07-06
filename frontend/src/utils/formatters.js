const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const numberFormatter = new Intl.NumberFormat("pt-BR");

export function formatCurrency(value) {
  return currencyFormatter.format(Number(value || 0));
}

export function formatNumber(value) {
  return numberFormatter.format(Number(value || 0));
}

export function formatPercent(value) {
  const numericValue = Number(value || 0);
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: Math.abs(numericValue) < 10 ? 1 : 0,
    minimumFractionDigits: 0,
  }).format(Math.abs(numericValue));
}

export function parseDecimalInput(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
  const text = String(value ?? "").trim();
  if (!text) return 0;

  const compact = text.replace(/\s/g, "");
  const hasComma = compact.includes(",");
  const hasDot = compact.includes(".");
  let normalized = compact;

  if (hasComma && hasDot) {
    normalized = compact.lastIndexOf(",") > compact.lastIndexOf(".")
      ? compact.replace(/\./g, "").replace(",", ".")
      : compact.replace(/,/g, "");
  } else if (hasComma) {
    normalized = compact.replace(/\./g, "").replace(",", ".");
  } else {
    normalized = compact.replace(/,/g, "");
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : NaN;
}

export function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}

export function formatDateOnly(value) {
  if (!value) return "-";
  const text = String(value);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(text) ? new Date(`${text}T00:00:00`) : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

export function formatDateTime(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatShortDate(value) {
  if (!value) return "-";
  const text = String(value);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(text) ? new Date(`${text}T00:00:00`) : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(date);
}

export function getLocalDateKey(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getPeriodPresetRange(preset) {
  const now = new Date();
  const end = new Date(now);
  let start = new Date(now);

  if (preset === "sevenDays") start.setDate(now.getDate() - 6);
  else if (preset === "month") start = new Date(now.getFullYear(), now.getMonth(), 1);
  else if (preset === "year") start = new Date(now.getFullYear(), 0, 1);

  return { startKey: getLocalDateKey(start), endKey: getLocalDateKey(end) };
}

export function formatPeriodRange(preset) {
  const { startKey, endKey } = getPeriodPresetRange(preset);
  const startLabel = startKey.split("-").reverse().join("/");
  const endLabel = endKey.split("-").reverse().join("/");
  return startKey === endKey ? startLabel : `${startLabel} - ${endLabel}`;
}

export function addMonthsToDateKey(value, months) {
  const base = value ? new Date(`${value}T00:00:00`) : new Date();
  if (Number.isNaN(base.getTime())) return "";
  const target = new Date(base);
  target.setMonth(target.getMonth() + Number(months || 0));
  return getLocalDateKey(target);
}

export function addMonths(date, months) {
  const target = new Date(date);
  target.setMonth(target.getMonth() + Number(months || 0));
  return target;
}

export function isDateBeforeToday(value) {
  const dateKey = getLocalDateKey(value);
  return Boolean(dateKey) && dateKey < getLocalDateKey();
}

export function isDateWithinNextDays(value, days) {
  const dateKey = getLocalDateKey(value);
  if (!dateKey || isDateBeforeToday(value)) return false;
  const limit = new Date();
  limit.setHours(0, 0, 0, 0);
  limit.setDate(limit.getDate() + Number(days || 0));
  return dateKey <= getLocalDateKey(limit);
}

export function getDaysOverdue(value) {
  const dateKey = getLocalDateKey(value);
  if (!dateKey || dateKey >= getLocalDateKey()) return 0;
  const dueDate = new Date(`${dateKey}T00:00:00`);
  const today = new Date(`${getLocalDateKey()}T00:00:00`);
  return Math.max(Math.floor((today - dueDate) / 86400000), 0);
}

export function getDaysUntil(value) {
  const dateKey = getLocalDateKey(value);
  if (!dateKey) return null;
  const dueDate = new Date(`${dateKey}T00:00:00`);
  const today = new Date(`${getLocalDateKey()}T00:00:00`);
  return Math.round((dueDate - today) / 86400000);
}

export function asList(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value.content)) return value.content;
  if (Array.isArray(value.value)) return value.value;
  return [];
}

export function getDataCount(data) {
  if (Array.isArray(data)) return data.length;
  if (data && typeof data === "object") return Object.keys(data).length;
  return 0;
}
