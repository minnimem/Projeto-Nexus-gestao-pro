import {
  formatCurrency,
  formatNumber,
  formatShortDate,
  getLocalDateKey,
  isDateBeforeToday,
  isDateWithinNextDays,
} from "../../../utils/formatters";

function classifyFinancialAccountPriority(item) {
  const overdue = isDateBeforeToday(item.dataVencimento || item.dataLancamento);
  const dueSoon = isDateWithinNextDays(item.dataVencimento || item.dataLancamento, 3);
  const value = Number(item.valor || 0);
  if (overdue && value >= 1500) {
    return { prioridade: "Crítica", classe: "danger", acao: item.tipo === "RECEITA" ? "Cobrar hoje" : "Pagar/negociar hoje" };
  }
  if (overdue || value >= 3000) {
    return { prioridade: "Alta", classe: "warning", acao: item.tipo === "RECEITA" ? "Priorizar cobrança" : "Priorizar pagamento" };
  }
  if (dueSoon || value >= 800) {
    return { prioridade: "Média", classe: "info", acao: "Acompanhar em até 3 dias" };
  }
  return { prioridade: "Baixa", classe: "success", acao: "Rotina normal" };
}

function sortByDueDate(items) {
  return [...items].sort((a, b) =>
    String(a.dataVencimento || a.dataLancamento || "").localeCompare(String(b.dataVencimento || b.dataLancamento || "")),
  );
}

export function createFinanceAccountsViewModel(branchScopedMovimentacoes) {
  const totalFinanceiroReceitas = branchScopedMovimentacoes
    .filter((item) => item.tipo === "RECEITA" && item.status === "APROVADO")
    .reduce((total, item) => total + Number(item.valor || 0), 0);
  const contasAReceber = branchScopedMovimentacoes.filter((item) => item.tipo === "RECEITA" && item.status === "PENDENTE");
  const contasAPagar = branchScopedMovimentacoes.filter((item) => item.tipo === "DESPESA" && item.status === "PENDENTE");
  const contasAReceberVencidas = contasAReceber.filter((item) => isDateBeforeToday(item.dataVencimento || item.dataLancamento));
  const contasAPagarVencidas = contasAPagar.filter((item) => isDateBeforeToday(item.dataVencimento || item.dataLancamento));
  const contasAReceberAVencer = contasAReceber.filter((item) => isDateWithinNextDays(item.dataVencimento || item.dataLancamento, 7));
  const contasAPagarAVencer = contasAPagar.filter((item) => isDateWithinNextDays(item.dataVencimento || item.dataLancamento, 7));
  const totalAReceber = contasAReceber.reduce((total, item) => total + Number(item.valor || 0), 0);
  const totalAPagar = contasAPagar.reduce((total, item) => total + Number(item.valor || 0), 0);
  const totalAReceberVencido = contasAReceberVencidas.reduce((total, item) => total + Number(item.valor || 0), 0);
  const totalAPagarVencido = contasAPagarVencidas.reduce((total, item) => total + Number(item.valor || 0), 0);
  const totalAReceberAVencer = contasAReceberAVencer.reduce((total, item) => total + Number(item.valor || 0), 0);
  const totalAPagarAVencer = contasAPagarAVencer.reduce((total, item) => total + Number(item.valor || 0), 0);
  const totalContasVencidas = contasAReceberVencidas.length + contasAPagarVencidas.length;
  const totalContasAVencer = contasAReceberAVencer.length + contasAPagarAVencer.length;
  const cashFlowDays = Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + index);
    const dateKey = getLocalDateKey(date);
    const dayMovements = branchScopedMovimentacoes.filter((item) => {
      if (!["APROVADO", "PENDENTE"].includes(String(item.status || ""))) return false;
      const referenceDate = item.status === "PENDENTE"
        ? item.dataVencimento || item.dataLancamento
        : item.dataLancamento;
      return getLocalDateKey(referenceDate) === dateKey;
    });
    const entradas = dayMovements
      .filter((item) => item.tipo === "RECEITA")
      .reduce((total, item) => total + Number(item.valor || 0), 0);
    const saidas = dayMovements
      .filter((item) => item.tipo === "DESPESA")
      .reduce((total, item) => total + Number(item.valor || 0), 0);
    const pendentes = dayMovements
      .filter((item) => item.status === "PENDENTE")
      .reduce((total, item) => total + Number(item.valor || 0), 0);
    return {
      key: dateKey,
      label: formatShortDate(dateKey),
      entradas,
      saidas,
      pendentes,
      saldo: entradas - saidas,
      registros: dayMovements.length,
    };
  });
  const cashFlowRows = cashFlowDays.map((item) => ({
    Data: item.label,
    Entradas: formatCurrency(item.entradas),
    Saidas: formatCurrency(item.saidas),
    Pendentes: formatCurrency(item.pendentes),
    Saldo: formatCurrency(item.saldo),
    Registros: formatNumber(item.registros),
  }));
  const cashFlowTotalEntradas = cashFlowDays.reduce((total, item) => total + item.entradas, 0);
  const cashFlowTotalSaidas = cashFlowDays.reduce((total, item) => total + item.saidas, 0);
  const cashFlowSaldo = cashFlowTotalEntradas - cashFlowTotalSaidas;
  const proximasContasAReceber = sortByDueDate(contasAReceber)
    .slice(0, 4)
    .map((item) => ({ ...item, ...classifyFinancialAccountPriority(item) }));
  const proximasContasAPagar = sortByDueDate(contasAPagar)
    .slice(0, 4)
    .map((item) => ({ ...item, ...classifyFinancialAccountPriority(item) }));

  return {
    cashFlowDays,
    cashFlowRows,
    cashFlowSaldo,
    cashFlowTotalEntradas,
    cashFlowTotalSaidas,
    contasAPagar,
    contasAPagarAVencer,
    contasAPagarVencidas,
    contasAReceber,
    contasAReceberAVencer,
    contasAReceberVencidas,
    proximasContasAPagar,
    proximasContasAReceber,
    totalAPagar,
    totalAPagarAVencer,
    totalAPagarVencido,
    totalAReceber,
    totalAReceberAVencer,
    totalAReceberVencido,
    totalContasAVencer,
    totalContasVencidas,
    totalFinanceiroReceitas,
  };
}

