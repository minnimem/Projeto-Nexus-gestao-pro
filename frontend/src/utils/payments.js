import { formatCurrency, parseDecimalInput } from "./formatters.js";

export const installmentPaymentMethods = ["CARTAO_CREDITO", "BOLETO"];
export const cashPaymentOptions = [
  { value: "DINHEIRO", label: "Dinheiro", shortcut: "F3" },
  { value: "PIX", label: "Pix", shortcut: "F4" },
  { value: "CARTAO_CREDITO", label: "Crédito", shortcut: "F5" },
  { value: "CARTAO_DEBITO", label: "Débito", shortcut: "F6" },
  { value: "BOLETO", label: "Boleto", shortcut: "F7" },
  { value: "MISTO", label: "Misto", shortcut: "F9" },
];
export const mixedPaymentMethods = ["PIX", "DINHEIRO", "CARTAO_CREDITO", "CARTAO_DEBITO"];

export function createEmptyMixedPayments() {
  return mixedPaymentMethods.reduce((acc, method) => ({ ...acc, [method]: "" }), {});
}

export function canInstallmentPayment(method) {
  return installmentPaymentMethods.includes(method);
}

export function getPaymentMethodLabel(method) {
  return cashPaymentOptions.find((option) => option.value === method)?.label || method || "Não informado";
}

export function getMixedPaymentTotal(payments) {
  if (!payments || typeof payments !== "object") return 0;
  return Object.values(payments).reduce((sum, value) => sum + parseDecimalInput(value), 0);
}

export function getMixedPaymentRows(payments) {
  if (!payments || typeof payments !== "object") return [];
  return Object.entries(payments)
    .map(([method, value]) => ({
      method,
      label: getPaymentMethodLabel(method),
      value: parseDecimalInput(value),
    }))
    .filter((item) => item.value > 0);
}

export function formatMixedPaymentDetails(payments) {
  return getMixedPaymentRows(payments)
    .map((item) => `${item.label}: ${formatCurrency(item.value)}`)
    .join(" | ");
}

export function getMixedPaymentObservation(observation) {
  const text = String(observation || "");
  const marker = "Pagamento misto:";
  const index = text.indexOf(marker);
  return index >= 0 ? text.slice(index + marker.length).trim() : "";
}
