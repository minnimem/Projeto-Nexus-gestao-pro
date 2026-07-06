import { AlertTriangle, CheckCircle2, ShieldCheck, UsersRound } from "lucide-react";
import { KpiCard } from "../../../components/common/KpiCard";
import { formatNumber } from "../../../utils/formatters";

export function CollaboratorsKpiPanel({
  ativos,
  filteredUsers,
  gerentes,
  selectedBranchLabel,
  semFilial,
}) {
  return (
    <section className="kpi-grid">
      <KpiCard
        icon={UsersRound}
        label="Colaboradores"
        value={formatNumber(filteredUsers.length)}
        detail={selectedBranchLabel}
      />
      <KpiCard
        icon={CheckCircle2}
        label="Ativos"
        value={formatNumber(ativos)}
        detail="Usuários liberados para operar"
      />
      <KpiCard
        icon={ShieldCheck}
        label="Gerentes"
        value={formatNumber(gerentes)}
        detail="Perfis com visão ampliada"
      />
      <KpiCard
        icon={AlertTriangle}
        label="Sem filial"
        value={formatNumber(semFilial)}
        detail="Colaboradores operacionais sem loja"
        tone={semFilial ? "warning" : "success"}
      />
    </section>
  );
}
