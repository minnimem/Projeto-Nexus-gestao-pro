import {
  asList,
  formatShortDate,
  getLocalDateKey,
} from "../../../utils/formatters.js";
import { normalizePerfil } from "../../../utils/permissions.js";
import { getStockProductName } from "../../../utils/stock.js";

function isInPeriod(value, periodRange) {
  const dateKey = getLocalDateKey(value);
  return Boolean(dateKey) && dateKey >= periodRange.startKey && dateKey <= periodRange.endKey;
}

export function useOverviewActivityData({
  estoqueBaixo,
  financeiro,
  isCashOperator,
  periodCaixas,
  periodCompletedPedidos,
  periodPedidos,
  periodPreset,
  periodRange,
  session,
  todayKey,
  widgetLayout,
}) {
  const trendLength = periodPreset === "today" ? 1 : periodPreset === "sevenDays" ? 7 : periodPreset === "year" ? 12 : 31;
  const salesTrendRows = periodPreset === "year"
    ? Array.from({ length: 12 }, (_, index) => {
      const month = index;
      const monthPedidos = periodCompletedPedidos
        .filter((pedido) => {
          const date = new Date(pedido.data);
          return !Number.isNaN(date.getTime()) && date.getMonth() === month;
        });
      const total = monthPedidos.reduce((sum, pedido) => sum + Number(pedido.valor || 0), 0);
      return {
        key: `month-${index}`,
        label: new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(new Date(new Date().getFullYear(), month, 1)),
        total,
        count: monthPedidos.length,
      };
    })
    : Array.from({ length: trendLength }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (trendLength - 1 - index));
      const dateKey = getLocalDateKey(date);
      const dayPedidos = periodCompletedPedidos.filter((pedido) => getLocalDateKey(pedido.data) === dateKey);
      const total = dayPedidos.reduce((sum, pedido) => sum + Number(pedido.valor || 0), 0);
      return { key: dateKey, label: formatShortDate(dateKey), total, count: dayPedidos.length };
    });
  const cashTrendRows = periodPreset === "year"
    ? Array.from({ length: 12 }, (_, index) => {
      const month = index;
      const monthCaixas = periodCaixas.filter((caixa) => {
        const date = new Date(caixa.dataAbertura || caixa.dataFechamento);
        return !Number.isNaN(date.getTime()) && date.getMonth() === month;
      });
      const total = monthCaixas.reduce(
        (sum, caixa) => sum + Number(caixa.totalVendas || 0) + Number(caixa.totalPagamentosRecebidos || 0),
        0,
      );
      const count = monthCaixas.filter((caixa) => Number(caixa.totalVendas || 0) + Number(caixa.totalPagamentosRecebidos || 0) > 0).length;
      return {
        key: `cash-month-${index}`,
        label: new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(new Date(new Date().getFullYear(), month, 1)),
        total,
        count,
      };
    })
    : Array.from({ length: trendLength }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (trendLength - 1 - index));
      const dateKey = getLocalDateKey(date);
      const dayCaixas = periodCaixas.filter((caixa) => getLocalDateKey(caixa.dataAbertura || caixa.dataFechamento) === dateKey);
      const total = dayCaixas.reduce(
        (sum, caixa) => sum + Number(caixa.totalVendas || 0) + Number(caixa.totalPagamentosRecebidos || 0),
        0,
      );
      const count = dayCaixas.filter((caixa) => Number(caixa.totalVendas || 0) + Number(caixa.totalPagamentosRecebidos || 0) > 0).length;
      return { key: `cash-${dateKey}`, label: formatShortDate(dateKey), total, count };
    });
  const overviewTrendRows = isCashOperator ? cashTrendRows : salesTrendRows;
  const financeiroMovimentacoes = asList(financeiro.movimentacoes);
  const recentActivityRows = [
    ...periodPedidos.slice(0, 8).map((pedido) => ({
      id: `pedido-${pedido.id}`,
      tipo: "Venda",
      descricao: `${pedido.numero || pedido.id} - ${pedido.cliente || "Cliente não informado"}`,
      usuario: pedido.usuario || "Sistema",
      data: pedido.data,
      status: pedido.status || "-",
    })),
    ...estoqueBaixo.slice(0, 4).map((item) => ({
      id: `estoque-${item.produtoId || item.id || getStockProductName(item)}`,
      tipo: "Estoque",
      descricao: `${getStockProductName(item)} abaixo do mínimo`,
      usuario: "Sistema",
      data: todayKey,
      status: "Baixo",
    })),
    ...financeiroMovimentacoes
      .filter((item) => isInPeriod(item.dataLancamento || item.dataVencimento, periodRange))
      .slice(0, 6)
      .map((item) => ({
        id: `financeiro-${item.id}`,
        tipo: "Financeiro",
        descricao: item.descricao || item.observacao || item.categoria || "Movimentação financeira",
        usuario: item.usuario || "Sistema",
        data: item.dataLancamento || item.dataVencimento,
        status: item.status || "-",
      })),
  ]
    .filter((item) => item.id)
    .sort((a, b) => new Date(b.data || 0).getTime() - new Date(a.data || 0).getTime())
    .slice(0, 6);
  const widgetCatalog = [
    { id: "bi", label: "BI operacional", profile: "Gestão" },
    { id: "ai", label: "Copiloto operacional", profile: "IA" },
    { id: "trend", label: isCashOperator ? "Gráfico do caixa" : "Gráfico de vendas", profile: "Comercial" },
    { id: "health", label: "Saúde operacional", profile: normalizePerfil(session.perfil) || "GERAL" },
    { id: "activity", label: "Atividades recentes", profile: "Operação" },
    { id: "alerts", label: "Alertas", profile: "Operação" },
    { id: "daily", label: "Relatório diário", profile: "Gestão" },
    { id: "branches", label: "Operação por filial", profile: "Gestão" },
    { id: "orders", label: "Últimos pedidos", profile: "Comercial" },
    { id: "priorities", label: "Prioridades", profile: "Gestão" },
  ];
  const visibleWidgetIds = widgetLayout.order.filter((id) => !widgetLayout.hidden.includes(id));
  const visibleWidgetLabels = visibleWidgetIds
    .map((id) => widgetCatalog.find((widget) => widget.id === id).label)
    .filter(Boolean);

  return {
    overviewTrendRows,
    recentActivityRows,
    visibleWidgetIds,
    visibleWidgetLabels,
    widgetCatalog,
  };
}
