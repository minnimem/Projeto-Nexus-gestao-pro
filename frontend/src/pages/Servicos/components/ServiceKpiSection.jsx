import { AlertTriangle, CheckCircle2, CircleDollarSign, ClipboardList } from "lucide-react";
import { KpiCard } from "../../../components/common/KpiCard";
import { formatCurrency, formatNumber } from "../../../utils/formatters";

export function ServiceKpiSection({ activeOrders, estimatedValue, finishedOrders, overdueOrders }) {
  return (
    <section className="kpi-grid">
      <KpiCard
        icon={ClipboardList}
        label="OS abertas"
        value={formatNumber(activeOrders.length)}
        detail="Fila técnica em andamento"
        tone="blue"
      />
      <KpiCard
        icon={AlertTriangle}
        label="Atrasadas"
        value={formatNumber(overdueOrders.length)}
        detail="Prazo vencido com status ativo"
        tone="amber"
      />
      <KpiCard
        icon={CheckCircle2}
        label="Concluídas"
        value={formatNumber(finishedOrders.length)}
        detail="Entregues ou faturadas"
        tone="green"
      />
      <KpiCard
        icon={CircleDollarSign}
        label="Valor previsto"
        value={formatCurrency(estimatedValue)}
        detail="Carteira total de OS"
        tone="dark"
      />
    </section>
  );
}
