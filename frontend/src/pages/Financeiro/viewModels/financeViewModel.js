import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  isDateBeforeToday,
  isDateWithinNextDays,
} from "../../../utils/formatters";

export function createFinanceMovementViewModel({
  filiais,
  financeBranchFilter,
  financeCategories,
  financeCategoryFilter,
  financeFilter,
  financePage,
  followUps,
  movimentacoes,
  recorrencias,
}) {
  const matchesFinanceBranch = (item) => {
    if (financeBranchFilter === "TODAS") return true;
    if (financeBranchFilter === "EMPRESA") return !item.filialId;
    return String(item.filialId || "") === financeBranchFilter;
  };
  const branchScopedMovimentacoes = movimentacoes.filter(matchesFinanceBranch);
  const branchScopedRecorrencias = recorrencias.filter(matchesFinanceBranch);
  const branchScopedFollowUps = followUps.filter(matchesFinanceBranch);
  const selectedFinanceBranchLabel = financeBranchFilter === "TODAS" ?
    "Todas as filiais"
    : financeBranchFilter === "EMPRESA" ?
      "Empresa / sem filial"
      : filiais.find((filial) => String(filial.id) === financeBranchFilter).nome || "Filial";
  const financeBaseMovimentacoes = branchScopedMovimentacoes.filter((item) => {
    if (financeFilter === "PENDENTES") return item.status === "PENDENTE";
    if (financeFilter === "VENCIDAS") return item.status === "PENDENTE" && isDateBeforeToday(item.dataVencimento || item.dataLancamento);
    if (financeFilter === "A_RECEBER_VENCER") return item.tipo === "RECEITA" && item.status === "PENDENTE" && isDateWithinNextDays(item.dataVencimento || item.dataLancamento, 7);
    if (financeFilter === "A_PAGAR_VENCER") return item.tipo === "DESPESA" && item.status === "PENDENTE" && isDateWithinNextDays(item.dataVencimento || item.dataLancamento, 7);
    if (financeFilter === "RECEITAS") return item.tipo === "RECEITA";
    if (financeFilter === "DESPESAS") return item.tipo === "DESPESA";
    if (financeFilter === "APROVADAS") return item.status === "APROVADO";
    return true;
  });
  const filteredMovimentacoes = financeBaseMovimentacoes.filter((item) =>
    financeCategoryFilter ? (item.categoria || "Sem categoria") === financeCategoryFilter : true,
  );
  const financeFilterOptions = [
    { value: "TODOS", label: "Todos", count: branchScopedMovimentacoes.length },
    { value: "PENDENTES", label: "Pendentes", count: branchScopedMovimentacoes.filter((item) => item.status === "PENDENTE").length },
    {
      value: "VENCIDAS",
      label: "Vencidas",
      count: branchScopedMovimentacoes.filter((item) => item.status === "PENDENTE" && isDateBeforeToday(item.dataVencimento || item.dataLancamento)).length,
    },
    {
      value: "A_RECEBER_VENCER",
      label: "Receber 7d",
      count: branchScopedMovimentacoes.filter((item) => item.tipo === "RECEITA" && item.status === "PENDENTE" && isDateWithinNextDays(item.dataVencimento || item.dataLancamento, 7)).length,
    },
    {
      value: "A_PAGAR_VENCER",
      label: "Pagar 7d",
      count: branchScopedMovimentacoes.filter((item) => item.tipo === "DESPESA" && item.status === "PENDENTE" && isDateWithinNextDays(item.dataVencimento || item.dataLancamento, 7)).length,
    },
    { value: "RECEITAS", label: "Receitas", count: branchScopedMovimentacoes.filter((item) => item.tipo === "RECEITA").length },
    { value: "DESPESAS", label: "Despesas", count: branchScopedMovimentacoes.filter((item) => item.tipo === "DESPESA").length },
    { value: "APROVADAS", label: "Aprovadas", count: branchScopedMovimentacoes.filter((item) => item.status === "APROVADO").length },
  ];
  const financePageSize = 10;
  const financeTotalPages = Math.max(Math.ceil(filteredMovimentacoes.length / financePageSize), 1);
  const currentFinancePage = Math.min(financePage, financeTotalPages - 1);
  const pagedMovimentacoes = filteredMovimentacoes.slice(
    currentFinancePage * financePageSize,
    currentFinancePage * financePageSize + financePageSize,
  );
  const financeFilterLabel = financeFilterOptions.find((option) => option.value === financeFilter).label || "Todos";
  const financeMovementRows = filteredMovimentacoes.map((item) => ({
    Data: formatDateTime(item.dataLancamento),
    Vencimento: item.dataVencimento ? formatDate(item.dataVencimento) : "-",
    "Descrição": item.descricao || "Lançamento sem descrição",
    Tipo: item.tipo || "-",
    Status: item.status || "-",
    Pagamento: item.metodoPagamentoDescricao || item.metodoPagamento || "-",
    Categoria: item.categoria || "-",
    Filial: item.filial || "Empresa",
    Cobranca: item.codigoCobranca || "-",
    Pix: item.pixCopiaCola || "-",
    Boleto: item.boletoLinhaDigitavel || "-",
    Valor: formatCurrency(item.valor),
    "Observação": item.observacao || "-",
  }));
  const recurringFinanceRows = branchScopedRecorrencias.map((item) => ({
    Regra: item.descricao || "-",
    Filial: item.filial || "Empresa / sem filial",
    Tipo: item.tipo || "-",
    Categoria: item.categoria || "-",
    Valor: formatCurrency(item.valor),
    "Próxima geração": item.proximaGeracao ? formatDate(item.proximaGeracao) : "-",
    Intervalo: `${formatNumber(item.intervaloMeses || 1)} mes(es)`,
    Geradas: item.totalGeracoes
      ? `${formatNumber(item.geracoesRealizadas || 0)}/${formatNumber(item.totalGeracoes)}`
      : formatNumber(item.geracoesRealizadas || 0),
    Status: item.ativo ? "Ativa" : "Pausada",
  }));
  const activeRecurrences = branchScopedRecorrencias.filter((item) => item.ativo !== false);
  const nextRecurrences = [...activeRecurrences]
    .sort((a, b) => String(a.proximaGeracao || "").localeCompare(String(b.proximaGeracao || "")))
    .slice(0, 4);
  const financeCategorySummary = Array.from(
    financeBaseMovimentacoes.reduce((map, item) => {
      const key = item.categoria || "Sem categoria";
      const current = map.get(key) || { categoria: key, receitas: 0, despesas: 0, pendentes: 0, total: 0, registros: 0 };
      const valor = Number(item.valor || 0);
      const isDespesa = item.tipo === "DESPESA";
      current.receitas += item.tipo === "RECEITA" ? valor : 0;
      current.despesas += isDespesa ? valor : 0;
      current.pendentes += item.status === "PENDENTE" ? valor : 0;
      current.total += isDespesa ? -valor : valor;
      current.registros += 1;
      map.set(key, current);
      return map;
    }, new Map()).values(),
  ).sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
  const financeCategoryRows = financeCategorySummary.map((item) => ({
    Categoria: item.categoria,
    Receitas: formatCurrency(item.receitas),
    Despesas: formatCurrency(item.despesas),
    Pendentes: formatCurrency(item.pendentes),
    Saldo: formatCurrency(item.total),
    Registros: formatNumber(item.registros),
  }));
  const financeBranchSummary = Array.from(
    branchScopedMovimentacoes.reduce((map, item) => {
      const key = item.filialId || "EMPRESA";
      const current = map.get(key) || {
        id: key,
        filial: item.filial || "Empresa",
        receitas: 0,
        despesas: 0,
        pendentes: 0,
        aprovadas: 0,
        registros: 0,
      };
      const valor = Number(item.valor || 0);
      current.receitas += item.tipo === "RECEITA" && item.status === "APROVADO" ? valor : 0;
      current.despesas += item.tipo === "DESPESA" && item.status === "APROVADO" ? valor : 0;
      current.pendentes += item.status === "PENDENTE" ? valor : 0;
      current.aprovadas += item.status === "APROVADO" ? 1 : 0;
      current.registros += 1;
      map.set(key, current);
      return map;
    }, new Map()).values(),
  ).sort((a, b) => (b.receitas - b.despesas) - (a.receitas - a.despesas));
  const financeBranchRows = financeBranchSummary.map((item) => ({
    Filial: item.filial,
    Receitas: formatCurrency(item.receitas),
    Despesas: formatCurrency(item.despesas),
    Lucro: formatCurrency(item.receitas - item.despesas),
    Pendentes: formatCurrency(item.pendentes),
    Aprovadas: formatNumber(item.aprovadas),
    Registros: formatNumber(item.registros),
  }));
  const financeCategoryOptions = Array.from(new Set([
    ...financeCategories.map((categoria) => categoria.nome).filter(Boolean),
    "Venda",
    "Compra de estoque",
    "Taxas",
    "Serviços",
    "Administrativo",
    ...financeCategorySummary.map((item) => item.categoria).filter((categoria) => categoria !== "Sem categoria"),
  ])).sort((a, b) => a.localeCompare(b));

  return {
    activeRecurrences,
    branchScopedFollowUps,
    branchScopedMovimentacoes,
    branchScopedRecorrencias,
    currentFinancePage,
    financeBaseMovimentacoes,
    financeBranchRows,
    financeBranchSummary,
    financeCategoryOptions,
    financeCategoryRows,
    financeCategorySummary,
    financeFilterLabel,
    financeFilterOptions,
    financeMovementRows,
    financePageSize,
    financeTotalPages,
    filteredMovimentacoes,
    nextRecurrences,
    pagedMovimentacoes,
    recurringFinanceRows,
    selectedFinanceBranchLabel,
  };
}

