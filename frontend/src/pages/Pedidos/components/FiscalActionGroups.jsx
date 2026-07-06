import { ReceiptText } from "lucide-react";
import { FiscalStatusSelect } from "./FiscalStatusSelect";

export function FiscalActionGroups({
  extraActions = null,
  fiscalActionRenderers,
  fiscalStatusOptions,
  getFiscalStatus,
  handlePrintFiscalMirror,
  includeConsult = false,
  includeStatus = false,
  mirrorLabel = "Espelho",
  pedido,
  savingOrderAction,
  updateFiscalStatus,
}) {
  const render = (name) => fiscalActionRenderers[name](pedido);

  return (
    <div className="table-actions fiscal-actions">
      {includeStatus && (
        <div className="fiscal-action-group status">
          <span>Status</span>
          <div>
            <FiscalStatusSelect
              fiscalStatusOptions={fiscalStatusOptions}
              getFiscalStatus={getFiscalStatus}
              pedido={pedido}
              updateFiscalStatus={updateFiscalStatus}
            />
          </div>
        </div>
      )}
      <div className="fiscal-action-group primary">
        <span>Fluxo</span>
        <div>
          {render("homologation")}
          {render("returns")}
          {render("lifecycle")}
          {includeConsult && render("consult")}
          {extraActions}
        </div>
      </div>
      <div className="fiscal-action-group">
        <span>Arquivos</span>
        <div>
          {render("files")}
          <button
            className="mini-action-button"
            disabled={savingOrderAction === `fiscal-${pedido.id}`}
            onClick={() => handlePrintFiscalMirror(pedido.id)}
            type="button"
          >
            <ReceiptText size={15} />
            {mirrorLabel}
          </button>
        </div>
      </div>
      <div className="fiscal-action-group">
        <span>Real</span>
        <div>
          {render("real")}
        </div>
      </div>
    </div>
  );
}
