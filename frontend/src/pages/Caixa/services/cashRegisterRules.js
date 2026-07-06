import { formatCurrency, parseDecimalInput } from "../../../utils/formatters.js";
import { canInstallmentPayment, formatMixedPaymentDetails, getMixedPaymentTotal } from "../../../utils/payments.js";

export function validateCashOpening(openForm) {
  const valorInicial = parseDecimalInput(openForm.valorInicial);
  if (!Number.isFinite(valorInicial) || valorInicial < 0) {
    return { error: "Informe um valor inicial válido. Ex.: 150,00" };
  }
  return { payload: { valorInicial, observacao: openForm.observacao } };
}

export function validateCashMovement(movementForm) {
  const valor = parseDecimalInput(movementForm.valor);
  if (!Number.isFinite(valor) || valor <= 0) {
    return { error: "Informe um valor válido para a movimentação. Ex.: 50,00" };
  }

  return {
    payload: {
      valor,
      metodoPagamento: movementForm.metodoPagamento,
      parcelas: canInstallmentPayment(movementForm.metodoPagamento) ? Number(movementForm.parcelas || 1) : 1,
      descricao: movementForm.descricao,
      observacao: movementForm.observacao,
    },
  };
}

export function validateCashClosing(closeForm) {
  const valorFechamento = parseDecimalInput(closeForm.valorFechamento);
  if (!Number.isFinite(valorFechamento) || valorFechamento < 0) {
    return { error: "Informe um valor contado válido. Ex.: 250,00" };
  }
  return { payload: { valorFechamento, observacao: closeForm.observacao } };
}

export function getCashClosingDifference({ closeForm, expectedValue }) {
  const counted = parseDecimalInput(closeForm.valorFechamento);
  const hasCountedValue = String(closeForm.valorFechamento || "").trim() !== "" && Number.isFinite(counted);
  if (!hasCountedValue) return { closeDifference: null, closeDifferenceOk: false };
  const closeDifference = Number((counted - Number(expectedValue || 0)).toFixed(2));
  return { closeDifference, closeDifferenceOk: Math.abs(closeDifference) < 0.009 };
}

export function validateCashPaymentReceive({
  caixa,
  canOperate,
  receivePaymentForm,
  selectedOrderTotal,
  selectedPendingOrder,
}) {
  if (!caixa?.id) return { error: "Abra um caixa antes de receber pagamentos." };
  if (!canOperate) return { error: "Perfil sem permissão para operar o caixa." };
  if (!selectedPendingOrder?.id) return { error: "Selecione um pedido pendente para receber." };
  if (Number(selectedOrderTotal || 0) <= 0) return { error: "Pedido sem valor para recebimento." };

  const isMixedReceive = receivePaymentForm.metodoPagamento === "MISTO";
  const mixedReceiveTotal = getMixedPaymentTotal(receivePaymentForm.pagamentos);
  if (isMixedReceive && Math.abs(mixedReceiveTotal - selectedOrderTotal) > 0.009) {
    return {
      error: `No pagamento misto, distribua exatamente ${formatCurrency(selectedOrderTotal)} entre as formas.`,
    };
  }

  return {
    isMixedReceive,
    mixedReceiveTotal,
    payload: {
      metodoPagamento: receivePaymentForm.metodoPagamento,
      parcelas: canInstallmentPayment(receivePaymentForm.metodoPagamento)
        ? Number(receivePaymentForm.parcelas || 1)
        : 1,
      detalhesPagamento: isMixedReceive ? formatMixedPaymentDetails(receivePaymentForm.pagamentos) : "",
    },
  };
}

export function getCashPaymentReadiness({
  caixa,
  canOperate,
  receivePaymentForm,
  selectedOrderTotal,
  selectedPendingOrder,
}) {
  const receiveMixedTotal = getMixedPaymentTotal(receivePaymentForm.pagamentos);
  const receiveMixedDifference = Number((receiveMixedTotal - Number(selectedOrderTotal || 0)).toFixed(2));
  const receivePaymentReady =
    Boolean(caixa?.id && selectedPendingOrder?.id && canOperate) &&
    (
      receivePaymentForm.metodoPagamento === "MISTO"
        ? Math.abs(receiveMixedDifference) < 0.009 && selectedOrderTotal > 0
        : selectedOrderTotal > 0
    );

  return { receiveMixedDifference, receiveMixedTotal, receivePaymentReady };
}

export function getCashMovementEndpointName(type) {
  if (type === "sangria") return "sangria";
  if (type === "pagamentoRecebido") return "pagamentoRecebido";
  return "suprimento";
}
