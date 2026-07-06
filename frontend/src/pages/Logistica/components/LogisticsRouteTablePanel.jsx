import { Pencil, Printer, Route } from "lucide-react";
import { TableEmptyState } from "../../../components/common/StatusUi";
import { StatusBadge } from "../../../components/StatusBadge/StatusBadge";
import { formatDate, formatNumber } from "../../../utils/formatters";
import {
  getDeliveryCustomer,
  getDeliveryOrderNumber,
  getRouteDriverName,
  getRoutePaymentLabel,
  getRouteStatus,
  getRouteVehicleLabel,
  printDeliveryReceipt,
  printRouteManifest,
} from "../viewModels/logisticsViewModel";

export function LogisticsRouteTablePanel({
  canEditRoute,
  canPrintRoute,
  companyName,
  entregasDaRota,
  getRouteBranchLabel,
  getScopedRouteDeliveryCount,
  onEditRoute,
  onRouteFilterChange,
  onToggleRouteStatusPanel,
  routeFilter,
  routeFilterOptions,
  rotasFiltradas,
  selectedRouteFilter,
  showRouteStatusPanel,
}) {
  return (
    <article className="panel orders-panel">
      <div className="panel-title">
        <div>
          <h2>Rotas logísticas</h2>
          <p>Filtre abertas, em rota e finalizadas vindas do Spring Boot.</p>
        </div>
        <div className="panel-actions">
          <span>{rotasFiltradas.length} rotas</span>
          <button
            className="panel-action-button light"
            onClick={onToggleRouteStatusPanel}
            type="button"
          >
            <Route size={15} />
            {showRouteStatusPanel ? "Ocultar status" : "Rotas por status"}
          </button>
        </div>
      </div>

      <div className="route-filter-bar" aria-label="Filtrar rotas por status">
        {routeFilterOptions.map((option) => (
          <button
            className={routeFilter === option.value ? "active" : ""}
            key={option.value}
            onClick={() => onRouteFilterChange(option.value)}
            type="button"
          >
            <span>{option.label}</span>
            <strong>{formatNumber(option.items.length)}</strong>
          </button>
        ))}
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Rota</th>
              <th>Filial</th>
              <th>Status</th>
              <th>Motorista</th>
              <th>Veículo</th>
              <th>Data</th>
              <th>Pagamento</th>
              <th>Entregas</th>
              <th>Acao</th>
            </tr>
          </thead>
          <tbody>
            {rotasFiltradas.length === 0 ? (
              <TableEmptyState
                colSpan="9"
                icon={Route}
                title={selectedRouteFilter.empty}
                detail="Crie uma rota ou altere o filtro para acompanhar entregas."
              />
            ) : (
              rotasFiltradas.map((rota) => (
                <tr key={rota.id}>
                  <td>
                    <strong>{rota.nome || "Rota sem nome"}</strong>
                    <small>{rota.id}</small>
                  </td>
                  <td>{getRouteBranchLabel(rota)}</td>
                  <td>
                    <StatusBadge status={getRouteStatus(rota)} />
                  </td>
                  <td>
                    <strong>{getRouteDriverName(rota)}</strong>
                    <small>{rota.entregador.telefone || "Sem telefone"}</small>
                  </td>
                  <td>{getRouteVehicleLabel(rota)}</td>
                  <td>{formatDate(rota.dataRota)}</td>
                  <td>
                    <StatusBadge
                      label={getRoutePaymentLabel(rota)}
                      status={["PAGAR_NA_ENTREGA", "RECEBER_RETORNO"].includes(rota.pagamentoEntrega) ? "PENDENTE" : "PAGO"}
                    />
                  </td>
                  <td>
                    <strong>{formatNumber(getScopedRouteDeliveryCount(rota))}</strong>
                    {entregasDaRota(rota).slice(0, 2).map((entrega) => (
                      <small key={entrega.id}>
                        {getDeliveryOrderNumber(entrega)} - {getDeliveryCustomer(entrega)}
                        {canPrintRoute && (
                          <button
                            className="inline-icon-button"
                            onClick={() => printDeliveryReceipt(entrega, rota, companyName)}
                            title="Imprimir comprovante de entrega"
                            type="button"
                          >
                            <Printer size={12} />
                          </button>
                        )}
                      </small>
                    ))}
                  </td>
                  <td>
                    <div className="table-actions compact-actions">
                      {canEditRoute && (
                        <button
                          className="table-icon-button"
                          onClick={() => onEditRoute(rota)}
                          title="Editar rota"
                          type="button"
                        >
                          <Pencil size={15} />
                        </button>
                      )}
                      {canPrintRoute && (
                        <button
                          className="table-icon-button"
                          onClick={() =>
                            printRouteManifest(
                              { ...rota, entregas: entregasDaRota(rota) },
                              companyName,
                            )
                          }
                          title="Imprimir romaneio"
                          type="button"
                        >
                          <Printer size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </article>
  );
}
