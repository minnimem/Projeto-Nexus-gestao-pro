import { CreditCard } from "lucide-react";
import { canInstallmentPayment } from "../../../utils/payments";

export function PointOfSalePaymentOptions({
  paymentMethod,
  paymentOptions,
  setPaymentInstallments,
  setPaymentMethod,
  setReceivedAmount,
}) {
  return (
    <div className="cash-payment-options">
      {paymentOptions.map((option) => (
        <button
          className={paymentMethod === option.value ? "active" : ""}
          key={option.value}
          onClick={() => {
            setPaymentMethod(option.value);
            if (!canInstallmentPayment(option.value)) setPaymentInstallments(1);
            if (option.value !== "DINHEIRO") setReceivedAmount("");
          }}
          type="button"
        >
          <CreditCard size={16} />
          {option.label}
        </button>
      ))}
    </div>
  );
}
