import { LogisticsRouteStatusPanel } from "./LogisticsRouteStatusPanel";
import { LogisticsRouteTablePanel } from "./LogisticsRouteTablePanel";

export function LogisticsRoutesDashboard({
  branchScopedRoutes,
  canEditRoute,
  canPrintRoute,
  companyName,
  entregadores,
  entregasDaRota,
  getRouteBranchLabel,
  getScopedRouteDeliveryCount,
  message,
  onEditRoute,
  onRouteFilterChange,
  onRouteStatus,
  onRouteStatusPageChange,
  onToggleRouteStatusPanel,
  routeFilter,
  routeFilterOptions,
  routeGroups,
  routeStatusPages,
  routeStatusPageSize,
  rotasFiltradas,
  savingRoute,
  selectedRouteFilter,
  showRouteStatusPanel,
  veiculos,
}) {
  return (
    <section className={`dashboard-grid logistics-grid ${showRouteStatusPanel ? "status-open" : "status-closed"}`}>
      <LogisticsRouteTablePanel
        canEditRoute={canEditRoute}
        canPrintRoute={canPrintRoute}
        companyName={companyName}
        entregasDaRota={entregasDaRota}
        getRouteBranchLabel={getRouteBranchLabel}
        getScopedRouteDeliveryCount={getScopedRouteDeliveryCount}
        onEditRoute={onEditRoute}
        onRouteFilterChange={onRouteFilterChange}
        onToggleRouteStatusPanel={onToggleRouteStatusPanel}
        routeFilter={routeFilter}
        routeFilterOptions={routeFilterOptions}
        rotasFiltradas={rotasFiltradas}
        selectedRouteFilter={selectedRouteFilter}
        showRouteStatusPanel={showRouteStatusPanel}
      />

      {showRouteStatusPanel && (
        <LogisticsRouteStatusPanel
          branchScopedRoutes={branchScopedRoutes}
          canPrintRoute={canPrintRoute}
          companyName={companyName}
          entregadores={entregadores}
          entregasDaRota={entregasDaRota}
          getRouteBranchLabel={getRouteBranchLabel}
          getScopedRouteDeliveryCount={getScopedRouteDeliveryCount}
          message={message}
          onRouteStatus={onRouteStatus}
          onRouteStatusPageChange={onRouteStatusPageChange}
          routeGroups={routeGroups}
          routeStatusPages={routeStatusPages}
          routeStatusPageSize={routeStatusPageSize}
          savingRoute={savingRoute}
          veiculos={veiculos}
        />
      )}
    </section>
  );
}
