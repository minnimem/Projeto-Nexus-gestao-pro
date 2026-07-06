import { SalesBarChart } from "./SalesBarChart";
import { SalesChartInsights } from "./SalesChartInsights";
import { SalesGrowthChartHeader } from "./SalesGrowthChartHeader";
import { SalesGrowthChartSummary } from "./SalesGrowthChartSummary";

export function SalesGrowthChart({
  averageChartValue,
  bestChartPeriod,
  chartInsights,
  chartPeriod,
  chartRows,
  maxSaleValue,
  setChartPeriod,
  totalChartValue,
}) {
  return (
    <article className="panel chart-panel">
      <SalesGrowthChartHeader
        chartPeriod={chartPeriod}
        setChartPeriod={setChartPeriod}
      />

      {chartRows.length === 0 ? (
        <div className="empty-chart">Nenhuma venda finalizada para montar o gráfico.</div>
      ) : (
        <>
          <SalesGrowthChartSummary
            averageChartValue={averageChartValue}
            chartRows={chartRows}
            totalChartValue={totalChartValue}
          />
          <SalesChartInsights chartInsights={chartInsights} />
          <SalesBarChart
            averageChartValue={averageChartValue}
            bestChartPeriod={bestChartPeriod}
            chartRows={chartRows}
            maxSaleValue={maxSaleValue}
            totalChartValue={totalChartValue}
          />
        </>
      )}
    </article>
  );
}
