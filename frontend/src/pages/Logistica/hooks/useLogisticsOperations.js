import { endpoints } from "../../../services/resources.js";
import {
  createInitialCarrierForm,
  createInitialDriverForm,
  createInitialRelationForm,
  createInitialRouteForm,
  createInitialVehicleForm,
} from "./useLogisticsPageState.js";
import {
  buildCarrierPayload,
  buildDriverPayload,
  buildRouteEditForm,
  buildRoutePayload,
  buildVehiclePayload,
  getLogisticsDispatchState,
  getRouteSaveMessage,
  validateCarrierForm,
  validateDriverForm,
  validateRouteForm,
  validateRouteRelationForm,
  validateVehicleForm,
} from "../services/logisticsRules.js";

export function useLogisticsOperations({
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
}) {
  async function handleRouteStatus(rotaId, status) {
    setSavingRoute(rotaId);
    setMessage(null);

    try {
      await endpoints.logistica.atualizarStatusRota(rotaId, status);
      setMessage({ type: "success", text: "Status da rota atualizado." });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSavingRoute(null);
    }
  }

  async function handleCreateVehicle(event) {
    event.preventDefault();

    const validationError = validateVehicleForm(vehicleForm);
    if (validationError) {
      setMessage({ type: "error", text: validationError });
      return;
    }

    setSavingForm("veiculo");
    setMessage(null);

    try {
      await endpoints.logistica.criarVeiculo(buildVehiclePayload(vehicleForm));
      setVehicleForm(createInitialVehicleForm());
      setMessage({ type: "success", text: "Veículo cadastrado." });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSavingForm("");
    }
  }

  async function handleCreateDriver(event) {
    event.preventDefault();

    const validationError = validateDriverForm(driverForm);
    if (validationError) {
      setMessage({ type: "error", text: validationError });
      return;
    }

    setSavingForm("entregador");
    setMessage(null);

    try {
      await endpoints.logistica.criarEntregador(buildDriverPayload(driverForm));
      setDriverForm(createInitialDriverForm());
      setMessage({ type: "success", text: "Entregador cadastrado." });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSavingForm("");
    }
  }

  async function handleCreateCarrier(event) {
    event.preventDefault();

    const validationError = validateCarrierForm(carrierForm);
    if (validationError) {
      setMessage({ type: "error", text: validationError });
      return;
    }

    setSavingForm("transportadora");
    setMessage(null);

    try {
      await endpoints.logistica.criarTransportadora(buildCarrierPayload(carrierForm));
      setCarrierForm(createInitialCarrierForm());
      setMessage({ type: "success", text: "Transportadora cadastrada." });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSavingForm("");
    }
  }

  async function handleCreateRoute(event) {
    event.preventDefault();
    const isEditing = Boolean(editingRoute?.id);

    const validationError = validateRouteForm(routeForm);
    if (validationError) {
      setMessage({ type: "error", text: validationError });
      return;
    }

    setSavingForm("rota");
    setMessage(null);

    try {
      const routePayload = buildRoutePayload({ editingRoute: editingRoute || {}, routeForm });
      const rotaSalva = isEditing
        ? await endpoints.logistica.atualizarRota(editingRoute.id, routePayload)
        : await endpoints.logistica.criarRota(routePayload);

      if (rotaSalva.id && routeForm.entregadorId) {
        await endpoints.logistica.vincularEntregadorRota(rotaSalva.id, routeForm.entregadorId);
      }

      if (rotaSalva.id && routeForm.veiculoId) {
        await endpoints.logistica.vincularVeiculoRota(rotaSalva.id, routeForm.veiculoId);
      }

      if (rotaSalva.id) {
        await endpoints.logistica.vincularEntregasRota(rotaSalva.id, routeForm.entregaIds);
      }

      setEditingRoute(null);
      setRouteForm(createInitialRouteForm());
      setMessage({ type: "success", text: getRouteSaveMessage(isEditing) });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSavingForm("");
    }
  }

  function handleEditRoute(rota) {
    setEditingRoute(rota);
    setActiveLogisticsForm("rota");
    setMessage(null);
    setRouteForm(buildRouteEditForm({ entregasDaRota, rota }));
  }

  function cancelRouteEdit() {
    setEditingRoute(null);
    setRouteForm(createInitialRouteForm());
  }

  async function handleLinkRouteAssets(event) {
    event.preventDefault();

    const validationError = validateRouteRelationForm(relationForm);
    if (validationError) {
      setMessage({ type: "error", text: validationError });
      return;
    }

    setSavingForm("relacao");
    setMessage(null);

    try {
      if (relationForm.entregadorId) {
        await endpoints.logistica.vincularEntregadorRota(
          relationForm.rotaId,
          relationForm.entregadorId,
        );
      }

      if (relationForm.veiculoId) {
        await endpoints.logistica.vincularVeiculoRota(relationForm.rotaId, relationForm.veiculoId);
      }

      setRelationForm(createInitialRelationForm());
      setMessage({ type: "success", text: "Motorista e veículo relacionados à rota." });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSavingForm("");
    }
  }

  function handleDispatchAction(action) {
    const nextState = getLogisticsDispatchState(action);
    if (nextState.routeFilter) setRouteFilter(nextState.routeFilter);
    if (nextState.activeLogisticsForm) setActiveLogisticsForm(nextState.activeLogisticsForm);
    if (nextState.showRouteStatusPanel) setShowRouteStatusPanel(true);
  }

  return {
    cancelRouteEdit,
    handleCreateCarrier,
    handleCreateDriver,
    handleCreateRoute,
    handleCreateVehicle,
    handleDispatchAction,
    handleEditRoute,
    handleLinkRouteAssets,
    handleRouteStatus,
  };
}
