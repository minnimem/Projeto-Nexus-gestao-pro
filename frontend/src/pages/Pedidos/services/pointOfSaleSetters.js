export function getPointOfSaleSetters({ cartActions, state }) {
  return {
    setCart: cartActions.setCart,
    setClientSearch: state.setClientSearch,
    setDeliveryAddress: state.setDeliveryAddress,
    setDeliveryNote: state.setDeliveryNote,
    setDeliveryType: state.setDeliveryType,
    setDiscount: state.setDiscount,
    setDiscountAmount: state.setDiscountAmount,
    setDiscountMode: state.setDiscountMode,
    setLastSale: state.setLastSale,
    setMessage: state.setMessage,
    setMixedPayments: state.setMixedPayments,
    setPaymentInstallments: state.setPaymentInstallments,
    setPaymentMethod: state.setPaymentMethod,
    setProductSearch: state.setProductSearch,
    setQuoteConditions: state.setQuoteConditions,
    setQuoteValidity: state.setQuoteValidity,
    setReceivedAmount: state.setReceivedAmount,
    setSaving: state.setSaving,
    setSelectedClienteId: state.setSelectedClienteId,
  };
}
