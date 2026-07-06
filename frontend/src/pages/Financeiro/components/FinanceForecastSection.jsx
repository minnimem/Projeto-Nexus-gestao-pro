import { ClipboardList, Download, Printer } from "lucide-react";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { formatCurrency, formatDate, formatNumber, formatPercent, getLocalDateKey, isDateBeforeToday } from "../../../utils/formatters";

export function FinanceForecastSection({
  canMutateFinance,
  canSeeProfit,
  currentMonthEnd,
  currentMonthResult,
  currentMonthStart,
  forecastBalance30Days,
  forecastExpense30Days,
  forecastRecurrences30Days,
  forecastRevenue30Days,
  handleFollowUpStatus,
  monthlyComparisonRows,
  previousMonthEnd,
  previousMonthResult,
  previousMonthStart,
  reminderFollowUps,
  resultVariation,
  saving,
  scrollToCollectionAgenda,
  selectedFinanceBranchLabel,
  session,
}) {
  return (
    <>
      <section className="panel finance-reconciliation">
        <div className="panel-title">
          <div>
            <h2>Comparativo e previsão</h2>
            <p>Resultado mensal e saldo projetado com contas abertas nos próximos 30 dias.</p>
          </div>
          <div className="report-actions">
            <button className="report-export" disabled={monthlyComparisonRows.length === 0} onClick={() => downloadCsv(`nexus-one-comparativo-financeiro-${getLocalDateKey()}.csv`, monthlyComparisonRows)} type="button">
              <Download size={17} /> CSV
            </button>
            <button className="report-export secondary" disabled={monthlyComparisonRows.length === 0} onClick={() => printRowsDocument(`Comparativo financeiro - ${selectedFinanceBranchLabel}`, monthlyComparisonRows, session.empresa || "Nexus One")} type="button">
              <Printer size={17} /> PDF
            </button>
          </div>
        </div>
        <div className="reconciliation-grid">
          <div><span>Resultado mês atual</span><strong>{canSeeProfit ? formatCurrency(currentMonthResult) : "Restrito"}</strong><small>{formatDate(currentMonthStart)} a {formatDate(currentMonthEnd)}</small></div>
          <div><span>Resultado mês anterior</span><strong>{canSeeProfit ? formatCurrency(previousMonthResult) : "Restrito"}</strong><small>{formatDate(previousMonthStart)} a {formatDate(previousMonthEnd)}</small></div>
          <div><span>Variação</span><strong className={resultVariation >= 0 ? "success-text" : "danger-text"}>{canSeeProfit ? `${resultVariation >= 0 ? "+" : "-"}${formatPercent(resultVariation)}%` : "Restrito"}</strong><small>Comparado ao resultado anterior</small></div>
          <div><span>Saldo previsto 30 dias</span><strong className={forecastBalance30Days >= 0 ? "success-text" : "danger-text"}>{formatCurrency(forecastBalance30Days)}</strong><small>{formatCurrency(forecastRevenue30Days)} entradas / {formatCurrency(forecastExpense30Days)} saídas / {formatNumber(forecastRecurrences30Days.length)} recorrência(s)</small></div>
        </div>
      </section>

      {reminderFollowUps.length > 0 && (
        <section className="panel followup-reminder-panel">
          <div className="panel-title compact">
            <div><h2>Lembretes de cobrança</h2><p>Follow-ups pendentes para hoje ou já vencidos.</p></div>
            <div className="account-plan-actions"><button onClick={scrollToCollectionAgenda} type="button"><ClipboardList size={15} /> Ver agenda</button></div>
          </div>
          <div className="followup-reminder-grid">
            {reminderFollowUps.slice(0, 4).map((item) => (
              <div className={isDateBeforeToday(item.proximaAcao) ? "followup-reminder-card overdue" : "followup-reminder-card"} key={item.id}>
                <span>{item.proximaAcao ? formatDate(item.proximaAcao) : "Sem data"}</span>
                <strong>{item.clienteNome || "Cliente não identificado"}</strong>
                <small>{item.canal || "Contato"} / {formatCurrency(item.valor)} / {item.filial || "Empresa"}</small>
                <small>{item.observacao || item.financeiroDescricao || "Retomar contato de cobrança"}</small>
                {canMutateFinance && (
                  <div className="table-actions">
                    <button disabled={saving} onClick={() => handleFollowUpStatus(item.id, "concluir")} type="button">Concluir</button>
                    <button disabled={saving} onClick={() => handleFollowUpStatus(item.id, "cancelar")} type="button">Cancelar</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

