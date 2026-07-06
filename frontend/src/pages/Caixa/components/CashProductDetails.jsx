import { formatCurrency, formatNumber } from "../../../utils/formatters";

export function CashProductDetails({
  productItems,
  productItemsPerPage,
  productItemsQuantityTotal,
  productItemsValueTotal,
  productPageCount,
  productTotalDifference,
  safeProductDetailsPage,
  setProductDetailsPage,
  visibleProductItems,
}) {
  return (
    <div className="cash-product-details">
      <div className="cash-product-summary">
        <span>{formatNumber(productItems.length)} item(ns)</span>
        <span>{formatNumber(productItemsQuantityTotal)} unidade(s)</span>
        <strong>{formatCurrency(productItemsValueTotal)}</strong>
        {productItems.length > 0 && Math.abs(productTotalDifference) >= 0.01 && (
          <em>Diferenca {formatCurrency(Math.abs(productTotalDifference))}</em>
        )}
      </div>
      <div className="cash-product-table">
        <table>
          <thead>
            <tr>
              <th>Cod.</th>
              <th>Resumo descrição</th>
              <th>Qta.</th>
              <th>Valor</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {productItems.length === 0 ? (
              <tr>
                <td colSpan="5">Itens não carregados para este pedido.</td>
              </tr>
            ) : (
              visibleProductItems.map((item) => {
                const quantidade = Number(item.quantidade || 0);
                const valorUnitario = Number(item.precoUnit || item.precoUnitario || item.preco || 0);
                const subtotal = Number(item.subtotal || quantidade * valorUnitario);
                return (
                  <tr key={item.id || item.produtoId || item.produto}>
                    <td>{item.codigoBarras || item.codigo || item.produtoId || "-"}</td>
                    <td>{item.produto || item.nomeProduto || "Produto sem nome"}</td>
                    <td>{formatNumber(quantidade)}</td>
                    <td>{formatCurrency(valorUnitario)}</td>
                    <td>{formatCurrency(subtotal)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {productItems.length > productItemsPerPage && (
        <div className="cash-product-pagination">
          <button
            disabled={safeProductDetailsPage === 0}
            onClick={() => setProductDetailsPage((current) => Math.max(0, current - 1))}
            type="button"
          >
            {"<"}
          </button>
          <span>
            {formatNumber(safeProductDetailsPage + 1)}/{formatNumber(productPageCount)}
          </span>
          <button
            disabled={safeProductDetailsPage >= productPageCount - 1}
            onClick={() => setProductDetailsPage((current) => Math.min(productPageCount - 1, current + 1))}
            type="button"
          >
            {">"}
          </button>
        </div>
      )}
    </div>
  );
}
