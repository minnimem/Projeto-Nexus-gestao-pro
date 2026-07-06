import { canInstallmentPayment, formatMixedPaymentDetails } from "../../../utils/payments.js";
import { getPriorityPayload } from "../../../utils/sales.js";

export function buildPointOfSaleOrderPayload({
  cart,
  deliveryAddress,
  deliveryNote,
  deliveryType,
  discountPayload,
  paymentInstallments,
  paymentMethod,
  priority,
  selectedClienteId,
  session,
}) {
  return {
    clienteId: selectedClienteId,
    usuarioId: session.usuarioId,
    filialId: session.filialId || null,
    prioridade: getPriorityPayload(priority),
    metodoPagamento: paymentMethod,
    parcelas: canInstallmentPayment(paymentMethod) ? Number(paymentInstallments || 1) : 1,
    tipoEntrega: deliveryType,
    enderecoEntrega: deliveryType === "ENTREGA" ? deliveryAddress : "",
    observacaoEntrega: deliveryNote,
    desconto: discountPayload,
    itens: cart.map((item) => ({ produtoId: item.produtoId, quantidade: item.quantidade })),
  };
}

export function buildPointOfSalePaymentPayload({
  isMixedPayment,
  mixedPayments,
  paymentInstallments,
  paymentMethod,
}) {
  return {
    metodoPagamento: paymentMethod,
    parcelas: canInstallmentPayment(paymentMethod) ? Number(paymentInstallments || 1) : 1,
    detalhesPagamento: isMixedPayment ? formatMixedPaymentDetails(mixedPayments) : "",
  };
}
