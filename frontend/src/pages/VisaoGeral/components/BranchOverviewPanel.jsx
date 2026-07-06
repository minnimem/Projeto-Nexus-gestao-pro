import { formatCurrency, formatNumber } from "../../../utils/formatters";

export function BranchOverviewPanel({ branchOverviewRows }) {
  return (
    <section className="panel account-plan-summary">
      <div className="account-plan-head">
        <div>
          <h3>Operação por filial</h3>
          <p>Vendas, pendências, equipe e entregas em uma leitura rápida.</p>
        </div>
        <span>{formatNumber(branchOverviewRows.length)} filial(is)</span>
      </div>
      <div className="account-plan-grid compact-catalog-grid">
        {branchOverviewRows.length === 0 ? (
          <div className="empty-selection compact">Nenhuma filial com movimento para resumir.</div>
        ) : (
          branchOverviewRows.map((row) => (
            <div className="account-plan-item" key={row.id}>
              <span>{row.filial}</span>
              <strong>{formatCurrency(row.receita)}</strong>
              <small>{formatNumber(row.vendas)} venda(s) / {formatNumber(row.pendentes)} pendente(s)</small>
              <small>{formatNumber(row.equipe)} ativo(s) / {formatNumber(row.entregas)} entrega(s)</small>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
