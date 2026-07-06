export const fiscalFilename = (prefix, extension) => (documento, pedido) =>
  `nexus-one-${prefix}${documento.modelo || "documento-fiscal"}-${documento.serie || "serie"}-${documento.numero || pedido.id}.${extension}`;

export function buildFiscalPendenciesContent({ documento, pedido }) {
  const pendencias = Array.isArray(documento.pendenciasFiscais)
    ? documento.pendenciasFiscais
    : String(documento.pendenciasFiscais || "")
      .split(/\r?\n|;/)
      .map((item) => item.trim())
      .filter(Boolean);

  return [
    "Nexus One - Pendências fiscais",
    `Pedido: ${pedido.numero || pedido.id || "-"}`,
    `Documento: ${documento.modelo || "-"} ${documento.serie || "-"}-${documento.numero || "-"}`,
    `Status: ${documento.status || "-"}`,
    "",
    "Pendências:",
    ...(pendencias.length > 0 ? pendencias.map((item, index) => `${index + 1}. ${item}`) : ["- Nenhuma pendência detalhada."]),
  ].join("\n");
}

export const fiscalDocumentDownloadConfigs = {
  correctionLetter: {
    actionKey: "download-cce",
    availableField: "possuiCartaCorrecao",
    contentField: "cartaCorrecaoXml",
    errorMessage: "Não foi possível baixar a CC-e de homologação.",
    filename: fiscalFilename("cce-", "xml"),
    mimeType: "application/xml;charset=utf-8",
    missingMessage: "CC-e de homologação não encontrada no documento atualizado.",
    successMessage: "CC-e de homologação baixada.",
    unavailableMessage: "Este pedido ainda não possui CC-e de homologação.",
  },
  danfe: {
    actionKey: "download-danfe",
    availableField: "possuiDanfeHtml",
    contentField: "danfeHtml",
    errorMessage: "Não foi possível baixar o DANFE de homologação.",
    filename: fiscalFilename("danfe-", "html"),
    mimeType: "text/html;charset=utf-8",
    missingMessage: "DANFE de homologação não encontrado no documento atualizado.",
    successMessage: "DANFE de homologação baixado.",
    unavailableMessage: "Este pedido ainda não possui DANFE de homologação gerado.",
  },
  payload: {
    actionKey: "download-json",
    availableField: "possuiPayloadJson",
    contentField: "payloadJson",
    errorMessage: "Não foi possível baixar o payload fiscal.",
    filename: fiscalFilename("", "json"),
    mimeType: "application/json;charset=utf-8",
    missingMessage: "Payload fiscal não encontrado no documento atualizado.",
    successMessage: "Payload fiscal JSON baixado.",
    unavailableMessage: "Este pedido ainda não possui payload fiscal JSON.",
  },
  returnXml: {
    actionKey: "download-retorno",
    availableField: "possuiXmlRetorno",
    contentField: "xmlRetorno",
    errorMessage: "Não foi possível baixar o XML de retorno fiscal.",
    filename: fiscalFilename("retorno-", "xml"),
    mimeType: "application/xml;charset=utf-8",
    missingMessage: "XML de retorno não encontrado no documento atualizado.",
    successMessage: "XML de retorno fiscal baixado.",
    unavailableMessage: "Este pedido ainda não possui XML de retorno fiscal.",
  },
  xml: {
    actionKey: "download-xml",
    availableField: "possuiXml",
    contentField: "xml",
    errorMessage: "Não foi possível baixar o XML fiscal.",
    filename: fiscalFilename("", "xml"),
    mimeType: "application/xml;charset=utf-8",
    missingMessage: "XML fiscal não encontrado no documento atualizado.",
    successMessage: "XML fiscal baixado.",
    unavailableMessage: "Este pedido ainda não possui XML fiscal.",
  },
};
