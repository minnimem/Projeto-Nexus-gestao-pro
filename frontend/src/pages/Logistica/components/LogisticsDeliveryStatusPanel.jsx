import { Download, Printer } from "lucide-react";
import { StatusBadge } from "../../../components/StatusBadge/StatusBadge";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { formatCurrency, formatNumber, getLocalDateKey } from "../../../utils/formatters";
import { getDeliveryCustomer, getDeliveryOrderNumber } from "../viewModels/logisticsViewModel";

export function LogisticsDeliveryStatusPanel({
  companyName,
  deliveryStatusColumns,
  deliveryStatusRows,
  selectedLogisticsBranchLabel,
}) {
  return (
    <section className="panel account-plan-summary delivery-status-panel">
      <div className="account-plan-head">
        <div>
          <h3>Esteira de entregas</h3>
          <p>Status operacional por entrega: pendente, em rota, entregue, atrasado e cancelado.</p>
        </div>
        <div className="account-plan-actions">
          <button
            disabled={deliveryStatusRows.length === 0}
            onClick={() => downloadCsv(`nexus-one-status-entregas-${getLocalDateKey()}.csv`, deliveryStatusRows)}
            type="button"
          >
            <Download size={15} />
            CSV
          </button>
          <button
            disabled={deliveryStatusRows.length === 0}
            onClick={() => printRowsDocument(`Status de entregas - ${selectedLogisticsBranchLabel}`, deliveryStatusRows, companyName)}
            type="button"
          >
            <Printer size={15} />
            PDF
          </button>
        </div>
      </div>
      <div className="delivery-status-board">
        {deliveryStatusColumns.map((column) => (
          <article className={`delivery-status-column ${column.status.toLowerCase()}`} key={column.status}>
            <div>
              <StatusBadge status={column.status} label={column.label} />
              <strong>{formatNumber(column.items.length)}</strong>
              <small>{column.detail}</small>
              <small>{formatCurrency(column.total)}</small>
            </div>
            <ul>
              {column.items.slice(0, 3).map((entrega) => (
                <li key={entrega.id}>
                  <span>{getDeliveryOrderNumber(entrega)}</span>
                  <small>{getDeliveryCustomer(entrega)}</small>
                </li>
              ))}
              {column.items.length === 0 && <li className="empty">Sem entregas</li>}
              {column.items.length > 3 && <li className="empty">+ {formatNumber(column.items.length - 3)} entrega(s)</li>}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
