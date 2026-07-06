import { formatCurrency, formatNumber } from "../../../utils/formatters";

export function TopProductsChart({ maxProductQty, topProducts }) {
  return (
    <article className="panel chart-panel">
      <div className="panel-title compact">
        <div>
          <h2>Produtos que mais vendem</h2>
          <p>Priorize compra, estoque e promocao.</p>
        </div>
      </div>
      {topProducts.length === 0 ? (
        <div className="empty-chart">Nenhum produto ranqueado no período.</div>
      ) : (
        <div className="product-chart-list">
          {topProducts.map((item) => {
            const quantity = Number(item.quantidade || 0);
            return (
              <div className="product-chart-row" key={item.produto}>
                <div>
                  <strong>{item.produto}</strong>
                  <span>{formatNumber(quantity)} un. | {formatCurrency(item.valorTotal)}</span>
                </div>
                <div className="product-bar-track">
                  <span style={{ width: `${Math.max((quantity / maxProductQty) * 100, 7)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}
