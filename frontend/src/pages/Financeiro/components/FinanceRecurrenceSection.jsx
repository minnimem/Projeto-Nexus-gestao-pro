import { Download, Printer } from "lucide-react";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { formatCurrency, formatDate, formatNumber, getLocalDateKey } from "../../../utils/formatters";

export function FinanceRecurrenceSection({
  activeRecurrences,
  branchScopedRecorrencias,
  canMutateFinance,
  handleGenerateRecurrence,
  handleToggleRecurrence,
  nextRecurrences,
  recurringFinanceRows,
  saving,
  session,
}) {
  return (
    <section className="panel account-plan-summary">
      <div className="account-plan-head">
        <div>
          <h3>Recorrências financeiras</h3>
          <p>Regras persistidas para gerar contas futuras automaticamente.</p>
        </div>
        <div className="account-plan-actions">
          <button
            disabled={recurringFinanceRows.length === 0}
            onClick={() => downloadCsv(`nexus-one-recorrencias-financeiras-${getLocalDateKey()}.csv`, recurringFinanceRows)}
            type="button"
          >
            <Download size={15} />
            CSV
          </button>
          <button
            disabled={recurringFinanceRows.length === 0}
            onClick={() => printRowsDocument("Recorrências financeiras", recurringFinanceRows, session.empresa || "Nexus One")}
            type="button"
          >
            <Printer size={15} />
            PDF
          </button>
        </div>
      </div>

      <div className="recurrence-summary">
        <div>
          <span>Ativas</span>
          <strong>{formatNumber(activeRecurrences.length)}</strong>
        </div>
        <div>
          <span>Total</span>
          <strong>{formatNumber(branchScopedRecorrencias.length)}</strong>
        </div>
        <div>
          <span>Próxima</span>
          <strong>{nextRecurrences[0].proximaGeracao ? formatDate(nextRecurrences[0].proximaGeracao) : "-"}</strong>
        </div>
      </div>

      <div className="account-plan-grid recurrence-grid">
        {branchScopedRecorrencias.length === 0 ? (
          <div className="empty-selection compact">Nenhuma regra recorrente cadastrada.</div>
        ) : (
          branchScopedRecorrencias.slice(0, 8).map((item) => (
            <div className="account-plan-item recurrence-card" key={item.id}>
              <span>{item.descricao}</span>
              <strong>{formatCurrency(item.valor)}</strong>
              <small>
                {item.tipo} / {item.filial || "Empresa"} / próxima {item.proximaGeracao ? formatDate(item.proximaGeracao) : "-"}
              </small>
              <div className="table-actions">
                {canMutateFinance && item.ativo && (
                  <button disabled={saving} onClick={() => handleGenerateRecurrence(item.id, 1)} type="button">
                    Gerar
                  </button>
                )}
                {canMutateFinance && (
                  <button disabled={saving} onClick={() => handleToggleRecurrence(item)} type="button">
                    {item.ativo ? "Pausar" : "Ativar"}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

