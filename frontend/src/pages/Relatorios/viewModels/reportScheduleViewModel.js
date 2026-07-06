import { formatDate, formatNumber, getLocalDateKey } from "../../../utils/formatters.js";
import { getSelectedReportRows } from "./reportFieldSelectionViewModel.js";

const scheduleFrequencyLabels = {
  weekly: "Semanal",
  biweekly: "Quinzenal",
  monthly: "Mensal",
};

const scheduleFormatLabels = {
  csv: "CSV",
  pdf: "PDF",
};

export function getNextScheduleDate(frequency) {
  const date = new Date();
  const daysToAdd = frequency === "monthly" ? 30 : frequency === "biweekly" ? 14 : 7;
  date.setDate(date.getDate() + daysToAdd);
  return getLocalDateKey(date);
}

export function buildReportScheduleViewModel({
  executiveInsightRows,
  moduleAnalyticsRows,
  reportCards,
  reportFieldSelection,
  reportSchedule,
  selectedReportBranchLabel,
  todayKey,
}) {
  const reportScheduleOptions = [
    { value: "executive", label: "BI executivo", rows: executiveInsightRows },
    { value: "analytics", label: "Analytics por módulo", rows: moduleAnalyticsRows },
    ...reportCards.map((card) => ({
      value: card.key,
      label: card.title,
      rows: getSelectedReportRows(card, reportFieldSelection),
    })),
  ];
  const selectedScheduleOption = reportScheduleOptions.find((option) => option.value === reportSchedule.report)
    || reportScheduleOptions[0];
  const scheduleDateKey = reportSchedule.nextDate || "";
  const scheduleState = !reportSchedule.active
    ? { label: "Pausada", tone: "paused", detail: "Agenda sem lembrete ativo." }
    : scheduleDateKey && scheduleDateKey < todayKey
      ? { label: "Atrasada", tone: "late", detail: "Rotina pendente de execução." }
      : scheduleDateKey === todayKey
        ? { label: "Vence hoje", tone: "due", detail: "Exportação deve ser revisada hoje." }
        : { label: "Em dia", tone: "active", detail: "Próxima exportação futura." };
  const reportScheduleRows = [
    {
      Item: "Status",
      Valor: scheduleState.label,
      Detalhe: scheduleState.detail,
    },
    {
      Item: "Relatório",
      Valor: selectedScheduleOption.label || "BI executivo",
      Detalhe: `${formatNumber(selectedScheduleOption.rows.length || 0)} registro(s) disponíveis`,
    },
    {
      Item: "Frequência",
      Valor: scheduleFrequencyLabels[reportSchedule.frequency] || "Semanal",
      Detalhe: `Formato ${scheduleFormatLabels[reportSchedule.format] || "PDF"}`,
    },
    {
      Item: "Próxima data",
      Valor: reportSchedule.nextDate ? formatDate(reportSchedule.nextDate) : "Não definida",
      Detalhe: selectedReportBranchLabel,
    },
  ];

  return {
    reportScheduleOptions,
    reportScheduleRows,
    scheduleState,
    selectedScheduleOption,
  };
}
