import { formatCurrency, formatNumber } from "../../../utils/formatters";

export function SalesOrdersPerformancePanel({
  rankingProdutos,
  ticketMedio,
  vendasPorDia,
}) {
  return (
    <aside className="panel side-panel">
      <div className="panel-title compact">
        <div>
          <h2>Performance</h2>
          <p>Resumo operacional.</p>
        </div>
      </div>
      <div className="metric-list">
        <div>
          <span>Ticket médio</span>
          <strong>{formatCurrency(ticketMedio)}</strong>
        </div>
        <div>
          <span>Dias com venda</span>
          <strong>{formatNumber(vendasPorDia.length)}</strong>
        </div>
        <div>
          <span>Produtos no ranking</span>
          <strong>{formatNumber(rankingProdutos.length)}</strong>
        </div>
      </div>
      <div className="ranking">
        <h3>Ranking de produtos</h3>
        {rankingProdutos.length === 0 ? (
          <p>Nenhum produto ranqueado no período.</p>
        ) : (
          rankingProdutos.map((item) => (
            <div className="ranking-row" key={item.produto}>
              <span>{item.produto}</span>
              <strong>{formatCurrency(item.valorTotal)}</strong>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
