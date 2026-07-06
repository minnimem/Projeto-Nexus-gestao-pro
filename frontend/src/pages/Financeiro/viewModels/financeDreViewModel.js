import { formatCurrency, formatNumber, formatPercent } from "../../../utils/formatters";

const completedSaleStatuses = new Set(["FINALIZADA", "RECEBIDO", "ENTREGUE", "CONCLUIDO"]);
const taxTerms = ["taxa", "imposto", "tribut", "tarifa", "comissao", "gateway", "cartao"];
const directCostTerms = ["compra", "estoque", "mercadoria", "produto", "fornecedor", "custo"];

function isCategoryLike(item, terms) {
  const text = `${item.categoria || ""} ${item.descricao || ""} ${item.observacao || ""}`.toLowerCase();
  return terms.some((term) => text.includes(term));
}

export function createFinanceDreViewModel({
  branchScopedMovimentacoes,
  caixas,
  pedidos,
  selectedFinanceBranchLabel,
}) {
  const vendasRecebidas = pedidos.filter((pedido) => completedSaleStatuses.has(String(pedido.status || "")));
  const totalVendasRecebidas = vendasRecebidas.reduce((total, pedido) => total + Number(pedido.valor || 0), 0);
  const totalCaixaVendas = caixas.reduce((total, caixa) => total + Number(caixa.totalVendas || 0), 0);
  const receitaAprovadaFiltrada = branchScopedMovimentacoes
    .filter((item) => item.tipo === "RECEITA" && item.status === "APROVADO")
    .reduce((total, item) => total + Number(item.valor || 0), 0);
  const despesaAprovadaFiltrada = branchScopedMovimentacoes
    .filter((item) => item.tipo === "DESPESA" && item.status === "APROVADO")
    .reduce((total, item) => total + Number(item.valor || 0), 0);
  const lucroFiltrado = receitaAprovadaFiltrada - despesaAprovadaFiltrada;
  const approvedFinanceMovements = branchScopedMovimentacoes.filter((item) => item.status === "APROVADO");
  const grossRevenue = approvedFinanceMovements
    .filter((item) => item.tipo === "RECEITA")
    .reduce((total, item) => total + Number(item.valor || 0), 0);
  const taxAndFeeExpenses = approvedFinanceMovements
    .filter((item) => item.tipo === "DESPESA" && isCategoryLike(item, taxTerms))
    .reduce((total, item) => total + Number(item.valor || 0), 0);
  const costOfGoodsSold = approvedFinanceMovements
    .filter((item) => item.tipo === "DESPESA" && isCategoryLike(item, directCostTerms))
    .reduce((total, item) => total + Number(item.valor || 0), 0);
  const operationalExpenses = approvedFinanceMovements
    .filter((item) => item.tipo === "DESPESA" && !isCategoryLike(item, [...taxTerms, ...directCostTerms]))
    .reduce((total, item) => total + Number(item.valor || 0), 0);
  const unclassifiedFinanceMovements = approvedFinanceMovements.filter((item) => !String(item.categoria || "").trim());
  const taxAndFeeMovements = approvedFinanceMovements.filter((item) =>
    item.tipo === "DESPESA" && isCategoryLike(item, taxTerms),
  );
  const directCostMovements = approvedFinanceMovements.filter((item) =>
    item.tipo === "DESPESA" && isCategoryLike(item, directCostTerms),
  );
  const netRevenue = grossRevenue - taxAndFeeExpenses;
  const grossProfit = netRevenue - costOfGoodsSold;
  const operatingResult = grossProfit - operationalExpenses;
  const grossMargin = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;
  const operatingMargin = netRevenue > 0 ? (operatingResult / netRevenue) * 100 : 0;
  const dreReadinessScore = Math.max(
    0,
    100
      - unclassifiedFinanceMovements.length * 12
      - (grossRevenue > 0 && taxAndFeeMovements.length === 0 ? 10 : 0)
      - (grossRevenue > 0 && directCostMovements.length === 0 ? 10 : 0),
  );
  const dreReadinessRows = [
    {
      criterio: "Lançamentos aprovados sem categoria",
      valor: formatNumber(unclassifiedFinanceMovements.length),
      status: unclassifiedFinanceMovements.length === 0 ? "Ok" : "Revisar",
      detalhe: unclassifiedFinanceMovements.length === 0 ?
        "Categorias suficientes para leitura gerencial."
        : "Classifique receitas/despesas antes de usar como DRE contábil.",
    },
    {
      criterio: "Deducoes/taxas identificadas",
      valor: formatCurrency(taxAndFeeExpenses),
      status: taxAndFeeMovements.length > 0 || grossRevenue === 0 ? "Ok" : "Validar",
      detalhe: taxAndFeeMovements.length > 0 ?
        `${formatNumber(taxAndFeeMovements.length)} lançamento(s) de taxa/imposto.`
        : "Sem taxa/imposto identificado no período.",
    },
    {
      criterio: "Custos diretos identificados",
      valor: formatCurrency(costOfGoodsSold),
      status: directCostMovements.length > 0 || grossRevenue === 0 ? "Ok" : "Validar",
      detalhe: directCostMovements.length > 0 ?
        `${formatNumber(directCostMovements.length)} lançamento(s) de compra/custo.`
        : "Sem compra/custo direto identificado no período.",
    },
    {
      criterio: "Leitura do DRE",
      valor: `${formatNumber(dreReadinessScore)}%`,
      status: dreReadinessScore >= 90 ? "Confiavel" : dreReadinessScore >= 70 ? "Gerencial" : "Baixa",
      detalhe: "Indicador interno de classificação, não substitui validação contábil/tributária.",
    },
  ];
  const dreRows = [
    { indicador: "Receita bruta", valor: grossRevenue, detalhe: "Receitas aprovadas no período carregado", tone: "positive" },
    {
      indicador: "(-) Deducoes, taxas e impostos",
      valor: -taxAndFeeExpenses,
      detalhe: "Taxas, tarifas, impostos, comissoes e custos de pagamento",
      tone: taxAndFeeExpenses > 0 ? "negative" : "neutral",
    },
    { indicador: "Receita liquida", valor: netRevenue, detalhe: "Receita bruta menos deducoes diretas", tone: netRevenue >= 0 ? "positive" : "negative" },
    {
      indicador: "(-) Custo de mercadorias/estoque",
      valor: -costOfGoodsSold,
      detalhe: "Compras, estoque, fornecedores e custos de produto",
      tone: costOfGoodsSold > 0 ? "negative" : "neutral",
    },
    { indicador: "Lucro bruto", valor: grossProfit, detalhe: `Margem bruta ${formatPercent(grossMargin)}%`, tone: grossProfit >= 0 ? "positive" : "negative" },
    {
      indicador: "(-) Despesas operacionais",
      valor: -operationalExpenses,
      detalhe: "Despesas aprovadas não classificadas como custo direto ou taxa",
      tone: operationalExpenses > 0 ? "negative" : "neutral",
    },
    { indicador: "Resultado operacional", valor: operatingResult, detalhe: `Margem operacional ${formatPercent(operatingMargin)}%`, tone: operatingResult >= 0 ? "positive" : "negative" },
  ];
  const dreExportRows = dreRows.map((row) => ({
    Indicador: row.indicador,
    Valor: formatCurrency(row.valor),
    Detalhe: row.detalhe,
    Filial: selectedFinanceBranchLabel,
  }));
  const dreReadinessExportRows = dreReadinessRows.map((row) => ({
    Criterio: row.criterio,
    Valor: row.valor,
    Status: row.status,
    Detalhe: row.detalhe,
    Filial: selectedFinanceBranchLabel,
  }));

  return {
    costOfGoodsSold,
    directCostMovements,
    despesaAprovadaFiltrada,
    dreExportRows,
    dreReadinessExportRows,
    dreReadinessRows,
    dreReadinessScore,
    dreRows,
    grossMargin,
    grossProfit,
    grossRevenue,
    lucroFiltrado,
    netRevenue,
    operatingMargin,
    operatingResult,
    operationalExpenses,
    receitaAprovadaFiltrada,
    taxAndFeeExpenses,
    taxAndFeeMovements,
    totalCaixaVendas,
    totalVendasRecebidas,
    unclassifiedFinanceMovements,
    vendasRecebidas,
  };
}
