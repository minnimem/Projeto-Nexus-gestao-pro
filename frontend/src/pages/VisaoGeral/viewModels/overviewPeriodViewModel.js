import {
  asList,
  formatPercent,
  getLocalDateKey,
} from "../../../utils/formatters.js";

export const COMPLETED_OVERVIEW_STATUSES = new Set(["FINALIZADA", "RECEBIDO", "ENTREGUE", "CONCLUIDO"]);

export function isCompletedOverviewOrder(pedido) {
  return COMPLETED_OVERVIEW_STATUSES.has(String(pedido.status || ""));
}

function isInPeriod(value, periodRange) {
  const dateKey = getLocalDateKey(value);
  return Boolean(dateKey) && dateKey >= periodRange.startKey && dateKey <= periodRange.endKey;
}

function countCashMovements(caixa) {
  const movimentos = asList(caixa.movimentos);
  if (movimentos.length > 0) {
    return movimentos.filter((movimento) => ["VENDA", "PAGAMENTO_RECEBIDO"].includes(String(movimento.tipo || ""))).length;
  }

  return Number(caixa.totalVendas || 0) + Number(caixa.totalPagamentosRecebidos || 0) > 0 ? 1 : 0;
}

export function buildOverviewPeriodViewModel({
  caixas,
  entregas,
  filiais,
  pedidos,
  periodRange,
  todayKey,
  usuarios,
}) {
  const periodPedidos = pedidos.filter((pedido) => isInPeriod(pedido.data, periodRange));
  const periodCompletedPedidos = periodPedidos.filter(isCompletedOverviewOrder);
  const periodRevenue = periodCompletedPedidos.reduce((total, pedido) => total + Number(pedido.valor || 0), 0);
  const periodCaixas = caixas.filter((caixa) => isInPeriod(caixa.dataAbertura || caixa.dataFechamento, periodRange));
  const periodCashRevenue = periodCaixas.reduce(
    (total, caixa) => total + Number(caixa.totalVendas || 0) + Number(caixa.totalPagamentosRecebidos || 0),
    0,
  );
  const periodCashMovements = periodCaixas.reduce((total, caixa) => total + countCashMovements(caixa), 0);
  const todayCaixas = caixas.filter((caixa) => getLocalDateKey(caixa.dataAbertura || caixa.dataFechamento) === todayKey);
  const todayCashRevenue = todayCaixas.reduce(
    (total, caixa) => total + Number(caixa.totalVendas || 0) + Number(caixa.totalPagamentosRecebidos || 0),
    0,
  );
  const openCashRegisters = caixas.filter((caixa) => String(caixa.status || "") === "ABERTO").length;
  const periodPendingOrders = periodPedidos.filter((pedido) =>
    ["PENDENTE", "SEPARACAO", "SEPARADO"].includes(String(pedido.status || "")),
  );
  const periodAverageTicket = periodCompletedPedidos.length > 0 ? periodRevenue / periodCompletedPedidos.length : 0;
  const periodCashTicket = periodCashMovements > 0 ? periodCashRevenue / periodCashMovements : 0;
  const periodDays = Math.max(
    1,
    Math.round((new Date(`${periodRange.endKey}T00:00:00`) - new Date(`${periodRange.startKey}T00:00:00`)) / 86400000) + 1,
  );
  const previousStart = new Date(`${periodRange.startKey}T00:00:00`);
  previousStart.setDate(previousStart.getDate() - periodDays);
  const previousEnd = new Date(`${periodRange.startKey}T00:00:00`);
  previousEnd.setDate(previousEnd.getDate() - 1);
  const previousStartKey = getLocalDateKey(previousStart);
  const previousEndKey = getLocalDateKey(previousEnd);
  const previousRevenue = pedidos
    .filter((pedido) => {
      const dateKey = getLocalDateKey(pedido.data);
      return dateKey >= previousStartKey
        && dateKey <= previousEndKey
        && isCompletedOverviewOrder(pedido);
    })
    .reduce((total, pedido) => total + Number(pedido.valor || 0), 0);
  const revenueChangePercent = previousRevenue > 0
    ? ((periodRevenue - previousRevenue) / previousRevenue) * 100
    : periodRevenue > 0
      ? 100
      : 0;
  const revenueChangeLabel = previousRevenue <= 0 && periodRevenue > 0
    ? "Novo faturamento no período"
    : revenueChangePercent > 0
      ? `Alta de ${formatPercent(revenueChangePercent)}% vs período anterior`
      : revenueChangePercent < 0
        ? `Queda de ${formatPercent(revenueChangePercent)}% vs período anterior`
        : "Sem variação vs período anterior";
  const revenueChange = {
    value: revenueChangeLabel,
    tone: revenueChangePercent >= 0 ? "positive" : "negative",
  };
  const branchSourceRows = [
    { id: "EMPRESA", nome: "Empresa / sem filial" },
    ...filiais.map((filial) => ({ id: filial.id, nome: filial.nome })),
  ];
  const branchOverviewRows = branchSourceRows
    .map((branch) => {
      const matchesBranch = (item) =>
        branch.id === "EMPRESA" ? !item.filialId : String(item.filialId || "") === String(branch.id);
      const branchPedidos = pedidos.filter(matchesBranch);
      const branchCompleted = branchPedidos.filter(isCompletedOverviewOrder);
      const branchUsers = usuarios.filter(matchesBranch);
      const branchDeliveries = entregas.filter(matchesBranch);
      return {
        id: branch.id,
        filial: branch.nome,
        receita: branchCompleted.reduce((total, pedido) => total + Number(pedido.valor || 0), 0),
        vendas: branchCompleted.length,
        pendentes: branchPedidos.filter((pedido) => ["PENDENTE", "SEPARACAO", "SEPARADO"].includes(String(pedido.status || ""))).length,
        equipe: branchUsers.filter((usuario) => usuario.ativo !== false && !usuario.bloqueado).length,
        entregas: branchDeliveries.length,
      };
    })
    .filter((row) => row.vendas > 0 || row.pendentes > 0 || row.equipe > 0 || row.entregas > 0)
    .sort((a, b) => b.receita - a.receita || b.vendas - a.vendas)
    .slice(0, 6);

  return {
    branchOverviewRows,
    openCashRegisters,
    periodAverageTicket,
    periodCashMovements,
    periodCashRevenue,
    periodCashTicket,
    periodCaixas,
    periodCompletedPedidos,
    periodDays,
    periodPedidos,
    periodPendingOrders,
    periodRevenue,
    previousRevenue,
    revenueChange,
    revenueChangeLabel,
    revenueChangePercent,
    todayCashRevenue,
  };
}
