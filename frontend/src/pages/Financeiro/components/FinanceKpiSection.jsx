import {
  ArrowUpRight,
  CircleDollarSign,
  ClipboardList,
  Phone,
  ReceiptText,
  WalletCards,
} from "lucide-react";
import { KpiCard } from "../../../components/common/KpiCard";
import { formatCurrency, formatNumber } from "../../../utils/formatters";

export function FinanceKpiSection({
  canSeeProfit,
  contasAReceber,
  contasAReceberVencidas,
  despesaAprovadaFiltrada,
  dueFollowUps,
  financeCategories,
  financeCategoryOptions,
  lucroFiltrado,
  pendingFollowUps,
  receitaAprovadaFiltrada,
  selectedFinanceBranchLabel,
  totalAReceber,
  upcomingFollowUps,
}) {
  return (
    <section className="kpi-grid">
      <KpiCard icon={CircleDollarSign} label="Receita" value={formatCurrency(receitaAprovadaFiltrada)} detail={`Entradas aprovadas / ${selectedFinanceBranchLabel}`} tone="green" />
      <KpiCard icon={WalletCards} label="Despesas" value={formatCurrency(despesaAprovadaFiltrada)} detail={`Saídas aprovadas / ${selectedFinanceBranchLabel}`} tone="amber" />
      <KpiCard icon={ArrowUpRight} label="Lucro" value={canSeeProfit ? formatCurrency(lucroFiltrado) : "Restrito"} detail={canSeeProfit ? "Receita menos despesas" : "Visivel para perfis autorizados"} tone="dark" />
      <KpiCard icon={ReceiptText} label="A receber" value={formatCurrency(totalAReceber)} detail={`${formatNumber(contasAReceber.length)} pendentes / ${formatNumber(contasAReceberVencidas.length)} vencidos`} tone="blue" />
      <KpiCard icon={ClipboardList} label="Categorias" value={formatNumber(financeCategoryOptions.length)} detail={`${formatNumber(financeCategories.filter((categoria) => categoria.centroCusto).length)} centros de custo formais`} tone="green" />
      <KpiCard icon={Phone} label="Follow-ups" value={formatNumber(pendingFollowUps.length)} detail={`${formatNumber(dueFollowUps.length)} hoje/vencidos / ${formatNumber(upcomingFollowUps.length)} em 7 dias`} tone="amber" />
    </section>
  );
}

