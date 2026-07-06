import { endpoints } from "../../../services/resources";
import { safeApi } from "../../../utils/async";
import { printCommercialProposal, printFiscalMirror } from "../../../utils/salesDocuments";
import {
  buildFiscalMirrorPrintData,
  buildSavedQuotePrintData,
  mapOrderItems,
} from "../services/salesDocumentPrints";

export function useSalesDocumentActions({
  session,
  setOrderMessage,
  setSavingOrderAction,
}) {
  async function loadOrderWithItems(id) {
    const pedido = await endpoints.pedidos.obter(id);
    const itensResponse = await safeApi(endpoints.pedidos.itens(id), []);
    const itens = mapOrderItems({ itensPedido: pedido.itens || [], itensResponse });
    return { itens, pedido };
  }

  async function handlePrintSavedQuote(id) {
    if (!id) return;

    setSavingOrderAction(id);
    setOrderMessage(null);
    try {
      const { itens, pedido } = await loadOrderWithItems(id);

      printCommercialProposal(
        buildSavedQuotePrintData({ itens, pedido }),
        pedido.empresa || "Nexus One",
      );
      setOrderMessage({ type: "success", text: "Orçamento enviado para impressao." });
    } catch (error) {
      setOrderMessage({ type: "error", text: error.message || "Não foi possível imprimir o orçamento." });
    } finally {
      setSavingOrderAction("");
    }
  }

  async function handlePrintFiscalMirror(id) {
    if (!id) return;

    setSavingOrderAction(`fiscal-${id}`);
    setOrderMessage(null);
    try {
      const { itens, pedido } = await loadOrderWithItems(id);
      printFiscalMirror(
        buildFiscalMirrorPrintData({ itens, pedido }),
        pedido.empresa || session.empresa || "Nexus One",
      );
      setOrderMessage({ type: "success", text: "Espelho fiscal enviado para impressao." });
    } catch (error) {
      setOrderMessage({ type: "error", text: error.message || "Não foi possível imprimir o espelho fiscal." });
    } finally {
      setSavingOrderAction("");
    }
  }

  return { handlePrintFiscalMirror, handlePrintSavedQuote };
}
