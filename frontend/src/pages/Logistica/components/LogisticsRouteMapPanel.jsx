import { Download, Printer } from "lucide-react";
import { StatusBadge } from "../../../components/StatusBadge/StatusBadge";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { formatDate, formatNumber, getLocalDateKey } from "../../../utils/formatters";
import {
  getDeliveryAddress,
  getDeliveryCustomer,
  getRouteDriverName,
  getRouteStatus,
  getRouteVehicleLabel,
} from "../viewModels/logisticsViewModel";

export function LogisticsRouteMapPanel({
  companyName,
  getRouteBranchLabel,
  routeMapCards,
  routeMapRows,
  selectedLogisticsBranchLabel,
}) {
  return (
    <section className="panel account-plan-summary">
      <div className="account-plan-head">
        <div>
          <h3>Mapa operacional de rotas</h3>
          <p>Visão visual de rotas ativas, paradas e risco de atraso sem depender de mapa externo.</p>
        </div>
        <div className="account-plan-actions">
          <button
            disabled={routeMapRows.length === 0}
            onClick={() => downloadCsv(`nexus-one-mapa-rotas-${getLocalDateKey()}.csv`, routeMapRows)}
            type="button"
          >
            <Download size={15} />
            CSV
          </button>
          <button
            disabled={routeMapRows.length === 0}
            onClick={() => printRowsDocument(`Mapa operacional de rotas - ${selectedLogisticsBranchLabel}`, routeMapRows, companyName)}
            type="button"
          >
            <Printer size={15} />
            PDF
          </button>
        </div>
      </div>
      <div className="route-map-grid">
        {routeMapCards.length === 0 ? (
          <div className="empty-selection compact">Nenhuma rota ativa para mapear.</div>
        ) : (
          routeMapCards.map(({ rota, stops, delayed }) => (
            <article className={`route-map-card ${delayed ? "danger" : ""}`} key={rota.id}>
              <div className="route-map-head">
                <span>{rota.nome || "Rota sem nome"}</span>
                <StatusBadge status={delayed ? "ATRASADO" : getRouteStatus(rota)} />
              </div>
              <strong>{getRouteDriverName(rota)}</strong>
              <small>{formatDate(rota.dataRota)} / {getRouteVehicleLabel(rota)} / {getRouteBranchLabel(rota)}</small>
              <div className="route-stop-list">
                {stops.slice(0, 5).map((entrega, index) => (
                  <div className="route-stop" key={entrega.id || `${rota.id}-${index}`}>
                    <em>{index + 1}</em>
                    <span>
                      <strong>{entrega ? getDeliveryCustomer(entrega) : "Parada planejada"}</strong>
                      <small>{entrega ? getDeliveryAddress(entrega) : "Endereço a confirmar"}</small>
                    </span>
                  </div>
                ))}
                {stops.length > 5 && <small>+ {formatNumber(stops.length - 5)} parada(s)</small>}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
