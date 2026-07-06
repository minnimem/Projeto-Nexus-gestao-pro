import { Download, Printer } from "lucide-react";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import {
  asList,
  formatCurrency,
  formatDateTime,
  formatNumber,
  getLocalDateKey,
} from "../../../utils/formatters";

export function ProductPurchaseHistorySection({
  companyName,
  compras,
  purchaseHistoryRows,
  selectedInventoryBranchLabel,
}) {
  return (
    <section className="inventory-tool-card inventory-history-card">
      <div className="panel-title compact">
        <div>
          <h2>Histórico de compras</h2>
          <p>Últimas compras de estoque registradas.</p>
        </div>
        <div className="account-plan-actions">
          <button
            disabled={purchaseHistoryRows.length === 0}
            onClick={() => downloadCsv(`nexus-one-compras-${getLocalDateKey()}.csv`, purchaseHistoryRows)}
            type="button"
          >
            <Download size={15} />
            CSV
          </button>
          <button
            disabled={purchaseHistoryRows.length === 0}
            onClick={() => printRowsDocument("Histórico de compras", purchaseHistoryRows, companyName)}
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
            {compras.length === 0 ? (
              <tr>
                <td className="empty-cell">Nenhuma compra registrada.</td>
              </tr>
            ) : (
              compras.slice(0, 6).map((compra) => {
                const itens = asList(compra.itens);
                const quantidade = itens.reduce((total, item) => total + Number(item.quantidade || 0), 0);
                const subtotal = itens.reduce((total, item) => total + Number(item.subtotal || 0), 0);

                return (
                  <tr key={compra.id}>
                    <td>
                      <strong>{compra.fornecedor || "Fornecedor"}</strong>
                      <small>{formatDateTime(compra.dataCompra)} / {compra.filial || selectedInventoryBranchLabel}</small>
                      <small>{compra.numeroDocumento || "Sem documento"}</small>
                    </td>
                    <td>{formatNumber(itens.length)} itens</td>
                    <td>
                      <strong>{itens.length > 0 ? formatCurrency(subtotal / Math.max(quantidade, 1)) : "-"}</strong>
                      <small>custo medio</small>
                    </td>
                    <td>{formatCurrency(compra.valorTotal)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
