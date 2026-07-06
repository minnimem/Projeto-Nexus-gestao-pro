import { Download, Printer } from "lucide-react";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { formatNumber, getLocalDateKey } from "../../../utils/formatters";
import { ServiceEvidencePanel } from "./ServiceEvidencePanel";
import { ServiceHistoryReport } from "./ServiceHistoryReport";
import { ServiceKanbanBoard } from "./ServiceKanbanBoard";
import { ServiceOrdersTable } from "./ServiceOrdersTable";
import { ServicePriorityPanel } from "./ServicePriorityPanel";

export function ServiceOrdersPanel({
  activeOrders,
  clientes,
  contratos,
  criticalOrders,
  exportRows,
  filteredOrders,
  handleChecklistToggle,
  handleConsumeServiceParts,
  handleInvoiceServiceOrder,
  handleServiceAttachmentUpload,
  handleServiceSignatureUpload,
  handleStatusChange,
  historyClienteId,
  historyEndDate,
  historyStartDate,
  historyStatus,
  historyTecnicoId,
  nextRecurringServices,
  nextSlaOrders,
  openSignatureCanvas,
  ordens,
  overdueRecurringServices,
  recurringServiceOrders,
  recurringServiceRows,
  savingChecklist,
  savingStatus,
  search,
  serviceHistoryAverageCycle,
  serviceHistoryEvidenceComplete,
  serviceHistoryFinished,
  serviceHistoryOrders,
  serviceHistoryOverdue,
  serviceHistoryRows,
  serviceHistoryValue,
  servicePartHistoryRows,
  servicePartTechnicianRows,
  session,
  setHistoryClienteId,
  setHistoryEndDate,
  setHistoryStartDate,
  setHistoryStatus,
  setHistoryTecnicoId,
  setSearch,
  setStatusFilter,
  statusFilter,
  tecnicos,
  timelineFocusOrder,
  timelineRows,
  topServicePartProducts,
  topServicePartTechnicians,
  uploadingAttachment,
}) {
  return (
    <article className="panel orders-panel">
      <div className="panel-title">
        <div>
          <h2>Ordens de serviço</h2>
          <p>Pipeline técnico com status, prazo e faturamento previsto.</p>
        </div>
        <div className="panel-actions">
          <span>{formatNumber(filteredOrders.length)} OS</span>
          <button disabled={exportRows.length === 0} onClick={() => downloadCsv(`nexus-one-ordens-servico-${getLocalDateKey()}.csv`, exportRows)} type="button">
            <Download size={15} />
            CSV
          </button>
          <button disabled={exportRows.length === 0} onClick={() => printRowsDocument("Ordens de serviço", exportRows, session.empresa || "Nexus One")} type="button">
            <Printer size={15} />
            PDF
          </button>
        </div>
      </div>

      <ServicePriorityPanel
        criticalOrders={criticalOrders}
        nextSlaOrders={nextSlaOrders}
      />
      <ServiceHistoryReport
        clientes={clientes}
        contratos={contratos}
        historyClienteId={historyClienteId}
        historyEndDate={historyEndDate}
        historyStartDate={historyStartDate}
        historyStatus={historyStatus}
        historyTecnicoId={historyTecnicoId}
        nextRecurringServices={nextRecurringServices}
        overdueRecurringServices={overdueRecurringServices}
        recurringServiceOrders={recurringServiceOrders}
        recurringServiceRows={recurringServiceRows}
        serviceHistoryAverageCycle={serviceHistoryAverageCycle}
        serviceHistoryEvidenceComplete={serviceHistoryEvidenceComplete}
        serviceHistoryFinished={serviceHistoryFinished}
        serviceHistoryOrders={serviceHistoryOrders}
        serviceHistoryOverdue={serviceHistoryOverdue}
        serviceHistoryRows={serviceHistoryRows}
        serviceHistoryValue={serviceHistoryValue}
        servicePartHistoryRows={servicePartHistoryRows}
        servicePartTechnicianRows={servicePartTechnicianRows}
        setHistoryClienteId={setHistoryClienteId}
        setHistoryEndDate={setHistoryEndDate}
        setHistoryStartDate={setHistoryStartDate}
        setHistoryStatus={setHistoryStatus}
        setHistoryTecnicoId={setHistoryTecnicoId}
        session={session}
        tecnicos={tecnicos}
        topServicePartProducts={topServicePartProducts}
        topServicePartTechnicians={topServicePartTechnicians}
      />
      <ServiceEvidencePanel
        activeOrders={activeOrders}
        timelineFocusOrder={timelineFocusOrder}
        timelineRows={timelineRows}
      />
      <ServiceKanbanBoard
        onStatusFilterChange={setStatusFilter}
        ordens={ordens}
      />
      <ServiceOrdersTable
        filteredOrders={filteredOrders}
        handleChecklistToggle={handleChecklistToggle}
        handleConsumeServiceParts={handleConsumeServiceParts}
        handleInvoiceServiceOrder={handleInvoiceServiceOrder}
        handleServiceAttachmentUpload={handleServiceAttachmentUpload}
        handleServiceSignatureUpload={handleServiceSignatureUpload}
        handleStatusChange={handleStatusChange}
        openSignatureCanvas={openSignatureCanvas}
        savingChecklist={savingChecklist}
        savingStatus={savingStatus}
        search={search}
        setSearch={setSearch}
        setStatusFilter={setStatusFilter}
        statusFilter={statusFilter}
        uploadingAttachment={uploadingAttachment}
      />
    </article>
  );
}
