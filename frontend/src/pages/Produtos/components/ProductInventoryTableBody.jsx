import { Barcode, Printer } from "lucide-react";
import { formatCurrency, formatNumber } from "../../../utils/formatters";
import { printProductLabel } from "../../../utils/productLabels";
import { formatProfit } from "../utils/productUtils";

export function ProductInventoryTableBody({
  companyName,
  filteredProducts,
  getFilteredProductMinimum,
  getFilteredProductStock,
  paginatedProducts,
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Produto</th>
            <th>Código</th>
            <th>Fiscal</th>
            <th>Categoria</th>
            <th>Marca</th>
            <th>Fornecedor</th>
            <th>Preco</th>
            <th>Lucro</th>
            <th>Estoque</th>
            <th>Status</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.length === 0 ? (
            <tr>
              <td colSpan="11" className="empty-cell">Nenhum produto encontrado.</td>
            </tr>
          ) : (
            paginatedProducts.map((produto) => (
              <tr key={produto.id}>
                <td>
                  <strong>{produto.nome || "Produto sem nome"}</strong>
                  <small>{produto.id}</small>
                </td>
                <td>
                  <span className="code-cell">
                    <Barcode size={14} />
                    {produto.codigoBarras || "-"}
                  </span>
                </td>
                <td>
                  <strong>{produto.ncm || "NCM pendente"}</strong>
                  <small>CFOP {produto.cfop || "-"}</small>
                </td>
                <td>{produto.categoria || "-"}</td>
                <td>{produto.marca || "-"}</td>
                <td>{produto.fornecedor || "-"}</td>
                <td>
                  <strong>{formatCurrency(produto.precoComDesconto)}</strong>
                  <small>Base {formatCurrency(produto.precoVenda)}</small>
                </td>
                <td>{formatProfit(produto.lucro)}</td>
                <td>
                  <span
                    className={`stock-badge ${
                      getFilteredProductMinimum(produto) > 0 && getFilteredProductStock(produto) <= getFilteredProductMinimum(produto) ?
                        "low"
                        : getFilteredProductStock(produto) > 0 ?
                          "ok"
                          : "empty"
                    }`}
                  >
                    {formatNumber(getFilteredProductStock(produto))}
                  </span>
                  <small>Min {formatNumber(getFilteredProductMinimum(produto))}</small>
                </td>
                <td>
                  <span className={`pill ${produto.ativo ? "entregue" : "cancelado"}`}>
                    {produto.ativo ? "ATIVO" : "INATIVO"}
                  </span>
                </td>
                <td>
                  <button
                    className="mini-action-button"
                    onClick={() => printProductLabel(produto, companyName)}
                    type="button"
                  >
                    <Printer size={15} />
                    Etiqueta
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
