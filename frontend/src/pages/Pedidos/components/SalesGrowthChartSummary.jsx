import { formatCurrency, formatNumber } from "../../../utils/formatters";

export function SalesGrowthChartSummary({
  averageChartValue,
  chartRows,
  totalChartValue,
}) {
  return (
    <div className="chart-summary">
      <div>
        <span>Total no gráfico</span>
        <strong>{formatCurrency(totalChartValue)}</strong>
      </div>
      <div>
        <span>Periodos</span>
        <strong>{formatNumber(chartRows.length)}</strong>
      </div>
      <div>
        <span>Linha média</span>
        <strong>{formatCurrency(averageChartValue)}</strong>
      </div>
    </div>
  );
}
