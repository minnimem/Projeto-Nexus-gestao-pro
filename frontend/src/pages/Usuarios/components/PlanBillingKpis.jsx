import {
  ArrowUpRight,
  CheckCircle2,
  CircleDollarSign,
  LockKeyhole,
  ReceiptText,
} from "lucide-react";
import { KpiCard } from "../../../components/common/KpiCard";
import { formatCurrency, formatNumber } from "../../../utils/formatters";

export function PlanBillingKpis({
  planBillingDueSoonItems,
  planBillingDueSoonTotal,
  planBillingItems,
  planBillingMonthlyTotal,
  planBillingOpenItems,
  planBillingOpenTotal,
  planBillingOverdueItems,
  planBillingOverdueTotal,
  planBillingTrialTotal,
}) {
  return (
    <section className="kpi-grid">
      <KpiCard
        icon={CircleDollarSign}
        label="MRR ativo estimado"
        value={formatCurrency(planBillingMonthlyTotal)}
        detail={`${formatNumber(planBillingItems.filter((item) => item.statusAssinaturaNormalizado === "ATIVA").length)} assinatura(s) ativa(s)`}
        tone="success"
      />
      <KpiCard
        icon={ReceiptText}
        label="Em cobrança"
        value={formatNumber(planBillingOpenItems.length)}
        detail={formatCurrency(planBillingOpenTotal)}
        tone={planBillingOpenItems.length > 0 ? "warning" : "success"}
      />
      <KpiCard
        icon={LockKeyhole}
        label="Vencidas"
        value={formatNumber(planBillingOverdueItems.length)}
        detail={formatCurrency(planBillingOverdueTotal)}
        tone={planBillingOverdueItems.length > 0 ? "danger" : "success"}
      />
      <KpiCard
        icon={ArrowUpRight}
        label="Vencendo"
        value={formatNumber(planBillingDueSoonItems.length)}
        detail={formatCurrency(planBillingDueSoonTotal)}
        tone={planBillingDueSoonItems.length > 0 ? "warning" : "success"}
      />
      <KpiCard
        icon={CheckCircle2}
        label="Em teste"
        value={formatNumber(planBillingTrialTotal)}
        detail="Conversão comercial pendente"
        tone="info"
      />
    </section>
  );
}
