import { formatCurrency, formatNumber, getLocalDateKey } from "../../../utils/formatters.js";

const commissionStatuses = new Set(["FINALIZADA", "RECEBIDO", "ENTREGUE", "CONCLUIDO"]);

export function getSellerPerformance({
  branchScopedOrders,
  commissionPercent,
  selectedSalesBranchLabel,
  sellerRankingFilter,
  sellers,
}) {
  const commissionRate = commissionPercent / 100;
  const sellerByName = new Map();
  sellers.forEach((usuario) => {
    [usuario.nome, usuario.login].filter(Boolean).forEach((value) => {
      sellerByName.set(String(value).toLowerCase(), usuario);
    });
  });

  const rankingSales = branchScopedOrders.filter((pedido) => {
    if (!commissionStatuses.has(String(pedido.status || ""))) return false;
    const saleKey = getLocalDateKey(pedido.data);
    if (!saleKey) return false;
    if (sellerRankingFilter.inicio && saleKey < sellerRankingFilter.inicio) return false;
    if (sellerRankingFilter.fim && saleKey > sellerRankingFilter.fim) return false;
    return true;
  });
  const sellerCommissionSummary = Array.from(
    rankingSales.reduce((map, pedido) => {
      const key = pedido.usuario || pedido.vendedor || "Vendedor não informado";
      const usuario = sellerByName.get(String(key).toLowerCase());
      const current = map.get(key) || {
        vendedor: key,
        usuario,
        pedidos: 0,
        total: 0,
        comissao: 0,
        meta: Number(usuario.metaVendas || 0),
        atingimento: 0,
        faltam: 0,
        filiais: new Set(),
      };
      const valor = Number(pedido.valor || 0);
      current.pedidos += 1;
      current.total += valor;
      current.comissao = current.total * commissionRate;
      current.atingimento = current.meta > 0 ? Math.min((current.total / current.meta) * 100, 999) : 0;
      current.faltam = Math.max(current.meta - current.total, 0);
      current.filiais.add(pedido.filial || "Empresa / sem filial");
      map.set(key, current);
      return map;
    }, new Map()).values(),
  ).sort((a, b) => b.total - a.total);
  const sellerRankingTotal = sellerCommissionSummary.reduce((total, item) => total + item.total, 0);
  const sellerRankingGoal = sellerCommissionSummary.reduce((total, item) => total + Number(item.meta || 0), 0);
  const sellerRankingProgress = sellerRankingGoal > 0 ? (sellerRankingTotal / sellerRankingGoal) * 100 : 0;
  const sellerCommissionRows = sellerCommissionSummary.map((item) => ({
    Vendedor: item.vendedor,
    Filiais: Array.from(item.filiais || []).join(" | ") || selectedSalesBranchLabel,
    Pedidos: formatNumber(item.pedidos),
    Vendas: formatCurrency(item.total),
    Meta: item.meta > 0 ? formatCurrency(item.meta) : "-",
    Atingimento: item.meta > 0 ? `${formatNumber(item.atingimento)}%` : "-",
    "Faltam para meta": item.meta > 0 ? formatCurrency(item.faltam) : "-",
    [`Comissão ${formatNumber(commissionPercent)}%`]: formatCurrency(item.comissao),
  }));

  return {
    sellerCommissionRows,
    sellerCommissionSummary,
    sellerRankingGoal,
    sellerRankingProgress,
    sellerRankingTotal,
  };
}
