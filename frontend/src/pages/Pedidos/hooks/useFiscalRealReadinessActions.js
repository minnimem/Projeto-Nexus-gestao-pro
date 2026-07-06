import { endpoints } from "../../../services/resources";
import { downloadTextFile } from "../../../utils/exporters";
import {
  buildFiscalReadinessMessage,
  buildFiscalRealFilename,
} from "../services/fiscalReal";

export function useFiscalRealReadinessActions({
  requireFiscalRealDocument,
  runFiscalRealAction,
  setOrderMessage,
}) {
  function handleDownloadFiscalRealChecklist(pedido) {
    const documento = requireFiscalRealDocument(pedido, "Este pedido ainda não possui documento fiscal para checklist real.");
    if (!documento) return;

    return runFiscalRealAction(`download-checklist-real-${pedido.id}`, async () => {
      const content = await endpoints.fiscal.checklistEmissaoReal(documento.id);
      const filename = buildFiscalRealFilename({ documento, pedido, prefix: "checklist-emissao-real", extension: "txt" });
      downloadTextFile(filename, content);
      setOrderMessage({ type: "success", text: "Checklist de emissão real baixado." });
    }, "Não foi possível baixar o checklist de emissão real.");
  }

  function handleConsultFiscalRealReadiness(pedido) {
    const documento = requireFiscalRealDocument(pedido, "Este pedido ainda não possui documento fiscal para status real.");
    if (!documento) return;

    return runFiscalRealAction(`status-real-${pedido.id}`, async () => {
      const status = await endpoints.fiscal.statusEmissaoReal(documento.id);
      setOrderMessage({
        type: status.prontoEmissaoReal ? "success" : "error",
        text: buildFiscalReadinessMessage(status),
      });
    }, "Não foi possível consultar o status de emissão real.");
  }

  return {
    handleConsultFiscalRealReadiness,
    handleDownloadFiscalRealChecklist,
  };
}
