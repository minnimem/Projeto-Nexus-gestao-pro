import { formatNumber } from "../../../utils/formatters";

export function getCommercialFollowUpSummary(commercialFollowUpOrders) {
  return Array.from(
    commercialFollowUpOrders.reduce((map, pedido) => {
      const vendedor = pedido.usuario || pedido.vendedor || "Vendedor não informado";
      const current = map.get(vendedor) || {
        vendedor,
        orcamentos: 0,
        pendentes: 0,
        separacao: 0,
        valorAberto: 0,
        ultimoContato: pedido.data,
        registros: 0,
      };
      const status = String(pedido.status || "");
      current.orcamentos += status === "ORCAMENTO" ? 1 : 0;
      current.pendentes += status === "PENDENTE" ? 1 : 0;
      current.separacao += ["SEPARACAO", "SEPARADO"].includes(status) ? 1 : 0;
      current.valorAberto += Number(pedido.valor || 0);
      current.registros += 1;
      if (String(pedido.data || "") > String(current.ultimoContato || "")) current.ultimoContato = pedido.data;
      map.set(vendedor, current);
      return map;
    }, new Map()).values(),
  ).sort((a, b) => b.valorAberto - a.valorAberto);
}

export function getPriorityBySeller(commercialFollowUpSummary) {
  return commercialFollowUpSummary.slice(0, 4).map((item) => ({
    key: item.vendedor,
    title: item.vendedor,
    value: item.valorAberto,
    count: item.registros,
    detail: `${formatNumber(item.orcamentos)} propostas / ${formatNumber(item.pendentes)} a receber`,
    action: "Cobrar próxima ação",
  }));
}

export function getPriorityByClient(commercialFollowUpOrders) {
  return Array.from(
    commercialFollowUpOrders.reduce((map, pedido) => {
      const key = pedido.cliente || "Cliente não informado";
      const current = map.get(key) || {
        cliente: key,
        valor: 0,
        pedidos: 0,
        vendedor: pedido.usuario || pedido.vendedor || "Vendedor não informado",
        ultimoContato: pedido.data,
        statusCount: new Map(),
      };
      const status = String(pedido.status || "-");
      current.valor += Number(pedido.valor || 0);
      current.pedidos += 1;
      current.statusCount.set(status, (current.statusCount.get(status) || 0) + 1);
      if (String(pedido.data || "") > String(current.ultimoContato || "")) current.ultimoContato = pedido.data;
      map.set(key, current);
      return map;
    }, new Map()).values(),
  )
    .map((item) => ({
      ...item,
      topStatus: Array.from(item.statusCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || "-",
    }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 4);
}
