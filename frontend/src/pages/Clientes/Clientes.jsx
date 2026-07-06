import { useEffect } from "react";
import { getClientId } from "../../utils/customers";
import { CustomerPageContent } from "./components/CustomerPageContent";
import { initialCustomerFollowUpForm } from "./constants/customerFormDefaults";
import { useCustomerActions } from "./hooks/useCustomerActions";
import { useCustomerPageState } from "./hooks/useCustomerPageState";
import { createCustomerPageViewModel } from "./viewModels/createCustomerPageViewModel";
import "./Clientes.css";

export function Clientes({ data, onRefresh }) {
  const state = useCustomerPageState();
  const viewModel = createCustomerPageViewModel({
    customerBranchFilter: state.customerBranchFilter,
    data,
    search: state.search,
    selectedCustomerId: state.selectedCustomerId,
  });

  useEffect(() => {
    state.setCustomerFollowUpForm(initialCustomerFollowUpForm);
  }, [viewModel.selectedCustomer ? getClientId(viewModel.selectedCustomer) : ""]);

  const actions = useCustomerActions({
    customerFollowUpForm: state.customerFollowUpForm,
    form: state.form,
    onRefresh,
    setCustomerFollowUpForm: state.setCustomerFollowUpForm,
    setForm: state.setForm,
    setMessage: state.setMessage,
    setSaving: state.setSaving,
    setShowCustomerForm: state.setShowCustomerForm,
  });

  return <CustomerPageContent actions={actions} state={state} viewModel={viewModel} />;
}
