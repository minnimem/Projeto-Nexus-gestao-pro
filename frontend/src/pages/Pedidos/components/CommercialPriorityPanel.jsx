import { formatCurrency, formatDateTime, formatNumber } from "../../../utils/formatters";

export function CommercialPriorityPanel({
  priorityByClient,
  priorityBySeller,
  setCommercialSellerFilter,
}) {
  return (
    <div className="commercial-priority-panel">
      <section>
        <div className="commercial-priority-head">
          <span>Prioridade por vendedor</span>
          <small>Maior valor aberto</small>
        </div>
        <div className="commercial-priority-list">
          {priorityBySeller.length === 0 ? (
            <div className="commercial-priority-empty">Sem vendedor com oportunidade aberta.</div>
          ) : (
            priorityBySeller.map((item) => (
              <button
                className="commercial-priority-card"
                key={item.key}
                onClick={() => setCommercialSellerFilter(item.key)}
                type="button"
              >
                <strong>{item.title}</strong>
                <span>{formatCurrency(item.value)}</span>
                <small>{formatNumber(item.count)} oportunidade(s) / {item.detail}</small>
                <em>{item.action}</em>
              </button>
            ))
          )}
        </div>
      </section>
      <section>
        <div className="commercial-priority-head">
          <span>Prioridade por cliente</span>
          <small>Maior impacto comercial</small>
        </div>
        <div className="commercial-priority-list">
          {priorityByClient.length === 0 ? (
            <div className="commercial-priority-empty">Sem cliente com oportunidade aberta.</div>
          ) : (
            priorityByClient.map((item) => (
              <div className="commercial-priority-card client" key={item.cliente}>
                <strong>{item.cliente}</strong>
                <span>{formatCurrency(item.valor)}</span>
                <small>{formatNumber(item.pedidos)} pedido(s) / {item.vendedor}</small>
                <em>{item.topStatus} / ultimo contato {formatDateTime(item.ultimoContato)}</em>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
