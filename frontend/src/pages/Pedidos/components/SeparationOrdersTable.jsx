import { PackageCheck } from "lucide-react";
import { SeparationOrdersTableRow } from "./SeparationOrdersTableRow";

export function SeparationOrdersTable({
  filteredOrders,
  handlePrintFiscalMirror,
  handleSeparationAction,
  savingOrderAction,
}) {
  return (
    <div className="table-wrap compact-table modern-sales-table">
      <table>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Data</th>
            <th>Status</th>
            <th>Entrega</th>
            <th>Valor</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.length === 0 ? (
            <tr>
              <td className="empty-cell" colSpan="6">
                <div className="table-empty-state">
                  <PackageCheck size={20} />
                  <strong>Fila de separação limpa</strong>
                  <small>Nenhum pedido encontrado nos filtros atuais.</small>
                </div>
              </td>
            </tr>
          ) : filteredOrders.map((pedido) => (
            <SeparationOrdersTableRow
              handlePrintFiscalMirror={handlePrintFiscalMirror}
              handleSeparationAction={handleSeparationAction}
              key={pedido.id}
              pedido={pedido}
              savingOrderAction={savingOrderAction}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
