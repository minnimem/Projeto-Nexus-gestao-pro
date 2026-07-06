import { formatDate, formatDateTime } from "../../../utils/formatters";

export function CommercialFollowUpHistoryCard({
  canManageCommercialFollowUp,
  handleCommercialFollowUpStatus,
  item,
  savingOrderAction,
}) {
  return (
    <div className="account-plan-item collection-card">
      <span>{item.clienteNome || "Cliente não identificado"}</span>
      <strong>{item.proximaAcao ? formatDate(item.proximaAcao) : "Sem data"}</strong>
      <small>{item.pedidoNumero || item.pedidoId} / {item.canal || "-"} / {item.status || "-"}</small>
      <small>Filial: {item.filial || "Empresa"}</small>
      {item.notificacaoExternaEm && (
        <small>Notificado em {formatDateTime(item.notificacaoExternaEm)}</small>
      )}
      <small>{item.observacao || "Sem observação"}</small>
      {canManageCommercialFollowUp && item.status === "PENDENTE" && (
        <div className="table-actions">
          <button disabled={savingOrderAction === `commercial-follow-up-${item.id}`} onClick={() => handleCommercialFollowUpStatus(item.id, "concluir")} type="button">
            Concluir
          </button>
          <button disabled={savingOrderAction === `commercial-follow-up-${item.id}`} onClick={() => handleCommercialFollowUpStatus(item.id, "cancelar")} type="button">
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
