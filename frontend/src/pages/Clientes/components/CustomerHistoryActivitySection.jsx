import { Download, Printer } from "lucide-react";
import { StatusBadge } from "../../../components/StatusBadge/StatusBadge";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import {
  formatCurrency,
  formatDateTime,
  formatNumber,
  getLocalDateKey,
} from "../../../utils/formatters";
import { getClientName, getOrderProductSummary } from "../../../utils/customers";
import "./CustomerHistoryActivitySection.css";

export function CustomerHistoryActivitySection({
  customer,
  historyRows,
  orders,
  timeline,
}) {
  return (
    <>
      <div className="account-plan-actions">
        <button
          disabled={historyRows.length === 0}
          onClick={() => downloadCsv(`nexus-one-historico-cliente-${getLocalDateKey()}.csv`, historyRows)}
          type="button"
        >
          <Download size={15} />
          CSV
        </button>
        <button
          disabled={historyRows.length === 0}
          onClick={() => printRowsDocument(`Historico de ${getClientName(customer)}`, historyRows, "Nexus One")}
          type="button"
        >
          <Printer size={15} />
          PDF
        </button>
      </div>

      <div className="customer-timeline-panel">
        <div className="customer-timeline-title">
          <span>Timeline</span>
          <strong>{formatNumber(timeline.length)} evento(s)</strong>
        </div>
        {timeline.length === 0 ? (
          <div className="empty-selection compact">Sem relacionamento registrado.</div>
        ) : (
          <div className="customer-timeline-list">
            {timeline.map((item) => (
              <div className="customer-timeline-item" key={item.key}>
                <span>{item.type}</span>
                <strong>{item.title}</strong>
                <small>{formatDateTime(item.date)} / {item.detail}</small>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="table-wrap compact-table">
        <table>
          <tbody>
            {orders.length === 0 ? (
              <tr><td className="empty-cell">Sem pedidos para exibir.</td></tr>
            ) : orders.slice(0, 6).map((order) => (
              <tr key={order.id}>
                <td>
                  <strong>{order.numero || order.id}</strong>
                  <small>Filial: {order.filial || "Empresa"}</small>
                  <small>{getOrderProductSummary(order)}</small>
                  <small>{formatDateTime(order.data)} / {order.usuario || "Vendedor não informado"}</small>
                </td>
                <td><StatusBadge status={order.status} /></td>
                <td>{formatCurrency(order.valor)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
