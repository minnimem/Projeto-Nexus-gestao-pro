import { CreditCard, Download, FileText, Loader2, Printer } from "lucide-react";
import { printSaleReceipt } from "../../../utils/salesDocuments";

function getQuoteDisabledReason({ cart, saving, selectedClienteId }) {
  if (saving) return "Aguarde o processamento da operação atual.";
  if (cart.length === 0) return "Adicione produtos ao carrinho para salvar o orçamento.";
  if (!selectedClienteId) return "Selecione um cliente para salvar o orçamento.";
  return undefined;
}

function getCheckoutDisabledReason({ cashMode, cashReceiptReady, saving }) {
  if (saving) return "Aguarde o registro da venda.";
  if (cashMode && !cashReceiptReady) return "Informe os dados de recebimento antes de finalizar no caixa.";
  return undefined;
}

export function PointOfSaleCheckoutActions({
  cart,
  cashMode,
  cashReceiptReady,
  handleExportProposalCsv,
  handlePrintProposal,
  handleSaveQuote,
  isPayOnDelivery,
  lastSale,
  saving,
  selectedClienteId,
  session,
}) {
  const emptyCartReason = cart.length === 0 ? "Adicione produtos ao carrinho para usar esta ação." : undefined;
  const quoteDisabledReason = getQuoteDisabledReason({ cart, saving, selectedClienteId });
  const checkoutDisabledReason = getCheckoutDisabledReason({ cashMode, cashReceiptReady, saving });

  return (
    <>
      {lastSale && (
        <button className="invoice-button" onClick={() => printSaleReceipt(lastSale, session.empresa || "Nexus One")} type="button">
          <Printer size={17} /> Imprimir recibo
        </button>
      )}
      <button
        className="invoice-button secondary"
        disabled={cart.length === 0}
        onClick={handlePrintProposal}
        title={emptyCartReason}
        type="button"
      >
        <FileText size={17} /> Imprimir proposta
      </button>
      <button
        className="invoice-button secondary"
        disabled={cart.length === 0}
        onClick={handleExportProposalCsv}
        title={emptyCartReason}
        type="button"
      >
        <Download size={17} /> CSV proposta
      </button>
      <button
        className="invoice-button secondary"
        disabled={Boolean(quoteDisabledReason)}
        onClick={handleSaveQuote}
        title={quoteDisabledReason}
        type="button"
      >
        <FileText size={17} /> Salvar orçamento
      </button>
      <button
        className="checkout-button"
        disabled={Boolean(checkoutDisabledReason)}
        title={checkoutDisabledReason}
        type="submit"
      >
        {saving ? <Loader2 className="spin" size={17} /> : <CreditCard size={17} />}
        {saving ? "Registrando..." : isPayOnDelivery ? "Registrar para entrega" : cashMode ? "Finalizar no caixa" : "Enviar para o caixa"}
      </button>
    </>
  );
}
