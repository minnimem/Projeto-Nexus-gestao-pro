import { formatCurrency, formatDate, formatNumber, isDateBeforeToday } from "../../../utils/formatters";

function FinanceAccountPanel({
  canMutateFinance,
  emptyMessage,
  fallbackDescription,
  handleStatusAction,
  items,
  pendingDescription,
  pendingItems,
  saving,
  title,
  total,
  overdueItems,
  overdueMessage,
}) {
  return (
    <article className="panel soft-panel">
      <div className="panel-title compact">
        <div>
          <h2>{title}</h2>
          <p>{pendingDescription}</p>
        </div>
        <span>{formatCurrency(total)}</span>
      </div>
      <div className="reconciliation-grid compact-metrics-grid">
        <div>
          <span>Pendentes</span>
          <strong>{formatNumber(pendingItems.length)}</strong>
          <small>{formatCurrency(total)}</small>
        </div>
        <div>
          <span>Vencidas</span>
          <strong>{formatNumber(overdueItems.length)}</strong>
          <small>{overdueMessage}</small>
        </div>
      </div>
      <div className="due-account-list">
        {items.length === 0 ? (
          <div className="empty-selection compact">{emptyMessage}</div>
        ) : (
          items.map((item) => (
            <div className={`due-account ${isDateBeforeToday(item.dataVencimento || item.dataLancamento) ? "overdue" : ""} ${item.classe || ""}`} key={item.id}>
              <div>
                <strong>{item.descricao || fallbackDescription}</strong>
                <small>Vence em {formatDate(item.dataVencimento || item.dataLancamento)} / {item.metodoPagamentoDescricao || item.metodoPagamento || "-"}</small>
                <small>Prioridade {item.prioridade} / {item.acao}</small>
              </div>
              <span>{formatCurrency(item.valor)}</span>
              {canMutateFinance && (
                <button disabled={saving} onClick={() => handleStatusAction(item.id, "baixar")} type="button">
                  Baixar
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </article>
  );
}

export function FinanceAccountsSection({
  canMutateFinance,
  contasAPagar,
  contasAPagarVencidas,
  contasAReceber,
  contasAReceberVencidas,
  handleStatusAction,
  proximasContasAPagar,
  proximasContasAReceber,
  saving,
  totalAPagar,
  totalAReceber,
}) {
  return (
    <section className="dashboard-grid finance-grid">
      <FinanceAccountPanel
        canMutateFinance={canMutateFinance}
        emptyMessage="Nenhuma conta a receber pendente."
        fallbackDescription="Receita pendente"
        handleStatusAction={handleStatusAction}
        items={proximasContasAReceber}
        overdueItems={contasAReceberVencidas}
        overdueMessage="Precisa cobrar"
        pendingDescription="Receitas pendentes separadas por vencimento."
        pendingItems={contasAReceber}
        saving={saving}
        title="Contas a receber"
        total={totalAReceber}
      />
      <FinanceAccountPanel
        canMutateFinance={canMutateFinance}
        emptyMessage="Nenhuma conta a pagar pendente."
        fallbackDescription="Despesa pendente"
        handleStatusAction={handleStatusAction}
        items={proximasContasAPagar}
        overdueItems={contasAPagarVencidas}
        overdueMessage="Precisa pagar"
        pendingDescription="Despesas pendentes para controle do caixa futuro."
        pendingItems={contasAPagar}
        saving={saving}
        title="Contas a pagar"
        total={totalAPagar}
      />
    </section>
  );
}


