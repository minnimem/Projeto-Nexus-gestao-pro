import { getPointOfSaleViewData } from "../services/pointOfSale";
import {
  getPointOfSaleDraftControlProps,
  getPointOfSaleProposalActionProps,
  getPointOfSaleSetters,
  getPointOfSaleSubmissionProps,
  getPointOfSaleViewInput,
} from "../services/pointOfSaleControllerProps";
import {
  getPointOfSaleCatalogProps,
  getPointOfSaleCheckoutProps,
} from "../services/pointOfSaleProps";
import { usePointOfSaleCart } from "./usePointOfSaleCart";
import { usePointOfSaleDraftControls } from "./usePointOfSaleDraftControls";
import { usePointOfSaleProposalActions } from "./usePointOfSaleProposalActions";
import { usePointOfSaleRefs } from "./usePointOfSaleRefs";
import { usePointOfSaleSubmission } from "./usePointOfSaleSubmission";
import { usePointOfSaleState } from "./usePointOfSaleState";

export function usePointOfSaleController({
  caixa,
  canOperateCash,
  cashMode,
  clientes,
  onSaleCreated,
  produtos,
  session,
}) {
  const state = usePointOfSaleState();
  const refs = usePointOfSaleRefs();
  const cartActions = usePointOfSaleCart({
    produtos,
    productSearch: state.productSearch,
    setMessage: state.setMessage,
    setProductSearch: state.setProductSearch,
  });
  const view = getPointOfSaleViewData(getPointOfSaleViewInput({
    cashMode,
    cartActions,
    clientes,
    produtos,
    session,
    state,
  }));
  const proposalActions = usePointOfSaleProposalActions(getPointOfSaleProposalActionProps({
    cartActions,
    onSaleCreated,
    session,
    state,
    view,
  }));
  const { handleSubmit } = usePointOfSaleSubmission(getPointOfSaleSubmissionProps({
    caixa,
    canOperateCash,
    cartActions,
    cashMode,
    onSaleCreated,
    session,
    state,
    view,
  }));
  const draftControls = usePointOfSaleDraftControls(getPointOfSaleDraftControlProps({
    cartActions,
    cashMode,
    proposalActions,
    refs,
    state,
    view,
  }));

  const setters = getPointOfSaleSetters({ cartActions, state });
  const catalogProps = getPointOfSaleCatalogProps({
    cartActions,
    caixa,
    cashMode,
    clientSearch: state.clientSearch,
    clientSearchRef: refs.clientSearchRef,
    deliveryAddress: state.deliveryAddress,
    deliveryNote: state.deliveryNote,
    deliveryType: state.deliveryType,
    discount: state.discount,
    discountAmount: state.discountAmount,
    discountMode: state.discountMode,
    paymentMethod: state.paymentMethod,
    priority: state.priority,
    productSearch: state.productSearch,
    productSearchRef: refs.productSearchRef,
    quoteConditions: state.quoteConditions,
    quoteValidity: state.quoteValidity,
    selectedClienteId: state.selectedClienteId,
    setters: {
      ...setters,
      setPriority: state.setPriority,
    },
    view,
  });
  const checkoutProps = getPointOfSaleCheckoutProps({
    cartActions,
    cashMode,
    draftControls,
    lastSale: state.lastSale,
    message: state.message,
    mixedPayments: state.mixedPayments,
    paymentInstallments: state.paymentInstallments,
    paymentMethod: state.paymentMethod,
    proposalActions,
    receivedAmount: state.receivedAmount,
    receivedAmountRef: refs.receivedAmountRef,
    saving: state.saving,
    selectedClienteId: state.selectedClienteId,
    session,
    setters,
    view,
  });

  return { catalogProps, checkoutProps, formRef: refs.formRef, handleSubmit };
}
