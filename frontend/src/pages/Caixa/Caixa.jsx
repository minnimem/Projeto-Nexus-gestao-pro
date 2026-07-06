import { useEffect } from "react";
import {
  CheckCircle2,
  CreditCard,
  FileText,
  Loader2,
  Plus,
  ReceiptText,
  Search,
  ShoppingCart,
  WalletCards,
} from "lucide-react";
import { StatusBadge } from "../../components/StatusBadge/StatusBadge.jsx";
import {
  formatCurrency,
  formatDate,
} from "../../utils/formatters.js";
import {
  canInstallmentPayment,
  cashPaymentOptions,
  createEmptyMixedPayments,
} from "../../utils/payments.js";
import "../Pedidos/styles/pointOfSale.css";
import { CashClosingReportSection } from "./components/CashClosingReportSection.jsx";
import { CashHistorySection } from "./components/CashHistorySection.jsx";
import { CashManagementPanel } from "./components/CashManagementPanel.jsx";
import { CashMovementForm } from "./components/CashMovementForm.jsx";
import { CashOpenForm } from "./components/CashOpenForm.jsx";
import { CashOperationSummary } from "./components/CashOperationSummary.jsx";
import { CashPendingOrdersSection } from "./components/CashPendingOrdersSection.jsx";
import { CashRecentMovementsSection } from "./components/CashRecentMovementsSection.jsx";
import { CashTerminalHeader } from "./components/CashTerminalHeader.jsx";
import { CashViewSwitch } from "./components/CashViewSwitch.jsx";
import { PendingPaymentsPanel } from "./components/PendingPaymentsPanel.jsx";
import { useCashRegisterDashboardData } from "./hooks/useCashRegisterDashboardData.js";
import { useCashRegisterOperations } from "./hooks/useCashRegisterOperations.js";
import { useCashRegisterState } from "./hooks/useCashRegisterState.js";
import "./Caixa.css";


