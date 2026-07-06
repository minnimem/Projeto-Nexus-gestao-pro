import { asList } from "../../utils/formatters";
import { getProductId } from "../../utils/products";
import { ServiceKpiSection } from "./components/ServiceKpiSection";
import { ServiceOrderForm } from "./components/ServiceOrderForm";
import { ServiceOrdersPanel } from "./components/ServiceOrdersPanel";
import { ServiceSignatureModal } from "./components/ServiceSignatureModal";
import "./Servicos.css";

import { serviceOrderFlowSteps } from "./constants/serviceConstants";
import { useServiceDashboardData } from "./hooks/useServiceDashboardData";
import { useServiceOrderOperations } from "./hooks/useServiceOrderOperations";
import { useServicePageState } from "./hooks/useServicePageState";
import { useServiceSignatureCanvas } from "./hooks/useServiceSignatureCanvas";
import {
  getServicePartCost,
  getServicePartProductIdentifier,
  getServicePartProductLabel,
  getServicePartSale,
  parseServiceChecklist,
  serializeServiceParts,
  serializeServiceChecklist,
} from "./viewModels/serviceViewModel";

export function Servicos({ data, session, onRefresh }) {
  const {
    form,
    formStep,
    historyClienteId,
    historyEndDate,
    historyStartDate,
    historyStatus,
    historyTecnicoId,
    message,
    saving,
    savingChecklist,
    savingStatus,
    search,
    setForm,
    setFormStep,
    setHistoryClienteId,
    setHistoryEndDate,
    setHistoryStartDate,
    setHistoryStatus,
    setHistoryTecnicoId,
    setMessage,
    setSaving,
    setSavingChecklist,
    setSavingStatus,
    setSearch,
    setSignatureDraft,
    setStatusFilter,
    setUploadingAttachment,
    signatureCanvasRef,
    signatureDraft,
    signatureDrawingRef,
    statusFilter,
    uploadingAttachment,
  } = useServicePageState();
  const {
    activeOrders,
    clientes,
    contratos,
    criticalOrders,
    estimatedValue,
    exportRows,
    filiais,
    filteredOrders,
    finishedOrders,
    nextRecurringServices,
    nextSlaOrders,
    ordens,
    overdueOrders,
    overdueRecurringServices,
    produtos,
    recurringServiceOrders,
    recurringServiceRows,
    servicePartsTotalCost,
    servicePartsTotalSale,
    serviceHistoryAverageCycle,
    serviceHistoryEvidenceComplete,
    serviceHistoryFinished,
    serviceHistoryOrders,
    serviceHistoryOverdue,
    serviceHistoryRows,
    serviceHistoryValue,
    servicePartHistoryRows,
    servicePartTechnicianRows,
    timelineFocusOrder,
    timelineRows,
    tecnicos,
    topServicePartProducts,
    topServicePartTechnicians,
  } = useServiceDashboardData({
    data,
    form,
    historyClienteId,
    historyEndDate,
    historyStartDate,
    historyStatus,
    historyTecnicoId,
    search,
    statusFilter,
  });
  const {
    handleChecklistToggle,
    handleConsumeServiceParts,
    handleCreateServiceOrder,
    handleInvoiceServiceOrder,
    handleServiceAttachmentUpload,
    handleServiceSignatureUpload,
    handleStatusChange,
  } = useServiceOrderOperations({
    form,
    onRefresh,
    session,
    setForm,
    setFormStep,
    setMessage,
    setSaving,
    setSavingChecklist,
    setSavingStatus,
    setUploadingAttachment,
  });
  const {
    clearSignatureCanvas,
    handleSubmitDrawnSignature,
    moveSignatureDrawing,
    openSignatureCanvas,
    startSignatureDrawing,
    stopSignatureDrawing,
    updateSignatureDraft,
  } = useServiceSignatureCanvas({
    onRefresh,
    setMessage,
    setSignatureDraft,
    setUploadingAttachment,
    signatureCanvasRef,
    signatureDraft,
    signatureDrawingRef,
    uploadingAttachment,
  });

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function removeServicePart(productId) {
    setForm((prev) => {
      const pecasItens = asList(prev.pecasItens).filter((item) => String(item.productId) !== String(productId));
      return {
        ...prev,
        pecasItens,
        pecasUtilizadas: serializeServiceParts(pecasItens),
      };
    });
  }

  function addSelectedServicePart() {
    const produto = produtos.find((item) => String(getProductId(item)) === String(form.pecaProdutoId));
    if (!produto) {
      setMessage({ type: "error", text: "Selecione um produto para adicionar as peças da OS." });
      setFormStep("prazo");
      return;
    }

    const quantity = Math.max(1, Number(form.pecaQuantidade || 1));
    setForm((prev) => {
      const existing = asList(prev.pecasItens);
      const productId = getProductId(produto);
      const nextItems = existing.some((item) => String(item.productId) === String(productId))
        ?
        existing.map((item) =>
            String(item.productId) === String(productId)
              ?
              { ...item, quantity: Number(item.quantity || 0) + quantity }
              : item,
          )
        : [
            ...existing,
            {
              productId,
              label: getServicePartProductLabel(produto),
              identifier: getServicePartProductIdentifier(produto),
              quantity,
              unitCost: getServicePartCost(produto),
              unitSale: getServicePartSale(produto),
            },
          ];
      return {
        ...prev,
        pecasItens: nextItems,
        pecasUtilizadas: serializeServiceParts(nextItems),
        pecaProdutoId: "",
        pecaQuantidade: "1",
      };
    });
    setMessage(null);
  }

  function applyChecklistTemplate(template) {
    setForm((prev) => ({
      ...prev,
      checklist: serializeServiceChecklist(template.items.map((item) => ({ done: false, text: item }))),
    }));
  }

  function updateChecklistLine(index, checked) {
    const items = parseServiceChecklist(form.checklist);
    const nextItems = items.length > 0 ? items : [{ done: false, text: "" }];
    nextItems[index] = { ...nextItems[index], done: checked };
    updateForm("checklist", serializeServiceChecklist(nextItems));
  }

  function addChecklistLine() {
    const items = parseServiceChecklist(form.checklist);
    updateForm("checklist", serializeServiceChecklist([...items, { done: false, text: "Novo item" }]));
  }

  function updateChecklistText(index, text) {
    const items = parseServiceChecklist(form.checklist);
    const nextItems = items.length > 0 ? items : [{ done: false, text: "" }];
    nextItems[index] = { ...nextItems[index], text };
    updateForm("checklist", serializeServiceChecklist(nextItems));
  }

  function goToNextServiceStep() {
    const currentIndex = serviceOrderFlowSteps.findIndex((step) => step.key === formStep);
    setFormStep(serviceOrderFlowSteps[Math.min(currentIndex + 1, serviceOrderFlowSteps.length - 1)].key);
  }

  function goToPreviousServiceStep() {
    const currentIndex = serviceOrderFlowSteps.findIndex((step) => step.key === formStep);
    setFormStep(serviceOrderFlowSteps[Math.max(currentIndex - 1, 0)].key);
  }

  const formChecklistItems = parseServiceChecklist(form.checklist);

  return (
    <div className="dashboard-view cash-register-screen">
      <ServiceKpiSection
        activeOrders={activeOrders}
        estimatedValue={estimatedValue}
        finishedOrders={finishedOrders}
        overdueOrders={overdueOrders}
      />

      <section className="dashboard-grid single-column-grid">
        <ServiceOrderForm
          addChecklistLine={addChecklistLine}
          addSelectedServicePart={addSelectedServicePart}
          applyChecklistTemplate={applyChecklistTemplate}
          clientes={clientes}
          contratos={contratos}
          filiais={filiais}
          form={form}
          formChecklistItems={formChecklistItems}
          formStep={formStep}
          getServicePartProductLabel={getServicePartProductLabel}
          goToNextServiceStep={goToNextServiceStep}
          goToPreviousServiceStep={goToPreviousServiceStep}
          handleCreateServiceOrder={handleCreateServiceOrder}
          message={message}
          produtos={produtos}
          removeServicePart={removeServicePart}
          saving={saving}
          servicePartsTotalCost={servicePartsTotalCost}
          servicePartsTotalSale={servicePartsTotalSale}
          setFormStep={setFormStep}
          tecnicos={tecnicos}
          updateChecklistLine={updateChecklistLine}
          updateChecklistText={updateChecklistText}
          updateForm={updateForm}
        />
        <ServiceOrdersPanel
          activeOrders={activeOrders}
          clientes={clientes}
          contratos={contratos}
          criticalOrders={criticalOrders}
          exportRows={exportRows}
          filteredOrders={filteredOrders}
          handleChecklistToggle={handleChecklistToggle}
          handleConsumeServiceParts={handleConsumeServiceParts}
          handleInvoiceServiceOrder={handleInvoiceServiceOrder}
          handleServiceAttachmentUpload={handleServiceAttachmentUpload}
          handleServiceSignatureUpload={handleServiceSignatureUpload}
          handleStatusChange={handleStatusChange}
          historyClienteId={historyClienteId}
          historyEndDate={historyEndDate}
          historyStartDate={historyStartDate}
          historyStatus={historyStatus}
          historyTecnicoId={historyTecnicoId}
          nextRecurringServices={nextRecurringServices}
          nextSlaOrders={nextSlaOrders}
          openSignatureCanvas={openSignatureCanvas}
          ordens={ordens}
          overdueRecurringServices={overdueRecurringServices}
          recurringServiceOrders={recurringServiceOrders}
          recurringServiceRows={recurringServiceRows}
          savingChecklist={savingChecklist}
          savingStatus={savingStatus}
          search={search}
          serviceHistoryAverageCycle={serviceHistoryAverageCycle}
          serviceHistoryEvidenceComplete={serviceHistoryEvidenceComplete}
          serviceHistoryFinished={serviceHistoryFinished}
          serviceHistoryOrders={serviceHistoryOrders}
          serviceHistoryOverdue={serviceHistoryOverdue}
          serviceHistoryRows={serviceHistoryRows}
          serviceHistoryValue={serviceHistoryValue}
          servicePartHistoryRows={servicePartHistoryRows}
          servicePartTechnicianRows={servicePartTechnicianRows}
          session={session}
          setHistoryClienteId={setHistoryClienteId}
          setHistoryEndDate={setHistoryEndDate}
          setHistoryStartDate={setHistoryStartDate}
          setHistoryStatus={setHistoryStatus}
          setHistoryTecnicoId={setHistoryTecnicoId}
          setSearch={setSearch}
          setStatusFilter={setStatusFilter}
          statusFilter={statusFilter}
          tecnicos={tecnicos}
          timelineFocusOrder={timelineFocusOrder}
          timelineRows={timelineRows}
          topServicePartProducts={topServicePartProducts}
          topServicePartTechnicians={topServicePartTechnicians}
          uploadingAttachment={uploadingAttachment}
        />
      </section>
      <ServiceSignatureModal
        clearSignatureCanvas={clearSignatureCanvas}
        handleSubmitDrawnSignature={handleSubmitDrawnSignature}
        moveSignatureDrawing={moveSignatureDrawing}
        setSignatureDraft={setSignatureDraft}
        signatureCanvasRef={signatureCanvasRef}
        signatureDraft={signatureDraft}
        startSignatureDrawing={startSignatureDrawing}
        stopSignatureDrawing={stopSignatureDrawing}
        updateSignatureDraft={updateSignatureDraft}
        uploadingAttachment={uploadingAttachment}
      />
    </div>
  );
}
