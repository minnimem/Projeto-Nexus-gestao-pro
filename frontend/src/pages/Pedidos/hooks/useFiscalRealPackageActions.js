import { endpoints } from "../../../services/resources";
import { downloadTextFile } from "../../../utils/exporters";
import {
  buildFiscalIntegrityMessage,
  buildFiscalPackageMessage,
  buildFiscalRealFilename,
} from "../services/fiscalReal";

export function useFiscalRealPackageActions({
  requireFiscalRealDocument,
  runFiscalRealAction,
  setOrderMessage,
}) {
  function handleDownloadFiscalRealPackage(pedido) {
    const documento = requireFiscalRealDocument(pedido, "Este pedido ainda não possui documento fiscal para pacote real.");
    if (!documento) return;

    return runFiscalRealAction(`download-pacote-real-${pedido.id}`, async () => {
      const pacote = await endpoints.fiscal.pacoteEmissaoReal(documento.id);
      const filename = buildFiscalRealFilename({ documento, pedido, prefix: "pacote-emissao-real", extension: "json" });
      downloadTextFile(filename, JSON.stringify(pacote, null, 2), "application/json;charset=utf-8");
      setOrderMessage({
        type: pacote.prontoEmissaoReal ? "success" : "error",
        text: buildFiscalPackageMessage(pacote),
      });
    }, "Não foi possível baixar o pacote de emissão real.");
  }

  function handleDownloadFiscalRealPackageManifest(pedido) {
    const documento = requireFiscalRealDocument(pedido, "Este pedido ainda não possui documento fiscal para manifesto.");
    if (!documento) return;

    return runFiscalRealAction(`download-manifesto-real-${pedido.id}`, async () => {
      const content = await endpoints.fiscal.manifestoPacoteEmissaoReal(documento.id);
      const filename = buildFiscalRealFilename({ documento, pedido, prefix: "manifesto-pacote-real", extension: "txt" });
      downloadTextFile(filename, content);
      setOrderMessage({ type: "success", text: "Manifesto de integridade do pacote real baixado." });
    }, "Não foi possível baixar o manifesto do pacote real.");
  }

  function handleValidateFiscalRealPackageIntegrity(pedido) {
    const documento = requireFiscalRealDocument(pedido, "Este pedido ainda não possui documento fiscal para validar pacote.");
    if (!documento) return;

    return runFiscalRealAction(`validar-pacote-real-${pedido.id}`, async () => {
      const integridade = await endpoints.fiscal.validarIntegridadePacoteEmissaoReal(documento.id);
      setOrderMessage({
        type: integridade.valido ? "success" : "error",
        text: buildFiscalIntegrityMessage(integridade),
      });
    }, "Não foi possível validar a integridade do pacote real.");
  }

  return {
    handleDownloadFiscalRealPackage,
    handleDownloadFiscalRealPackageManifest,
    handleValidateFiscalRealPackageIntegrity,
  };
}
