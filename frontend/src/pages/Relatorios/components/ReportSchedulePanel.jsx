import { CalendarDays, CheckCircle2, Download, Printer } from "lucide-react";

export function ReportSchedulePanel({
  exportScheduledReportNow,
  markScheduledReportDone,
  reportSchedule,
  reportScheduleOptions,
  reportScheduleRows,
  scheduleState,
  selectedScheduleOption,
  updateReportSchedule,
}) {
  return (
    <section className="panel report-schedule-panel">
      <div className="account-plan-head">
        <div>
          <h3>Agenda local de exportação</h3>
          <p>Preferência operacional salva para lembrar a rotina de relatórios deste perfil.</p>
        </div>
        <div className="account-plan-actions">
          <span className={`schedule-status ${scheduleState.tone}`}>
            {scheduleState.label}
          </span>
          <button onClick={markScheduledReportDone} type="button">
            <CheckCircle2 size={15} />
            Marcar executado
          </button>
          <button
            disabled={(selectedScheduleOption.rows || []).length === 0}
            onClick={exportScheduledReportNow}
            type="button"
          >
            {reportSchedule.format === "csv" ? <Download size={15} /> : <Printer size={15} />}
            Exportar agora
          </button>
        </div>
      </div>
      <div className="report-schedule-grid">
        <label>
          <span>Relatório</span>
          <select
            value={reportSchedule.report}
            onChange={(event) => updateReportSchedule({ report: event.target.value })}
          >
            {reportScheduleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Frequência</span>
          <select
            value={reportSchedule.frequency}
            onChange={(event) => updateReportSchedule({ frequency: event.target.value })}
          >
            <option value="weekly">Semanal</option>
            <option value="biweekly">Quinzenal</option>
            <option value="monthly">Mensal</option>
          </select>
        </label>
        <label>
          <span>Formato</span>
          <select
            value={reportSchedule.format}
            onChange={(event) => updateReportSchedule({ format: event.target.value })}
          >
            <option value="pdf">PDF</option>
            <option value="csv">CSV</option>
          </select>
        </label>
        <label>
          <span>Próxima data</span>
          <input
            type="date"
            value={reportSchedule.nextDate || ""}
            onChange={(event) => updateReportSchedule({ nextDate: event.target.value })}
          />
        </label>
        <button
          className={reportSchedule.active ? "schedule-toggle active" : "schedule-toggle"}
          onClick={() => updateReportSchedule({ active: !reportSchedule.active })}
          type="button"
        >
          <CalendarDays size={16} />
          {reportSchedule.active ? "Pausar agenda" : "Ativar agenda"}
        </button>
      </div>
      <div className="report-schedule-summary">
        {reportScheduleRows.map((row) => (
          <div key={row.Item}>
            <span>{row.Item}</span>
            <strong>{row.Valor}</strong>
            <small>{row.Detalhe}</small>
          </div>
        ))}
      </div>
    </section>
  );
}
