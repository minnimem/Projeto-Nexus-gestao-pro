import { Loader2, ReceiptText } from "lucide-react";
import {
  canFinishSeparation,
  canStartSeparation,
  getSeparationStartLabel,
} from "../services/separationRules.js";

export function SeparationOrderActions({
  deliveryType,
  handlePrintFiscalMirror,
  handleSeparationAction,
  isSaving,
  pedido,
  savingOrderAction,
  status,
}) {
  const actionContext = { status, tipoEntrega: deliveryType };
  const canStart = canStartSeparation(actionContext);

  return (
    <div className="table-actions">
      {canStart && (
        <button
          className="mini-action-button"
          disabled={isSaving}
          onClick={() => handleSeparationAction(pedido.id, "start", deliveryType)}
          type="button"
        >
          {isSaving && <Loader2 className="spin" size={14} />}
          {getSeparationStartLabel(deliveryType)}
        </button>
      )}
      {canFinishSeparation(actionContext) && (
        <button
          className="mini-action-button"
          disabled={isSaving}
          onClick={() => handleSeparationAction(pedido.id, "finish", deliveryType)}
          type="button"
        >
          {isSaving && <Loader2 className="spin" size={14} />}
          Concluir
        </button>
      )}
      {status === "SEPARADO" && <span className="operation-chip pronto">Pronto para despacho</span>}
      <button
        aria-label={`Abrir fiscal do pedido ${pedido.numero || pedido.id}`}
        className="mini-action-button icon-only"
        disabled={savingOrderAction === `fiscal-${pedido.id}`}
        onClick={() => handlePrintFiscalMirror(pedido.id)}
        title="Fiscal"
        type="button"
      >
        <ReceiptText size={15} />
      </button>
    </div>
  );
}
