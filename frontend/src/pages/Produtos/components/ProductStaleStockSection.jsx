import { Download, Printer } from "lucide-react";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { formatCurrency, formatNumber, getLocalDateKey } from "../../../utils/formatters";
import { printProductLabel } from "../../../utils/productLabels";
import { getProductStockQuantity } from "../../../utils/stock";

export function ProductStaleStockSection({ companyName, staleStockProducts, staleStockRows }) {
  return (
    <section className="panel stale-stock-panel">
      <div className="panel-title compact">
        <div>
          <h2>Estoque parado</h2>
          <p>Produtos com saldo e sem venda encontrada nos pedidos carregados.</p>
        </div>
        <div className="account-plan-actions">
          <button
            disabled={staleStockRows.length === 0}
            onClick={() => downloadCsv(`nexus-one-estoque-parado-${getLocalDateKey()}.csv`, staleStockRows)}
            type="button"
          >
            <Download size={15} />
            CSV
          </button>
          <button
            disabled={staleStockRows.length === 0}
            onClick={() => printRowsDocument("Estoque parado", staleStockRows, companyName)}
            type="button"
          >
            <Printer size={15} />
            PDF
          </button>
        </div>
      </div>

      <div className="table-wrap compact-table">
        <table>
          <tbody>
            {staleStockProducts.length === 0 ? (
              <tr>
                <td className="empty-cell" colSpan="4">Nenhum produto parado identificado com os dados atuais.</td>
              </tr>
            ) : (
              staleStockProducts.map((produto) => (
                <tr key={produto.id || produto.codigoBarras || produto.nome}>
                  <td>
                    <strong>{produto.nome || "Produto sem nome"}</strong>
                    <small>{produto.codigoBarras || "Sem código"}</small>
                  </td>
                  <td>{formatCurrency(produto.precoComDesconto || produto.precoVenda || 0)}</td>
                  <td>{formatNumber(getProductStockQuantity(produto))} un.</td>
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
    </section>
  );
}
