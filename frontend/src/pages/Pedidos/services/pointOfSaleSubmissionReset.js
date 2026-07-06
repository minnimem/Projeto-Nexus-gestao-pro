import { createEmptyMixedPayments } from "../../../utils/payments";
import { getDefaultQuoteValidity } from "../../../utils/sales";
import { defaultQuoteConditions } from "./pointOfSaleDraft";

export function resetPointOfSaleDraft(setters) {
  setters.setCart([]);
  setters.setDiscount(0);
  setters.setDiscountAmount("");
  setters.setDiscountMode("percent");
  setters.setDeliveryType("RETIRADA_LOJA");
  setters.setDeliveryAddress("");
  setters.setDeliveryNote("");
  setters.setQuoteValidity(getDefaultQuoteValidity());
  setters.setQuoteConditions(defaultQuoteConditions);
  setters.setReceivedAmount("");
  setters.setMixedPayments(createEmptyMixedPayments());
  setters.setPaymentInstallments(1);
  setters.setProductSearch("");
  setters.setClientSearch("");
  setters.setSelectedClienteId("");
}
