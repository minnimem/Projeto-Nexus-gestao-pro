import {
  getClientId,
  getClientName,
} from "../../../utils/customers";
import { CustomerFollowUpForm } from "./CustomerFollowUpForm";
import { CustomerHistoryActivitySection } from "./CustomerHistoryActivitySection";
import { CustomerFavoriteProductsSection } from "./CustomerFavoriteProductsSection";
import { CustomerInsightsSection } from "./CustomerInsightsSection";
import { CustomerCommercialSummary } from "./CustomerCommercialSummary";

export function CustomerProfilePanel({
  branchFilter,
  customerFollowUpForm,
  customerHistoryRows,
  customers,
  filiais,
  onCreateFollowUp,
  saving,
  selectedCustomer,
  selectedCustomerAverageTicket,
  selectedCustomerCompletedOrders,
  selectedCustomerFavoriteProducts,
  selectedCustomerInsights,
  selectedCustomerLastOrder,
  selectedCustomerOpenOrders,
  selectedCustomerOrders,
  selectedCustomerPendingFollowUps,
  selectedCustomerProfile,
  selectedCustomerRevenue,
  selectedCustomerTags,
  selectedCustomerTimeline,
  setBranchFilter,
  setCustomerFollowUpForm,
  setSelectedCustomerId,
}) {
  return (
    <aside className="panel side-panel">
      <div className="panel-title compact">
        <div>
          <h2>Histórico do cliente</h2>
          <p>Compras, ticket e última movimentação.</p>
        </div>
      </div>

      <label className="form-control">
        <span>Cliente</span>
        <select
          value={selectedCustomer ? getClientId(selectedCustomer) : ""}
          onChange={(event) => setSelectedCustomerId(event.target.value)}
        >
          {customers.map((customer) => (
            <option key={getClientId(customer)} value={getClientId(customer)}>
              {getClientName(customer)}
            </option>
          ))}
        </select>
      </label>

      <label className="form-control">
        <span>Filial</span>
        <select value={branchFilter} onChange={(event) => setBranchFilter(event.target.value)}>
          <option value="TODAS">Todas as filiais</option>
          <option value="EMPRESA">Empresa / sem filial</option>
          {filiais.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.matriz ? "Matriz" : "Filial"} - {branch.nome}
            </option>
          ))}
        </select>
      </label>

      <CustomerCommercialSummary
        averageTicket={selectedCustomerAverageTicket}
        completedOrdersCount={selectedCustomerCompletedOrders.length}
        customer={selectedCustomer}
        lastOrder={selectedCustomerLastOrder}
        ordersCount={selectedCustomerOrders.length}
        profile={selectedCustomerProfile}
        revenue={selectedCustomerRevenue}
        tags={selectedCustomerTags}
      />

      {selectedCustomer && <CustomerInsightsSection insights={selectedCustomerInsights} />}

      <CustomerFavoriteProductsSection products={selectedCustomerFavoriteProducts} />

      <CustomerFollowUpForm
        form={customerFollowUpForm}
        onSubmit={onCreateFollowUp}
        openOrders={selectedCustomerOpenOrders}
        pendingCount={selectedCustomerPendingFollowUps.length}
        saving={saving}
        setForm={setCustomerFollowUpForm}
      />

      <CustomerHistoryActivitySection
        customer={selectedCustomer}
        historyRows={customerHistoryRows}
        orders={selectedCustomerOrders}
        timeline={selectedCustomerTimeline}
      />
    </aside>
  );
}
