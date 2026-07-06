import { getLocalDateKey } from "../../../utils/formatters";

export const initialCommercialFollowUpForm = {
  pedidoId: "",
  cliente: "",
  canal: "WhatsApp",
  proximaAcao: "",
  observacao: "",
};

export function buildCommercialFollowUpFormFromOrder(pedido) {
  return {
    pedidoId: pedido.id,
    cliente: pedido.cliente || "Cliente não informado",
    canal: "WhatsApp",
    proximaAcao: getLocalDateKey(new Date(Date.now() + 24 * 60 * 60 * 1000)),
    observacao: pedido.status === "ORCAMENTO" ? "Retomar proposta comercial." : "Retomar andamento do pedido.",
  };
}

export function buildCommercialFollowUpPayload(form) {
  return {
    pedidoId: form.pedidoId,
    canal: form.canal,
    proximaAcao: form.proximaAcao || null,
    observacao: form.observacao,
  };
}
