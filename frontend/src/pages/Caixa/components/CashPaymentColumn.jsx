import { ArrowUpRight, Barcode, Copy, CreditCard, Loader2 } from "lucide-react";
import { formatCurrency } from "../../../utils/formatters";
import {
  canInstallmentPayment,
  cashPaymentOptions,
  createEmptyMixedPayments,
  getMixedPaymentTotal,
  getPaymentMethodLabel,
  mixedPaymentMethods,
} from "../../../utils/payments";

export function CashPaymentColumn({
  caixa,
  canOperate,
  cashChangeValue,
  cashReceiveBlocked,
  cashReceivedInputRef,
  charge,
  chargeGeneratedForOrder,
  chargeReceiveBlocked,
  generatingCharge,
  onCopyCharge,
  onGenerateCharge,
  onPaymentFormChange,
  onReceiveOrder,
  paymentForm,
  paymentReceiveBlocked,
  receivingOrder,
  selectedPendingOrder,
}) {
  return (
    <div className="cash-payment-column">
      <div className="cash-pos-column-label payment">
        <span>Pagamento</span>
        <strong>Pix, cartao, dinheiro e resumo</strong>
      </div>
      <div className="cash-shortcut-strip">
        <span><kbd>F2</kbd> pedidos</span>
        <span><kbd>F3-F7</kbd> metodo</span>
        <span><kbd>F10</kbd> cobrar</span>
        <span><kbd>F8</kbd> receber</span>
      </div>
      <div className="sale-summary-total">
        <span>Total a receber</span>
        <strong>{formatCurrency(selectedPendingOrder.valor)}</strong>
      </div>

      <div className={`cash-receipt-confirm ${paymentReceiveBlocked ? "pending" : "ready"}`}>
        <span>Confirmacao</span>
        <strong>{getPaymentMethodLabel(paymentForm.metodoPagamento)}</strong>
        <small>
          {["PIX", "BOLETO"].includes(paymentForm.metodoPagamento)
            ?
            chargeGeneratedForOrder
              ?
              "Cobranca gerada para este pedido."
              : "Gere a cobranca antes de concluir."
            : paymentForm.metodoPagamento === "DINHEIRO" && cashReceiveBlocked ?
              "Informe valor recebido igual ou maior que o total."
              : "Pronto para receber no caixa."}
        </small>
      </div>

      <div className="cash-payment-panel compact-payment-panel">
        <span>Receber no caixa como</span>
        <div className="cash-payment-options">
          {cashPaymentOptions.map((option) => (
            <button
              className={`${paymentForm.metodoPagamento === option.value ? "active" : ""} payment-${String(option.value || "").toLowerCase().replaceAll("_", "-")}`}
              key={option.value}
              onClick={() =>
                onPaymentFormChange((prev) => ({
                  metodoPagamento: option.value,
                  parcelas: canInstallmentPayment(option.value) ? prev.parcelas : 1,
                  pagamentos: prev.pagamentos || createEmptyMixedPayments(),
                  valorRecebido: prev.valorRecebido || "",
                }))
              }
              type="button"
            >
              <CreditCard size={16} />
              <span>{option.label}</span>
              <kbd>{option.shortcut}</kbd>
            </button>
          ))}
        </div>
        {canInstallmentPayment(paymentForm.metodoPagamento) && (
          <label className="form-control">
            <span>Parcelas</span>
            <select
              value={paymentForm.parcelas}
              onChange={(event) =>
                onPaymentFormChange({
                  ...paymentForm,
                  parcelas: Number(event.target.value),
                })
              }
            >
              {Array.from({ length: 12 }, (_, index) => index + 1).map((parcela) => (
                <option key={parcela} value={parcela}>
                  {parcela}x de {formatCurrency(Number(selectedPendingOrder.valor || 0) / parcela)}
                </option>
              ))}
            </select>
          </label>
        )}
        {paymentForm.metodoPagamento === "MISTO" && (
          <div className="mixed-payment-grid compact-mixed-payment-grid">
            {mixedPaymentMethods.map((method) => (
              <label className="form-control" key={method}>
                <span>{getPaymentMethodLabel(method)}</span>
                <input
                  inputMode="decimal"
                  placeholder="0,00"
                  type="text"
                  value={paymentForm.pagamentos?.[method] || ""}
                  onChange={(event) =>
                    onPaymentFormChange((prev) => ({
                      ...prev,
                      pagamentos: {
                        ...(prev.pagamentos || createEmptyMixedPayments()),
                        [method]: event.target.value,
                      },
                    }))
                  }
                />
              </label>
            ))}
            <div className={`mixed-payment-balance ${Math.abs(getMixedPaymentTotal(paymentForm.pagamentos) - Number(selectedPendingOrder.valor || 0)) < 0.009 ? "ok" : "pending"}`}>
              <span>{getMixedPaymentTotal(paymentForm.pagamentos) >= Number(selectedPendingOrder.valor || 0) ? "Excedente" : "Falta"}</span>
              <strong>{formatCurrency(Math.abs(getMixedPaymentTotal(paymentForm.pagamentos) - Number(selectedPendingOrder.valor || 0)))}</strong>
            </div>
          </div>
        )}
        {paymentForm.metodoPagamento === "DINHEIRO" && (
          <div className="cash-change-box">
            <label className="form-control">
              <span>Valor recebido</span>
              <input
                ref={cashReceivedInputRef}
                inputMode="decimal"
                placeholder="0,00"
                type="text"
                value={paymentForm.valorRecebido || ""}
                onChange={(event) =>
                  onPaymentFormChange((prev) => ({
                    ...prev,
                    valorRecebido: event.target.value,
                  }))
                }
              />
            </label>
            <div className={cashChangeValue === null || cashChangeValue < 0 ? "cash-change-result pending" : "cash-change-result ok"}>
              <span>{cashChangeValue === null || cashChangeValue < 0 ? "Falta" : "Troco"}</span>
              <strong>{formatCurrency(Math.abs(cashChangeValue || 0))}</strong>
            </div>
          </div>
        )}
      </div>

      {["PIX", "BOLETO"].includes(paymentForm.metodoPagamento) && (
        <div className="charge-box cash-charge-box">
          <div className="cash-charge-status">
            <span>{paymentForm.metodoPagamento === "PIX" ? "Pix operacional" : "Boleto operacional"}</span>
            <strong>
              {charge && String(charge.pedidoId || "") === String(selectedPendingOrder.id) ?
                "Cobranca gerada"
                : "Aguardando geracao"}
            </strong>
            <small>
              {paymentForm.metodoPagamento === "PIX" ?
                "Gere o QR Code ou copia e cola para confirmar o recebimento."
                : "Gere a linha digitavel para pagamento externo."}
            </small>
          </div>
          <button
            className="checkout-button secondary"
            disabled={!canOperate || !caixa || generatingCharge === selectedPendingOrder.id}
            onClick={() => onGenerateCharge(selectedPendingOrder.id)}
            type="button"
          >
            {generatingCharge === selectedPendingOrder.id ? <Loader2 className="spin" size={17} /> : <Barcode size={17} />}
            {generatingCharge === selectedPendingOrder.id ?
              "Gerando..."
              : paymentForm.metodoPagamento === "PIX" ?
                "Gerar Pix"
                : "Gerar boleto"}
            {generatingCharge !== selectedPendingOrder.id && <kbd>F10</kbd>}
          </button>

          {charge && String(charge.pedidoId || "") === String(selectedPendingOrder.id) && (
            <>
              <div className="charge-provider">
                <span>{charge.cobrancaProvedor || "DEMO"}</span>
                {charge.cobrancaUrl && (
                  <a href={charge.cobrancaUrl} rel="noreferrer" target="_blank">
                    <ArrowUpRight size={15} />
                    Abrir
                  </a>
                )}
              </div>

              {charge.pixCopiaCola && (
                <>
                  {charge.pixQrCodeUrl && (
                    <img alt="QR Code Pix" className="charge-qr" src={charge.pixQrCodeUrl} />
                  )}
                  <label className="form-control">
                    <span>Pix copia e cola</span>
                    <textarea readOnly value={charge.pixCopiaCola} />
                  </label>
                  <button
                    className="checkout-button secondary"
                    onClick={() => onCopyCharge(charge.pixCopiaCola, "Pix copia e cola")}
                    type="button"
                  >
                    <Copy size={17} />
                    Copiar Pix
                  </button>
                </>
              )}

              {charge.boletoLinhaDigitavel && (
                <>
                  <label className="form-control">
                    <span>Linha digitavel</span>
                    <textarea readOnly value={charge.boletoLinhaDigitavel} />
                  </label>
                  <button
                    className="checkout-button secondary"
                    onClick={() => onCopyCharge(charge.boletoLinhaDigitavel, "Linha digitavel")}
                    type="button"
                  >
                    <Copy size={17} />
                    Copiar boleto
                  </button>
                </>
              )}
            </>
          )}
        </div>
      )}

      <button
        className="checkout-button"
        disabled={!canOperate || !caixa || receivingOrder === selectedPendingOrder.id || paymentReceiveBlocked}
        onClick={() => onReceiveOrder(selectedPendingOrder.id)}
        type="button"
      >
        {receivingOrder === selectedPendingOrder.id ? <Loader2 className="spin" size={17} /> : <CreditCard size={17} />}
        {receivingOrder === selectedPendingOrder.id ?
          "Recebendo..."
          : cashReceiveBlocked
            ? "Informe valor recebido"
            : chargeReceiveBlocked
              ? `Gerar ${paymentForm.metodoPagamento === "PIX" ? "Pix" : "boleto"} primeiro`
              : "Receber pagamento"}
        {receivingOrder !== selectedPendingOrder.id && <kbd>F8</kbd>}
      </button>
    </div>
  );
}
