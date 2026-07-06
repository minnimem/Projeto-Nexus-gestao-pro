import { formatDateTime } from "../../../utils/formatters";

export function CommercialClientTimeline({ commercialClientTimeline }) {
  return (
    <section>
      <div className="commercial-priority-head">
        <span>Timeline do cliente</span>
        <small>Últimos contatos registrados</small>
      </div>
      <div className="commercial-timeline-list">
        {commercialClientTimeline.length === 0 ? (
          <div className="commercial-priority-empty">Nenhum contato comercial registrado.</div>
        ) : (
          commercialClientTimeline.map((item) => (
            <article className="commercial-timeline-item" key={item.id}>
              <span>{formatDateTime(item.criadoEm || item.atualizadoEm || item.proximaAcao)}</span>
              <strong>{item.clienteNome || "Cliente não identificado"}</strong>
              <small>{item.status || "-"} / {item.canal || "-"} / {item.usuarioNome || item.vendedor || "-"}</small>
              <em>{item.observacao || "Sem observação"}</em>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
