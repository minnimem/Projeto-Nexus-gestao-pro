import { useFiscalConsultActions } from "./useFiscalConsultActions";
import { useFiscalContingencyActions } from "./useFiscalContingencyActions";
import { useFiscalHomologationActions } from "./useFiscalHomologationActions";
import { useFiscalLifecycleActions } from "./useFiscalLifecycleActions";

export function useFiscalWorkflowActions({
  configuracoesFiscais,
  getFiscalModelForOrder,
  getLatestFiscalDocument,
  onRefresh,
  setOrderMessage,
  setSavingOrderAction,
  updateFiscalStatus,
}) {
  const {
    handleFiscalHomologationReturn,
    handleGenerateFiscalXml,
    handlePrepareFiscalHomologation,
    handleTransmitFiscalHomologation,
    handleValidateFiscalXml,
  } = useFiscalHomologationActions({
    configuracoesFiscais,
    getFiscalModelForOrder,
    onRefresh,
    setOrderMessage,
    setSavingOrderAction,
    updateFiscalStatus,
  });

  const {
    handleFiscalContingency,
    handleRegularizeFiscalContingency,
  } = useFiscalContingencyActions({
    onRefresh,
    setOrderMessage,
    setSavingOrderAction,
    updateFiscalStatus,
  });

  const {
    handleCancelFiscalHomologation,
    handleGenerateFiscalDanfe,
    handleInvalidateFiscalHomologation,
    handleIssueFiscalCorrectionLetter,
    handleReprocessFiscalRejection,
  } = useFiscalLifecycleActions({
    getLatestFiscalDocument,
    onRefresh,
    setOrderMessage,
    setSavingOrderAction,
    updateFiscalStatus,
  });

  const { handleConsultFiscalHomologation } = useFiscalConsultActions({
    getLatestFiscalDocument,
    setOrderMessage,
    setSavingOrderAction,
  });

  return {
    handleCancelFiscalHomologation,
    handleConsultFiscalHomologation,
    handleFiscalContingency,
    handleFiscalHomologationReturn,
    handleGenerateFiscalDanfe,
    handleGenerateFiscalXml,
    handleIssueFiscalCorrectionLetter,
    handleInvalidateFiscalHomologation,
    handlePrepareFiscalHomologation,
    handleRegularizeFiscalContingency,
    handleReprocessFiscalRejection,
    handleTransmitFiscalHomologation,
    handleValidateFiscalXml,
  };
}
