import { SalesOrdersEmptyRow } from "./SalesOrdersEmptyRow";
import { SalesOrdersTableRow } from "./SalesOrdersTableRow";

export function SalesOrdersTable({
  fiscalActionRenderers,
  filteredOrders,
  getFiscalStatus,
  handleConvertQuote,
  handlePrintFiscalMirror,
  handlePrintSavedQuote,
  handleSeparationAction,
  savingOrderAction,
  updateFiscalStatus,
}) {
  return (
    <div className="table-wrap modern-sales-table">
      <table>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Data</th>
            <th>Status</th>
            <th>Valor</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.length === 0 ? (
            <SalesOrdersEmptyRow />
          ) : (
            filteredOrders.map((pedido) => (
              <SalesOrdersTableRow
                fiscalActionRenderers={fiscalActionRenderers}
                getFiscalStatus={getFiscalStatus}
                handleConvertQuote={handleConvertQuote}
                handlePrintFiscalMirror={handlePrintFiscalMirror}
                handlePrintSavedQuote={handlePrintSavedQuote}
                handleSeparationAction={handleSeparationAction}
                key={pedido.id}
                pedido={pedido}
                savingOrderAction={savingOrderAction}
                updateFiscalStatus={updateFiscalStatus}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
