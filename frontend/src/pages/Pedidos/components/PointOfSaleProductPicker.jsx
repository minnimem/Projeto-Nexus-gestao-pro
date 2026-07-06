import { Barcode, Plus, Search } from "lucide-react";
import { formatCurrency, formatNumber } from "../../../utils/formatters";
import { getProductId, getProductPrice } from "../../../utils/products";
import { getProductStockQuantity } from "../../../utils/stock";

export function PointOfSaleProductPicker({
  addProduct,
  addProductFromSearch,
  cashMode,
  filteredProducts,
  productSearch,
  productSearchRef,
  setProductSearch,
}) {
  return (
    <>
      <label className="search-field product-search">
        {cashMode ? <Barcode size={17} /> : <Search size={17} />}
        <input
          ref={productSearchRef}
          value={productSearch}
          onChange={(event) => setProductSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addProductFromSearch();
            }
          }}
          placeholder={cashMode ? "Ler código de barras ou buscar produto" : "Buscar produto para adicionar"}
        />
      </label>
      <div className="product-pick-list">
        {filteredProducts.length === 0 ? (
          <div className="empty-selection">Nenhum produto ativo encontrado.</div>
        ) : (
          filteredProducts.map((produto) => (
            <button className="product-pick" key={getProductId(produto)} onClick={() => addProduct(produto)} type="button">
              <span>
                <strong>{produto.nome || "Produto sem nome"}</strong>
                <small>{produto.codigoBarras || "Sem código"} | Estoque {formatNumber(getProductStockQuantity(produto))}</small>
              </span>
              <em>{formatCurrency(getProductPrice(produto))}</em>
              <Plus size={17} />
            </button>
          ))
        )}
      </div>
    </>
  );
}
