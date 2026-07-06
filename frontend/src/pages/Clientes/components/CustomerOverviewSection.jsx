import {
  ArrowUpRight,
  Mail,
  Phone,
  Plus,
  UserRound,
} from "lucide-react";
import { KpiCard } from "../../../components/common/KpiCard";
import { formatNumber } from "../../../utils/formatters";
import "./CustomerOverviewSection.css";

export function CustomerOverviewSection({
  branchFilter,
  customerCount,
  customersWithEmail,
  customersWithPhone,
  newCustomersCurrentMonth,
  newCustomersPreviousMonth,
  newCustomersTrend,
  onCreateCustomer,
}) {
  return (
    <>
      <section className="panel customer-create-topbar">
        <div>
          <span>Cadastro de clientes</span>
          <strong>Adicionar cliente</strong>
          <small>Crie rápidamente um novo contato comercial antes de iniciar vendas, follow-up ou recorrência.</small>
        </div>
        <button className="customer-create-primary" onClick={onCreateCustomer} type="button">
          <Plus size={18} />
          Novo cliente
        </button>
      </section>

      <section className="kpi-grid">
        <KpiCard
          detail={branchFilter === "TODAS" ? "Base comercial ativa" : "Filtro por filial ativo"}
          icon={UserRound}
          label="Clientes"
          tone="blue"
          value={formatNumber(customerCount)}
        />
        <KpiCard
          detail="Prontos para contato digital"
          icon={Mail}
          label="Com email"
          tone="green"
          value={formatNumber(customersWithEmail)}
        />
        <KpiCard
          detail="Atendimento e pos-venda"
          icon={Phone}
          label="Com telefone"
          tone="amber"
          value={formatNumber(customersWithPhone)}
        />
        <KpiCard
          change={newCustomersTrend}
          detail={`${formatNumber(newCustomersPreviousMonth)} no mes anterior`}
          icon={ArrowUpRight}
          label="Novos no mês"
          tone="dark"
          value={formatNumber(newCustomersCurrentMonth)}
        />
      </section>
    </>
  );
}
