import { formatCurrency, formatDate, formatDateTime, formatNumber } from "../../../utils/formatters";

export function FinanceReconciliationDetailsPanels({
  caixasComDivergencia,
  cashDivergenceRef,
  financeiroSemPedido,
  orphanlessRevenueRef,
}) {
  return (
    <>
      <article className="panel soft-panel" ref={cashDivergenceRef}>
        <div className="panel-title compact">
          <div>
            <h2>Caixas com divergência</h2>
            <p>Fechamentos onde contado e calculado não batem.</p>
          </div>
          <span>{formatNumber(caixasComDivergencia.length)}</span>
        </div>
        <div className="table-wrap compact-table">
          <table>
            <tbody>
              {caixasComDivergencia.slice(0, 6).map((caixa) => (
                <tr key={caixa.id}>
                  <td>
                    <strong>{caixa.usuarioNome || caixa.usuarioLogin || "Operador"}</strong>
                    <small>{formatDate(caixa.dataAbertura)} / {caixa.status}</small>
                  </td>
                  <td>{formatCurrency(caixa.divergencia)}</td>
                </tr>
              ))}
              {caixasComDivergencia.length === 0 && (
                <tr>
                  <td className="empty-cell" colSpan="2">Nenhuma divergência encontrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>

      <article className="panel soft-panel" ref={orphanlessRevenueRef}>
        <div className="panel-title compact">
          <div>
            <h2>Receitas sem pedido</h2>
            <p>Lançamentos aprovados sem pedido vinculado para revisão manual.</p>
          </div>
          <span>{formatNumber(financeiroSemPedido.length)}</span>
        </div>
        <div className="table-wrap compact-table">
          <table>
            <tbody>
              {financeiroSemPedido.slice(0, 6).map((item) => (
                <tr key={item.id || item.descricao}>
                  <td>
                    <strong>{item.descricao || "Lançamento sem descrição"}</strong>
                    <small>{formatDateTime(item.dataLancamento)} / {item.usuario || "Usuário não identificado"}</small>
                  </td>
                  <td>{item.metodoPagamento || item.categoria || "-"}</td>
                  <td>{formatCurrency(item.valor)}</td>
                </tr>
              ))}
              {financeiroSemPedido.length === 0 && (
                <tr>
                  <td className="empty-cell" colSpan="3">Nenhum lançamento aprovado sem pedido vinculado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </>
  );
}

