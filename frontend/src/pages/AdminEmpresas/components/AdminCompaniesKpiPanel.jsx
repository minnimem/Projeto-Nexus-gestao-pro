import { AlertTriangle, Building2, ShieldCheck, UsersRound } from "lucide-react";
import { KpiCard } from "../../../components/common/KpiCard";
import { formatNumber } from "../../../utils/formatters";

export function AdminCompaniesKpiPanel({
  activeCompanies,
  companiesWithRisk,
  empresas,
  enterpriseCompanies,
  suspendedCompanies,
  totalActiveUsers,
}) {
  return (
    <section className="kpi-grid">
      <KpiCard
        icon={Building2}
        label="Empresas ativas"
        value={formatNumber(activeCompanies)}
        detail={`${formatNumber(empresas.length)} cadastrada(s)`}
        tone="success"
      />
      <KpiCard
        icon={UsersRound}
        label="Usuários ativos"
        value={formatNumber(totalActiveUsers)}
        detail="Somatório multiempresa"
        tone="info"
      />
      <KpiCard
        icon={AlertTriangle}
        label="Em atenção"
        value={formatNumber(companiesWithRisk)}
        detail={`${formatNumber(enterpriseCompanies)} no plano enterprise`}
        tone={companiesWithRisk > 0 ? "warning" : "success"}
      />
      <KpiCard
        icon={ShieldCheck}
        label="Suspensas"
        value={formatNumber(suspendedCompanies)}
        detail="Assinatura sem operação plena"
        tone={suspendedCompanies > 0 ? "warning" : "neutral"}
      />
    </section>
  );
}
