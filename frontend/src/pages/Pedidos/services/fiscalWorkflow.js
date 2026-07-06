import { asList } from "../../../utils/formatters";

export function findFiscalConfigForOrder({
  configuracoesFiscais,
  modelo = "NFE",
  pedido,
}) {
  const configs = configuracoesFiscais.filter((config) =>
    config.ativo
    && String(config.modelo || "") === modelo
    && String(config.ambiente || "HOMOLOGACAO") === "HOMOLOGACAO"
  );
  const filialId = String(pedido.filialId || "");

  return configs.find((config) => filialId && String(config.filialId || "") === filialId)
    || configs.find((config) => !config.filialId)
    || configs[0]
    || null;
}

export async function findFiscalDocumentByStatus({
  endpoints,
  pedidoId,
  status,
}) {
  const documentos = await endpoints.fiscal.documentosPorPedido(pedidoId);
  return asList(documentos).find((item) => item.status === status);
}
