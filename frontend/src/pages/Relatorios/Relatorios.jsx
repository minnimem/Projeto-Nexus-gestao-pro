import { useEffect, useState } from "react";
import { endpoints } from "../../services/resources.js";
import { canAccessModule, normalizePerfil } from "../../utils/permissions.js";
import {
  asList,
  getLocalDateKey,
} from "../../utils/formatters.js";
import { downloadCsv, printRowsDocument } from "../../utils/exporters.js";
import { CommercialReportsPanel } from "./components/CommercialReportsPanel.jsx";
import { ExecutiveBiPanel } from "./components/ExecutiveBiPanel.jsx";
import { FiscalBranchReportsPanel } from "./components/FiscalBranchReportsPanel.jsx";
import { ReportAnalyticsPanel } from "./components/ReportAnalyticsPanel.jsx";
import { ReportKpiSection } from "./components/ReportKpiSection.jsx";
import { ReportSchedulePanel } from "./components/ReportSchedulePanel.jsx";
import { ReportsExportGrid } from "./components/ReportsExportGrid.jsx";
import { SalesPeriodReport } from "./components/SalesPeriodReport.jsx";
import {
  SALES_REPORT_OPTIONS,
  buildSalesPeriodViewModel,
} from "./viewModels/salesPeriodReportViewModel.js";
import { buildBranchFiscalReportViewModel } from "./viewModels/branchFiscalReportViewModel.js";
import { buildCommercialReportViewModel } from "./viewModels/commercialReportViewModel.js";
import { buildExecutiveReportViewModel } from "./viewModels/executiveReportViewModel.js";
import { buildReportCardsViewModel } from "./viewModels/reportCardsViewModel.js";
import {
  getReportFieldKeys,
  getSelectedReportFields as getSelectedReportFieldsModel,
  getSelectedReportRows as getSelectedReportRowsModel,
  setReportFieldPresetSelection,
  toggleReportFieldSelection,
} from "./viewModels/reportFieldSelectionViewModel.js";
import {
  buildReportScheduleViewModel,
  getNextScheduleDate,
} from "./viewModels/reportScheduleViewModel.js";
import "./Relatorios.css";


