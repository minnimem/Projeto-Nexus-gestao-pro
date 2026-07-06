import { CustomerCreateModal } from "./CustomerCreateModal";
import { CustomerListSection } from "./CustomerListSection";
import { CustomerOverviewSection } from "./CustomerOverviewSection";
import { CustomerProfilePanel } from "./CustomerProfilePanel";

export function CustomerPageContent({
  actions,
  state,
  viewModel: model,
}) {
  return (
    <div className="dashboard-view">
      <CustomerOverviewSection
        branchFilter={state.customerBranchFilter}
        customerCount={model.branchFilteredClientes.length}
        customersWithEmail={model.clientesComEmail}
        customersWithPhone={model.clientesComTelefone}
        newCustomersCurrentMonth={model.clientesNovosMes}
        newCustomersPreviousMonth={model.clientesNovosMesAnterior}
        newCustomersTrend={model.customerNewMonthTrend}
        onCreateCustomer={() => {
          state.setMessage(null);
          state.setShowCustomerForm(true);
        }}
      />

      <section className="dashboard-grid customer-grid single-column-grid">
        <CustomerProfilePanel
          branchFilter={state.customerBranchFilter}
          customerFollowUpForm={state.customerFollowUpForm}
          customerHistoryRows={model.customerHistoryRows}
          customers={model.filteredClientes}
          filiais={model.filiais}
          onCreateFollowUp={actions.handleCreateCustomerFollowUp}
          saving={state.saving}
          selectedCustomer={model.selectedCustomer}
          selectedCustomerAverageTicket={model.selectedCustomerAverageTicket}
          selectedCustomerCompletedOrders={model.selectedCustomerCompletedOrders}
          selectedCustomerFavoriteProducts={model.selectedCustomerFavoriteProducts}
          selectedCustomerInsights={model.selectedCustomerInsights}
          selectedCustomerLastOrder={model.selectedCustomerLastOrder}
          selectedCustomerOpenOrders={model.selectedCustomerOpenOrders}
          selectedCustomerOrders={model.selectedCustomerOrders}
          selectedCustomerPendingFollowUps={model.selectedCustomerPendingFollowUps}
          selectedCustomerProfile={model.selectedCustomerProfile}
          selectedCustomerRevenue={model.selectedCustomerRevenue}
          selectedCustomerTags={model.selectedCustomerTags}
          selectedCustomerTimeline={model.selectedCustomerTimeline}
          setBranchFilter={state.setCustomerBranchFilter}
          setCustomerFollowUpForm={state.setCustomerFollowUpForm}
          setSelectedCustomerId={state.setSelectedCustomerId}
        />

        <CustomerListSection
          branchFilter={state.customerBranchFilter}
          customers={model.filteredClientes}
          filiais={model.filiais}
          getCustomerBranchLabel={model.getCustomerBranchLabel}
          getCustomerCommercialProfile={model.getCustomerCommercialProfile}
          onCreateCustomer={() => state.setShowCustomerForm(true)}
          search={state.search}
          selectedCustomer={model.selectedCustomer}
          setBranchFilter={state.setCustomerBranchFilter}
          setSearch={state.setSearch}
          setSelectedCustomerId={state.setSelectedCustomerId}
        />
      </section>

      {state.showCustomerForm && (
        <CustomerCreateModal
          form={state.form}
          message={state.message}
          onClose={() => state.setShowCustomerForm(false)}
          onSubmit={actions.handleSubmit}
          saving={state.saving}
          updateForm={actions.updateForm}
        />
      )}
    </div>
  );
}
