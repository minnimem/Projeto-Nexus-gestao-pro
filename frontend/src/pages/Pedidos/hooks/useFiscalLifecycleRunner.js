export function useFiscalLifecycleRunner({
  setOrderMessage,
  setSavingOrderAction,
}) {
  async function runLifecycleAction({ actionKey, errorMessage, operation, pedido }) {
    if (!pedido.id) return;

    setSavingOrderAction(`${actionKey}-${pedido.id}`);
    setOrderMessage(null);
    try {
      await operation();
    } catch (error) {
      setOrderMessage({ type: "error", text: error.message || errorMessage });
    } finally {
      setSavingOrderAction("");
    }
  }

  return { runLifecycleAction };
}
