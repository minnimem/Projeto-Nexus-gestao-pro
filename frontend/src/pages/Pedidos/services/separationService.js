import { endpoints } from "../../../services/resources.js";

export const separationService = {
  start: (pedidoId) => endpoints.pedidos.iniciarSeparacao(pedidoId),
  finish: (pedidoId) => endpoints.pedidos.concluirSeparacao(pedidoId),
  cancelInconsistent: (pedidoId) => endpoints.pedidos.cancelarInconsistente(pedidoId),
  cancelInconsistentBatch: (pedidoIds) => endpoints.pedidos.cancelarInconsistentes(pedidoIds),
};
