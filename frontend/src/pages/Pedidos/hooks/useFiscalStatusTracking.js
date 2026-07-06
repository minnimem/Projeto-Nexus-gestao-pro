import { useEffect, useState } from "react";
import {
  buildFiscalHistoryItem,
  loadFiscalHistory,
  loadFiscalStatusByOrder,
  persistFiscalHistory,
  persistFiscalStatusByOrder,
} from "../services/fiscalStatusTracking";

export function useFiscalStatusTracking({ getLatestFiscalDocument, session }) {
  const [fiscalStatusByOrder, setFiscalStatusByOrder] = useState(loadFiscalStatusByOrder);
  const [fiscalHistory, setFiscalHistory] = useState(loadFiscalHistory);

  useEffect(() => {
    persistFiscalStatusByOrder(fiscalStatusByOrder);
  }, [fiscalStatusByOrder]);

  useEffect(() => {
    persistFiscalHistory(fiscalHistory);
  }, [fiscalHistory]);

  function getFiscalStatus(pedido) {
    return getLatestFiscalDocument(pedido).status || fiscalStatusByOrder[pedido.id] || "PENDENTE";
  }

  function updateFiscalStatus(pedido, status) {
    const orderId = pedido.id;
    if (!orderId) return;
    const previous = getFiscalStatus(pedido);
    if (previous === status) return;

    setFiscalStatusByOrder((current) => ({ ...current, [orderId]: status }));
    setFiscalHistory((current) => [
      buildFiscalHistoryItem({ pedido, previous, session, status }),
      ...current,
    ].slice(0, 80));
  }

  return { fiscalHistory, getFiscalStatus, updateFiscalStatus };
}
