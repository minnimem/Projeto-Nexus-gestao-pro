import { Loader2, PackageCheck, Search, X } from "lucide-react";
import { formatNumber } from "../../../utils/formatters";
import { getProductStockQuantity } from "../../../utils/stock";

import "./ProductStockForm.css";

export function ProductStockAdjustmentForm({
  adjustment,
  message,
  onSubmit,
  saving,
  selectedProduct,
  setAdjustment,
  setStockProductSearch,
  stockProductSearch,
  stockSearchResults,
}) {
  function clearProduct() {
    setStockProductSearch("");
    setAdjustment((current) => ({ ...current, produtoId: "" }));
  }

  return (
    <section className="inventory-tool-card">
      <div className="panel-title compact">
        <div>
          <h2>Ajuste rápido</h2>
          <p>Entrada e saída conectadas ao Spring Boot.</p>
        </div>
      </div>

      <form className="stock-form" onSubmit={onSubmit}>
        <label className="stock-product-search">
          <span>Produto</span>
          <div className="client-search-box">
            <Search size={17} />
            <input
              value={selectedProduct ? selectedProduct.nome : stockProductSearch}
              onChange={(event) => {
                setStockProductSearch(event.target.value);
                setAdjustment((current) => ({ ...current, produtoId: "" }));
              }}
              placeholder="Digite nome ou código do produto"
            />
            {selectedProduct && (
              <button className="inline-clear-button" onClick={clearProduct} title="Limpar produto" type="button">
                <X size={15} />
              </button>
            )}
          </div>
          {!selectedProduct && stockProductSearch.trim() && (
            <div className="client-results stock-search-results">
              {stockSearchResults.length === 0 ? (
                <button className="client-result empty" disabled type="button">Nenhum produto encontrado</button>
              ) : (
                stockSearchResults.map((produto) => (
                  <button
                    className="client-result"
                    key={produto.id}
                    onClick={() => {
                      setAdjustment((current) => ({ ...current, produtoId: produto.id }));
                      setStockProductSearch(produto.nome || "");
                    }}
                    type="button"
                  >
                    <strong>{produto.nome || "Produto sem nome"}</strong>
                    <small>
                      {produto.codigoBarras || "Sem código"} | Estoque {formatNumber(getProductStockQuantity(produto))}
                    </small>
                  </button>
                ))
              )}
            </div>
          )}
        </label>

        {selectedProduct && (
          <p className="stock-current">
            Saldo atual: <strong>{formatNumber(getProductStockQuantity(selectedProduct))}</strong> unidades
          </p>
        )}

        <label>
          <span>Quantidade</span>
          <input
            min="1"
            type="number"
            value={adjustment.quantidade}
            onChange={(event) => setAdjustment((current) => ({ ...current, quantidade: event.target.value }))}
          />
        </label>

        <div className="segmented">
          <button
            className={adjustment.type === "entrada" ? "active" : ""}
            onClick={() => setAdjustment((current) => ({ ...current, type: "entrada" }))}
            type="button"
          >
            Entrada
          </button>
          <button
            className={adjustment.type === "saida" ? "active" : ""}
            onClick={() => setAdjustment((current) => ({ ...current, type: "saida" }))}
            type="button"
          >
            Saida
          </button>
        </div>

        <button disabled={saving} type="submit">
          {saving ? <Loader2 className="spin" size={17} /> : <PackageCheck size={17} />}
          {saving ? "Atualizando..." : "Atualizar estoque"}
        </button>

        {message && <p className={`form-message ${message.type}`}>{message.text}</p>}
      </form>
    </section>
  );
}
