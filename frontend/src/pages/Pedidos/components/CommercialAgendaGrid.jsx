import { formatDate, formatNumber } from "../../../utils/formatters";

export function CommercialAgendaGrid({ commercialAgendaGroups }) {
  return (
    <div className="commercial-agenda-grid">
      {commercialAgendaGroups.map((group) => (
        <article className={`commercial-agenda-column ${group.tone}`} key={group.key}>
          <div className="commercial-agenda-head">
            <span>{group.label}</span>
            <strong>{formatNumber(group.items.length)}</strong>
          </div>
          <div className="commercial-reminder-list">
            {group.items.length === 0 ? (
              <div className="commercial-priority-empty">Sem lembretes nesta faixa.</div>
            ) : (
              group.items.slice(0, 3).map((item) => (
                <article
                  className={`commercial-reminder-card ${group.tone === "overdue" ? "overdue" : ""}`}
                  key={item.id}
                >
                  <span>{item.proximaAcao ? formatDate(item.proximaAcao) : "Sem data"}</span>
                  <strong>{item.clienteNome || "Cliente não identificado"}</strong>
                  <small>{item.canal || "-"} / {item.vendedor || "-"} / {item.pedidoNumero || item.pedidoId || "-"}</small>
                  <em>{item.observacao || "Sem observação"}</em>
                </article>
              ))
            )}
          </div>
          {group.items.length > 3 && (
            <small className="commercial-kanban-more">+{formatNumber(group.items.length - 3)} lembrete(s)</small>
          )}
        </article>
      ))}
    </div>
  );
}
