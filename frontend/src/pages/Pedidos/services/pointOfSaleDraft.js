import { createEmptyMixedPayments } from "../../../utils/payments";
import { getDefaultQuoteValidity } from "../../../utils/sales";

export const defaultQuoteConditions = "Validade sujeita a disponibilidade de estoque e confirmação comercial.";

export function resetPointOfSaleDraftFields(setters) {
  setters.setCart([]);
  setters.setDiscount(0);
  setters.setDiscountAmount("");
  setters.setDiscountMode("percent");
  setters.setDeliveryType("RETIRADA_LOJA");
  setters.setDeliveryAddress("");
  setters.setDeliveryNote("");
  setters.setQuoteValidity(getDefaultQuoteValidity());
  setters.setQuoteConditions(defaultQuoteConditions);
  setters.setPaymentMethod("PIX");
  setters.setPaymentInstallments(1);
  setters.setReceivedAmount("");
  setters.setMixedPayments(createEmptyMixedPayments());
  setters.setProductSearch("");
  setters.setMessage(null);
  setters.setLastSale(null);
}
