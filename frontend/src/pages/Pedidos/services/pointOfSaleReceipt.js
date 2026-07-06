import { getClientName } from "../../../utils/customers.js";
import { canInstallmentPayment, getMixedPaymentRows } from "../../../utils/payments.js";

export function buildPointOfSaleReceipt({
  cart,
  change,
  descontoValor,
  mixedPayments,
  paymentInstallments,
  paymentMethod,
  pedido,
  received,
  selectedCliente,
  session,
  subtotal,
  total,
  vendaRecebida,
}) {
  return {
    id: vendaRecebida.id || pedido.id,
    numero: vendaRecebida.numero || pedido.numero,
    cliente: selectedCliente ? getClientName(selectedCliente) : "Cliente não informado",
    vendedor: session.nome || session.login || session.perfil || "Usuário",
    pagamento: paymentMethod,
    parcelas: canInstallmentPayment(paymentMethod) ? Number(paymentInstallments || 1) : 1,
    data: new Date().toLocaleString("pt-BR"),
    itens: cart,
    subtotal,
    descontoValor,
    total,
    recebido: received,
    troco: change,
    pagamentosMisturados: getMixedPaymentRows(mixedPayments),
  };
}

export function getPointOfSaleSuccessMessage({ cashMode, deliveryType, pedido }) {
  if (cashMode) return `Venda ${pedido.numero || ""} recebida no caixa com sucesso.`;
  if (deliveryType === "ENTREGA") return `Pedido ${pedido.numero || ""} enviado direto para a logística.`;
  return `Pedido ${pedido.numero || ""} enviado ao caixa apenas para receber o valor.`;
}
