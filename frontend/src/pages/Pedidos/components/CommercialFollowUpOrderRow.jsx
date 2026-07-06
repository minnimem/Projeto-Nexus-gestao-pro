import { Phone } from "lucide-react";
import { StatusBadge } from "../../../components/StatusBadge/StatusBadge";
import { getOrderProductSummary } from "../../../utils/customers";
import { formatCurrency, formatDateTime } from "../../../utils/formatters";

export function CommercialFollowUpOrderRow({
  canManageCommercialFollowUp,
  pedido,
  startCommercialFollowUp,
}) {
  return (
    <tr>
      <td>
        <strong>{pedido.cliente || "Cliente não informado"}</strong>
        <small>{pedido.numero || pedido.id}</small>
        <small>Filial: {pedido.filial || "Empresa"}</small>
        <small>{getOrderProductSummary(pedido)}</small>
      </td>
      <td>{pedido.usuario || pedido.vendedor || "Vendedor não informado"}</td>
      <td><StatusBadge status={pedido.status} /></td>
      <td>
        {pedido.status === "ORCAMENTO" ?
          "Retomar proposta"
          : pedido.status === "PENDENTE" ?
            "Confirmar recebimento"
            : "Acompanhar separação"}
        <small>{formatDateTime(pedido.data)}</small>
      </td>
      <td>{formatCurrency(pedido.valor)}</td>
      <td>
        {canManageCommercialFollowUp ? (
          <button className="mini-action-button" onClick={() => startCommercialFollowUp(pedido)} type="button">
            <Phone size={15} />
            Agendar
          </button>
        ) : (
          "-"
        )}
      </td>
    </tr>
  );
}
