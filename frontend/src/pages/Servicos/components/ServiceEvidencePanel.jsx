import { getServiceEvidence } from "../viewModels/serviceViewModel";

export function ServiceEvidencePanel({ activeOrders, timelineFocusOrder, timelineRows }) {
  return (
    <div className="service-evidence-panel">
      <section>
        <div className="commercial-priority-head">
          <span>Linha do tempo da OS</span>
          <small>{timelineFocusOrder ? (timelineFocusOrder.numero || timelineFocusOrder.id) : "Sem OS"}</small>
        </div>
        <div className="service-timeline-list">
          {timelineRows.length === 0 ? (
            <div className="commercial-priority-empty">Sem eventos para exibir.</div>
          ) : (
            timelineRows.map((item) => (
              <article className={`service-timeline-item ${item.tone}`} key={`${item.label}-${item.detail}`}>
                <span>{item.label}</span>
                <strong>{item.detail}</strong>
              </article>
            ))
          )}
        </div>
      </section>
      <section>
        <div className="commercial-priority-head">
          <span>Evidências pendentes</span>
          <small>Fotos, peças e aceite</small>
        </div>
        <div className="service-evidence-grid">
          {activeOrders.slice(0, 4).map((ordem) => {
            const evidence = getServiceEvidence(ordem);
            const pendingEvidence = [
              !evidence.pecas && "peças",
              !evidence.evidencias && "evidências",
              !evidence.assinaturaCliente && "assinatura",
            ].filter(Boolean);
            return (
              <article className={pendingEvidence.length > 0 ? "warning" : "success"} key={ordem.id}>
                <span>{ordem.numero || ordem.id}</span>
                <strong>{pendingEvidence.length > 0 ? pendingEvidence.join(", ") : "completo"}</strong>
                <small>{ordem.cliente || "Cliente não informado"}</small>
              </article>
            );
          })}
          {activeOrders.length === 0 && (
            <div className="commercial-priority-empty">Sem OS ativa para revisar evidências.</div>
          )}
        </div>
      </section>
    </div>
  );
}
