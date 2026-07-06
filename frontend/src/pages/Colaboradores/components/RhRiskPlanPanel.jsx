export function RhRiskPlanPanel({ collaboratorRiskPlan }) {
  const items = collaboratorRiskPlan.length > 0
    collaboratorRiskPlan
    : [{
        key: "collaborators-ok",
        severity: "success",
        title: "Equipe sem bloqueios críticos",
        detail: "Usuários carregados não indicam falta de filial, gestor ou status pendente.",
      }];

  return (
    <section className="panel compact-alert-panel">
      <div className="panel-title compact">
        <div>
          <h2>Plano de risco RH</h2>
          <p>Pendências que afetam acesso, supervisão e cobertura operacional.</p>
        </div>
      </div>
      <div className="compact-alert-list">
        {items.map((item) => (
          <div className={`compact-alert-card ${item.severity}`} key={item.key}>
            <span>
              <strong>{item.title}</strong>
              <small>{item.detail}</small>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
