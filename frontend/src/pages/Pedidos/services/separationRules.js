import { SEPARATION_STAGE } from "../constants/separation.js";

export function normalizeOrderStatus(pedido) {
  return String(pedido?.status || "").toUpperCase();
}

export function normalizeDeliveryType(value) {
  return String(value || "RETIRADA_LOJA").toUpperCase();
}

export function getSeparationStage(pedido) {
  const status = normalizeOrderStatus(pedido);
  if (status === "SEPARACAO") return SEPARATION_STAGE.IN_PROGRESS;
  if (status === "SEPARADO") return SEPARATION_STAGE.READY;
  return SEPARATION_STAGE.WAITING;
}

export function isSeparationQueueOrder(pedido) {
  const status = normalizeOrderStatus(pedido);
  const deliveryType = normalizeDeliveryType(pedido?.tipoEntrega);

  if (["SEPARACAO", "SEPARADO"].includes(status)) return true;
  if (status === "RECEBIDO") return true;
  return status === "PENDENTE" && deliveryType === "ENTREGA";
}

export function canStartSeparation(pedido) {
  return ["PENDENTE", "RECEBIDO"].includes(normalizeOrderStatus(pedido));
}

export function canFinishSeparation(pedido) {
  return normalizeOrderStatus(pedido) === "SEPARACAO";
}

export function canCancelInconsistentOrder(pedido) {
  const status = normalizeOrderStatus(pedido);
  const items = Array.isArray(pedido?.itens) ? pedido.itens : [];
  return items.length === 0 && !["CANCELADO", "CANCELADA", "CONCLUIDO"].includes(status);
}

export function getSeparationCompletionStatus(deliveryType) {
  return normalizeDeliveryType(deliveryType) === "RETIRADA_LOJA" ? "CONCLUIDO" : "SEPARADO";
}

export function getSeparationStartLabel(deliveryType) {
  return normalizeDeliveryType(deliveryType) === "RETIRADA_LOJA" ? "Retirar estoque" : "Iniciar";
}

export function getSeparationStatusLabel(pedido) {
  const stage = getSeparationStage(pedido);
  if (stage === SEPARATION_STAGE.IN_PROGRESS) return "Em separação";
  if (stage === SEPARATION_STAGE.READY) return "Pronto para despacho";
  return "Aguardando separação";
}
