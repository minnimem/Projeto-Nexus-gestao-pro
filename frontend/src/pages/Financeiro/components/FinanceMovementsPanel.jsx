import { Download, Plus, Printer, WalletCards } from "lucide-react";
import { StatusBadge } from "../../../components/StatusBadge/StatusBadge";
import { TableEmptyState } from "../../../components/common/StatusUi";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { formatCurrency, formatDate, formatNumber, getLocalDateKey, isDateBeforeToday } from "../../../utils/formatters";
import { getMixedPaymentObservation } from "../../../utils/payments";

export function FinanceMovementsPanel({
  branchScopedMovimentacoes,
  canMutateFinance,
  canReverseFinance,
  currentFinancePage,
  financeFilter,
  financeFilterLabel,
  financeMovementRows,
  financePageSize,
  financeTotalPages,
  filteredMovimentacoes,
  getFinanceItemSummary,
  handleEditFinanceItem,
  handleGenerateCharge,
  handleOpenFinanceForm,
  handleStatusAction,
  pagedMovimentacoes,
  saving,
  selectedFinanceBranchLabel,
  session,
  setFinancePage,
  setSelectedCharge,
}) {
  return (
    <article className="panel orders-panel">
      <div className="panel-title">
        <div>
          <h2>Movimentações financeiras</h2>
          <p>Receitas, despesas, pagamentos, cancelamentos e estornos.</p>
        </div>
        <div className="panel-actions">
          <span>{formatNumber(filteredMovimentacoes.length)} de {formatNumber(branchScopedMovimentacoes.length)} registros / {selectedFinanceBranchLabel}</span>
          <button
            className="panel-action-button secondary"
            disabled={financeMovementRows.length === 0}
            onClick={() => downloadCsv(`nexus-one-financeiro-${financeFilter.toLowerCase()}-${selectedFinanceBranchLabel.toLowerCase().replaceAll(" ", "-")}-${getLocalDateKey()}.csv`, financeMovementRows)}
            type="button"
          >
            <Download size={16} />
            CSV
          </button>
          <button
            className="panel-action-button secondary"
            disabled={financeMovementRows.length === 0}
            onClick={() => printRowsDocument(`Movimentações financeiras - ${financeFilterLabel} - ${selectedFinanceBranchLabel}`, financeMovementRows, session.empresa || "Nexus One")}
            type="button"
          >
            <Printer size={16} />
            PDF
          </button>
          {canMutateFinance && (
            <button className="panel-action-button" onClick={handleOpenFinanceForm} type="button">
              <Plus size={16} />
              Novo lançamento
            </button>
          )}
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Tipo</th>
              <th>Status</th>
              <th>Pagamento</th>
              <th>Valor</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {filteredMovimentacoes.length === 0 ? (
              <TableEmptyState
                colSpan="6"
                icon={WalletCards}
                title="Nenhuma movimentação financeira"
                detail="Ajuste os filtros ou registre um novo lançamento."
              />
            ) : (
              pagedMovimentacoes.map((item) => {
                const mixedPaymentObservation = getMixedPaymentObservation(item.observacao);
                return (
                  <tr key={item.id}>
                    <td>
                      <strong>{getFinanceItemSummary(item)}</strong>
                      <small>{formatDate(item.dataLancamento)} / {item.descricao || "Lançamento sem descrição"}</small>
                      <small className="payment-detail-line">Filial: {item.filial || "Empresa"}</small>
                      {item.dataVencimento && (
                        <small className={isDateBeforeToday(item.dataVencimento) && item.status === "PENDENTE" ? "payment-detail-line overdue" : "payment-detail-line"}>
                          Vencimento: {formatDate(item.dataVencimento)}
                        </small>
                      )}
                      {mixedPaymentObservation && (
                        <small className="payment-detail-line">Pagamento misto: {mixedPaymentObservation}</small>
                      )}
                    </td>
                    <td><StatusBadge status={item.tipo} /></td>
                    <td><StatusBadge status={item.status} /></td>
                    <td>{item.metodoPagamentoDescricao || item.metodoPagamento || "-"}</td>
                    <td>{formatCurrency(item.valor)}</td>
                    <td>
                      <div className="table-actions">
                        {canMutateFinance && item.status === "PENDENTE" ? (
                          <>
                            <button disabled={saving} onClick={() => handleEditFinanceItem(item)} type="button">
                              Editar
                            </button>
                            <button disabled={saving} onClick={() => handleStatusAction(item.id, "baixar")} type="button">
                              Baixar
                            </button>
                            <button disabled={saving} onClick={() => handleStatusAction(item.id, "cancelar")} type="button">
                              Cancelar
                            </button>
                            {item.tipo === "RECEITA" && ["PIX", "BOLETO"].includes(item.metodoPagamento) && (
                              <button
                                disabled={saving}
                                onClick={() => item.codigoCobranca ? setSelectedCharge(item) : handleGenerateCharge(item)}
                                type="button"
                              >
                                Cobrança
                              </button>
                            )}
                          </>
                        ) : canReverseFinance && item.status === "APROVADO" ? (
                          <button disabled={saving} onClick={() => handleStatusAction(item.id, "estornar")} type="button">
                            Estornar
                          </button>
                        ) : canMutateFinance ? (
                          <button
                            disabled={saving || item.status === "CANCELADO" || item.status === "ESTORNADO"}
                            onClick={() => handleStatusAction(item.id, "cancelar")}
                            type="button"
                          >
                            Cancelar
                          </button>
                        ) : (
                          <span>-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {filteredMovimentacoes.length > financePageSize && (
        <div className="table-pagination">
          <button disabled={currentFinancePage <= 0} onClick={() => setFinancePage((page) => Math.max(page - 1, 0))} type="button">
            Anterior
          </button>
          <span>{formatNumber(currentFinancePage + 1)} / {formatNumber(financeTotalPages)}</span>
          <button
            disabled={currentFinancePage >= financeTotalPages - 1}
            onClick={() => setFinancePage((page) => Math.min(page + 1, financeTotalPages - 1))}
            type="button"
          >
            Próximo
          </button>
        </div>
      )}
    </article>
  );
}
