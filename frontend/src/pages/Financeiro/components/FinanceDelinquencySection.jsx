import { Download, Printer } from "lucide-react";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { formatCurrency, formatDate, formatNumber, getLocalDateKey } from "../../../utils/formatters";

export function FinanceDelinquencySection({
  agingBuckets,
  canMutateFinance,
  contasAReceberVencidas,
  contasAReceberVencidasDetalhadas,
  handleStatusAction,
  inadimplenciaRows,
  maiorAtrasoDias,
  saving,
  sectionRef,
  session,
  totalAReceberVencido,
}) {
  return (
    <section className="panel delinquency-panel" ref={sectionRef}>
      <div className="panel-title compact">
        <div>
          <h2>Inadimplência</h2>
          <p>Receitas pendentes vencidas para ação de cobrança.</p>
        </div>
        <div className="account-plan-actions">
          <button
            disabled={inadimplenciaRows.length === 0}
            onClick={() => downloadCsv(`nexus-one-inadimplencia-${getLocalDateKey()}.csv`, inadimplenciaRows)}
            type="button"
          >
            <Download size={15} />
            CSV
          </button>
          <button
            disabled={inadimplenciaRows.length === 0}
            onClick={() => printRowsDocument("Inadimplência", inadimplenciaRows, session.empresa || "Nexus One")}
            type="button"
          >
            <Printer size={15} />
            PDF
          </button>
        </div>
      </div>
      <div className="delinquency-summary">
        <div>
          <span>Vencidas</span>
          <strong>{formatNumber(contasAReceberVencidas.length)}</strong>
        </div>
        <div>
          <span>Valor em atraso</span>
          <strong>{formatCurrency(totalAReceberVencido)}</strong>
        </div>
        <div>
          <span>Maior atraso</span>
          <strong>{formatNumber(maiorAtrasoDias)} dia(s)</strong>
        </div>
      </div>
      <div className="aging-grid">
        {agingBuckets.map((bucket) => (
          <div className={bucket.quantidade > 0 ? "aging-card active" : "aging-card"} key={bucket.faixa}>
            <span>{bucket.faixa}</span>
            <strong>{formatCurrency(bucket.valor)}</strong>
            <small>{formatNumber(bucket.quantidade)} titulo(s)</small>
          </div>
        ))}
      </div>
      <div className="table-wrap compact-table">
        <table>
          <tbody>
            {contasAReceberVencidasDetalhadas.length === 0 ? (
              <tr>
                <td className="empty-cell" colSpan="4">Nenhuma receita vencida em aberto.</td>
              </tr>
            ) : (
              contasAReceberVencidasDetalhadas.slice(0, 6).map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.descricao || "Receita vencida"}</strong>
                    <small>{item.cliente} / pedido {item.pedidoNumero}</small>
                    <small>Venceu em {formatDate(item.vencimento)} / {formatNumber(item.diasAtraso)} dia(s) / {item.faixa}</small>
                  </td>
                  <td>{item.metodoPagamentoDescricao || item.metodoPagamento || "-"}</td>
                  <td>{formatCurrency(item.valor)}</td>
                  <td>
                    {canMutateFinance ? (
                      <button className="mini-action-button" disabled={saving} onClick={() => handleStatusAction(item.id, "baixar")} type="button">
                        Baixar
                      </button>
                    ) : (
                      <span>-</span>
                    )}
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
