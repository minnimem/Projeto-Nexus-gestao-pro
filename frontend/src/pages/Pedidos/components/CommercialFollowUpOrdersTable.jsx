import { Phone } from "lucide-react";
import { TableEmptyState } from "../../../components/common/StatusUi";
import { CommercialFollowUpOrderRow } from "./CommercialFollowUpOrderRow";

export function CommercialFollowUpOrdersTable({
  canManageCommercialFollowUp,
  commercialFollowUpOrders,
  startCommercialFollowUp,
}) {
  return (
    <div className="table-wrap compact-table">
      <table>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Vendedor</th>
            <th>Status</th>
            <th>Próxima ação</th>
            <th>Valor</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
          {commercialFollowUpOrders.length === 0 ? (
            <TableEmptyState
              colSpan="6"
              icon={Phone}
              title="Nenhum follow-up comercial"
              detail="Crie lembretes a partir de propostas e pedidos em aberto."
            />
          ) : (
            commercialFollowUpOrders.slice(0, 8).map((pedido) => (
              <CommercialFollowUpOrderRow
                canManageCommercialFollowUp={canManageCommercialFollowUp}
                key={pedido.id}
                pedido={pedido}
                startCommercialFollowUp={startCommercialFollowUp}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
