import { Download, Printer } from "lucide-react";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { formatNumber, getLocalDateKey } from "../../../utils/formatters";

export function CommercialReportsPanel({
  customerRevenueReportRows,
  dormantCustomerRows,
  paymentReportRows,
  productSalesReportRows,
  session,
}) {
  return (
    <>
      <section className="panel payment-method-report">
        <div className="panel-title compact">
          <div>
            <h2>Formas de pagamento</h2>
            <p>Ranking por valor recebido, participação e ticket medio.</p>
          </div>
          <div className="account-plan-actions">
            <button
              disabled={paymentReportRows.length === 0}
              onClick={() => downloadCsv(`nexus-one-formas-pagamento-${getLocalDateKey()}.csv`, paymentReportRows)}
              type="button"
            >
              <Download size={15} />
              CSV
            </button>
            <button
              disabled={paymentReportRows.length === 0}
              onClick={() => printRowsDocument("Formas de pagamento", paymentReportRows, session.empresa || "Nexus One")}
              type="button"
            >
              <Printer size={15} />
              PDF
            </button>
          </div>
        </div>
        <div className="payment-method-grid">
          {paymentReportRows.length === 0 ? (
            <div className="empty-selection compact">Nenhuma forma de pagamento encontrada no período.</div>
          ) : (
            paymentReportRows.slice(0, 6).map((row, index) => (
              <article className={index === 0 ? "leader" : ""} key={row["Forma de pagamento"]}>
                <span>{row["Forma de pagamento"]}</span>
                <strong>{row.Total}</strong>
                <small>{row.Vendas} venda(s) / {row.Participacao}</small>
                <small>Ticket médio {row["Ticket médio"]}</small>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="panel customer-revenue-report">
        <div className="panel-title compact">
          <div>
            <h2>Clientes por receita</h2>
            <p>Carteira prioritaria por valor, recompra e ticket medio.</p>
          </div>
          <div className="account-plan-actions">
            <button
              disabled={customerRevenueReportRows.length === 0}
              onClick={() => downloadCsv(`nexus-one-clientes-receita-${getLocalDateKey()}.csv`, customerRevenueReportRows)}
              type="button"
            >
              <Download size={15} />
              CSV
            </button>
            <button
              disabled={customerRevenueReportRows.length === 0}
              onClick={() => printRowsDocument("Clientes por receita", customerRevenueReportRows, session.empresa || "Nexus One")}
              type="button"
            >
              <Printer size={15} />
              PDF
            </button>
          </div>
        </div>
        <div className="customer-revenue-grid">
          {customerRevenueReportRows.length === 0 ? (
            <div className="empty-selection compact">Nenhum cliente com venda concluída no período.</div>
          ) : (
            customerRevenueReportRows.slice(0, 8).map((row) => (
              <article key={`${row.Posicao}-${row.Cliente}`}>
                <span>#{row.Posicao}</span>
                <strong>{row.Cliente}</strong>
                <small>{row.Receita} / {row.Vendas} venda(s)</small>
                <small>Ticket {row["Ticket médio"]} / última {row["Última compra"]}</small>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="panel dormant-customer-report">
        <div className="panel-title compact">
          <div>
            <h2>Clientes sem recompra</h2>
            <p>Carteira sem venda concluída no filtro atual para reativação comercial.</p>
          </div>
          <div className="account-plan-actions">
            <span>{formatNumber(dormantCustomerRows.length)} cliente(s)</span>
            <button
              disabled={dormantCustomerRows.length === 0}
              onClick={() => downloadCsv(`nexus-one-clientes-sem-recompra-${getLocalDateKey()}.csv`, dormantCustomerRows)}
              type="button"
            >
              <Download size={15} />
              CSV
            </button>
            <button
              disabled={dormantCustomerRows.length === 0}
              onClick={() => printRowsDocument("Clientes sem recompra", dormantCustomerRows, session.empresa || "Nexus One")}
              type="button"
            >
              <Printer size={15} />
              PDF
            </button>
          </div>
        </div>
        <div className="dormant-customer-list">
          {dormantCustomerRows.length === 0 ? (
            <div className="empty-selection compact">Todos os clientes carregados tiveram compra no período filtrado.</div>
          ) : (
            dormantCustomerRows.slice(0, 6).map((row) => (
              <article key={`${row.Cliente}-${row.Email}`}>
                <div>
                  <strong>{row.Cliente}</strong>
                  <small>{row.Telefone} / {row.Email}</small>
                </div>
                <span>{row["Dias sem compra"]} dia(s)</span>
                <small>{row.Acao}</small>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="panel product-sales-report">
        <div className="panel-title compact">
          <div>
            <h2>Produtos vendidos</h2>
            <p>Ranking por receita, quantidade e giro no período filtrado.</p>
          </div>
          <div className="account-plan-actions">
            <button
              disabled={productSalesReportRows.length === 0}
              onClick={() => downloadCsv(`nexus-one-produtos-vendidos-${getLocalDateKey()}.csv`, productSalesReportRows)}
              type="button"
            >
              <Download size={15} />
              CSV
            </button>
            <button
              disabled={productSalesReportRows.length === 0}
              onClick={() => printRowsDocument("Produtos vendidos", productSalesReportRows, session.empresa || "Nexus One")}
              type="button"
            >
              <Printer size={15} />
              PDF
            </button>
          </div>
        </div>
        <div className="product-sales-grid">
          {productSalesReportRows.length === 0 ? (
            <div className="empty-selection compact">Nenhum item de pedido carregado para o período.</div>
          ) : (
            productSalesReportRows.slice(0, 8).map((row) => (
              <article key={`${row.Posicao}-${row.Produto}`}>
                <span>#{row.Posicao}</span>
                <strong>{row.Produto}</strong>
                <small>{row.Receita} / {row.Quantidade} un.</small>
                <small>{row.Acao}</small>
              </article>
            ))
          )}
        </div>
      </section>
    </>
  );
}
