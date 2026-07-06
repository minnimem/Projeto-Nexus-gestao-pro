import { sectionClass } from "../../../utils/sales";
import { SalesOrdersFilters } from "./SalesOrdersFilters";
import { SalesOrdersPerformancePanel } from "./SalesOrdersPerformancePanel";
import { SalesOrdersTable } from "./SalesOrdersTable";

export function SalesOrdersSection({
  fiscalActionRenderers,
  fiscal,
  orderMessage,
  orders,
  rankingProdutos,
  savingOrderAction,
  showSalesOrders,
  ticketMedio,
  vendasPorDia,
}) {
  const {
    filteredOrders,
    filteredOrdersPending,
    filteredOrdersTotal,
    handleConvertQuote,
    handlePrintFiscalMirror,
    handlePrintSavedQuote,
    handleSeparationAction,
    orderPeriodFilter,
    orderStatusFilter,
    selectedOrderPeriod,
    selectedOrderStatus,
    setOrderPeriodFilter,
    setOrderStatusFilter,
  } = orders;
  const { getFiscalStatus, updateFiscalStatus } = fiscal;

  return (
    <section className={`dashboard-grid${sectionClass(showSalesOrders)}`}>
      <article className="panel orders-panel">
        <div className="panel-title">
          <div>
            <h2>Últimos pedidos</h2>
            <p>Movimentações recentes vindas do PostgreSQL.</p>
          </div>
          <span>{filteredOrders.length} registros</span>
        </div>

        <SalesOrdersFilters
          filteredOrdersPending={filteredOrdersPending}
          filteredOrdersTotal={filteredOrdersTotal}
          orderPeriodFilter={orderPeriodFilter}
          orderStatusFilter={orderStatusFilter}
          selectedOrderPeriod={selectedOrderPeriod}
          selectedOrderStatus={selectedOrderStatus}
          setOrderPeriodFilter={setOrderPeriodFilter}
          setOrderStatusFilter={setOrderStatusFilter}
        />
        {orderMessage && <p className={`form-message ${orderMessage.type}`}>{orderMessage.text}</p>}

        <SalesOrdersTable
          fiscalActionRenderers={fiscalActionRenderers}
          filteredOrders={filteredOrders}
          getFiscalStatus={getFiscalStatus}
          handleConvertQuote={handleConvertQuote}
          handlePrintFiscalMirror={handlePrintFiscalMirror}
          handlePrintSavedQuote={handlePrintSavedQuote}
          handleSeparationAction={handleSeparationAction}
          savingOrderAction={savingOrderAction}
          updateFiscalStatus={updateFiscalStatus}
        />
      </article>

      <SalesOrdersPerformancePanel
        rankingProdutos={rankingProdutos}
        ticketMedio={ticketMedio}
        vendasPorDia={vendasPorDia}
      />
    </section>
  );
}
