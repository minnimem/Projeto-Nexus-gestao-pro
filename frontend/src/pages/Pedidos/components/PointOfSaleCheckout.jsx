import { PointOfSaleCartList } from "./PointOfSaleCartList";
import { PointOfSaleCheckoutActions } from "./PointOfSaleCheckoutActions";
import { PointOfSaleCheckoutHeader } from "./PointOfSaleCheckoutHeader";
import { PointOfSalePaymentPanel } from "./PointOfSalePaymentPanel";
import { PointOfSaleReceiptStatus } from "./PointOfSaleReceiptStatus";
import { PointOfSaleTotalCard } from "./PointOfSaleTotalCard";

export function PointOfSaleCheckout({
  cart,
  cashMode,
  cashReceiptDetail,
  cashReceiptReady,
  change,
  changeQuantity,
  descontoValor,
  handleExportProposalCsv,
  handlePrintProposal,
  handleSaveQuote,
  isMixedPayment,
  isPayOnDelivery,
  lastSale,
  message,
  mixedPaymentDifference,
  mixedPayments,
  mixedPaymentTotal,
  paymentInstallments,
  paymentMethod,
  paymentOptions,
  receivedAmount,
  receivedAmountRef,
  removeProduct,
  resetSaleDraft,
  saving,
  selectedCliente,
  selectedClienteId,
  session,
  setMixedPayments,
  setPaymentInstallments,
  setPaymentMethod,
  setQuantity,
  setQuickReceivedAmount,
  setReceivedAmount,
  subtotal,
  total,
}) {
  return (
    <aside className="panel side-panel checkout-panel">
      <PointOfSaleCheckoutHeader
        cart={cart}
        resetSaleDraft={resetSaleDraft}
        selectedCliente={selectedCliente}
      />

      <PointOfSaleCartList
        cart={cart}
        changeQuantity={changeQuantity}
        removeProduct={removeProduct}
        setQuantity={setQuantity}
      />

      <PointOfSaleTotalCard
        descontoValor={descontoValor}
        subtotal={subtotal}
        total={total}
      />

      {cashMode && (
        <PointOfSalePaymentPanel
          change={change}
          isMixedPayment={isMixedPayment}
          mixedPaymentDifference={mixedPaymentDifference}
          mixedPayments={mixedPayments}
          mixedPaymentTotal={mixedPaymentTotal}
          paymentInstallments={paymentInstallments}
          paymentMethod={paymentMethod}
          paymentOptions={paymentOptions}
          receivedAmount={receivedAmount}
          receivedAmountRef={receivedAmountRef}
          setMixedPayments={setMixedPayments}
          setPaymentInstallments={setPaymentInstallments}
          setPaymentMethod={setPaymentMethod}
          setQuickReceivedAmount={setQuickReceivedAmount}
          setReceivedAmount={setReceivedAmount}
          total={total}
        />
      )}

      {cashMode && (
        <PointOfSaleReceiptStatus
          cart={cart}
          cashReceiptDetail={cashReceiptDetail}
          cashReceiptReady={cashReceiptReady}
          paymentMethod={paymentMethod}
          selectedCliente={selectedCliente}
          total={total}
        />
      )}

      {message && <p className={`form-message ${message.type}`}>{message.text}</p>}
      <PointOfSaleCheckoutActions
        cart={cart}
        cashMode={cashMode}
        cashReceiptReady={cashReceiptReady}
        handleExportProposalCsv={handleExportProposalCsv}
        handlePrintProposal={handlePrintProposal}
        handleSaveQuote={handleSaveQuote}
        isPayOnDelivery={isPayOnDelivery}
        lastSale={lastSale}
        saving={saving}
        selectedClienteId={selectedClienteId}
        session={session}
      />
    </aside>
  );
}
