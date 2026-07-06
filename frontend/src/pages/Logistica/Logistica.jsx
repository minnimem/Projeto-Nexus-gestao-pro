import {
  MapPinned,
  Navigation,
  PackageCheck,
  Route,
  Truck,
  UserRound,
} from "lucide-react";
import { KpiCard } from "../../components/common/KpiCard";
import { canPerform } from "../../utils/permissions";
import {
  asList,
  formatCurrency,
  formatNumber,
} from "../../utils/formatters";
import { LogisticsDeliveryStatusPanel } from "./components/LogisticsDeliveryStatusPanel";
import { LogisticsDispatchPanel } from "./components/LogisticsDispatchPanel";
import { LogisticsCarrierForm } from "./components/LogisticsCarrierForm";
import { LogisticsDriverForm } from "./components/LogisticsDriverForm";
import { LogisticsDriverPerformancePanel } from "./components/LogisticsDriverPerformancePanel";
import { LogisticsOperationalFilterPanel } from "./components/LogisticsOperationalFilterPanel";
import { LogisticsRelationForm } from "./components/LogisticsRelationForm";
import { LogisticsRouteForm } from "./components/LogisticsRouteForm";
import { LogisticsRouteMapPanel } from "./components/LogisticsRouteMapPanel";
import { LogisticsRoutesDashboard } from "./components/LogisticsRoutesDashboard";
import { LogisticsTimelinePanel } from "./components/LogisticsTimelinePanel";
import { LogisticsVehicleForm } from "./components/LogisticsVehicleForm";
import {
  buildLogisticsViewModel,
} from "./viewModels/logisticsViewModel";
import { useLogisticsOperations } from "./hooks/useLogisticsOperations";
import { useLogisticsPageState } from "./hooks/useLogisticsPageState";
import "./Logistica.css";


