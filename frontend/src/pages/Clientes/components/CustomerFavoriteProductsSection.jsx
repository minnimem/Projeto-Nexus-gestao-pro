import { formatCurrency, formatNumber } from "../../../utils/formatters";
import "./CustomerFavoriteProductsSection.css";

export function CustomerFavoriteProductsSection({ products }) {
  return (
    <div className="customer-products-panel">
      <div className="customer-products-title">
        <span>Produtos favoritos</span>
        <strong>{formatNumber(products.length)} item(ns)</strong>
      </div>
      {products.length === 0 ? (
        <div className="empty-selection compact">Produtos ainda não carregados no histórico.</div>
      ) : (
        <div className="customer-products-list">
          {products.map((item) => (
            <div className="customer-product-item" key={item.name}>
              <span className="customer-product-rank">{item.name.slice(0, 2).toUpperCase()}</span>
              <span>
                <strong>{item.name}</strong>
                <small>{formatNumber(item.quantity)} un. comprada(s)</small>
              </span>
              <em>{formatCurrency(item.revenue)}</em>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
