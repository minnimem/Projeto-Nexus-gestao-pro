import { useEffect, useMemo, useRef, useState } from "react";
import { ReceiptText, ShoppingCart } from "lucide-react";
import { StatusBadge } from "../../../components/StatusBadge/StatusBadge";
import { asList, formatDate, formatNumber, parseDecimalInput } from "../../../utils/formatters";
import {
  canInstallmentPayment,
  cashPaymentOptions,
  createEmptyMixedPayments,
} from "../../../utils/payments";
import { CashOrderPicker } from "./CashOrderPicker";
import { CashPaymentColumn } from "./CashPaymentColumn";
import { CashProductDetails } from "./CashProductDetails";

export function PendingPaymentsPanel({
  canOperate,
  caixa,
  charge,
  generatingCharge,
  filteredPendingOrders,
  onCopyCharge,
  onGenerateCharge,
  onReceiveOrder,
  onSearch,
  onSelectOrder,
  paymentForm,
  onPaymentFormChange,
  pendingSearch,
  pedidosPendentes,
  receivingOrder,
  selectedPendingOrder,
}) {
  const [showDetails, setShowDetails] = useState(true);
  const [productDetailsPage, setProductDetailsPage] = useState(0);
  const [showOrderPicker, setShowOrderPicker] = useState(false);
  const pendingSearchRef = useRef(null);
  const pendingOrderListRef = useRef(null);
  const cashReceivedInputRef = useRef(null);
  const productItems = useMemo(() => asList(selectedPendingOrder.itens), [selectedPendingOrder.itens]);
  const productItemsPerPage = 10;
  const productPageCount = Math.max(1, Math.ceil(productItems.length / productItemsPerPage));
  const safeProductDetailsPage = Math.min(productDetailsPage, productPageCount - 1);
  const visibleProductItems = productItems.slice(
    safeProductDetailsPage * productItemsPerPage,
    safeProductDetailsPage * productItemsPerPage + productItemsPerPage,
  );
  const productItemsQuantityTotal = productItems.reduce((total, item) => total + Number(item.quantidade || 0), 0);
  const productItemsValueTotal = productItems.reduce((total, item) => {
    const quantidade = Number(item.quantidade || 0);
    const valorUnitario = Number(item.precoUnit || item.precoUnitario || item.preco || 0);
    return total + Number(item.subtotal || quantidade * valorUnitario || 0);
  }, 0);
  const productTotalDifference = Number((productItemsValueTotal - Number(selectedPendingOrder.valor || 0)).toFixed(2));
  const cashReceivedValue = parseDecimalInput(paymentForm.valorRecebido);
  const cashOrderValue = Number(selectedPendingOrder.valor || 0);
  const cashChangeValue = Number.isFinite(cashReceivedValue) ? cashReceivedValue - cashOrderValue : null;
  const cashReceiveBlocked =
    paymentForm.metodoPagamento === "DINHEIRO" &&
    (cashChangeValue === null || cashChangeValue < 0);
  const chargeRequired = ["PIX", "BOLETO"].includes(paymentForm.metodoPagamento);
  const chargeGeneratedForOrder = charge && String(charge.pedidoId || "") === String(selectedPendingOrder.id);
  const chargeReceiveBlocked = chargeRequired && !chargeGeneratedForOrder;
  const paymentReceiveBlocked = cashReceiveBlocked || chargeReceiveBlocked;

  useEffect(() => {
    setShowDetails(true);
    setProductDetailsPage(0);
  }, [selectedPendingOrder.id]);

  useEffect(() => {
    if (productDetailsPage > productPageCount - 1) {
      setProductDetailsPage(productPageCount - 1);
    }
  }, [productDetailsPage, productPageCount]);

  useEffect(() => {
    if (showOrderPicker) {
      pendingSearchRef.current.focus();
      pendingSearchRef.current.select();
    }
  }, [showOrderPicker]);

  useEffect(() => {
    if (!showOrderPicker || !selectedPendingOrder.id) return;
    pendingOrderListRef.current
      .querySelector(`[data-order-id="${CSS.escape(String(selectedPendingOrder.id))}"]`)
      .scrollIntoView({ block: "nearest" });
  }, [selectedPendingOrder.id, showOrderPicker]);

  useEffect(() => {
    if (paymentForm.metodoPagamento === "DINHEIRO") {
      cashReceivedInputRef.current.focus();
      cashReceivedInputRef.current.select();
    }
  }, [paymentForm.metodoPagamento]);

  useEffect(() => {
    function handlePendingPaymentShortcut(event) {
      if (event.altKey || event.ctrlKey || event.metaKey || receivingOrder) return;

      if (event.key === "F2") {
        event.preventDefault();
        setShowOrderPicker(true);
        pendingSearchRef.current.focus();
        pendingSearchRef.current.select();
      }

      if (event.key === "Escape" && showOrderPicker) {
        event.preventDefault();
        setShowOrderPicker(false);
      }

      if (showOrderPicker && ["ArrowDown", "ArrowUp"].includes(event.key) && filteredPendingOrders.length > 0) {
        event.preventDefault();
        const currentIndex = Math.max(0, filteredPendingOrders.findIndex((pedido) => String(pedido.id) === String(selectedPendingOrder.id)));
        const direction = event.key === "ArrowDown" ? 1 : -1;
        const nextIndex = (currentIndex + direction + filteredPendingOrders.length) % filteredPendingOrders.length;
        onSelectOrder(filteredPendingOrders[nextIndex].id);
      }

      if (event.key === "Enter" && showOrderPicker && selectedPendingOrder.id) {
        event.preventDefault();
        setShowOrderPicker(false);
      }

      const shortcutPaymentOption = cashPaymentOptions.find((option) => option.shortcut === event.key);
      if (shortcutPaymentOption && selectedPendingOrder) {
        event.preventDefault();
        onPaymentFormChange((prev) => ({
          metodoPagamento: shortcutPaymentOption.value,
          parcelas: canInstallmentPayment(shortcutPaymentOption.value) ? prev.parcelas : 1,
          pagamentos: prev.pagamentos || createEmptyMixedPayments(),
          valorRecebido: prev.valorRecebido || "",
        }));
      }

      if (event.key === "F10" && selectedPendingOrder.id && ["PIX", "BOLETO"].includes(paymentForm.metodoPagamento)) {
        event.preventDefault();
        onGenerateCharge(selectedPendingOrder.id);
      }

      if (event.key === "F12" && selectedPendingOrder.id) {
        event.preventDefault();
        setShowDetails((current) => !current);
      }

      if (event.key === "F8" && selectedPendingOrder.id && !paymentReceiveBlocked) {
        event.preventDefault();
        onReceiveOrder(selectedPendingOrder.id);
      }
    }

    window.addEventListener("keydown", handlePendingPaymentShortcut);
    return () => window.removeEventListener("keydown", handlePendingPaymentShortcut);
  }, [filteredPendingOrders, onGenerateCharge, onPaymentFormChange, onReceiveOrder, onSelectOrder, paymentForm.metodoPagamento, paymentReceiveBlocked, receivingOrder, selectedPendingOrder, showOrderPicker]);

  return (
    <section className="panel orders-panel cash-simple-panel">
      <div className="panel-title">
        <div>
          <h2>Caixa livre - venda</h2>
          <p>Receba somente o valor dos pedidos de retirada.</p>
        </div>
        <span>{formatNumber(filteredPendingOrders.length)} de {formatNumber(pedidosPendentes.length)}</span>
      </div>

              <button className="cash-open-sales-button" onClick={() => setShowOrderPicker((current) => !current)} type="button">
                <ShoppingCart size={17} />
                <span>Vendas em aberto para receber</span>
                <kbd>F2</kbd>
                <strong>{formatNumber(pedidosPendentes.length)}</strong>
              </button>

      {showOrderPicker && (
        <CashOrderPicker
          filteredPendingOrders={filteredPendingOrders}
          onSearch={onSearch}
          onSelectOrder={onSelectOrder}
          pendingOrderListRef={pendingOrderListRef}
          pendingSearch={pendingSearch}
          pendingSearchRef={pendingSearchRef}
          selectedPendingOrder={selectedPendingOrder}
          setShowOrderPicker={setShowOrderPicker}
        />
      )}

      <div className="cash-receive-grid">
        <aside className="sale-summary">
          {selectedPendingOrder ? (
            <>
              <div className="cash-order-column">
                <div className="cash-pos-column-label order">
                  <span>Pedido</span>
                  <strong>Itens, cliente e observação</strong>
                </div>
                <div className="sale-summary-head">
                  <div>
                    <span>Valor enviado ao caixa</span>
                    <strong>{selectedPendingOrder.cliente || "Cliente não informado"}</strong>
                  </div>
                  <StatusBadge status="PENDENTE" />
                </div>

                <div className="sale-summary-meta cash-simple-meta">
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

                {selectedPendingOrder.observacaoEntrega && (
                  <div className="sale-summary-note">
                    <span>Observação</span>
                    <strong>{selectedPendingOrder.observacaoEntrega}</strong>
                  </div>
                )}

                <button className="cash-detail-toggle" onClick={() => setShowDetails((current) => !current)} type="button">
                  <ReceiptText size={15} />
                  {showDetails ? "Ocultar detalhes do produto" : "Mostrar detalhes do produto"}
                  <kbd>F12</kbd>
                </button>

                {showDetails && (
                  <CashProductDetails
                    productItems={productItems}
                    productItemsPerPage={productItemsPerPage}
                    productItemsQuantityTotal={productItemsQuantityTotal}
                    productItemsValueTotal={productItemsValueTotal}
                    productPageCount={productPageCount}
                    productTotalDifference={productTotalDifference}
                    safeProductDetailsPage={safeProductDetailsPage}
                    setProductDetailsPage={setProductDetailsPage}
                    visibleProductItems={visibleProductItems}
                  />
                )}
              </div>

              <CashPaymentColumn
                caixa={caixa}
                canOperate={canOperate}
                cashChangeValue={cashChangeValue}
                cashReceiveBlocked={cashReceiveBlocked}
                cashReceivedInputRef={cashReceivedInputRef}
                charge={charge}
                chargeGeneratedForOrder={chargeGeneratedForOrder}
                chargeReceiveBlocked={chargeReceiveBlocked}
                generatingCharge={generatingCharge}
                onCopyCharge={onCopyCharge}
                onGenerateCharge={onGenerateCharge}
                onPaymentFormChange={onPaymentFormChange}
                onReceiveOrder={onReceiveOrder}
                paymentForm={paymentForm}
                paymentReceiveBlocked={paymentReceiveBlocked}
                receivingOrder={receivingOrder}
                selectedPendingOrder={selectedPendingOrder}
              />
            </>
          ) : (
            <div className="empty-selection">Selecione um pedido pendente para receber.</div>
          )}
        </aside>
      </div>
    </section>
  );
}
