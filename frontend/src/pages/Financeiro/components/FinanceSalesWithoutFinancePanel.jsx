import { formatCurrency, formatNumber } from "../../../utils/formatters";

export function FinanceSalesWithoutFinancePanel({
  getPedidoItemSummary,
  sectionRef,
  vendasSemFinanceiro,
}) {
  return (
    <article className="panel soft-panel" ref={sectionRef}>
      <div className="panel-title compact">
        <div>
          <h2>Vendas sem financeiro</h2>
          <p>Pedidos recebidos sem receita aprovada vinculada.</p>
        </div>
        <span>{formatNumber(vendasSemFinanceiro.length)}</span>
      </div>
      <div className="table-wrap compact-table">
        <table>
          <tbody>
            {vendasSemFinanceiro.slice(0, 6).map((pedido) => (
              <tr key={pedido.id}>
                <td>
                  <strong>{getPedidoItemSummary(pedido)}</strong>
                  <small>{pedido.numero || pedido.id}</small>
                </td>
                <td>{formatCurrency(pedido.valor)}</td>
              </tr>
            ))}
            {vendasSemFinanceiro.length === 0 && (
              <tr>
                <td className="empty-cell" colSpan="2">Nenhuma venda pendente de financeiro.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </article>
  );
}

