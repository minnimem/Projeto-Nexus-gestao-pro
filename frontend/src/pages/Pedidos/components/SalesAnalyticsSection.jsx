import { sectionClass } from "../../../utils/sales";
import { SalesGrowthChart } from "./SalesGrowthChart";
import { TopProductsChart } from "./TopProductsChart";

export function SalesAnalyticsSection({
  analytics,
  showSalesAnalytics,
}) {
  const {
    averageChartValue,
    bestChartPeriod,
    chartInsights,
    chartPeriod,
    chartRows,
    maxProductQty,
    maxSaleValue,
    setChartPeriod,
    topProducts,
    totalChartValue,
  } = analytics;

  return (
    <section className={`analytics-grid${sectionClass(showSalesAnalytics)}`}>
      <SalesGrowthChart
        averageChartValue={averageChartValue}
        bestChartPeriod={bestChartPeriod}
        chartInsights={chartInsights}
        chartPeriod={chartPeriod}
        chartRows={chartRows}
        maxSaleValue={maxSaleValue}
        setChartPeriod={setChartPeriod}
        totalChartValue={totalChartValue}
      />

      <TopProductsChart
        maxProductQty={maxProductQty}
        topProducts={topProducts}
      />
    </section>
  );
}
