import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { StatusBadge } from "../../../components/StatusBadge/StatusBadge";
import { formatCurrency, formatDate, formatNumber } from "../../../utils/formatters";
import {
  getStockMinimum,
  getStockProductName,
  getStockQuantity,
} from "../../../utils/stock";

export function OrdersPrioritiesPanel({
  actions,
  estoqueBaixo,
  showOrders,
  showPriorities,
  ultimosPedidos,
}) {
  if (!showOrders && !showPriorities) return null;

  return (
    <section className="dashboard-grid overview-detail-grid">
      {showOrders && (
        <article className="panel orders-panel">
          <div className="panel-title">
            <div>
              <h2>Últimos pedidos</h2>
              <p>Resumo para decisão rápida.</p>
            </div>
            <span>{ultimosPedidos.length} registros</span>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {ultimosPedidos.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="empty-cell">
                      Nenhum pedido encontrado.
                    </td>
                  </tr>
                ) : (
                  ultimosPedidos.map((pedido) => (
                    <tr key={pedido.id}>
                      <td>
                        <strong>{pedido.cliente || "Cliente não informado"}</strong>
                        <small>{pedido.id}</small>
                      </td>
                      <td>{formatDate(pedido.data)}</td>
                      <td>
                        <StatusBadge status={pedido.status} />
                        <small className="status-helper">
                          {String(pedido.tipoEntrega || "RETIRADA_LOJA") === "ENTREGA" ? "Entrega" : "Retirada"}
                        </small>
                      </td>
                      <td>{formatCurrency(pedido.valor)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>
      )}

      {showPriorities && (
        <aside className="panel side-panel inventory-tools-panel">
          <div className="panel-title compact">
            <div>
              <h2>Prioridades</h2>
              <p>Próximas ações para demonstração.</p>
            </div>
          </div>

          <div className="action-list">
            {actions.length === 0 && estoqueBaixo.length === 0 ? (
              <div className="action-item success">
                <CheckCircle2 size={18} />
                Operação pronta para apresentação.
              </div>
            ) : (
              actions.map((action) => (
                <div className="action-item" key={action}>
                  <AlertTriangle size={18} />
                  {action}
                </div>
              ))
            )}

            {estoqueBaixo.length > 0 && (
              <div className="action-item stock-priority">
                <div className="stock-alert-icon">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <strong>{formatNumber(estoqueBaixo.length)} item(ns) precisam de reposição</strong>
                  <small className="stock-alert-copy">
                    Produtos abaixo do mínimo definido. Priorize a entrada no estoque.
                  </small>
                  <div className="priority-stock-list">
                    {estoqueBaixo.slice(0, 5).map((item) => {
                      const atual = Number(getStockQuantity(item) || 0);
                      const minimo = Number(getStockMinimum(item) || 0);
                      const faltam = Math.max(minimo - atual, 0);

                      return (
                        <div className="priority-stock-row" key={item.produtoId || item.id || getStockProductName(item)}>
                          <div>
                            <span>{getStockProductName(item)}</span>
                            <small>Atual {formatNumber(atual)} / Mín {formatNumber(minimo)}</small>
                          </div>
                          <strong>Faltam {formatNumber(faltam)}</strong>
                        </div>
                      );
                    })}
                  </div>
                  {estoqueBaixo.length > 5 && (
                    <em>+{formatNumber(estoqueBaixo.length - 5)} item(ns) em estoque baixo</em>
                  )}
                </div>
              </div>
            )}
          </div>
        </aside>
      )}
    </section>
  );
}
