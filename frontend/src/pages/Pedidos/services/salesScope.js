import { asList } from "../../../utils/formatters";

function belongsToSalesBranch(pedido, salesBranchFilter) {
  if (salesBranchFilter === "TODAS") return true;
  if (salesBranchFilter === "EMPRESA") return !pedido.filialId;
  return String(pedido.filialId || "") === salesBranchFilter;
}

export function getSalesScopeData({ data, salesBranchFilter }) {
  const ultimosPedidos = asList(data.ultimosPedidos);
  const pedidos = asList(data.pedidos);
  const pedidosBase = pedidos.length > 0 ? pedidos : ultimosPedidos;
  const filiais = asList(data.filiais);
  const branchScopedOrders = pedidosBase.filter((pedido) =>
    belongsToSalesBranch(pedido, salesBranchFilter),
  );
  const recentOrdersSource = pedidos.length > 0 ? branchScopedOrders : ultimosPedidos;
  const branchScopedRecentOrders = recentOrdersSource
    .filter((pedido) => belongsToSalesBranch(pedido, salesBranchFilter))
    .sort((a, b) => String(b.data || "").localeCompare(String(a.data || "")));
  const branchCompletedOrders = branchScopedOrders.filter((pedido) =>
    ["FINALIZADA", "RECEBIDO", "ENTREGUE", "CONCLUIDO"].includes(String(pedido.status || "")),
  );
  const selectedSalesBranchLabel = salesBranchFilter === "TODAS" ?
    "Todas as filiais"
    : salesBranchFilter === "EMPRESA" ?
      "Empresa / sem filial"
      : filiais.find((filial) => String(filial.id) === salesBranchFilter).nome || "Filial";

  return {
    branchCompletedOrders,
    branchScopedOrders,
    branchScopedRecentOrders,
    filiais,
    selectedSalesBranchLabel,
    ultimosPedidos,
  };
}
