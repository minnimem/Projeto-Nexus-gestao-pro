export function SalesGrowthChartHeader({ chartPeriod, setChartPeriod }) {
  return (
    <div className="panel-title chart-title">
      <div>
        <h2>Crescimento de vendas</h2>
        <p>Analise por dia, mes ou ano com dados reais dos pedidos.</p>
      </div>
      <div className="chart-tabs" aria-label="Período do gráfico de vendas">
        {[
          ["dia", "Dia"],
          ["mês", "Mês"],
          ["ano", "Ano"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={chartPeriod === value ? "active" : ""}
            onClick={() => setChartPeriod(value)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
