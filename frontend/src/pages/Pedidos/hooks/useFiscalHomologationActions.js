import { useFiscalHomologationReturnActions } from "./useFiscalHomologationReturnActions";
import { useFiscalPreparationActions } from "./useFiscalPreparationActions";
import { useFiscalXmlActions } from "./useFiscalXmlActions";

export function useFiscalHomologationActions({
  configuracoesFiscais,
  getFiscalModelForOrder,
  onRefresh,
  setOrderMessage,
  setSavingOrderAction,
  updateFiscalStatus,
}) {
  const { handlePrepareFiscalHomologation } = useFiscalPreparationActions({
    configuracoesFiscais,
    getFiscalModelForOrder,
    onRefresh,
    setOrderMessage,
    setSavingOrderAction,
    updateFiscalStatus,
  });

  const {
    handleGenerateFiscalXml,
    handleTransmitFiscalHomologation,
    handleValidateFiscalXml,
  } = useFiscalXmlActions({
    onRefresh,
    setOrderMessage,
    setSavingOrderAction,
    updateFiscalStatus,
  });

  const { handleFiscalHomologationReturn } = useFiscalHomologationReturnActions({
    onRefresh,
    setOrderMessage,
    setSavingOrderAction,
    updateFiscalStatus,
  });

  return {
    handleFiscalHomologationReturn,
    handleGenerateFiscalXml,
    handlePrepareFiscalHomologation,
    handleTransmitFiscalHomologation,
    handleValidateFiscalXml,
  };
}
