import { useState } from "react";

export function createInitialVehicleForm() {
  return {
    placa: "",
    modelo: "",
    marca: "",
    tipo: "UTILITARIO",
    capacidadeKg: "",
  };
}

export function createInitialDriverForm() {
  return {
    nome: "",
    telefone: "",
    cpf: "",
    email: "",
  };
}

export function createInitialCarrierForm() {
  return {
    nome: "",
    documento: "",
    telefone: "",
    email: "",
    site: "",
    observacao: "",
  };
}

export function createInitialRouteForm() {
  return {
    nome: "",
    dataRota: new Date().toISOString().slice(0, 10),
    entregadorId: "",
    veiculoId: "",
    quantidadeEntregas: 0,
    distanciaKm: "",
    custoEstimado: "",
    pagamentoEntrega: "JA_PAGO",
    observacao: "",
    entregaIds: [],
  };
}

export function createInitialRelationForm() {
  return {
    rotaId: "",
    entregadorId: "",
    veiculoId: "",
  };
}

export function useLogisticsPageState() {
  const [savingRoute, setSavingRoute] = useState(null);
  const [savingForm, setSavingForm] = useState("");
  const [message, setMessage] = useState(null);
  const [routeFilter, setRouteFilter] = useState("todas");
  const [routeStatusPages, setRouteStatusPages] = useState({});
  const [showRouteStatusPanel, setShowRouteStatusPanel] = useState(false);
  const [activeLogisticsForm, setActiveLogisticsForm] = useState("rota");
  const [editingRoute, setEditingRoute] = useState(null);
  const [vehicleForm, setVehicleForm] = useState(createInitialVehicleForm);
  const [driverForm, setDriverForm] = useState(createInitialDriverForm);
  const [carrierForm, setCarrierForm] = useState(createInitialCarrierForm);
  const [routeForm, setRouteForm] = useState(createInitialRouteForm);
  const [relationForm, setRelationForm] = useState(createInitialRelationForm);
  const [logisticsBranchFilter, setLogisticsBranchFilter] = useState("TODAS");

  return {
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
  };
}