export function Logistica({ data, session, onRefresh }) {
  const {
    activeLogisticsForm,
    carrierForm,
    driverForm,
    editingRoute,
    logisticsBranchFilter,
    message,
    relationForm,
    routeFilter,
    routeForm,
    routeStatusPages,
    savingForm,
    savingRoute,
    setActiveLogisticsForm,
    setCarrierForm,
    setDriverForm,
    setEditingRoute,
    setLogisticsBranchFilter,
    setMessage,
    setRelationForm,
    setRouteFilter,
    setRouteForm,
    setRouteStatusPages,
    setSavingForm,
    setSavingRoute,
    setShowRouteStatusPanel,
    setVehicleForm,
    showRouteStatusPanel,
    vehicleForm,
  } = useLogisticsPageState();
  const rotas = asList(data.rotas);
  const entregas = asList(data.entregas);
  const veiculos = asList(data.veiculos);
  const entregadores = asList(data.entregadores);
  const transportadoras = asList(data.transportadoras);
  const filiais = asList(data.filiais);
  const routeStatusPageSize = 3;
  const canEditRoute = canPerform(session, "editRoute");
  const canPrintRoute = canPerform(session, "printRoute");

  const {
    branchScopedRoutes,
    custoEstimado,
    custoPorEntrega,
    deliveryStatusColumns,
    deliveryStatusRows,
    driverPerformance,
    driverPerformanceRows,
    entregasDaRota,
    entregasDisponiveis,
    entregasPlanejadas,
    entregasSemRota,
    getRouteBranchLabel,
    getScopedRouteDeliveryCount,
    logisticsDispatchPlan,
    logisticsDispatchRows,
    logisticsExportRows,
    logisticsTimeline,
    logisticsTimelineRows,
    routeFilterOptions,
    routeGroups,
    routeMapCards,
    routeMapRows,
    rotasAtrasadas,
    rotasAtivas,
    rotasEmRota,
    rotasFila,
    rotasFiltradas,
    rotasFinalizadas,
    selectedLogisticsBranchLabel,
    selectedRouteFilter,
  } = buildLogisticsViewModel({
    entregas,
    filiais,
    logisticsBranchFilter,
    rotas,
    routeFilter,
    routeFormEntregaIds: routeForm.entregaIds,
  });
  const logisticsFormOptions = [
    { value: "veiculo", label: "Veículo", icon: Truck },
    { value: "entregador", label: "Entregador", icon: UserRound },
    { value: "transportadora", label: "Transportadora", icon: PackageCheck },
    { value: "rota", label: "Rota", icon: MapPinned },
    { value: "relacao", label: "Relacionar", icon: Route },
  ];
  const {
    cancelRouteEdit,
    handleCreateCarrier,
    handleCreateDriver,
    handleCreateRoute,
    handleCreateVehicle,
    handleDispatchAction,
    handleEditRoute,
    handleLinkRouteAssets,
    handleRouteStatus,
  } = useLogisticsOperations({
    carrierForm,
    driverForm,
    editingRoute,
    entregasDaRota,
    onRefresh,
    relationForm,
    routeForm,
    setActiveLogisticsForm,
    setCarrierForm,
    setDriverForm,
    setEditingRoute,
    setMessage,
    setRelationForm,
    setRouteFilter,
    setRouteForm,
    setSavingForm,
    setSavingRoute,
    setShowRouteStatusPanel,
    setVehicleForm,
    vehicleForm,
  });
  return (
    <div className="dashboard-view logistics-view">
      <section className="kpi-grid">
        <KpiCard
          icon={PackageCheck}
          label="Fila"
          value={formatNumber(rotasFila.length)}
          detail={`${formatNumber(entregasPlanejadas)} entregas planejadas / ${selectedLogisticsBranchLabel}`}
          tone="blue"
        />
        <KpiCard
          icon={Navigation}
          label="Em rota"
          value={formatNumber(rotasEmRota.length)}
          detail={`${formatNumber(rotasAtivas)} rotas ativas`}
          tone="amber"
        />
        <KpiCard
          icon={MapPinned}
          label="Finalizadas"
          value={formatNumber(rotasFinalizadas.length)}
          detail={`Custo previsto ${formatCurrency(custoEstimado)}`}
          tone="dark"
        />
        <KpiCard
          icon={Truck}
          label="Frota ativa"
          value={formatNumber(veiculos.length)}
          detail={`${formatNumber(entregadores.length)} entregadores / ${formatNumber(transportadoras.length)} transportadoras`}
          tone="green"
        />
      </section>

      <LogisticsOperationalFilterPanel
        companyName={session.empresa || "Nexus One"}
        exportRows={logisticsExportRows}
        filiais={filiais}
        logisticsBranchFilter={logisticsBranchFilter}
        onLogisticsBranchFilterChange={setLogisticsBranchFilter}
      />

      <LogisticsDispatchPanel
        companyName={session.empresa || "Nexus One"}
        custoPorEntrega={custoPorEntrega}
        entregasPlanejadas={entregasPlanejadas}
        entregasSemRota={entregasSemRota}
        logisticsDispatchPlan={logisticsDispatchPlan}
        logisticsDispatchRows={logisticsDispatchRows}
        onDispatchAction={handleDispatchAction}
        rotasAtrasadas={rotasAtrasadas}
        selectedLogisticsBranchLabel={selectedLogisticsBranchLabel}
      />

      <LogisticsDeliveryStatusPanel
        companyName={session.empresa || "Nexus One"}
        deliveryStatusColumns={deliveryStatusColumns}
        deliveryStatusRows={deliveryStatusRows}
        selectedLogisticsBranchLabel={selectedLogisticsBranchLabel}
      />

      <LogisticsDriverPerformancePanel
        companyName={session.empresa || "Nexus One"}
        driverPerformance={driverPerformance}
        driverPerformanceRows={driverPerformanceRows}
        selectedLogisticsBranchLabel={selectedLogisticsBranchLabel}
      />

      <LogisticsTimelinePanel
        companyName={session.empresa || "Nexus One"}
        logisticsTimeline={logisticsTimeline}
        logisticsTimelineRows={logisticsTimelineRows}
        selectedLogisticsBranchLabel={selectedLogisticsBranchLabel}
      />

      <LogisticsRouteMapPanel
        companyName={session.empresa || "Nexus One"}
        getRouteBranchLabel={getRouteBranchLabel}
        routeMapCards={routeMapCards}
        routeMapRows={routeMapRows}
        selectedLogisticsBranchLabel={selectedLogisticsBranchLabel}
      />

      <LogisticsRoutesDashboard
        branchScopedRoutes={branchScopedRoutes}
        canEditRoute={canEditRoute}
        canPrintRoute={canPrintRoute}
        companyName={session.empresa || "Nexus One"}
        entregadores={entregadores}
        entregasDaRota={entregasDaRota}
        getRouteBranchLabel={getRouteBranchLabel}
        getScopedRouteDeliveryCount={getScopedRouteDeliveryCount}
        message={message}
        onEditRoute={handleEditRoute}
        onRouteFilterChange={setRouteFilter}
        onRouteStatus={handleRouteStatus}
        onRouteStatusPageChange={(title, page) =>
          setRouteStatusPages((prev) => ({
            ...prev,
            [title]: page,
          }))
        }
        onToggleRouteStatusPanel={() => setShowRouteStatusPanel((prev) => !prev)}
        routeFilter={routeFilter}
        routeFilterOptions={routeFilterOptions}
        routeGroups={routeGroups}
        routeStatusPages={routeStatusPages}
        routeStatusPageSize={routeStatusPageSize}
        rotasFiltradas={rotasFiltradas}
        savingRoute={savingRoute}
        selectedRouteFilter={selectedRouteFilter}
        showRouteStatusPanel={showRouteStatusPanel}
        veiculos={veiculos}
      />
      <section className="panel logistics-workbench">
        <div className="panel-title">
          <div>
            <h2>Operações logísticas</h2>
            <p>Cadastros e vínculos em uma tela compacta.</p>
          </div>
        </div>

        <div className="logistics-action-tabs" aria-label="Selecionar operação logística">
          {logisticsFormOptions.map(({ value, label, icon: Icon }) => (
            <button
              className={activeLogisticsForm === value ? "active" : ""}
              key={value}
              onClick={() => {
                setMessage(null);
                setActiveLogisticsForm(value);
              }}
              type="button"
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </div>

        <div className="logistics-form-shell">
        {activeLogisticsForm === "veiculo" && (
          <LogisticsVehicleForm
            form={vehicleForm}
            onFormChange={setVehicleForm}
            onSubmit={handleCreateVehicle}
            savingForm={savingForm}
          />
        )}

        {activeLogisticsForm === "entregador" && (
          <LogisticsDriverForm
            form={driverForm}
            onFormChange={setDriverForm}
            onSubmit={handleCreateDriver}
            savingForm={savingForm}
          />
        )}

        {activeLogisticsForm === "transportadora" && (
          <LogisticsCarrierForm
            form={carrierForm}
            onFormChange={setCarrierForm}
            onSubmit={handleCreateCarrier}
            savingForm={savingForm}
            transportadoras={transportadoras}
          />
        )}
        {activeLogisticsForm === "rota" && (
          <LogisticsRouteForm
            canPrintRoute={canPrintRoute}
            companyName={session.empresa || "Nexus One"}
            editingRoute={editingRoute}
            entregadores={entregadores}
            entregasDisponiveis={entregasDisponiveis}
            form={routeForm}
            onCancelEdit={cancelRouteEdit}
            onFormChange={setRouteForm}
            onSubmit={handleCreateRoute}
            savingForm={savingForm}
            veiculos={veiculos}
          />
        )}

        {activeLogisticsForm === "relacao" && (
          <LogisticsRelationForm
            branchScopedRoutes={branchScopedRoutes}
            entregadores={entregadores}
            form={relationForm}
            getRouteBranchLabel={getRouteBranchLabel}
            onFormChange={setRelationForm}
            onSubmit={handleLinkRouteAssets}
            savingForm={savingForm}
            veiculos={veiculos}
          />
        )}
        </div>
      </section>
    </div>
  );
}








