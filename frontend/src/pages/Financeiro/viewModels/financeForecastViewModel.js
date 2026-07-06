import { addMonthsToDateKey, formatCurrency, formatNumber, getLocalDateKey } from "../../../utils/formatters";

export function createFinanceForecastViewModel({ activeRecurrences, branchScopedMovimentacoes, now }) {
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  const next30DaysEnd = new Date(now);
  next30DaysEnd.setDate(now.getDate() + 30);
  const isMovementWithin = (item, start, end, field = "dataLancamento") => {
    const key = getLocalDateKey(item[field] || item.dataLancamento || item.dataVencimento);
    return key >= getLocalDateKey(start) && key <= getLocalDateKey(end);
  };
  const sumApprovedByType = (items, tipo, start, end) =>
    items
      .filter((item) => item.tipo === tipo && item.status === "APROVADO" && isMovementWithin(item, start, end))
      .reduce((total, item) => total + Number(item.valor || 0), 0);
  const currentMonthRevenue = sumApprovedByType(branchScopedMovimentacoes, "RECEITA", currentMonthStart, currentMonthEnd);
  const currentMonthExpense = sumApprovedByType(branchScopedMovimentacoes, "DESPESA", currentMonthStart, currentMonthEnd);
  const previousMonthRevenue = sumApprovedByType(branchScopedMovimentacoes, "RECEITA", previousMonthStart, previousMonthEnd);
  const previousMonthExpense = sumApprovedByType(branchScopedMovimentacoes, "DESPESA", previousMonthStart, previousMonthEnd);
  const currentMonthResult = currentMonthRevenue - currentMonthExpense;
  const previousMonthResult = previousMonthRevenue - previousMonthExpense;
  const resultVariation = previousMonthResult !== 0
    ? ((currentMonthResult - previousMonthResult) / Math.abs(previousMonthResult)) * 100
    : currentMonthResult > 0 ? 100 : 0;
  const forecastMovements30Days = branchScopedMovimentacoes.filter((item) => {
    if (!["APROVADO", "PENDENTE"].includes(String(item.status || ""))) return false;
    const key = getLocalDateKey(item.status === "PENDENTE" ? item.dataVencimento || item.dataLancamento : item.dataLancamento);
    return key >= getLocalDateKey(now) && key <= getLocalDateKey(next30DaysEnd);
  });
  const forecastRecurrences30Days = activeRecurrences.flatMap((item) => {
    const firstKey = item.proximaGeracao || item.dataInicio;
    if (!firstKey) return [];
    const interval = Math.max(1, Number(item.intervaloMeses || 1));
    const generated = Number(item.geracoesRealizadas || 0);
    const total = Number(item.totalGeracoes || 0);
    const remaining = total > 0 ? Math.max(0, total - generated) : 12;
    const entries = [];
    let nextKey = firstKey;
    for (let index = 0; index < remaining; index += 1) {
      if (!nextKey || nextKey > getLocalDateKey(next30DaysEnd)) break;
      if (nextKey >= getLocalDateKey(now)) {
        entries.push({
          id: `${item.id || item.descricao}-${nextKey}`,
          descricao: item.descricao,
          tipo: item.tipo,
          valor: Number(item.valor || 0),
          dataPrevista: nextKey,
        });
      }
      nextKey = addMonthsToDateKey(nextKey, interval);
    }
    return entries;
  });
  const forecastRevenue30Days = forecastMovements30Days
    .filter((item) => item.tipo === "RECEITA")
    .reduce((total, item) => total + Number(item.valor || 0), 0)
    + forecastRecurrences30Days
      .filter((item) => item.tipo === "RECEITA")
      .reduce((total, item) => total + Number(item.valor || 0), 0);
  const forecastExpense30Days = forecastMovements30Days
    .filter((item) => item.tipo === "DESPESA")
    .reduce((total, item) => total + Number(item.valor || 0), 0)
    + forecastRecurrences30Days
      .filter((item) => item.tipo === "DESPESA")
      .reduce((total, item) => total + Number(item.valor || 0), 0);
  const forecastBalance30Days = forecastRevenue30Days - forecastExpense30Days;
  const monthlyComparisonRows = [
    {
      Indicador: "Receitas aprovadas",
      "Mês atual": formatCurrency(currentMonthRevenue),
      "Mês anterior": formatCurrency(previousMonthRevenue),
      Diferenca: formatCurrency(currentMonthRevenue - previousMonthRevenue),
    },
    {
      Indicador: "Despesas aprovadas",
      "Mês atual": formatCurrency(currentMonthExpense),
      "Mês anterior": formatCurrency(previousMonthExpense),
      Diferenca: formatCurrency(currentMonthExpense - previousMonthExpense),
    },
    {
      Indicador: "Resultado",
      "Mês atual": formatCurrency(currentMonthResult),
      "Mês anterior": formatCurrency(previousMonthResult),
      Diferenca: formatCurrency(currentMonthResult - previousMonthResult),
    },
    {
      Indicador: "Previsão 30 dias",
      "Mês atual": formatCurrency(forecastBalance30Days),
      "Mês anterior": "-",
      "Diferença": `${formatNumber(forecastMovements30Days.length)} lançamento(s) + ${formatNumber(forecastRecurrences30Days.length)} recorrência(s)`,
    },
  ];

  return {
    currentMonthEnd,
    currentMonthExpense,
    currentMonthResult,
    currentMonthRevenue,
    currentMonthStart,
    forecastBalance30Days,
    forecastExpense30Days,
    forecastMovements30Days,
    forecastRecurrences30Days,
    forecastRevenue30Days,
    monthlyComparisonRows,
    previousMonthEnd,
    previousMonthExpense,
    previousMonthResult,
    previousMonthRevenue,
    previousMonthStart,
    resultVariation,
  };
}

