import { useState } from "react";
import { getDefaultQuoteValidity } from "../../../utils/sales";

export function usePointOfSaleState() {
  const [selectedClienteId, setSelectedClienteId] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [discount, setDiscount] = useState(0);
  const [discountMode, setDiscountMode] = useState("percent");
  const [discountAmount, setDiscountAmount] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [paymentMethod, setPaymentMethod] = useState("PIX");
  const [paymentInstallments, setPaymentInstallments] = useState(1);
  const [deliveryType, setDeliveryType] = useState("RETIRADA_LOJA");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [quoteValidity, setQuoteValidity] = useState(getDefaultQuoteValidity);
  const [quoteConditions, setQuoteConditions] = useState("Validade sujeita a disponibilidade de estoque e confirmação comercial.");
  const [receivedAmount, setReceivedAmount] = useState("");
  const [mixedPayments, setMixedPayments] = useState({
    PIX: "",
    DINHEIRO: "",
    CARTAO_CREDITO: "",
    CARTAO_DEBITO: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [lastSale, setLastSale] = useState(null);

  return {
    clientSearch,
    deliveryAddress,
    deliveryNote,
    deliveryType,
    discount,
    discountAmount,
    discountMode,
    lastSale,
    message,
    mixedPayments,
    paymentInstallments,
    paymentMethod,
    priority,
    productSearch,
    quoteConditions,
    quoteValidity,
    receivedAmount,
    saving,
    selectedClienteId,
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
    setPriority,
    setProductSearch,
    setQuoteConditions,
    setQuoteValidity,
    setReceivedAmount,
    setSaving,
    setSelectedClienteId,
  };
}
