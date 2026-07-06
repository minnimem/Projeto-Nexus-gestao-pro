import { CheckCircle2, Loader2 } from "lucide-react";
import { formatCurrency } from "../../../utils/formatters";

export function CashCloseForm({
  closeConciliationRows,
  closeDifference,
  closeDifferenceOk,
  closeForm,
  onCloseCash,
  saving,
  setCloseForm,
}) {
  return (
    <form className="stack-form close-cash-form" onSubmit={onCloseCash}>
      <label>
        <span>Valor contado no fechamento</span>
        <input
          min="0"
          required
          inputMode="decimal"
          type="text"
          value={closeForm.valorFechamento}
          onChange={(event) => setCloseForm((prev) => ({ ...prev, valorFechamento: event.target.value }))}
        />
      </label>
      <label>
        <span>Observação</span>
        <textarea
          value={closeForm.observacao}
          onChange={(event) => setCloseForm((prev) => ({ ...prev, observacao: event.target.value }))}
        />
      </label>
      <div className="cash-close-conciliation" aria-label="Conciliação de fechamento do caixa">
        <div className="cash-close-conciliation-grid">
          {closeConciliationRows.map((row) => (
            <div className={`cash-close-card ${row.tone}`} key={row.label}>
              <span>{row.label}</span>
              <strong>{row.value}</strong>
            </div>
          ))}
        </div>
        <div className={`cash-close-difference ${closeDifferenceOk ? "ok" : closeDifference === null ? "pending" : "alert"}`}>
          <div>
            <span>Conferência</span>
            <strong>
              {closeDifference === null ?
                "Informe o valor contado"
                : closeDifferenceOk
                  ? "Fechamento conciliado"
                  : "Divergência no caixa"}
            </strong>
          </div>
          <em>{closeDifference === null ? "-" : formatCurrency(Math.abs(closeDifference))}</em>
        </div>
      </div>
      <button disabled={Boolean(saving)} type="submit">
        {saving === "fechar" ? <Loader2 className="spin" size={18} /> : <CheckCircle2 size={18} />}
        Confirmar fechamento
      </button>
    </form>
  );
}
