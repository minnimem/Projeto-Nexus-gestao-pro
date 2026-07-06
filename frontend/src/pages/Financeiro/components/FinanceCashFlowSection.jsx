import { Download, Printer } from "lucide-react";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { formatCurrency, formatNumber, getLocalDateKey } from "../../../utils/formatters";

export function FinanceCashFlowSection({
  cashFlowDays,
  cashFlowRows,
  cashFlowSaldo,
  cashFlowTotalEntradas,
  cashFlowTotalSaidas,
  sectionRef,
  session,
}) {
  return (
    <section className="panel cash-flow-panel" ref={sectionRef}>
      <div className="panel-title compact">
        <div>
          <h2>Fluxo de caixa 14 dias</h2>
          <p>Entradas, saídas e pendências por data prevista.</p>
        </div>
        <div className="account-plan-actions">
          <button
            disabled={cashFlowRows.length === 0}
            onClick={() => downloadCsv(`nexus-one-fluxo-caixa-${getLocalDateKey()}.csv`, cashFlowRows)}
            type="button"
          >
            <Download size={15} />
            CSV
          </button>
          <button
            disabled={cashFlowRows.length === 0}
            onClick={() => printRowsDocument("Fluxo de caixa 14 dias", cashFlowRows, session.empresa || "Nexus One")}
            type="button"
          >
            <Printer size={15} />
            PDF
          </button>
        </div>
      </div>
      <div className="cash-flow-summary">
        <div>
          <span>Entradas</span>
          <strong>{formatCurrency(cashFlowTotalEntradas)}</strong>
        </div>
        <div>
          <span>Saídas</span>
          <strong>{formatCurrency(cashFlowTotalSaidas)}</strong>
        </div>
        <div>
          <span>Saldo previsto</span>
          <strong>{formatCurrency(cashFlowSaldo)}</strong>
        </div>
      </div>
      <div className="cash-flow-grid">
        {cashFlowDays.map((item) => (
          <div className={item.saldo < 0 ? "cash-flow-day negative" : "cash-flow-day"} key={item.key}>
            <span>{item.label}</span>
            <strong>{formatCurrency(item.saldo)}</strong>
            <small>Entrada {formatCurrency(item.entradas)} / Saída {formatCurrency(item.saidas)}</small>
            <em>{formatNumber(item.registros)} registros</em>
          </div>
        ))}
      </div>
    </section>
  );
}

