import { useState } from "react";
import { createEmptyMixedPayments } from "../../../utils/payments.js";

export function useCashRegisterState({ caixa, loadWarning }) {
  const [pendingSearch, setPendingSearch] = useState("");
  const [selectedPendingOrderId, setSelectedPendingOrderId] = useState("");
  const [cashBranchFilter, setCashBranchFilter] = useState("TODAS");
  const [openForm, setOpenForm] = useState({ valorInicial: "0", observacao: "" });
  const [movementForm, setMovementForm] = useState({
    tipo: "pagamentoRecebido",
    valor: "",
    metodoPagamento: "PIX",
    parcelas: 1,
    descricao: "",
    observacao: "",
  });
  const [closeForm, setCloseForm] = useState({ valorFechamento: "", observacao: "" });
  const [cashAction, setCashAction] = useState("");
  const [cashView, setCashView] = useState(caixa ? "pdv" : "movimentos");
  const [cashExpanded, setCashExpanded] = useState(false);
  const [selectedCashReport, setSelectedCashReport] = useState(null);
  const [cashHistoryFilter, setCashHistoryFilter] = useState({
    busca: "",
    status: "TODOS",
    inicio: "",
    fim: "",
  });
  const [saving, setSaving] = useState("");
  const [receivingOrder, setReceivingOrder] = useState("");
  const [generatingCharge, setGeneratingCharge] = useState("");
  const [selectedCashCharge, setSelectedCashCharge] = useState(null);
  const [lastCashReceipt, setLastCashReceipt] = useState(null);
  const [receivePaymentForm, setReceivePaymentForm] = useState({
    metodoPagamento: "PIX",
    parcelas: 1,
    pagamentos: createEmptyMixedPayments(),
    valorRecebido: "",
  });
  const [message, setMessage] = useState(
    loadWarning ? { type: "error", text: loadWarning } : null,
  );

  return {
    cashAction,
    cashBranchFilter,
    cashExpanded,
    cashHistoryFilter,
    cashView,
    closeForm,
    generatingCharge,
    lastCashReceipt,
    message,
    movementForm,
    openForm,
    pendingSearch,
    receivePaymentForm,
    receivingOrder,
    saving,
    selectedCashCharge,
    selectedCashReport,
    selectedPendingOrderId,
    setCashAction,
    setCashBranchFilter,
    setCashExpanded,
    setCashHistoryFilter,
    setCashView,
    setCloseForm,
    setGeneratingCharge,
    setLastCashReceipt,
    setMessage,
    setMovementForm,
    setOpenForm,
    setPendingSearch,
    setReceivePaymentForm,
    setReceivingOrder,
    setSaving,
    setSelectedCashCharge,
    setSelectedCashReport,
    setSelectedPendingOrderId,
  };
}
