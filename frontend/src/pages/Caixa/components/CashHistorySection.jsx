import { CreditCard, Download, FileText, Loader2, Printer, X } from "lucide-react";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { formatCurrency, formatDate, formatNumber, getLocalDateKey } from "../../../utils/formatters";

export function CashHistorySection({
  cashHistoryFilter,
  cashHistoryRows,
  cashHistoryTotals,
  filteredCashHistory,
  onResetFilter,
  onViewCashReport,
  saving,
  session,
  setCashHistoryFilter,
}) {
  return (
    <section className="panel">
      <div className="panel-title">
        <div>
          <h2>Caixas recentes</h2>
          <p>Histórico rápido da empresa com filtros e exportação.</p>
        </div>
        <div className="report-actions">
          <button
            className="report-export"
            disabled={cashHistoryRows.length === 0}
            onClick={() => downloadCsv(`nexus-one-caixas-${getLocalDateKey()}.csv`, cashHistoryRows)}
            type="button"
          >
            <Download size={17} />
            CSV
          </button>
          <button
            className="report-export secondary"
            disabled={cashHistoryRows.length === 0}
            onClick={() => printRowsDocument("Histórico de caixas", cashHistoryRows, session.empresa || "Nexus One")}
            type="button"
          >
            <Printer size={17} />
            PDF
          </button>
        </div>
      </div>

      <div className="cash-history-filters">
        <label>
          <span>Busca</span>
          <input
            value={cashHistoryFilter.busca}
            onChange={(event) => setCashHistoryFilter((current) => ({ ...current, busca: event.target.value }))}
            placeholder="Operador, perfil, filial ou empresa"
          />
        </label>
        <label>
          <span>Status</span>
          <select
            value={cashHistoryFilter.status}
            onChange={(event) => setCashHistoryFilter((current) => ({ ...current, status: event.target.value }))}
          >
            <option value="TODOS">Todos</option>
            <option value="ABERTO">Aberto</option>
            <option value="FECHADO">Fechado</option>
          </select>
        </label>
        <label>
          <span>Início</span>
          <input
            type="date"
            value={cashHistoryFilter.inicio}
            onChange={(event) => setCashHistoryFilter((current) => ({ ...current, inicio: event.target.value }))}
          />
        </label>
        <label>
          <span>Fim</span>
          <input
            type="date"
            value={cashHistoryFilter.fim}
            onChange={(event) => setCashHistoryFilter((current) => ({ ...current, fim: event.target.value }))}
          />
        </label>
        <button
          disabled={
            !cashHistoryFilter.busca &&
            cashHistoryFilter.status === "TODOS" &&
            !cashHistoryFilter.inicio &&
            !cashHistoryFilter.fim
          }
          onClick={onResetFilter}
          type="button"
        >
          <X size={16} />
          Limpar
        </button>
      </div>

      <div className="cash-history-summary">
        <div>
          <span>Caixas</span>
          <strong>{formatNumber(cashHistoryTotals.caixas)}</strong>
        </div>
        <div>
          <span>Vendas</span>
          <strong>{formatCurrency(cashHistoryTotals.vendas)}</strong>
        </div>
        <div>
          <span>Saldo</span>
          <strong>{formatCurrency(cashHistoryTotals.saldo)}</strong>
        </div>
        <div>
          <span>Divergência</span>
          <strong>{formatCurrency(cashHistoryTotals.divergencia)}</strong>
        </div>
      </div>

      <div className="action-list">
        {filteredCashHistory.slice(0, 12).map((item) => (
          <div className="action-item" key={item.id}>
            <CreditCard size={18} />
            <div>
              <strong>{item.usuarioNome || item.usuarioLogin} - {item.status}</strong>
              <small>{formatCurrency(item.saldoCalculado)} em {formatDate(item.dataAbertura)}</small>
            </div>
            <button
              className="mini-action-button"
              disabled={saving === `relatorio-${item.id}`}
              onClick={() => onViewCashReport(item.id)}
              type="button"
            >
              {saving === `relatorio-${item.id}` ? <Loader2 className="spin" size={15} /> : <FileText size={15} />}
              Ver relatório
            </button>
          </div>
        ))}
        {filteredCashHistory.length === 0 && (
          <div className="empty-selection compact">Nenhum caixa encontrado para os filtros.</div>
        )}
      </div>
    </section>
  );
}
