import { formatCurrency, formatNumber, parseDecimalInput } from "../../../utils/formatters.js";
import { canInstallmentPayment, getMixedPaymentTotal } from "../../../utils/payments.js";

export function getPointOfSaleTotals({
  cart,
  discount,
  discountAmount,
  discountMode,
}) {
  const subtotal = cart.reduce((sum, item) => sum + item.preco * item.quantidade, 0);
  const discountAmountValue = Math.min(subtotal, Math.max(0, parseDecimalInput(discountAmount)));
  const discountPercentValue = Math.min(100, Math.max(0, Number(discount || 0)));
  const descontoValor = discountMode === "amount"
    ? discountAmountValue
    : subtotal * (discountPercentValue / 100);
  const discountPayload = subtotal > 0 ? Number(((descontoValor / subtotal) * 100).toFixed(4)) : 0;
  const total = Math.max(subtotal - descontoValor, 0);

  return { descontoValor, discountPayload, subtotal, total };
}

export function getPointOfSalePaymentView({
  cart,
  cashMode,
  isMixedPayment,
  mixedPayments,
  paymentInstallments,
  paymentMethod,
  receivedAmount,
  selectedClienteId,
  total,
}) {
  const received = parseDecimalInput(receivedAmount);
  const change = paymentMethod === "DINHEIRO" ? Math.max(received - total, 0) : 0;
  const mixedPaymentTotal = getMixedPaymentTotal(mixedPayments);
  const mixedPaymentDifference = isMixedPayment ? Number((mixedPaymentTotal - total).toFixed(2)) : 0;
  const cashReceiptReady = cashMode && cart.length > 0 && Boolean(selectedClienteId) && (
    paymentMethod === "DINHEIRO"
      ? received >= total && total > 0
      : isMixedPayment
        ? Math.abs(mixedPaymentDifference) < 0.009 && total > 0
        : total > 0
  );
  const cashReceiptDetail = paymentMethod === "DINHEIRO"
    ? `Recebido ${formatCurrency(received)} | Troco ${formatCurrency(change)}`
    : isMixedPayment
      ? `${formatCurrency(mixedPaymentTotal)} distribuído | ${mixedPaymentDifference >= 0 ? "Excedente" : "Falta"} ${formatCurrency(Math.abs(mixedPaymentDifference))}`
      : canInstallmentPayment(paymentMethod)
        ? `${formatNumber(paymentInstallments)}x de ${formatCurrency(total / Number(paymentInstallments || 1))}`
        : "Recebimento integral no caixa";

  return {
    cashReceiptDetail,
    cashReceiptReady,
    change,
    mixedPaymentDifference,
    mixedPaymentTotal,
    received,
  };
}
