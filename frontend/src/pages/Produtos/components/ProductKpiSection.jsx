import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  CircleDollarSign,
  Truck,
} from "lucide-react";
import { KpiCard } from "../../../components/common/KpiCard";
import { formatCurrency, formatNumber } from "../../../utils/formatters";
import { getStockProductName } from "../../../utils/stock";

export function ProductKpiSection({
  ativos,
  branchFilteredProducts,
  estoqueBaixo,
  fornecedores,
  isStockOperator,
  openInventoryTool,
  saldoEstoque,
  selectedInventoryBranchLabel,
  valorCatalogo,
}) {
  return (
    <>
      <section className="kpi-grid">
        <KpiCard
          detail={selectedInventoryBranchLabel}
          icon={Boxes}
          label="Produtos cadastrados"
          tone="blue"
          value={formatNumber(branchFilteredProducts.length)}
        />
        <KpiCard
          detail={`${formatNumber(ativos)} produtos ativos / ${selectedInventoryBranchLabel}`}
          icon={CheckCircle2}
          label="Unidades em estoque"
          tone="green"
          value={formatNumber(saldoEstoque)}
        />
        <KpiCard
          detail="Itens abaixo do limite operacional"
          icon={AlertTriangle}
          label="Estoque baixo"
          tone="amber"
          value={formatNumber(estoqueBaixo.length)}
        />
        <KpiCard
          detail="Soma dos preços atuais"
          icon={CircleDollarSign}
          label="Valor catalogo"
          tone="dark"
          value={formatCurrency(valorCatalogo)}
        />
        <KpiCard
          detail="Base de compras e reposição"
          icon={Truck}
          label="Fornecedores"
          tone="blue"
          value={formatNumber(fornecedores.length)}
        />
      </section>

      {isStockOperator && estoqueBaixo.length > 0 && (
        <section className="stock-replenishment-notice">
          <div className="stock-alert-icon">
            <AlertTriangle size={22} />
          </div>
          <div>
            <strong>{formatNumber(estoqueBaixo.length)} produto(s) em baixa para repor</strong>
            <span>
              {estoqueBaixo.slice(0, 3).map((item) => getStockProductName(item)).join(", ")}
              {estoqueBaixo.length > 3 ? ` e mais ${formatNumber(estoqueBaixo.length - 3)}` : ""}
            </span>
          </div>
          <button onClick={() => openInventoryTool("alerts")} type="button">
            Ver alertas
          </button>
        </section>
      )}
    </>
  );
}
