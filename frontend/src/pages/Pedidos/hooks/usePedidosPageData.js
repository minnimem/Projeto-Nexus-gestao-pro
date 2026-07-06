import { useMemo } from "react";
import { normalizeStatus } from "../../../components/common/StatusUi";
import { asList } from "../../../utils/formatters";
import { SALES_VIEWS } from "../constants/salesNavigation";
import { getSalesContext } from "../services/salesContext";
import { isSeparationQueueOrder } from "../services/separationRules";

export function usePedidosPageData({ data, view }) {
  return useMemo(() => {
    const dashboard = data.dashboard || data || {};
    const produtos = asList(data.produtos);
    const clientes = asList(data.clientes);
    const pedidosBase = asList(dashboard.pedidos);
    const pedidos = pedidosBase.length > 0 ? pedidosBase : asList(dashboard.ultimosPedidos);
    const followUps = asList(dashboard.followUpsComerciais);
    const rankingProdutos = asList(dashboard.rankingProdutos);
    const documentosFiscaisPorPedido = dashboard.documentosFiscaisPorPedido || {};
    const fiscalDocumentCount = Object.values(documentosFiscaisPorPedido).reduce(
      (total, value) => total + asList(value).length,
      0,
    );
    const pendingOrders = pedidos.filter((pedido) =>
      ["PENDENTE", "SEPARACAO", "SEPARADO"].includes(normalizeStatus(pedido.status)),
    );
    const completedOrders = pedidos.filter((pedido) =>
      ["FINALIZADA", "RECEBIDO", "ENTREGUE", "CONCLUIDO"].includes(normalizeStatus(pedido.status)),
    );
    const quoteOrders = pedidos.filter((pedido) => normalizeStatus(pedido.status) === "ORCAMENTO");
    const separationOrders = pedidos.filter(isSeparationQueueOrder);
    const activeSalesView = SALES_VIEWS.find((item) => item.value === view) || SALES_VIEWS[0];
    const salesContext = getSalesContext({
      clientes,
      completedOrders,
      dashboard,
      fiscalDocumentCount,
      followUps,
      pendingOrders,
      pedidos,
      produtos,
      quoteOrders,
      rankingProdutos,
      separationOrders,
      view,
    });

    return {
      activeSalesView,
      clientes,
      dashboard,
      produtos,
      salesContext,
    };
  }, [data, view]);
}
