import { formatNumber } from "../../../utils/formatters";

export function ProductInventoryPagination({
  currentProductPage,
  filteredProducts,
  productPageSize,
  productTotalPages,
  setProductPage,
}) {
  if (filteredProducts.length <= productPageSize) return null;

  return (
    <div className="table-pagination">
      <button
        disabled={currentProductPage === 0}
        onClick={() => setProductPage((page) => Math.max(page - 1, 0))}
        type="button"
      >
        Anterior
      </button>
      <span>
        Pagina {formatNumber(currentProductPage + 1)} de {formatNumber(productTotalPages)}
      </span>
      <button
        disabled={currentProductPage >= productTotalPages - 1}
        onClick={() => setProductPage((page) => Math.min(page + 1, productTotalPages - 1))}
        type="button"
      >
        Próximo
      </button>
    </div>
  );
}
