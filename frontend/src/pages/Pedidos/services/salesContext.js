import { asList, formatCurrency } from "../../../utils/formatters";

export function getSalesContext({
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
}) {
  const completedRevenue = completedOrders.reduce(
    (total, pedido) => total + Number(pedido.valor || 0),
    0,
  );
  const contexts = {
    overview: {
      title: "Comando comercial",
      detail: "Receita, gargalos e atalhos por prioridade.",
      stats: [
        ["Vendas", completedOrders.length],
        ["Pendentes", pendingOrders.length],
        ["Orçamentos", quoteOrders.length],
      ],
    },
    pdv: {
      title: "Nova venda",
      detail: "Pedido, proposta e envio ao caixa no mesmo fluxo.",
      stats: [
        ["Clientes", clientes.length],
        ["Produtos", produtos.length],
        ["Pedidos", pedidos.length],
      ],
    },
    orders: {
      title: "Pedidos",
      detail: "Histórico operacional com status, fiscal e separação.",
      stats: [
        ["Registros", pedidos.length],
        ["Pendentes", pendingOrders.length],
        ["Concluídos", completedOrders.length],
      ],
    },
    followup: {
      title: "CRM comercial",
      detail: "Retomada de propostas e oportunidades em aberto.",
      stats: [
        ["Follow-ups", followUps.length],
        ["Orçamentos", quoteOrders.length],
        ["Pendentes", pendingOrders.length],
      ],
    },
    separation: {
      title: "Separação",
      detail: "Pedidos que precisam de estoque, retirada ou despacho.",
      stats: [
        ["Em fila", separationOrders.length],
        ["Pendentes", pendingOrders.length],
        ["Produtos", produtos.length],
      ],
    },
    analytics: {
      title: "Analytics",
      detail: "Gráficos e leitura de performance comercial.",
      stats: [
        ["Vendas", completedOrders.length],
        ["Ranking", rankingProdutos.length],
        ["Receita", formatCurrency(completedRevenue)],
      ],
    },
    ranking: {
      title: "Ranking",
      detail: "Vendedores, metas e produtos com maior impacto.",
      stats: [
        ["Vendedores", asList(dashboard.usuarios).length],
        ["Produtos", rankingProdutos.length],
        ["Vendas", completedOrders.length],
      ],
    },
    fiscal: {
      title: "Nota fiscal",
      detail: "Fila fiscal, homologação, XML, DANFE e pacote real.",
      stats: [
        ["Pedidos", pedidos.length],
        ["Documentos", fiscalDocumentCount],
        ["Pendentes", pendingOrders.length],
      ],
    },
  };

  return contexts[view] || contexts.overview;
}
