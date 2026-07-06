import { Download, Printer } from "lucide-react";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { formatCurrency, formatNumber, formatPercent, getLocalDateKey } from "../../../utils/formatters";

export function LogisticsDriverPerformancePanel({
  companyName,
  driverPerformance,
  driverPerformanceRows,
  selectedLogisticsBranchLabel,
}) {
  return (
    <section className="panel account-plan-summary">
      <div className="account-plan-head">
        <div>
          <h3>Desempenho por motorista</h3>
          <p>Entregas, rotas, atrasos e custo para acompanhamento operacional.</p>
        </div>
        <div className="account-plan-actions">
          <button
            disabled={driverPerformanceRows.length === 0}
            onClick={() => downloadCsv(`nexus-one-motoristas-logistica-${getLocalDateKey()}.csv`, driverPerformanceRows)}
            type="button"
          >
            <Download size={15} />
            CSV
          </button>
          <button
            disabled={driverPerformanceRows.length === 0}
            onClick={() => printRowsDocument(`Desempenho por motorista - ${selectedLogisticsBranchLabel}`, driverPerformanceRows, companyName)}
            type="button"
          >
            <Printer size={15} />
            PDF
          </button>
        </div>
      </div>
      <div className="account-plan-grid collection-grid">
        {driverPerformance.length === 0 ? (
          <div className="empty-selection compact">Nenhuma rota com motorista vinculado.</div>
        ) : (
          driverPerformance.slice(0, 8).map((item) => (
            <div className={`account-plan-item driver-performance-card ${item.atrasadas > 0 ? "warning" : "success"}`} key={item.motorista}>
              <span>{item.motorista}</span>
              <strong>{formatNumber(item.entregas)} entrega(s)</strong>
              <small>{formatNumber(item.rotas)} rota(s) / {formatNumber(item.ativas)} ativa(s) / {formatNumber(item.finalizadas)} finalizada(s)</small>
              <small>{formatNumber(item.atrasadas)} atraso(s) / eficiência {formatPercent(item.eficiencia)}%</small>
              <small>Custo por entrega {formatCurrency(item.custoPorEntrega)}</small>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
