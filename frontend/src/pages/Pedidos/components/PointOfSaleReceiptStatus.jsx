import { getClientName } from "../../../utils/customers";
import { formatCurrency, formatNumber } from "../../../utils/formatters";
import { getPaymentMethodLabel } from "../../../utils/payments";

export function PointOfSaleReceiptStatus({
  cart,
  cashReceiptDetail,
  cashReceiptReady,
  paymentMethod,
  selectedCliente,
  total,
}) {
  return (
    <div className={`cash-receipt-confirm ${cashReceiptReady ? "ready" : "pending"}`}>
      <span>{cashReceiptReady ? "Pronto para finalizar" : "Conferencia pendente"}</span>
      <strong>{formatCurrency(total)} em {getPaymentMethodLabel(paymentMethod)}</strong>
      <small>
        {selectedCliente ? getClientName(selectedCliente) : "Selecione o cliente"} | {formatNumber(cart.length)} item(ns) | {cashReceiptDetail}
      </small>
    </div>
  );
}
