export function ControlPanelTabs({ controlPanelTab, setControlPanelTab }) {
  return (
    <div className="chart-tabs compact-tabs finance-filter-tabs">
      <button
        className={controlPanelTab === "liberacoes" ? "active" : ""}
        onClick={() => setControlPanelTab("liberacoes")}
        type="button"
      >
        Liberações
      </button>
      <button
        className={controlPanelTab === "cobranca-planos" ? "active" : ""}
        onClick={() => setControlPanelTab("cobranca-planos")}
        type="button"
      >
        Cobrança dos planos
      </button>
    </div>
  );
}
