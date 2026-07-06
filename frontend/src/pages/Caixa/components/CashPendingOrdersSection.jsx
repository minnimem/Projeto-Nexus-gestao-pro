import { CreditCard, Loader2, Search } from "lucide-react";
import { StatusBadge } from "../../../components/StatusBadge/StatusBadge";
import { asList, formatCurrency, formatDate, formatNumber } from "../../../utils/formatters";
import {
  canInstallmentPayment,
  cashPaymentOptions,
  createEmptyMixedPayments,
  getMixedPaymentTotal,
  getPaymentMethodLabel,
  mixedPaymentMethods,
} from "../../../utils/payments";

export function CashPendingOrdersSection({
  branchScopedPendingOrders,
  filteredPendingOrders,
  onReceiveOrder,
  pendingSearch,
  receiveMixedDifference,
  receivePaymentDetail,
  receivePaymentForm,
  receivePaymentReady,
  receivingOrder,
  selectedOrderTotal,
  selectedPendingOrder,
  setPendingSearch,
  setReceivePaymentForm,
  setSelectedPendingOrderId,
}) {
  return (
    <section className="panel orders-panel">
      <div className="panel-title">
        <div>
          <h2>Pagamentos para receber</h2>
          <p>Pesquise por cliente, produto ou número e confira o resumo antes de receber.</p>
        </div>
        <span>{formatNumber(filteredPendingOrders.length)} de {formatNumber(branchScopedPendingOrders.length)}</span>
      </div>

      <label className="search-field cash-pending-search">
        <Search size={17} />
        <input
          value={pendingSearch}
          onChange={(event) => setPendingSearch(event.target.value)}
          placeholder="Procurar por nome do cliente, produto ou número"
        />
      </label>

      <div className="cash-receive-grid">
        <div className="pending-order-list">
          {filteredPendingOrders.length === 0 ? (
            <div className="empty-selection compact">Nenhum pagamento pendente encontrado.</div>
          ) : (
            filteredPendingOrders.map((pedido) => (
              <button
                className={String(selectedPendingOrder.id) === String(pedido.id) ? "pending-order active" : "pending-order"}
                key={pedido.id}
                onClick={() => setSelectedPendingOrderId(pedido.id)}
                type="button"
              >
                <span>
                  <strong>{pedido.cliente || "Cliente não informado"}</strong>
                  <small>{pedido.numero || pedido.id}</small>
                </span>
                <em>{formatCurrency(pedido.valor)}</em>
              </button>
            ))
          )}
        </div>

        <aside className="sale-summary">
          {selectedPendingOrder ? (
            <>
              <div className="sale-summary-head">
                <div>
                  <span>Resumo da venda</span>
                  <strong>{selectedPendingOrder.cliente || "Cliente não informado"}</strong>
                </div>
                <StatusBadge status="PENDENTE" />
              </div>

              <div className="sale-summary-meta">
                <div>
                  <span>Número</span>
                  <strong>{selectedPendingOrder.numero || selectedPendingOrder.id}</strong>
                </div>
                <div>
                  <span>Vendedor</span>
                  <strong>{selectedPendingOrder.usuario || selectedPendingOrder.vendedor || "-"}</strong>
                </div>
                <div>
                  <span>Pagamento</span>
                  <strong>{selectedPendingOrder.metodoPagamentoDescricao || selectedPendingOrder.metodoPagamento || "-"}</strong>
                </div>
                <div>
                  <span>Filial</span>
                  <strong>{selectedPendingOrder.filial || "Empresa"}</strong>
                </div>
                <div>
                  <span>Data</span>
                  <strong>{formatDate(selectedPendingOrder.data)}</strong>
                </div>
              </div>

              <div className="sale-summary-items">
                <span>Produtos</span>
                {asList(selectedPendingOrder.itens).length === 0 ? (
                  <div className="empty-selection compact">Itens não carregados para este pedido.</div>
                ) : (
                  asList(selectedPendingOrder.itens).map((item) => (
                    <div className="sale-summary-item" key={item.id || item.produtoId || item.produto}>
                      <div>
                        <strong>{item.produto || "Produto sem nome"}</strong>
                        <small>{formatNumber(item.quantidade)} un. x {formatCurrency(item.precoUnit)}</small>
                      </div>
                      <em>{formatCurrency(item.subtotal)}</em>
                    </div>
                  ))
                )}
              </div>

              <div className="sale-summary-total">
                <span>Total a receber</span>
                <strong>{formatCurrency(selectedPendingOrder.valor)}</strong>
              </div>

              <div className="cash-payment-panel compact-payment-panel">
                <span>Receber no caixa como</span>
                <div className="cash-payment-options">
                  {cashPaymentOptions.map((option) => (
                    <button
                      className={receivePaymentForm.metodoPagamento === option.value ? "active" : ""}
                      key={option.value}
                      onClick={() =>
                        setReceivePaymentForm((prev) => ({
                          metodoPagamento: option.value,
                          parcelas: canInstallmentPayment(option.value) ? prev.parcelas : 1,
                          pagamentos: prev.pagamentos || createEmptyMixedPayments(),
                        }))
                      }
                      type="button"
                    >
                      <CreditCard size={16} />
                      {option.label}
                    </button>
                  ))}
                </div>
                {canInstallmentPayment(receivePaymentForm.metodoPagamento) && (
                  <label className="form-control">
                    <span>Parcelas</span>
                    <select
                      value={receivePaymentForm.parcelas}
                      onChange={(event) =>
                        setReceivePaymentForm((prev) => ({ ...prev, parcelas: Number(event.target.value) }))
                      }
                    >
                      {Array.from({ length: 12 }, (_, index) => index + 1).map((parcela) => (
                        <option key={parcela} value={parcela}>
                          {parcela}x de {formatCurrency(Number(selectedPendingOrder.valor || 0) / parcela)}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {receivePaymentForm.metodoPagamento === "MISTO" && (
                  <div className="mixed-payment-grid compact-mixed-payment-grid">
                    {mixedPaymentMethods.map((method) => (
                      <label className="form-control" key={method}>
                        <span>{getPaymentMethodLabel(method)}</span>
                        <input
                          inputMode="decimal"
                          placeholder="0,00"
                          type="text"
                          value={receivePaymentForm.pagamentos?.[method] || ""}
                          onChange={(event) =>
                            setReceivePaymentForm((prev) => ({
                              ...prev,
                              pagamentos: {
                                ...(prev.pagamentos || createEmptyMixedPayments()),
                                [method]: event.target.value,
                              },
                            }))
                          }
                        />
                      </label>
                    ))}
                    <div className="mixed-payment-total">
                      <span>Distribuído</span>
                      <strong>{formatCurrency(getMixedPaymentTotal(receivePaymentForm.pagamentos))}</strong>
                    </div>
                    <div className="mixed-payment-total">
                      <span>Total do pedido</span>
                      <strong>{formatCurrency(selectedOrderTotal)}</strong>
                    </div>
                    <div className={`mixed-payment-balance ${Math.abs(receiveMixedDifference) < 0.009 ? "ok" : "pending"}`}>
                      <span>{receiveMixedDifference >= 0 ? "Excedente" : "Falta"}</span>
                      <strong>{formatCurrency(Math.abs(receiveMixedDifference))}</strong>
                    </div>
                  </div>
                )}
              </div>

              <div className={`cash-receipt-confirm ${receivePaymentReady ? "ready" : "pending"}`}>
                <span>{receivePaymentReady ? "Pronto para receber" : "Conferência pendente"}</span>
                <strong>{formatCurrency(selectedOrderTotal)} em {getPaymentMethodLabel(receivePaymentForm.metodoPagamento)}</strong>
                <small>
                  {selectedPendingOrder.cliente || "Cliente não informado"} | {selectedPendingOrder.numero || selectedPendingOrder.id} | {receivePaymentDetail}
                </small>
              </div>

              <button
                className="checkout-button"
                disabled={!receivePaymentReady || receivingOrder === selectedPendingOrder.id}
                onClick={() => onReceiveOrder(selectedPendingOrder.id)}
                type="button"
              >
                {receivingOrder === selectedPendingOrder.id ? <Loader2 className="spin" size={17} /> : <CreditCard size={17} />}
                {receivingOrder === selectedPendingOrder.id ? "Recebendo..." : "Receber pagamento"}
              </button>
            </>
          ) : (
            <div className="empty-selection">Selecione um pedido pendente para receber.</div>
          )}
        </aside>
      </div>
    </section>
  );
}
