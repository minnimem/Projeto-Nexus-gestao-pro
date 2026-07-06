import { ClipboardList, Download, FileText, ShieldCheck } from "lucide-react";
import { KpiCard } from "../../../components/common/KpiCard";
import { formatNumber } from "../../../utils/formatters";

export function ReportKpiSection({ exportaveis, reportCards, selectedReportBranchLabel, totalRegistros }) {
  return (
    <section className="kpi-grid">
      <KpiCard
        icon={FileText}
        label="Relatórios"
        value={formatNumber(reportCards.length)}
        detail="Áreas disponíveis para este perfil"
        tone="blue"
      />
      <KpiCard
        icon={ClipboardList}
        label="Registros"
        value={formatNumber(totalRegistros)}
        detail="Dados prontos para análise"
        tone="green"
      />
      <KpiCard
        icon={Download}
        label="Exportáveis"
        value={formatNumber(exportaveis)}
        detail="Bases com dados para CSV"
        tone="amber"
      />
      <KpiCard
        icon={ShieldCheck}
        label="Filial"
        value={selectedReportBranchLabel}
        detail="Filtro consolidado dos relatórios"
        tone="dark"
      />
    </section>
  );
}
