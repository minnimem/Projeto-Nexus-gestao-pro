import {
  formatCurrency,
  formatNumber,
  formatPercent,
  getLocalDateKey,
} from "../../../utils/formatters.js";
import { isCompletedSale } from "./salesPeriodReportViewModel.js";

function getFinanceDateKey(item) {
  const dateValue = item.data || item.dataPagamento || item.dataVencimento || item.criadoEm || item.dataCriacao;
  return dateValue ? getLocalDateKey(dateValue) : "";
}

export function buildExecutiveReportViewModel({
  bestBranchPerformance,
  bestPeriodRow,
  canSeeCollaborators,
  canSeeFinance,
  canSeeLogistics,
  clientes,
  dominantPaymentMethod,
  filteredEntregas,
  filteredFinanceiro,
  filteredPedidos,
  filteredRotas,
  filteredUsuarios,
  produtos,
  salesReportFilter,
  todayKey,
}) {
  const currentMonthStartKey = todayKey.slice(0, 8) + "01";
  const executiveStartKey = salesReportFilter.inicio || currentMonthStartKey;
  const executiveEndKey = salesReportFilter.fim || todayKey;
  const executiveStartDate = new Date(`${executiveStartKey}T00:00:00`);
  const executiveEndDate = new Date(`${executiveEndKey}T00:00:00`);
  const executiveDays = Math.max(
    Math.round((executiveEndDate.getTime() - executiveStartDate.getTime()) / 86400000) + 1,
    1,
  );
  const previousEndDate = new Date(executiveStartDate);
  previousEndDate.setDate(previousEndDate.getDate() - 1);
  const previousStartDate = new Date(previousEndDate);
  previousStartDate.setDate(previousStartDate.getDate() - executiveDays + 1);
  const previousStartKey = getLocalDateKey(previousStartDate);
  const previousEndKey = getLocalDateKey(previousEndDate);
  const periodCompletedSales = filteredPedidos.filter((pedido) => {
    if (!isCompletedSale(pedido)) return false;
    const key = getLocalDateKey(pedido.data);
    return key >= executiveStartKey && key <= executiveEndKey;
  });
  const previousCompletedSales = filteredPedidos.filter((pedido) => {
    if (!isCompletedSale(pedido)) return false;
    const key = getLocalDateKey(pedido.data);
    return key >= previousStartKey && key <= previousEndKey;
  });
  const currentRevenue = periodCompletedSales.reduce((total, pedido) => total + Number(pedido.valor || 0), 0);
  const previousRevenue = previousCompletedSales.reduce((total, pedido) => total + Number(pedido.valor || 0), 0);
  const revenueVariation = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : currentRevenue > 0 ? 100 : 0;
  const currentTicket = periodCompletedSales.length > 0 ? currentRevenue / periodCompletedSales.length : 0;
  const previousTicket = previousCompletedSales.length > 0
    ? previousCompletedSales.reduce((total, pedido) => total + Number(pedido.valor || 0), 0) / previousCompletedSales.length
    : 0;
  const currentFinanceRevenue = canSeeFinance
    ? filteredFinanceiro
        .filter((item) => {
          const key = getFinanceDateKey(item);
          return item.tipo === "RECEITA" && item.status === "APROVADO" && key >= executiveStartKey && key <= executiveEndKey;
        })
        .reduce((total, item) => total + Number(item.valor || 0), 0)
    : 0;
  const currentFinanceExpense = canSeeFinance
    ? filteredFinanceiro
        .filter((item) => {
          const key = getFinanceDateKey(item);
          return item.tipo === "DESPESA" && item.status === "APROVADO" && key >= executiveStartKey && key <= executiveEndKey;
        })
        .reduce((total, item) => total + Number(item.valor || 0), 0)
    : 0;
  const pendingFinanceAmount = canSeeFinance
    ? filteredFinanceiro
        .filter((item) => item.status === "PENDENTE")
        .reduce((total, item) => total + Number(item.valor || 0), 0)
    : 0;
  const delayedDeliveries = canSeeLogistics
    ? filteredEntregas.filter((entrega) => String(entrega.status || "").toUpperCase().includes("ATRAS")).length
    : 0;
  const inactiveCustomers = clientes.filter((cliente) => {
    const lastDate = cliente.ultimaCompra || cliente.dataUltimaCompra || cliente.dataAtualizacao;
    if (!lastDate) return false;
    const days = Math.round((new Date().getTime() - new Date(lastDate).getTime()) / 86400000);
    return days > 90;
  }).length;

  const executiveInsightRows = [
    {
      Area: "Vendas",
      Indicador: "Receita do período",
      Atual: formatCurrency(currentRevenue),
      Comparativo: formatCurrency(previousRevenue),
      Tendencia: `${revenueVariation >= 0 ? "+" : "-"}${formatPercent(revenueVariation)}%`,
      Acao: revenueVariation < 0 ? "Revisar funil, follow-up e ticket médio." : "Manter ritmo e reforcar campanhas vencedoras.",
    },
    bestPeriodRow && {
      Area: "Período",
      Indicador: "Melhor desempenho",
      Atual: bestPeriodRow.Periodo,
      Comparativo: formatCurrency(bestPeriodRow.total),
      Tendencia: `${formatNumber(bestPeriodRow.vendas)} venda(s)`,
      Acao: "Replicar oferta, equipe e mix do melhor período nas próximas metas.",
    },
    bestBranchPerformance && {
      Area: "Filial",
      Indicador: "Maior receita",
      Atual: bestBranchPerformance.filial,
      Comparativo: formatCurrency(bestBranchPerformance.total),
      Tendencia: `${formatNumber(bestBranchPerformance.vendas)} venda(s)`,
      Acao: "Usar filial lider como referência para treinamento e estoque.",
    },
    dominantPaymentMethod && {
      Area: "Pagamento",
      Indicador: "Forma dominante",
      Atual: dominantPaymentMethod.metodo,
      Comparativo: formatCurrency(dominantPaymentMethod.total),
      Tendencia: `${formatNumber(dominantPaymentMethod.vendas)} venda(s)`,
      Acao: "Conferir taxas e conciliação da forma mais usada no período.",
    },
    {
      Area: "Ticket",
      Indicador: "Ticket médio",
      Atual: formatCurrency(currentTicket),
      Comparativo: formatCurrency(previousTicket),
      Tendencia: previousTicket > 0 ? `${currentTicket >= previousTicket ? "+" : "-"}${formatPercent(((currentTicket - previousTicket) / previousTicket) * 100)}%` : "-",
      Acao: currentTicket < previousTicket ? "Priorizar combos, upsell e mix de maior margem." : "Usar ticket como referência para metas comerciais.",
    },
    canSeeFinance && {
      Area: "Financeiro",
      Indicador: "Resultado aprovado",
      Atual: formatCurrency(currentFinanceRevenue - currentFinanceExpense),
      Comparativo: formatCurrency(pendingFinanceAmount),
      Tendencia: pendingFinanceAmount > 0 ? "Atenção" : "Ok",
      Acao: pendingFinanceAmount > 0 ? "Cobrar pendências e revisar vencimentos." : "Fluxo sem pendência financeira relevante.",
    },
    canSeeLogistics && {
      Area: "Logística",
      Indicador: "Entregas atrasadas",
      Atual: formatNumber(delayedDeliveries),
      Comparativo: formatNumber(filteredEntregas.length),
      Tendencia: delayedDeliveries > 0 ? "Atenção" : "Ok",
      Acao: delayedDeliveries > 0 ? "Replanejar rotas e acionar responsáveis." : "Operação sem atraso logístico registrado.",
    },
    {
      Area: "Clientes",
      Indicador: "Clientes inativos",
      Atual: formatNumber(inactiveCustomers),
      Comparativo: formatNumber(clientes.length),
      Tendencia: inactiveCustomers > 0 ? "Recuperar" : "Ok",
      Acao: inactiveCustomers > 0 ? "Criar lista de reativação comercial." : "Carteira sem inatividade relevante.",
    },
  ].filter(Boolean);

  const executiveHighlightCards = [
    {
      label: "Melhor período",
      value: bestPeriodRow?.Periodo || "-",
      detail: bestPeriodRow ? `${formatCurrency(bestPeriodRow.total)} em ${formatNumber(bestPeriodRow.vendas)} venda(s)` : "Sem venda concluída",
      tone: "success",
    },
    {
      label: "Forma dominante",
      value: dominantPaymentMethod?.metodo || "-",
      detail: dominantPaymentMethod ? `${formatCurrency(dominantPaymentMethod.total)} recebido` : "Sem pagamento identificado",
      tone: "info",
    },
    {
      label: "Filial lider",
      value: bestBranchPerformance?.filial || "-",
      detail: bestBranchPerformance ? `${formatCurrency(bestBranchPerformance.total)} no filtro atual` : "Sem filial com venda",
      tone: "success",
    },
    {
      label: "Ação sugerida",
      value: revenueVariation < 0 ? "Recuperar" : pendingFinanceAmount > 0 ? "Conciliar" : "Escalar",
      detail: revenueVariation < 0 ?
        "Priorizar follow-up e clientes inativos."
        : pendingFinanceAmount > 0 ?
          "Baixar pendências antes de ampliar campanha."
          : "Reforcar estoque e meta da equipe.",
      tone: revenueVariation < 0 || pendingFinanceAmount > 0 ? "warning" : "success",
    },
  ];

  const moduleAnalyticsRows = [
    {
      Modulo: "Vendas",
      Metrica: "Receita / pedidos / ticket",
      Valor: `${formatCurrency(currentRevenue)} / ${formatNumber(periodCompletedSales.length)} / ${formatCurrency(currentTicket)}`,
      Status: revenueVariation < 0 ? "Queda" : "Crescimento",
    },
    {
      Modulo: "Clientes",
      Metrica: "Carteira / inativos",
      Valor: `${formatNumber(clientes.length)} / ${formatNumber(inactiveCustomers)}`,
      Status: inactiveCustomers > 0 ? "Recuperação" : "Saudável",
    },
    {
      Modulo: "Estoque",
      Metrica: "Produtos monitorados",
      Valor: formatNumber(produtos.length),
      Status: produtos.length > 0 ? "Com dados" : "Sem dados",
    },
    canSeeFinance && {
      Modulo: "Financeiro",
      Metrica: "Receitas / despesas / pendentes",
      Valor: `${formatCurrency(currentFinanceRevenue)} / ${formatCurrency(currentFinanceExpense)} / ${formatCurrency(pendingFinanceAmount)}`,
      Status: pendingFinanceAmount > 0 ? "Atenção" : "Controlado",
    },
    canSeeLogistics && {
      Modulo: "Logística",
      Metrica: "Entregas / rotas / atrasos",
      Valor: `${formatNumber(filteredEntregas.length)} / ${formatNumber(filteredRotas.length)} / ${formatNumber(delayedDeliveries)}`,
      Status: delayedDeliveries > 0 ? "Atenção" : "Controlado",
    },
    canSeeCollaborators && {
      Modulo: "Colaboradores",
      Metrica: "Ativos / bloqueados",
      Valor: `${formatNumber(filteredUsuarios.filter((usuario) => usuario.ativo !== false && !usuario.bloqueado).length)} / ${formatNumber(filteredUsuarios.filter((usuario) => usuario.bloqueado || usuario.ativo === false).length)}`,
      Status: filteredUsuarios.some((usuario) => usuario.bloqueado || usuario.ativo === false) ? "Revisar" : "Controlado",
    },
  ].filter(Boolean);

  return {
    currentRevenue,
    executiveEndKey,
    executiveHighlightCards,
    executiveInsightRows,
    executiveStartKey,
    moduleAnalyticsRows,
    previousEndKey,
    previousRevenue,
    previousStartKey,
    revenueVariation,
  };
}
