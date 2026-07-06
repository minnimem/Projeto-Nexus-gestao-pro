import { StatusBadge } from "../../../components/StatusBadge/StatusBadge";
import { fiscalStatusOptions } from "../../../constants/fiscal";
import { getCustomerInitials, getOrderProductSummary } from "../../../utils/customers";
import { formatCurrency, formatDate } from "../../../utils/formatters";
import { SalesOrderActions } from "./SalesOrderActions";

export function SalesOrdersTableRow({
  fiscalActionRenderers,
  getFiscalStatus,
  handleConvertQuote,
  handlePrintFiscalMirror,
  handlePrintSavedQuote,
  handleSeparationAction,
  pedido,
  savingOrderAction,
  updateFiscalStatus,
}) {
  return (
    <tr>
      <td>
        <div className="customer-table-cell">
          <span className="customer-avatar">{getCustomerInitials(pedido.cliente)}</span>
          <span>
            <strong>{pedido.cliente || "Cliente não informado"}</strong>
            <small>{pedido.numero || pedido.id}</small>
            <small>{getOrderProductSummary(pedido)}</small>
          </span>
        </div>
      </td>
      <td>{formatDate(pedido.data)}</td>
      <td><StatusBadge status={pedido.status} /></td>
      <td>{formatCurrency(pedido.valor)}</td>
      <td>
        <SalesOrderActions
          fiscalActionRenderers={fiscalActionRenderers}
          fiscalStatusOptions={fiscalStatusOptions}
          getFiscalStatus={getFiscalStatus}
          handleConvertQuote={handleConvertQuote}
          handlePrintFiscalMirror={handlePrintFiscalMirror}
          handlePrintSavedQuote={handlePrintSavedQuote}
          handleSeparationAction={handleSeparationAction}
          pedido={pedido}
          savingOrderAction={savingOrderAction}
          updateFiscalStatus={updateFiscalStatus}
        />
      </td>
    </tr>
  );
}
