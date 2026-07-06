import { StatusBadge } from "../../../components/StatusBadge/StatusBadge.jsx";
import { formatCurrency, formatDate } from "../../../utils/formatters.js";
import { SeparationCustomerCell } from "./SeparationCustomerCell.jsx";
import { SeparationOrderActions } from "./SeparationOrderActions.jsx";

export function SeparationOrdersTableRow({
  handlePrintFiscalMirror,
  handleSeparationAction,
  pedido,
  savingOrderAction,
}) {
  const status = String(pedido.status || "").toUpperCase();
  const deliveryType = String(pedido.tipoEntrega || "RETIRADA_LOJA").toUpperCase();
  const isSaving = savingOrderAction === pedido.id;

  return (
    <tr>
      <td>
        <SeparationCustomerCell pedido={pedido} />
      </td>
      <td>{formatDate(pedido.data)}</td>
      <td><StatusBadge status={pedido.status} /></td>
      <td>
        <span className={`operation-chip ${deliveryType.toLowerCase()}`}>
          {deliveryType === "ENTREGA" ? "Entrega" : "Retirada"}
        </span>
      </td>
      <td>{formatCurrency(pedido.valor)}</td>
      <td>
        <SeparationOrderActions
          deliveryType={deliveryType}
          handlePrintFiscalMirror={handlePrintFiscalMirror}
          handleSeparationAction={handleSeparationAction}
          isSaving={isSaving}
          pedido={pedido}
          savingOrderAction={savingOrderAction}
          status={status}
        />
      </td>
    </tr>
  );
}
