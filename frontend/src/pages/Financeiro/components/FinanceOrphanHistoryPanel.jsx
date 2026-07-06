import { Download, Printer } from "lucide-react";
import { StatusBadge } from "../../../components/StatusBadge/StatusBadge";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { formatNumber, getLocalDateKey } from "../../../utils/formatters";

const historyPresets = [
  ["TODOS", "Todos"],
  ["HOJE", "Hoje"],
  ["SEMANA", "Semana"],
  ["MES", "Mês"],
];

export function FinanceOrphanHistoryPanel({
  applyOrphanHistoryPreset,
  currentOrphanHistoryPage,
  filteredOrphanCancellationEvents,
  orphanCancellationRows,
  orphanHistoryFilter,
  orphanHistoryTotalPages,
  pagedOrphanCancellationEvents,
  sectionRef,
  session,
  setOrphanHistoryFilter,
  setOrphanHistoryPage,
}) {
  const clearDisabled = !orphanHistoryFilter.busca
    && !orphanHistoryFilter.inicio
    && !orphanHistoryFilter.fim
    && orphanHistoryFilter.preset === "TODOS";

  return (
    <article className="panel soft-panel" ref={sectionRef}>
      <div className="panel-title compact">
        <div>
          <h2>Histórico dos cancelados</h2>
          <p>Pedidos sem itens cancelados administrativamente com rastreio de responsável.</p>
        </div>
        <div className="panel-actions">
          <span>{formatNumber(filteredOrphanCancellationEvents.length)}</span>
          <div className="report-actions compact-report-actions">
            <button
              className="report-export"
              disabled={orphanCancellationRows.length === 0}
              onClick={() => downloadCsv(`nexus-one-pedidos-sem-itens-cancelados-${getLocalDateKey()}.csv`, orphanCancellationRows)}
              type="button"
            >
              <Download size={17} />
              CSV
            </button>
            <button
              className="report-export secondary"
              disabled={orphanCancellationRows.length === 0}
              onClick={() => printRowsDocument("Histórico de pedidos sem itens cancelados", orphanCancellationRows, session.empresa || "Nexus One")}
              type="button"
            >
              <Printer size={17} />
              PDF
            </button>
          </div>
        </div>
      </div>
      <div className="chart-tabs compact-tabs" aria-label="Período do histórico de pedidos sem itens cancelados">
        {historyPresets.map(([value, label]) => (
          <button
            key={value}
            className={orphanHistoryFilter.preset === value ? "active" : ""}
            onClick={() => applyOrphanHistoryPreset(value)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
      <div className="audit-filters">
        <label>
          <span>Busca</span>
          <input
            value={orphanHistoryFilter.busca}
            onChange={(event) => setOrphanHistoryFilter((current) => ({ ...current, busca: event.target.value }))}
            placeholder="Pedido, usuário ou responsável"
          />
        </label>
        <label>
          <span>Início</span>
          <input
            type="date"
            value={orphanHistoryFilter.inicio}
            onChange={(event) => setOrphanHistoryFilter((current) => ({
              ...current,
              inicio: event.target.value,
              preset: "PERSONALIZADO",
            }))}
          />
        </label>
        <label>
          <span>Fim</span>
          <input
            type="date"
            value={orphanHistoryFilter.fim}
            onChange={(event) => setOrphanHistoryFilter((current) => ({
              ...current,
              fim: event.target.value,
              preset: "PERSONALIZADO",
            }))}
          />
        </label>
        <button
          disabled={clearDisabled}
          onClick={() => setOrphanHistoryFilter({ busca: "", inicio: "", fim: "", preset: "TODOS" })}
          type="button"
        >
          Limpar
        </button>
      </div>
      <div className="table-wrap compact-table">
        <table>
          <tbody>
            {pagedOrphanCancellationEvents.map((evento) => (
              <tr key={evento.id}>
                <td>
                  <strong>{evento.pedidoNumero}</strong>
                  <small>{evento.canceladoEm} / {evento.canceladoPor}</small>
                  <small>{evento.usuarioOrigem} / {evento.empresaOrigem}</small>
                </td>
                <td>{evento.valor}</td>
                <td>
                  <StatusBadge status={evento.status} />
                </td>
              </tr>
            ))}
            {filteredOrphanCancellationEvents.length === 0 && (
              <tr>
                <td className="empty-cell" colSpan="3">Nenhum pedido sem itens cancelado administrativamente.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="table-pagination">
        <button
          disabled={currentOrphanHistoryPage === 0}
          onClick={() => setOrphanHistoryPage((page) => Math.max(page - 1, 0))}
          type="button"
        >
          Anterior
        </button>
        <span>
          Página {formatNumber(currentOrphanHistoryPage + 1)} de {formatNumber(orphanHistoryTotalPages)}
        </span>
        <button
          disabled={currentOrphanHistoryPage >= orphanHistoryTotalPages - 1}
          onClick={() => setOrphanHistoryPage((page) => Math.min(page + 1, orphanHistoryTotalPages - 1))}
          type="button"
        >
          Próximo
        </button>
      </div>
    </article>
  );
}
