import "./HeaderOperationSummary.css";

function formatLastUpdate(lastUpdatedAt) {
  if (!lastUpdatedAt) return "--:--";
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(lastUpdatedAt);
}

export function HeaderOperationSummary({ lastUpdatedAt, session, status }) {
  return (
    <>
      <div className="operation-chip">
        <span>Empresa</span>
        <strong>#{session.empresaId || "-"}</strong>
      </div>
      <div className="operation-chip">
        <span>Plano</span>
        <strong>{session.plano.planoComercial || "STARTER"}</strong>
      </div>
      <div className="operation-chip accent">
        <span>Status</span>
        <strong>{status === "success" ? "Online" : status === "loading" ? "Sincronizando" : "Atenção"}</strong>
      </div>
      <div className="operation-chip sync-chip">
        <span>Atualizado</span>
        <strong>{formatLastUpdate(lastUpdatedAt)}</strong>
      </div>
    </>
  );
}
