import { fiscalStatusOptions } from "../../../constants/fiscal";
import { formatCurrency, formatDateTime } from "../../../utils/formatters";

const primaryFiscalStatuses = new Set(["PENDENTE", "AUTORIZADO", "REJEITADO", "CANCELADO"]);

export function getFiscalControlData({
  branchScopedRecentOrders,
  fiscalHistory,
  getFiscalStatus,
  getLatestFiscalDocument,
}) {
  const fiscalControlOrders = branchScopedRecentOrders.filter((pedido) => String(pedido.status || "") !== "ORCAMENTO");
  const fiscalControlRows = fiscalControlOrders.map((pedido) => {
    const documento = getLatestFiscalDocument(pedido);
    return {
      Documento: documento ? `${documento.modelo || "-"} ${documento.serie || "-"}-${documento.numero || "-"}` : "-",
      Pedido: pedido.numero || pedido.id,
      Cliente: pedido.cliente || "Cliente não informado",
      Filial: pedido.filial || "Empresa / sem filial",
      Data: formatDateTime(pedido.data),
      Valor: formatCurrency(pedido.valor),
      "Status pedido": pedido.status || "-",
      "Status fiscal": getFiscalStatus(pedido),
      Protocolo: documento.protocolo || "-",
      Chave: documento.chaveAcesso || "-",
      "Última alteração": fiscalHistory.find((item) => String(item.orderId) === String(pedido.id)).data || "-",
    };
  });
  const fiscalHistoryRows = fiscalHistory.map((item) => ({
    Data: item.data,
    Pedido: item.pedido,
    Cliente: item.cliente,
    Filial: item.filial,
    "Status anterior": item.anterior,
    "Status novo": item.novo,
    Usuario: item.usuario,
    Observacao: item.observacao,
  }));
  const fiscalStatusSummary = fiscalStatusOptions.map((option) => ({
    ...option,
    count: fiscalControlOrders.filter((pedido) => getFiscalStatus(pedido) === option.value).length,
  }));

  return {
    fiscalControlOrders,
    fiscalControlRows,
    fiscalHistoryRows,
    fiscalStatusSummary,
    primaryFiscalStatusSummary: fiscalStatusSummary.filter((item) => primaryFiscalStatuses.has(item.value)),
    secondaryFiscalStatusSummary: fiscalStatusSummary.filter((item) => !primaryFiscalStatuses.has(item.value)),
  };
}
