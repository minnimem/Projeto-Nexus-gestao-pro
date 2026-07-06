export function useFiscalRealRunner({
  getLatestFiscalDocument,
  setOrderMessage,
  setSavingOrderAction,
}) {
  function requireFiscalRealDocument(pedido, message) {
    const documento = getLatestFiscalDocument(pedido);
    if (!documento.id) {
      setOrderMessage({ type: "error", text: message });
      return null;
    }
    return documento;
  }

  async function runFiscalRealAction(actionKey, operation, errorMessage) {
    setSavingOrderAction(actionKey);
    setOrderMessage(null);
    try {
      await operation();
    } catch (error) {
      setOrderMessage({ type: "error", text: error.message || errorMessage });
    } finally {
      setSavingOrderAction("");
    }
  }

  return { requireFiscalRealDocument, runFiscalRealAction };
}
