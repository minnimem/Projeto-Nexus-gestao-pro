import { formatCurrency, formatNumber } from "../../../utils/formatters";

export function SalesBarChart({
  averageChartValue,
  bestChartPeriod,
  chartRows,
  maxSaleValue,
  totalChartValue,
}) {
  return (
    <div className="sales-chart">
      {chartRows.map((item) => {
        const participation = totalChartValue > 0 ? (item.value / totalChartValue) * 100 : 0;
        const averageDelta = averageChartValue > 0 ? ((item.value - averageChartValue) / averageChartValue) * 100 : null;
        return (
          <div className="sales-bar" key={item.key}>
            <div
              className={bestChartPeriod.key === item.key ? "sales-bar-track best" : "sales-bar-track"}
              tabIndex={0}
            >
              <i
                aria-hidden="true"
                className="sales-average-line"
                style={{ bottom: `${Math.max((averageChartValue / maxSaleValue) * 100, 8)}%` }}
              />
              <span style={{ height: `${Math.max((item.value / maxSaleValue) * 100, 8)}%` }} />
              <div className="sales-bar-tooltip">
                <strong>{item.label}</strong>
                <small>{formatCurrency(item.value)}</small>
                <small>{formatNumber(participation)}% do total</small>
                <em>
                  {averageDelta === null ?
                    "Sem média"
                    : `${averageDelta >= 0 ? "+" : ""}${formatNumber(averageDelta)}% vs media`}
                </em>
              </div>
            </div>
            <strong>{item.label}</strong>
            <small>{formatCurrency(item.value)}</small>
          </div>
        );
      })}
    </div>
  );
}
