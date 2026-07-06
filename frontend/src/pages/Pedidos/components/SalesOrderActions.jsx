import { FiscalActionGroups } from "./FiscalActionGroups";
import { SalesOrderOperationalAction } from "./SalesOrderOperationalAction";
import { SalesOrderProposalActions } from "./SalesOrderProposalActions";

export function SalesOrderActions({
  fiscalActionRenderers,
  fiscalStatusOptions,
  getFiscalStatus,
  handleConvertQuote,
  handlePrintFiscalMirror,
  handlePrintSavedQuote,
  handleSeparationAction,
  pedido,
  savingOrderAction,
  updateFiscalStatus,
}) {
  const status = String(pedido.status || "");
  const tipoEntrega = String(pedido.tipoEntrega || "RETIRADA_LOJA");
  const showOperationalAction = (
    (status === "PENDENTE" && tipoEntrega !== "RETIRADA_LOJA") ||
    (status === "RECEBIDO" && tipoEntrega === "RETIRADA_LOJA") ||
    status === "SEPARACAO"
  );

  if (status === "ORCAMENTO") {
    return (
      <SalesOrderProposalActions
        handleConvertQuote={handleConvertQuote}
        handlePrintSavedQuote={handlePrintSavedQuote}
        pedido={pedido}
        savingOrderAction={savingOrderAction}
      />
    );
  }

  return (
    <div className="order-action-stack">
      {showOperationalAction && (
        <div className="order-context-group operation">
          <span>Operação</span>
          <div>
            <SalesOrderOperationalAction
              handleSeparationAction={handleSeparationAction}
              pedido={pedido}
              savingOrderAction={savingOrderAction}
              status={status}
              tipoEntrega={tipoEntrega}
            />
          </div>
        </div>
      )}
      <FiscalActionGroups
        fiscalActionRenderers={fiscalActionRenderers}
        fiscalStatusOptions={fiscalStatusOptions}
        getFiscalStatus={getFiscalStatus}
        handlePrintFiscalMirror={handlePrintFiscalMirror}
        includeStatus
        mirrorLabel="Fiscal"
        pedido={pedido}
        savingOrderAction={savingOrderAction}
        updateFiscalStatus={updateFiscalStatus}
      />
    </div>
  );
}
