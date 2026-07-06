import {
  CheckCircle2,
  FileText,
  LockKeyhole,
  MapPin,
  ReceiptText,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { KpiCard } from "../../../components/common/KpiCard";
import { formatNumber } from "../../../utils/formatters";

export function RestrictedAdminState() {
  return (
    <div className="restricted-state">
      <div className="preview-icon">
        <LockKeyhole size={26} />
      </div>
      <h2>Acesso restrito</h2>
      <p>
        Este módulo fica disponível para ADMIN da empresa ou MASTER técnico de planos. Usuários comuns
        continuam operando vendas, estoque, financeiro e logística conforme permissão.
      </p>
    </div>
  );
}

export function UserDashboardKpis({
  activeFiscalConfigs,
  admins,
  ativos,
  bloqueados,
  contratos,
  filteredUsers,
  fiscalReadinessRows,
  fiscalReadyCount,
  selectedUserBranchLabel,
  usuariosSemFilial,
}) {
  return (
    <section className="kpi-grid">
      <KpiCard
        icon={UserRound}
        label="Usuários"
        value={formatNumber(filteredUsers.length)}
        detail={`Filtro: ${selectedUserBranchLabel}`}
        tone="blue"
      />
      <KpiCard
        icon={CheckCircle2}
        label="Ativos"
        value={formatNumber(ativos)}
        detail="Contas liberadas"
        tone="green"
      />
      <KpiCard
        icon={ShieldCheck}
        label="Admins"
        value={formatNumber(admins)}
        detail="Perfis administrativos"
        tone="dark"
      />
      <KpiCard
        icon={MapPin}
        label="Sem filial"
        value={formatNumber(usuariosSemFilial)}
        detail="Colaboradores operacionais sem loja"
        tone="amber"
      />
      <KpiCard
        icon={FileText}
        label="Contratos"
        value={formatNumber(contratos.length)}
        detail={`${formatNumber(bloqueados)} acessos bloqueados`}
        tone="blue"
      />
      <KpiCard
        icon={ReceiptText}
        label="Pre-fiscal"
        value={`${formatNumber(fiscalReadyCount)}/${formatNumber(fiscalReadinessRows.length)}`}
        detail={`${formatNumber(activeFiscalConfigs)} config. ativa(s)`}
        tone="green"
      />
    </section>
  );
}
