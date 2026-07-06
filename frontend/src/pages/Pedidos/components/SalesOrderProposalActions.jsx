import { Printer } from "lucide-react";

export function SalesOrderProposalActions({
  handleConvertQuote,
  handlePrintSavedQuote,
  pedido,
  savingOrderAction,
}) {
  return (
    <div className="order-action-stack">
      <div className="order-context-group proposal">
        <span>Proposta</span>
        <div>
          <button
            className="mini-action-button"
            disabled={savingOrderAction === pedido.id}
            onClick={() => handlePrintSavedQuote(pedido.id)}
            type="button"
          >
            <Printer size={15} />
            Imprimir
          </button>
          <button
            className="mini-action-button"
            disabled={savingOrderAction === pedido.id}
            onClick={() => handleConvertQuote(pedido.id)}
            type="button"
          >
            {savingOrderAction === pedido.id ? "Processando..." : "Converter"}
          </button>
        </div>
      </div>
    </div>
  );
}
