import { useFiscalAuthorizedActions } from "./useFiscalAuthorizedActions";
import { useFiscalLifecycleRunner } from "./useFiscalLifecycleRunner";
import { useFiscalRejectedActions } from "./useFiscalRejectedActions";

export function useFiscalLifecycleActions({
  getLatestFiscalDocument,
  onRefresh,
  setOrderMessage,
  setSavingOrderAction,
  updateFiscalStatus,
}) {
  const { runLifecycleAction } = useFiscalLifecycleRunner({
    setOrderMessage,
    setSavingOrderAction,
  });

  const {
    handleCancelFiscalHomologation,
    handleGenerateFiscalDanfe,
    handleIssueFiscalCorrectionLetter,
  } = useFiscalAuthorizedActions({
    getLatestFiscalDocument,
    onRefresh,
    runLifecycleAction,
    setOrderMessage,
    updateFiscalStatus,
  });

  const {
    handleInvalidateFiscalHomologation,
    handleReprocessFiscalRejection,
  } = useFiscalRejectedActions({
    onRefresh,
    runLifecycleAction,
    setOrderMessage,
    updateFiscalStatus,
  });

  return {
    handleCancelFiscalHomologation,
    handleGenerateFiscalDanfe,
    handleInvalidateFiscalHomologation,
    handleIssueFiscalCorrectionLetter,
    handleReprocessFiscalRejection,
  };
}
