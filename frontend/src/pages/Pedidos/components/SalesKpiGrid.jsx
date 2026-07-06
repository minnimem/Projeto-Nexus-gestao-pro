import {
  ArrowUpRight,
  CircleDollarSign,
  ClipboardList,
  FileText,
  PackageCheck,
  ShoppingCart,
} from "lucide-react";
import { KpiCard } from "../../../components/common/KpiCard";
import { formatCurrency, formatNumber } from "../../../utils/formatters";
import { sectionClass } from "../../../utils/sales";

export function SalesKpiGrid({
  salesKpis,
  selectedSalesBranchLabel,
  showSalesAnalytics,
  showSalesOrders,
  showSalesOverview,
}) {
  return (
    <section className={`kpi-grid${sectionClass(showSalesOverview || showSalesAnalytics || showSalesOrders)}`}>
      <KpiCard icon={ShoppingCart} label="Total de vendas" value={formatNumber(salesKpis.totalVendas)} detail={`Pedidos concluidos / ${selectedSalesBranchLabel}`} tone="blue" />
      <KpiCard icon={ClipboardList} label="Pendentes" value={formatNumber(salesKpis.pendentes)} detail="Pedidos aguardando andamento" tone="amber" />
      <KpiCard icon={FileText} label="Orçamentos" value={formatNumber(salesKpis.orcamentos)} detail="Propostas salvas aguardando conversão" tone="blue" />
      <KpiCard icon={PackageCheck} label="Separação" value={formatNumber(salesKpis.separacao)} detail={`${formatNumber(salesKpis.separados)} pedidos prontos`} tone="amber" />
      <KpiCard icon={CircleDollarSign} label="Receita total" value={formatCurrency(salesKpis.receita)} detail="Somatório de vendas concluídas" tone="green" />
      <KpiCard icon={ArrowUpRight} label="Vendas hoje" value={formatCurrency(salesKpis.vendasHoje)} detail={selectedSalesBranchLabel} tone="dark" />
    </section>
  );
}
