import { endpoints } from "../../../services/resources";
import { buildFiscalConsultMessage } from "../services/fiscalConsult";

export function useFiscalConsultActions({
  getLatestFiscalDocument,
  setOrderMessage,
  setSavingOrderAction,
}) {
  async function handleConsultFiscalHomologation(pedido) {
    const documento = getLatestFiscalDocument(pedido);
    if (!documento.id) {
      setOrderMessage({ type: "error", text: "Este pedido ainda não possui documento fiscal para consulta." });
      return;
    }

    setSavingOrderAction(`consulta-fiscal-${pedido.id}`);
    setOrderMessage(null);
    try {
      const consulta = await endpoints.fiscal.consultarHomologacao(documento.id);
      setOrderMessage(buildFiscalConsultMessage({ consulta, documento }));
    } catch (error) {
      setOrderMessage({ type: "error", text: error.message || "Não foi possível consultar a homologação fiscal." });
    } finally {
      setSavingOrderAction("");
    }
  }

  return { handleConsultFiscalHomologation };
}
