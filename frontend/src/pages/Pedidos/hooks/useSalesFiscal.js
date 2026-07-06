import { useState } from "react";
import { asList } from "../../../utils/formatters";
import { getFiscalControlData } from "../services/fiscalControl";
import { getFiscalReadinessData } from "../services/fiscalReadiness";
import {
  buildFiscalActions,
  getFiscalModelForOrder as resolveFiscalModelForOrder,
  getLatestFiscalDocumentForOrder,
} from "../services/salesFiscal";
import { useFiscalFileActions } from "./useFiscalFileActions";
import { useFiscalRealActions } from "./useFiscalRealActions";
import { useFiscalStatusTracking } from "./useFiscalStatusTracking";
import { useFiscalWorkflowActions } from "./useFiscalWorkflowActions";

export function useSalesFiscal({
  branchScopedRecentOrders,
  data,
  onRefresh,
  session,
  setOrderMessage,
  setSavingOrderAction,
}) {
  const [fiscalModelByOrder, setFiscalModelByOrder] = useState({});
  const configuracoesFiscais = asList(data.configuracoesFiscais);
  const documentosFiscaisPorPedido = data.documentosFiscaisPorPedido || {};
  const getLatestFiscalDocument = (pedido) =>
    getLatestFiscalDocumentForOrder({ documentosFiscaisPorPedido, pedido });
  const { fiscalHistory, getFiscalStatus, updateFiscalStatus } = useFiscalStatusTracking({
    getLatestFiscalDocument,
    session,
  });
  const fileActions = useFiscalFileActions({
    getLatestFiscalDocument,
    onRefresh,
    setOrderMessage,
    setSavingOrderAction,
    updateFiscalStatus,
  });
  const realActions = useFiscalRealActions({
    getLatestFiscalDocument,
    setOrderMessage,
    setSavingOrderAction,
  });
  const getFiscalModelForOrder = (pedido) =>
    resolveFiscalModelForOrder({ fiscalModelByOrder, getLatestFiscalDocument, pedido });
  const workflowActions = useFiscalWorkflowActions({
    configuracoesFiscais,
    getFiscalModelForOrder,
    getLatestFiscalDocument,
    onRefresh,
    setOrderMessage,
    setSavingOrderAction,
    updateFiscalStatus,
  });
  const fiscalControl = getFiscalControlData({
    branchScopedRecentOrders,
    fiscalHistory,
    getFiscalStatus,
    getLatestFiscalDocument,
  });
  const fiscalReadiness = getFiscalReadinessData({
    fiscalControlOrders: fiscalControl.fiscalControlOrders,
    getLatestFiscalDocument,
  });
  const fiscalActions = buildFiscalActions({ fileActions, realActions, workflowActions });

  return {
    fiscalActions,
    fiscalHistory,
    getFiscalModelForOrder,
    getFiscalStatus,
    getLatestFiscalDocument,
    setFiscalModelByOrder,
    updateFiscalStatus,
    ...fiscalControl,
    ...fiscalReadiness,
  };
}
