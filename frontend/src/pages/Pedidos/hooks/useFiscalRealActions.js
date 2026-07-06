import { useFiscalRealPackageActions } from "./useFiscalRealPackageActions";
import { useFiscalRealReadinessActions } from "./useFiscalRealReadinessActions";
import { useFiscalRealRunner } from "./useFiscalRealRunner";

export function useFiscalRealActions({
  getLatestFiscalDocument,
  setOrderMessage,
  setSavingOrderAction,
}) {
  const runner = useFiscalRealRunner({
    getLatestFiscalDocument,
    setOrderMessage,
    setSavingOrderAction,
  });
  const readinessActions = useFiscalRealReadinessActions({
    ...runner,
    setOrderMessage,
  });
  const packageActions = useFiscalRealPackageActions({
    ...runner,
    setOrderMessage,
  });

  return {
    ...readinessActions,
    ...packageActions,
  };
}
