import { formatDate } from "../../../utils/formatters";

export function PlanBillingDueCell({ item }) {
  const dueLabel = item.nextDueDate
    ?
    formatDate(item.nextDueDate)
    : item.dueDay
      ?
      `Dia ${String(item.dueDay).padStart(2, "0")}`
      : "A definir";

  return (
    <>
      <small>{dueLabel}</small>
      <small>
        {item.dueDay ? `Dia base ${String(item.dueDay).padStart(2, "0")}` : "Dia base pendente"}
      </small>
      <small>
        {item.ultimoPagamentoPlano
          ?
          `Pago em ${formatDate(item.ultimoPagamentoPlano)}`
          : "Sem baixa registrada"}
      </small>
    </>
  );
}
