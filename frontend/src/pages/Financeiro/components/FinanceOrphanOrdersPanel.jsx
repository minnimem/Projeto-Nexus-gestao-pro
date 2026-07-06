import { Download, Printer } from "lucide-react";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { formatCurrency, formatDateTime, formatNumber, getLocalDateKey } from "../../../utils/formatters";

export function FinanceOrphanOrdersPanel({
  allVisibleOrphansSelected,
  handleCancelOrphanOrder,
  handleCancelOrphanOrders,
  handleToggleOrphanSelection,
  handleToggleVisibleOrphans,
  isAdmin,
  orphanPreview,
  orphanReportRows,
  pedidosSemItens,
  saving,
  sectionRef,
  selectedOrphanIds,
  session,
}) {
  return (
    <article className="panel soft-panel" ref={sectionRef}>
      <div className="panel-title compact">
        <div>
          <h2>Pedidos sem itens</h2>
          <p>Pedidos antigos ou inconsistentes removidos da conciliação principal.</p>
        </div>
        <span>{formatNumber(pedidosSemItens.length)}</span>
      </div>
      <div className="compact-toolbar">
        <div className="report-actions compact-report-actions">
          <button
            className="report-export"
            disabled={orphanReportRows.length === 0}
            onClick={() => downloadCsv(`nexus-one-pedidos-sem-itens-${getLocalDateKey()}.csv`, orphanReportRows)}
            type="button"
          >
            <Download size={17} />
            CSV
          </button>
          <button
            className="report-export secondary"
            disabled={orphanReportRows.length === 0}
            onClick={() => printRowsDocument("Pedidos sem itens", orphanReportRows, session.empresa || "Nexus One")}
            type="button"
          >
            <Printer size={17} />
            PDF
          </button>
        </div>
        {isAdmin && (
          <div className="compact-bulk-actions">
            <label className="bulk-select-toggle">
              <input
                checked={allVisibleOrphansSelected}
                disabled={orphanPreview.length === 0 || saving}
                onChange={handleToggleVisibleOrphans}
                type="checkbox"
              />
              Selecionar visiveis
            </label>
            <div className="table-actions">
              <button
                disabled={selectedOrphanIds.length === 0 || saving}
                onClick={() => handleCancelOrphanOrders(selectedOrphanIds, `${formatNumber(selectedOrphanIds.length)} pedidos selecionados`)}
                type="button"
              >
                Cancelar selecionados
              </button>
              <button
                disabled={pedidosSemItens.length === 0 || saving}
                onClick={() => handleCancelOrphanOrders(pedidosSemItens.map((pedido) => pedido.id), "todos os pedidos listados")}
                type="button"
              >
                Cancelar todos
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="table-wrap compact-table">
        <table>
          <tbody>
            {orphanPreview.map((pedido) => (
              <tr key={pedido.id}>
                <td>
                  <div className="orphan-order-cell">
                    {isAdmin && (
                      <input
                        checked={selectedOrphanIds.includes(String(pedido.id))}
                        disabled={saving}
                        onChange={() => handleToggleOrphanSelection(pedido.id)}
                        type="checkbox"
                      />
                    )}
                    <div>
                      <strong>{pedido.numero || pedido.id}</strong>
                      <small>{formatDateTime(pedido.data)} / {pedido.usuario || "Usuário não identificado"}</small>
                      <small>{pedido.empresa || session.empresa || "Empresa não identificada"} / sem itens cadastrados</small>
                    </div>
                  </div>
                </td>
                <td>{formatCurrency(pedido.valor)}</td>
                <td>
                  {isAdmin ? (
                    <div className="table-actions">
                      <button
                        disabled={saving}
                        onClick={() => handleCancelOrphanOrder(pedido.id)}
                        type="button"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : "-"}
                </td>
              </tr>
            ))}
            {pedidosSemItens.length === 0 && (
              <tr>
                <td className="empty-cell" colSpan="3">Nenhum pedido inconsistente encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </article>
  );
}
