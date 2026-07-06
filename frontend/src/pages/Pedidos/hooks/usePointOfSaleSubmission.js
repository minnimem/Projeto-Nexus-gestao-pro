import { endpoints } from "../../../services/resources";
import {
  buildPointOfSaleOrderPayload,
  buildPointOfSalePaymentPayload,
  buildPointOfSaleReceipt,
  getPointOfSaleSubmissionError,
  getPointOfSaleSuccessMessage,
  resetPointOfSaleDraft,
} from "../services/pointOfSaleSubmission";

export function usePointOfSaleSubmission({
  caixa,
  canOperateCash,
  cart,
  cashMode,
  change,
  deliveryAddress,
  deliveryNote,
  deliveryType,
  descontoValor,
  discountPayload,
  isMixedPayment,
  isPayOnDelivery,
  mixedPaymentDifference,
  mixedPayments,
  onSaleCreated,
  paymentInstallments,
  paymentMethod,
  priority,
  received,
  selectedCliente,
  selectedClienteId,
  session,
  setCart,
  setClientSearch,
  setDeliveryAddress,
  setDeliveryNote,
  setDeliveryType,
  setDiscount,
  setDiscountAmount,
  setDiscountMode,
  setLastSale,
  setMessage,
  setMixedPayments,
  setPaymentInstallments,
  setProductSearch,
  setQuoteConditions,
  setQuoteValidity,
  setReceivedAmount,
  setSaving,
  setSelectedClienteId,
  subtotal,
  total,
}) {
  async function handleSubmit(event) {
    event.preventDefault();

    const validationError = getPointOfSaleSubmissionError({
      caixa,
      canOperateCash,
      cart,
      cashMode,
      isMixedPayment,
      mixedPaymentDifference,
      paymentMethod,
      received,
      selectedClienteId,
      session,
      total,
    });
    if (validationError) {
      setMessage({ type: "error", text: validationError });
      return;
    }

    setSaving(true);
    setMessage(null);
    setLastSale(null);
    try {
      const pedido = await endpoints.pedidos.criar(buildPointOfSaleOrderPayload({
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
      }));

      if (cashMode) {
        const vendaRecebida = await endpoints.pedidos.finalizar(pedido.id, buildPointOfSalePaymentPayload({
          isMixedPayment,
          mixedPayments,
          paymentInstallments,
          paymentMethod,
        }));
        setLastSale(buildPointOfSaleReceipt({
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
        }));
      } else if (isPayOnDelivery) {
        setLastSale(null);
      } else {
        setLastSale(null);
      }

      resetPointOfSaleDraft({
        setCart,
        setClientSearch,
        setDeliveryAddress,
        setDeliveryNote,
        setDeliveryType,
        setDiscount,
        setDiscountAmount,
        setDiscountMode,
        setMixedPayments,
        setPaymentInstallments,
        setProductSearch,
        setQuoteConditions,
        setQuoteValidity,
        setReceivedAmount,
        setSelectedClienteId,
      });
      setMessage({
        type: "success",
        text: getPointOfSaleSuccessMessage({ cashMode, deliveryType, pedido }),
      });
      await onSaleCreated();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  }

  return { handleSubmit };
}