export function Caixa({ data, session, onRefresh }) {
  const currentCash = data.aberto || null;
  const {
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
  } = useCashRegisterState({ caixa: currentCash, loadWarning: data.loadWarning });
  const {
    branchScopedPendingOrders,
    caixa,
    canOperate,
    cashClosingRows,
    cashHistoryRows,
    cashHistoryTotals,
    cashMovementRows,
    cashStatusCards,
    clientes,
    closeConciliationRows,
    closeDifference,
    closeDifferenceOk,
    displayedCashReport,
    filteredCashHistory,
    filteredPendingOrders,
    filiais,
    paymentReportRows,
    paymentReportTotal,
    pedidosPendentes,
    produtos,
    recentes,
    receiveMixedDifference,
    receivePaymentDetail,
    receivePaymentReady,
    selectedCashBranchLabel,
    selectedOrderTotal,
    selectedPendingOrder,
    todayPaymentMovements,
  } = useCashRegisterDashboardData({
    cashBranchFilter,
    cashHistoryFilter,
    closeForm,
    data,
    pendingSearch,
    receivePaymentForm,
    selectedCashReport,
    selectedPendingOrderId,
    session,
  });
  const {
    copyCashChargeText,
    handleCloseCash,
    handleGeneratePendingOrderCharge,
    handleMovement,
    handleOpenCash,
    handleReceiveOrder,
    handleViewCashReport,
  } = useCashRegisterOperations({
    caixa,
    canOperate,
    closeForm,
    movementForm,
    onRefresh,
    openForm,
    receivePaymentForm,
    selectedCashBranchLabel,
    selectedOrderTotal,
    selectedPendingOrder,
    session,
    setCashAction,
    setCashView,
    setCloseForm,
    setGeneratingCharge,
    setLastCashReceipt,
    setMessage,
    setMovementForm,
    setOpenForm,
    setReceivingOrder,
    setSaving,
    setSelectedCashCharge,
    setSelectedCashReport,
  });

  useEffect(() => {
    if (selectedPendingOrder) {
      const metodoPagamento = selectedPendingOrder.metodoPagamento || "PIX";
      setReceivePaymentForm({
        metodoPagamento,
        parcelas: canInstallmentPayment(metodoPagamento)
          ?
          Number(selectedPendingOrder.parcelasPagamento || 1)
          : 1,
        pagamentos: createEmptyMixedPayments(),
        valorRecebido: "",
      });
    }
  }, [selectedPendingOrder?.id, setReceivePaymentForm]);

  useEffect(() => {
    if (!caixa && cashView === "pdv") {
      setCashView("movimentos");
    }
  }, [caixa, cashView]);

  useEffect(() => {
    if (!selectedPendingOrderId && filteredPendingOrders[0]?.id) {
      setSelectedPendingOrderId(filteredPendingOrders[0].id);
      return;
    }

    if (
      selectedPendingOrderId &&
      !filteredPendingOrders.some((pedido) => String(pedido.id) === String(selectedPendingOrderId))
    ) {
      setSelectedPendingOrderId(filteredPendingOrders[0]?.id || "");
    }
  }, [filteredPendingOrders, selectedPendingOrderId]);

  useEffect(() => {
    function handleCashExpandShortcut(event) {
      if (event.key === "F11") {
        event.preventDefault();
        setCashExpanded((current) => !current);
      }
    }

    window.addEventListener("keydown", handleCashExpandShortcut);
    return () => window.removeEventListener("keydown", handleCashExpandShortcut);
  }, []);

  return (
    <div className={`dashboard-view cash-register-screen ${cashExpanded ? "cash-expanded" : ""}`}>
      {message && (
        <div className={message.type === "error" ? "error-box" : "success-box"}>
          {message.text}
        </div>
      )}
      <CashTerminalHeader
        caixa={caixa}
        cashExpanded={cashExpanded}
        onToggleExpanded={() => setCashExpanded((current) => !current)}
        session={session}
      />

      <section className="cash-filter-strip">
        <div>
          <strong>Filial operacional</strong>
          <span>{selectedCashBranchLabel}</span>
        </div>
        <label className="commission-config-control">
          <span>Filial</span>
          <select value={cashBranchFilter} onChange={(event) => setCashBranchFilter(event.target.value)}>
            <option value="TODAS">Todas as filiais</option>
            <option value="EMPRESA">Empresa / sem filial</option>
            {filiais.map((filial) => (
              <option key={filial.id} value={filial.id}>
                {filial.matriz ? "Matriz" : "Filial"} - {filial.nome}
              </option>
            ))}
          </select>
        </label>
      </section>
      <CashOperationSummary
        caixa={caixa}
        cashStatusCards={cashStatusCards}
        lastCashReceipt={lastCashReceipt}
        paymentReportRows={paymentReportRows}
        paymentReportTotal={paymentReportTotal}
        session={session}
        todayPaymentMovements={todayPaymentMovements}
      />

      {!caixa && cashView === "pdv" && (
        <section className="panel open-cash-terminal">
          <div>
            <h2>Abrir caixa</h2>
            <p>Informe o fundo inicial para liberar o PDV.</p>
          </div>
          <CashOpenForm
            canOperate={canOperate}
            onOpenCash={handleOpenCash}
            openForm={openForm}
            saving={saving}
            setOpenForm={setOpenForm}
          />
        </section>
      )}
      <CashViewSwitch
        caixa={caixa}
        cashExpanded={cashExpanded}
        cashView={cashView}
        onToggleExpanded={() => setCashExpanded((current) => !current)}
        setCashView={setCashView}
      />

      {cashView === "pdv" ? (
        <>
          <PendingPaymentsPanel
            caixa={caixa}
            canOperate={canOperate}
            charge={selectedCashCharge}
            filteredPendingOrders={filteredPendingOrders}
            generatingCharge={generatingCharge}
            onCopyCharge={copyCashChargeText}
            onGenerateCharge={handleGeneratePendingOrderCharge}
            onReceiveOrder={handleReceiveOrder}
            onSearch={setPendingSearch}
            onSelectOrder={setSelectedPendingOrderId}
            onPaymentFormChange={setReceivePaymentForm}
            paymentForm={receivePaymentForm}
            pendingSearch={pendingSearch}
            pedidosPendentes={branchScopedPendingOrders}
            receivingOrder={receivingOrder}
            selectedPendingOrder={selectedPendingOrder}
          />
        </>
      ) : (
        <>
      <CashManagementPanel
        caixa={caixa}
        canOperate={canOperate}
        cashAction={cashAction}
        closeConciliationRows={closeConciliationRows}
        closeDifference={closeDifference}
        closeDifferenceOk={closeDifferenceOk}
        closeForm={closeForm}
        handleCloseCash={handleCloseCash}
        handleMovement={handleMovement}
        handleOpenCash={handleOpenCash}
        movementForm={movementForm}
        openForm={openForm}
        paymentReportRows={paymentReportRows}
        paymentReportTotal={paymentReportTotal}
        saving={saving}
        setCashAction={setCashAction}
        setCloseForm={setCloseForm}
        setMovementForm={setMovementForm}
        setOpenForm={setOpenForm}
        todayPaymentMovements={todayPaymentMovements}
      />

          <CashPendingOrdersSection
            branchScopedPendingOrders={branchScopedPendingOrders}
            filteredPendingOrders={filteredPendingOrders}
            onReceiveOrder={handleReceiveOrder}
            pendingSearch={pendingSearch}
            receiveMixedDifference={receiveMixedDifference}
            receivePaymentDetail={receivePaymentDetail}
            receivePaymentForm={receivePaymentForm}
            receivePaymentReady={receivePaymentReady}
            receivingOrder={receivingOrder}
            selectedOrderTotal={selectedOrderTotal}
            selectedPendingOrder={selectedPendingOrder}
            setPendingSearch={setPendingSearch}
            setReceivePaymentForm={setReceivePaymentForm}
            setSelectedPendingOrderId={setSelectedPendingOrderId}
          />

          <CashRecentMovementsSection
            caixa={caixa}
            cashMovementRows={cashMovementRows}
            session={session}
          />

      {displayedCashReport && (
        <CashClosingReportSection
          cashClosingRows={cashClosingRows}
          displayedCashReport={displayedCashReport}
          onClearSelectedReport={() => setSelectedCashReport(null)}
          selectedCashReport={selectedCashReport}
        />
      )}

      {recentes.length > 0 && (
        <CashHistorySection
          cashHistoryFilter={cashHistoryFilter}
          cashHistoryRows={cashHistoryRows}
          cashHistoryTotals={cashHistoryTotals}
          filteredCashHistory={filteredCashHistory}
          onResetFilter={() => setCashHistoryFilter({ busca: "", status: "TODOS", inicio: "", fim: "" })}
          onViewCashReport={handleViewCashReport}
          saving={saving}
          session={session}
          setCashHistoryFilter={setCashHistoryFilter}
        />
      )}
        </>
      )}
    </div>
  );
}







