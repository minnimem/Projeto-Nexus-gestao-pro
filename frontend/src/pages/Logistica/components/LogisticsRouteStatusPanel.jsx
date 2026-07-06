import { Printer, Truck, UserRound } from "lucide-react";
import { StatusBadge } from "../../../components/StatusBadge/StatusBadge";
import { formatDate, formatNumber } from "../../../utils/formatters";
import {
  getRouteDriverName,
  getRoutePaymentLabel,
  getRouteStatus,
  getRouteVehicleLabel,
  printRouteManifest,
} from "../viewModels/logisticsViewModel";

export function LogisticsRouteStatusPanel({
  branchScopedRoutes,
  canPrintRoute,
  companyName,
  entregadores,
  entregasDaRota,
  getRouteBranchLabel,
  getScopedRouteDeliveryCount,
  message,
  onRouteStatus,
  onRouteStatusPageChange,
  routeGroups,
  routeStatusPages,
  routeStatusPageSize,
  savingRoute,
  veiculos,
}) {
  return (
    <aside className="panel side-panel">
      <div className="panel-title compact">
        <div>
          <h2>Rotas por status</h2>
          <p>Fila, em rota e finalizadas no mesmo painel.</p>
        </div>
      </div>

      {message && <p className={`form-message ${message.type}`}>{message.text}</p>}

      <div className="route-list">
        {branchScopedRoutes.length === 0 ? (
          <div className="empty-selection">Nenhuma rota cadastrada.</div>
        ) : (
          routeGroups.map((group) => {
            const totalPages = Math.max(Math.ceil(group.items.length / routeStatusPageSize), 1);
            const currentPage = Math.min(routeStatusPages[group.title] || 0, totalPages - 1);
            const pageStart = currentPage * routeStatusPageSize;
            const visibleRoutes = group.items.slice(pageStart, pageStart + routeStatusPageSize);

            return (
              <section className="route-section" key={group.title}>
                <div className="route-section-title">
                  <strong>{group.title}</strong>
                  <span>{formatNumber(group.items.length)}</span>
                </div>
                <p>{group.detail}</p>

                {group.items.length === 0 ? (
                  <div className="empty-selection compact">Nenhuma rota neste status.</div>
                ) : (
                  <>
                    {visibleRoutes.map((rota) => {
                      const status = getRouteStatus(rota);
                      return (
                        <div className="route-card" key={rota.id}>
                          <div>
                            <strong>{rota.nome}</strong>
                            <small>
                              {formatDate(rota.dataRota)} / {formatNumber(getScopedRouteDeliveryCount(rota))} entregas / {getRoutePaymentLabel(rota)}
                            </small>
                            <small>{getRouteBranchLabel(rota)}</small>
                          </div>
                          <StatusBadge status={status} />
                          <div className="route-meta">
                            <span>
                              <UserRound size={14} />
                              {getRouteDriverName(rota)}
                            </span>
                            <span>
                              <Truck size={14} />
                              {getRouteVehicleLabel(rota)}
                            </span>
                          </div>
                          <div className="table-actions route-actions">
                            {canPrintRoute && (
                              <button
                                onClick={() =>
                                  printRouteManifest(
                                    { ...rota, entregas: entregasDaRota(rota) },
                                    companyName,
                                  )
                                }
                                type="button"
                              >
                                Imprimir
                              </button>
                            )}
                            <button
                              disabled={savingRoute === rota.id || status === "EM_ANDAMENTO" || status === "FINALIZADA"}
                              onClick={() => onRouteStatus(rota.id, "EM_ANDAMENTO")}
                              type="button"
                            >
                              Iniciar
                            </button>
                            <button
                              disabled={savingRoute === rota.id || status === "FINALIZADA"}
                              onClick={() => onRouteStatus(rota.id, "FINALIZADA")}
                              type="button"
                            >
                              Finalizar
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {totalPages > 1 && (
                      <div className="route-pagination">
                        <button
                          disabled={currentPage === 0}
                          onClick={() => onRouteStatusPageChange(group.title, Math.max(currentPage - 1, 0))}
                          type="button"
                        >
                          Anterior
                        </button>
                        <span>
                          {formatNumber(currentPage + 1)} / {formatNumber(totalPages)}
                        </span>
                        <button
                          disabled={currentPage >= totalPages - 1}
                          onClick={() => onRouteStatusPageChange(group.title, Math.min(currentPage + 1, totalPages - 1))}
                          type="button"
                        >
                          Proxima
                        </button>
                      </div>
                    )}
                  </>
                )}
              </section>
            );
          })
        )}
      </div>

      <div className="fleet-strip">
        <div>
          <span>Veículos ativos</span>
          <strong>{formatNumber(veiculos.length)}</strong>
        </div>
        <div>
          <span>Equipe ativa</span>
          <strong>{formatNumber(entregadores.length)}</strong>
        </div>
      </div>
    </aside>
  );
}
