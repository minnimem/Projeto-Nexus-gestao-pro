import { useEffect } from "react";
import { buildConfirmationText, requestConfirmation } from "../../../utils/confirmations";
import { getClientName } from "../../../utils/customers";
import { canInstallmentPayment } from "../../../utils/payments";
import { resetPointOfSaleDraftFields } from "../services/pointOfSaleDraft";

export function usePointOfSaleDraftControls({
  cart,
  cashMode,
  clientSearchRef,
  formRef,
  handleSaveQuote,
  paymentOptions,
  productSearchRef,
  receivedAmountRef,
  saving,
  selectedCliente,
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
  setPaymentMethod,
  setProductSearch,
  setQuoteConditions,
  setQuoteValidity,
  setReceivedAmount,
}) {
  function setQuickReceivedAmount(value) {
    setReceivedAmount(String(Number(value || 0).toFixed(2)));
    receivedAmountRef.current.focus();
  }

  function resetSaleDraft() {
    if (cart.length > 0 && !requestConfirmation(buildConfirmationText("Limpar", "a venda atual"))) return;
    resetPointOfSaleDraftFields({
      setCart,
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
      setPaymentMethod,
      setProductSearch,
      setQuoteConditions,
      setQuoteValidity,
      setReceivedAmount,
    });
    productSearchRef.current.focus();
  }

  useEffect(() => {
    function handleShortcut(event) {
      if (event.altKey || event.ctrlKey || event.metaKey || saving) return;
      const activeTag = document.activeElement.tagName;
      const isTypingField =
        ["INPUT", "TEXTAREA", "SELECT"].includes(activeTag) ||
        document.activeElement.isContentEditable;

      if (event.key === "F2") {
        event.preventDefault();
        productSearchRef.current.focus();
        productSearchRef.current.select();
      }
      if (event.key === "F4") {
        event.preventDefault();
        clientSearchRef.current.focus();
        clientSearchRef.current.select();
      }
      if (event.key === "F6" && cashMode) {
        event.preventDefault();
        setPaymentMethod((current) => {
          const index = paymentOptions.findIndex((option) => option.value === current);
          const next = paymentOptions[(index + 1) % paymentOptions.length].value || "PIX";
          if (!canInstallmentPayment(next)) setPaymentInstallments(1);
          if (next !== "DINHEIRO") setReceivedAmount("");
          return next;
        });
      }
      if (event.key === "F8") {
        event.preventDefault();
        formRef.current.requestSubmit();
      }
      if (event.key === "F9" && !cashMode) {
        event.preventDefault();
        handleSaveQuote();
      }
      if (event.key === "Escape") {
        setProductSearch("");
        setClientSearch(selectedCliente ? getClientName(selectedCliente) : "");
        setMessage(null);
      }
      if (event.key === "Delete" && cashMode && cart.length > 0 && !isTypingField) {
        event.preventDefault();
        resetSaleDraft();
      }
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [cart.length, cashMode, paymentOptions, saving, selectedCliente]);

  return { resetSaleDraft, setQuickReceivedAmount };
}
