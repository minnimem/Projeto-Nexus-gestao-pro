import { canInstallmentPayment } from "../../../utils/payments";
import { PointOfSaleCashPayment } from "./PointOfSaleCashPayment";
import { PointOfSaleInstallments } from "./PointOfSaleInstallments";
import { PointOfSaleMixedPayment } from "./PointOfSaleMixedPayment";
import { PointOfSalePaymentOptions } from "./PointOfSalePaymentOptions";

export function PointOfSalePaymentPanel({
  change,
  isMixedPayment,
  mixedPaymentDifference,
  mixedPayments,
  mixedPaymentTotal,
  paymentInstallments,
  paymentMethod,
  paymentOptions,
  receivedAmount,
  receivedAmountRef,
  setMixedPayments,
  setPaymentInstallments,
  setPaymentMethod,
  setQuickReceivedAmount,
  setReceivedAmount,
  total,
}) {
  return (
    <div className="cash-payment-panel">
      <span>Forma de pagamento</span>
      <PointOfSalePaymentOptions
        paymentMethod={paymentMethod}
        paymentOptions={paymentOptions}
        setPaymentInstallments={setPaymentInstallments}
        setPaymentMethod={setPaymentMethod}
        setReceivedAmount={setReceivedAmount}
      />
      {paymentMethod === "DINHEIRO" && (
        <PointOfSaleCashPayment
          change={change}
          receivedAmount={receivedAmount}
          receivedAmountRef={receivedAmountRef}
          setQuickReceivedAmount={setQuickReceivedAmount}
          setReceivedAmount={setReceivedAmount}
          total={total}
        />
      )}
      {isMixedPayment && (
        <PointOfSaleMixedPayment
          mixedPaymentDifference={mixedPaymentDifference}
          mixedPayments={mixedPayments}
          mixedPaymentTotal={mixedPaymentTotal}
          setMixedPayments={setMixedPayments}
          total={total}
        />
      )}
      {canInstallmentPayment(paymentMethod) && (
        <PointOfSaleInstallments
          paymentInstallments={paymentInstallments}
          setPaymentInstallments={setPaymentInstallments}
          total={total}
        />
      )}
    </div>
  );
}
