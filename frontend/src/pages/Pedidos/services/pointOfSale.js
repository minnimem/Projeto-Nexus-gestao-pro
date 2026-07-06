import { cashPaymentOptions } from "../../../utils/payments";
import { getPointOfSaleClientSearch, getPointOfSaleProductSearch } from "./pointOfSaleSearch";
import { getPointOfSalePaymentView, getPointOfSaleTotals } from "./pointOfSaleTotals";
import { getPointOfSaleProposalView } from "./pointOfSaleViewProposal";

const salesPaymentOptions = [
  { value: "PIX", label: "Pix" },
  { value: "DINHEIRO", label: "Dinheiro" },
  { value: "CARTAO_CREDITO", label: "Cartao credito" },
  { value: "CARTAO_DEBITO", label: "Cartao debito" },
  { value: "BOLETO", label: "Boleto" },
  { value: "MISTO", label: "Misto" },
];

export function getPointOfSaleViewData({
  cashMode,
  cart,
  clientes,
  clientSearch,
  deliveryAddress,
  deliveryNote,
  deliveryType,
  discount,
  discountAmount,
  discountMode,
  mixedPayments,
  paymentInstallments,
  paymentMethod,
  productSearch,
  produtos,
  quoteConditions,
  quoteValidity,
  receivedAmount,
  selectedClienteId,
  session,
}) {
  const isPayOnDelivery = paymentMethod === "PAGAR_NA_ENTREGA";
  const isMixedPayment = paymentMethod === "MISTO";
  const paymentOptions = cashMode ? cashPaymentOptions : salesPaymentOptions;
  const { activeProducts, filteredProducts, productSearchCommand } = getPointOfSaleProductSearch({ productSearch, produtos });
  const { filteredClientes, selectedCliente } = getPointOfSaleClientSearch({ clientes, clientSearch, selectedClienteId });
  const { descontoValor, discountPayload, subtotal, total } = getPointOfSaleTotals({
    cart,
    discount,
    discountAmount,
    discountMode,
  });
  const {
    cashReceiptDetail,
    cashReceiptReady,
    change,
    mixedPaymentDifference,
    mixedPaymentTotal,
    received,
  } = getPointOfSalePaymentView({
    cart,
    cashMode,
    isMixedPayment,
    mixedPayments,
    paymentInstallments,
    paymentMethod,
    receivedAmount,
    selectedClienteId,
    total,
  });
  const proposalBranchLabel = session.filial || "Empresa / sem filial";
  const { buildProposal, proposalNumber, proposalRows } = getPointOfSaleProposalView({
    cart,
    deliveryAddress,
    deliveryNote,
    deliveryType,
    descontoValor,
    proposalBranchLabel,
    quoteConditions,
    quoteValidity,
    selectedCliente,
    session,
    subtotal,
    total,
  });

  return {
    activeProducts,
    buildProposal,
    cashReceiptDetail,
    cashReceiptReady,
    change,
    descontoValor,
    discountPayload,
    filteredClientes,
    filteredProducts,
    isMixedPayment,
    isPayOnDelivery,
    mixedPaymentDifference,
    mixedPaymentTotal,
    paymentOptions,
    productSearchCommand,
    proposalBranchLabel,
    proposalNumber,
    proposalRows,
    received,
    selectedCliente,
    subtotal,
    total,
  };
}