export function Relatorios({ data, session }) {
  const reportPreferenceKey = `nexus-one-report-preferences-${normalizePerfil(session.perfil) || "GERAL"}`;
  const [salesReportPeriod, setSalesReportPeriod] = useState("diario");
  const [salesReportFilter, setSalesReportFilter] = useState({ inicio: "", fim: "" });
  const [reportBranchFilter, setReportBranchFilter] = useState("TODAS");
  const [reportFieldSelection, setReportFieldSelection] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`${reportPreferenceKey}-fields`) || "{}");
    } catch {
      return {};
    }
  });
  const [reportSchedule, setReportSchedule] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`${reportPreferenceKey}-schedule`) || "null") || {
        active: false,
        report: "executive",
        frequency: "weekly",
        format: "pdf",
        nextDate: "",
      };
    } catch {
      return {
        active: false,
        report: "executive",
        frequency: "weekly",
        format: "pdf",
        nextDate: "",
      };
    }
  });
  const [reportAnalyticsFullscreen, setReportAnalyticsFullscreen] = useState(false);
  const todayKey = getLocalDateKey();
  const pedidos = asList(data.pedidos);
  const clientes = asList(data.clientes);
  const produtos = asList(data.produtos);
  const financeiro = asList(data.financeiro);
  const entregas = asList(data.entregas);
  const rotas = asList(data.rotas);
  const usuarios = asList(data.usuarios);
  const filiais = asList(data.filiais);
  const documentosFiscaisPorPedido = data.documentosFiscaisPorPedido || {};
  const canSeeFinance = canAccessModule(session, "financeiro");
  const canSeeLogistics = canAccessModule(session, "logistica");
  const canSeeCollaborators = canAccessModule(session, "colaboradores");
  const salesReportOptions = SALES_REPORT_OPTIONS;

  function matchesReportBranch(item) {
    if (reportBranchFilter === "TODAS") return true;
    if (reportBranchFilter === "EMPRESA") return !item.filialId;
    return String(item.filialId || "") === reportBranchFilter;
  }

  const selectedReportBranchLabel = reportBranchFilter === "TODAS" ?
    "Todas as filiais"
    : reportBranchFilter === "EMPRESA" ?
      "Empresa / sem filial"
      : filiais.find((filial) => String(filial.id) === reportBranchFilter)?.nome || "Filial";

  const filteredPedidos = pedidos.filter(matchesReportBranch);
  const filteredFinanceiro = financeiro.filter(matchesReportBranch);
  const filteredUsuarios = usuarios.filter(matchesReportBranch);
  const filteredEntregas = entregas.filter(matchesReportBranch);
  const filteredRotas = rotas.filter((rota) => {
    if (reportBranchFilter === "TODAS") return true;
    return filteredEntregas.some((entrega) => String(entrega.rotaId || "") === String(rota.id || ""));
  });
  const {
    bestPeriodRow,
    salesReportCount,
    salesReportRows,
    salesReportTotal,
    vendasConcluidas,
  } = buildSalesPeriodViewModel({
    pedidos: filteredPedidos,
    salesReportFilter,
    salesReportPeriod,
  });
  const {
    customerRevenueReportRows,
    dominantPaymentMethod,
    dormantCustomerRows,
    paymentReportRows,
    productSalesReportRows,
  } = buildCommercialReportViewModel({
    clientes,
    filteredPedidos,
    salesReportTotal,
    todayKey,
    vendasConcluidas,
  });
  const {
    bestBranchPerformance,
    branchReportRows,
    collaboratorBranchReportRows,
    financeBranchReportRows,
    fiscalPreparedCount,
    fiscalReportRows,
  } = buildBranchFiscalReportViewModel({
    canSeeCollaborators,
    canSeeFinance,
    documentosFiscaisPorPedido,
    filteredFinanceiro,
    filteredPedidos,
    filteredUsuarios,
    vendasConcluidas,
  });
  const {
    currentRevenue,
    executiveEndKey,
    executiveHighlightCards,
    executiveInsightRows,
    executiveStartKey,
    moduleAnalyticsRows,
    previousEndKey,
    previousRevenue,
    previousStartKey,
    revenueVariation,
  } = buildExecutiveReportViewModel({
    bestBranchPerformance,
    bestPeriodRow,
    canSeeCollaborators,
    canSeeFinance,
    canSeeLogistics,
    clientes,
    dominantPaymentMethod,
    filteredEntregas,
    filteredFinanceiro,
    filteredPedidos,
    filteredRotas,
    filteredUsuarios,
    produtos,
    salesReportFilter,
    todayKey,
  });
  const {
    exportaveis,
    reportCards,
    totalRegistros,
  } = buildReportCardsViewModel({
    canSeeCollaborators,
    canSeeFinance,
    canSeeLogistics,
    clientes,
    filteredEntregas,
    filteredFinanceiro,
    filteredPedidos,
    filteredRotas,
    filteredUsuarios,
    produtos,
    selectedReportBranchLabel,
  });
  const getSelectedReportFields = (card) => {
    return getSelectedReportFieldsModel(card, reportFieldSelection);
  };
  const getSelectedReportRows = (card) => {
    return getSelectedReportRowsModel(card, reportFieldSelection);
  };
  function toggleReportField(cardKey, field) {
    setReportFieldSelection((current) => toggleReportFieldSelection(current, reportCards, cardKey, field));
  }

  function setReportFieldPreset(cardKey, preset) {
    setReportFieldSelection((current) => setReportFieldPresetSelection(current, reportCards, cardKey, preset));
  }

  const {
    reportScheduleOptions,
    reportScheduleRows,
    scheduleState,
    selectedScheduleOption,
  } = buildReportScheduleViewModel({
    executiveInsightRows,
    moduleAnalyticsRows,
    reportCards,
    reportFieldSelection,
    reportSchedule,
    selectedReportBranchLabel,
    todayKey,
  });
  function updateReportSchedule(patch) {
    setReportSchedule((current) => {
      const next = { ...current, ...patch };
      if (!next.nextDate || patch.frequency) {
        next.nextDate = getNextScheduleDate(next.frequency);
      }
      return next;
    });
  }

  function markScheduledReportDone() {
    updateReportSchedule({ active: true, nextDate: getNextScheduleDate(reportSchedule.frequency) });
  }

  function exportScheduledReportNow() {
    const rows = selectedScheduleOption.rows || [];
    if (reportSchedule.format === "csv") {
      downloadCsv(`nexus-one-agenda-${reportSchedule.report}-${getLocalDateKey()}.csv`, rows);
      return;
    }
    printRowsDocument(`Agenda de relatório - ${selectedScheduleOption.label || "BI executivo"}`, rows, session.empresa || "Nexus One");
  }

  useEffect(() => {
    localStorage.setItem(`${reportPreferenceKey}-fields`, JSON.stringify(reportFieldSelection));
  }, [reportFieldSelection, reportPreferenceKey]);

  useEffect(() => {
    localStorage.setItem(`${reportPreferenceKey}-schedule`, JSON.stringify(reportSchedule));
  }, [reportSchedule, reportPreferenceKey]);

  useEffect(() => {
    if (!reportAnalyticsFullscreen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setReportAnalyticsFullscreen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [reportAnalyticsFullscreen]);

  return (
    <div className="dashboard-view">
      <ReportKpiSection
        exportaveis={exportaveis}
        reportCards={reportCards}
        selectedReportBranchLabel={selectedReportBranchLabel}
        totalRegistros={totalRegistros}
      />
      <ExecutiveBiPanel
        currentRevenue={currentRevenue}
        currentTicket={currentTicket}
        executiveEndKey={executiveEndKey}
        executiveHighlightCards={executiveHighlightCards}
        executiveInsightRows={executiveInsightRows}
        executiveStartKey={executiveStartKey}
        previousEndKey={previousEndKey}
        previousRevenue={previousRevenue}
        previousStartKey={previousStartKey}
        revenueVariation={revenueVariation}
        selectedReportBranchLabel={selectedReportBranchLabel}
        session={session}
      />
      <ReportAnalyticsPanel
        moduleAnalyticsRows={moduleAnalyticsRows}
        reportAnalyticsFullscreen={reportAnalyticsFullscreen}
        setReportAnalyticsFullscreen={setReportAnalyticsFullscreen}
        session={session}
      />
      <ReportSchedulePanel
        exportScheduledReportNow={exportScheduledReportNow}
        markScheduledReportDone={markScheduledReportDone}
        reportSchedule={reportSchedule}
        reportScheduleOptions={reportScheduleOptions}
        reportScheduleRows={reportScheduleRows}
        scheduleState={scheduleState}
        selectedScheduleOption={selectedScheduleOption}
        updateReportSchedule={updateReportSchedule}
      />
      <CommercialReportsPanel
        customerRevenueReportRows={customerRevenueReportRows}
        dormantCustomerRows={dormantCustomerRows}
        paymentReportRows={paymentReportRows}
        productSalesReportRows={productSalesReportRows}
        session={session}
      />
      <SalesPeriodReport
        filiais={filiais}
        reportBranchFilter={reportBranchFilter}
        salesReportCount={salesReportCount}
        salesReportFilter={salesReportFilter}
        salesReportOptions={salesReportOptions}
        salesReportPeriod={salesReportPeriod}
        salesReportRows={salesReportRows}
        salesReportTotal={salesReportTotal}
        session={session}
        setReportBranchFilter={setReportBranchFilter}
        setSalesReportFilter={setSalesReportFilter}
        setSalesReportPeriod={setSalesReportPeriod}
      />
      <FiscalBranchReportsPanel
        branchReportRows={branchReportRows}
        canSeeCollaborators={canSeeCollaborators}
        canSeeFinance={canSeeFinance}
        collaboratorBranchReportRows={collaboratorBranchReportRows}
        financeBranchReportRows={financeBranchReportRows}
        fiscalPreparedCount={fiscalPreparedCount}
        fiscalReportRows={fiscalReportRows}
        selectedReportBranchLabel={selectedReportBranchLabel}
        session={session}
      />
      <ReportsExportGrid
        getReportFieldKeys={getReportFieldKeys}
        getSelectedReportFields={getSelectedReportFields}
        getSelectedReportRows={getSelectedReportRows}
        reportCards={reportCards}
        session={session}
        setReportFieldPreset={setReportFieldPreset}
        toggleReportField={toggleReportField}
        totalRegistros={totalRegistros}
      />
    </div>
  );
}








