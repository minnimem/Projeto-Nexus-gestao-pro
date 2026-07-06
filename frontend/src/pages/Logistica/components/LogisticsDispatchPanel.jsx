import { Download, Printer } from "lucide-react";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { formatCurrency, formatNumber, getLocalDateKey } from "../../../utils/formatters";

export function LogisticsDispatchPanel({
  companyName,
  custoPorEntrega,
  entregasPlanejadas,
  entregasSemRota,
  logisticsDispatchPlan,
  logisticsDispatchRows,
  onDispatchAction,
  rotasAtrasadas,
  selectedLogisticsBranchLabel,
}) {
  const alerts =
    logisticsDispatchPlan.length > 0
      logisticsDispatchPlan
      : [
          {
            key: "dispatch-ok",
            severity: "success",
            title: "Despacho sem bloqueios imediatos",
            detail: "Rotas e entregas carregadas não indicam atraso ou falta de vínculo.",
            actionLabel: "",
            action: "",
          },
        ];

  return (
    <section className="panel compact-alert-panel">
      <div className="panel-title compact">
        <div>
          <h2>Central de despacho</h2>
          <p>Prioridades para liberar rotas, corrigir atrasos e fechar romaneios.</p>
        </div>
        <div className="account-plan-actions">
          <button
            disabled={logisticsDispatchRows.length === 0}
            onClick={() => downloadCsv(`nexus-one-despacho-logistico-${getLocalDateKey()}.csv`, logisticsDispatchRows)}
            type="button"
          >
            <Download size={15} />
            CSV
          </button>
          <button
            disabled={logisticsDispatchRows.length === 0}
            onClick={() => printRowsDocument(`Central de despacho - ${selectedLogisticsBranchLabel}`, logisticsDispatchRows, companyName)}
            type="button"
          >
            <Printer size={15} />
            PDF
          </button>
        </div>
      </div>
      <div className="reconciliation-grid compact-metrics-grid">
        <div>
          <span>Entregas sem rota</span>
          <strong>{formatNumber(entregasSemRota.length)}</strong>
          <small>Disponíveis para planejamento</small>
        </div>
        <div>
          <span>Rotas atrasadas</span>
          <strong className={rotasAtrasadas.length > 0 ? "danger-text" : "success-text"}>{formatNumber(rotasAtrasadas.length)}</strong>
          <small>Rotas ativas antes de hoje</small>
        </div>
        <div>
          <span>Custo por entrega</span>
          <strong>{formatCurrency(custoPorEntrega)}</strong>
          <small>{formatNumber(entregasPlanejadas)} entrega(s) planejadas</small>
        </div>
      </div>
      <div className="compact-alert-list">
        {alerts.map((item) => (
          <div className={`compact-alert-card ${item.severity}`} key={item.key}>
            <span>
              <strong>{item.title}</strong>
              <small>{item.detail}</small>
            </span>
            {item.action && (
              <button onClick={() => onDispatchAction(item.action)} type="button">
                {item.actionLabel}
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
