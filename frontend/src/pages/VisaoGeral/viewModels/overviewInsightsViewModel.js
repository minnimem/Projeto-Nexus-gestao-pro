import {
  asList,
  formatCurrency,
  formatDate,
  formatNumber,
  formatPercent,
  getLocalDateKey,
  isDateBeforeToday,
  isDateWithinNextDays,
} from "../../../utils/formatters.js";
import {
  getStockMinimum,
  getStockProductName,
  getStockQuantity,
} from "../../../utils/stock.js";
import { isCompletedOverviewOrder } from "./overviewPeriodViewModel.js";

export function buildOverviewInsightsViewModel({
  canSeeAdmin,
  canSeeFinance,
  canSeeLogistics,
  clientes,
  dailyReportDate,
  dismissedAutomationAlerts,
  entregadores,
  entregas,
  estoqueBaixo,
  financeiro,
  isCashOperator,
  periodAverageTicket,
  periodCashMovements,
  periodCashRevenue,
  periodCashTicket,
  periodCompletedPedidos,
  periodDays,
  periodPendingOrders,
  periodPedidos,
  periodRevenue,
  pedidos,
  previousRevenue,
  produtos,
  revenueChangeLabel,
  revenueChangePercent,
  rotas,
  todayKey,
  usuarios,
  vendas,
  veiculos,
}) {
  const rotasAtivas = rotas.filter((rota) =>
    ["ABERTA", "EM_ANDAMENTO"].includes(rota.status),
  ).length;
  const financeiroMovimentacoes = asList(financeiro.movimentacoes);
  const contasPendentes = financeiroMovimentacoes.filter((item) => item.status === "PENDENTE");
  const contasVencidas = canSeeFinance
    ?
    contasPendentes.filter((item) => isDateBeforeToday(item.dataVencimento || item.dataLancamento))
    : [];
  const contasAVencer = canSeeFinance
    ?
    contasPendentes.filter((item) => isDateWithinNextDays(item.dataVencimento || item.dataLancamento, 7))
    : [];
  const ticketMedio = Number(vendas.ticketMedio || 0);
  const highSaleLimit = Math.max(ticketMedio * 3, 1000);
  const highValueOrders = periodPedidos
    .filter(isCompletedOverviewOrder)
    .filter((pedido) => Number(pedido.valor || 0) >= highSaleLimit);
  const automationAlerts = [
    estoqueBaixo.length > 0 && {
      id: `stock-low-${getLocalDateKey()}-${estoqueBaixo.length}`,
      title: "Estoque baixo",
      detail: `${formatNumber(estoqueBaixo.length)} produto(s) abaixo do mínimo operacional.`,
      action: "Gerar reposição ou compra",
      tone: "warning",
    },
    contasVencidas.length > 0 && {
      id: `finance-overdue-${getLocalDateKey()}-${contasVencidas.length}`,
      title: "Conta vencida",
      detail: `${formatNumber(contasVencidas.length)} titulo(s) financeiro(s) vencidos.`,
      action: "Priorizar cobrança/baixa",
      tone: "danger",
    },
    contasAVencer.length > 0 && {
      id: `finance-due-${getLocalDateKey()}-${contasAVencer.length}`,
      title: "Conta vencendo",
      detail: `${formatNumber(contasAVencer.length)} título(s) vencem nos próximos 7 dias.`,
      action: "Agendar follow-up",
      tone: "info",
    },
    highValueOrders.length > 0 && {
      id: `high-sale-${getLocalDateKey()}-${highValueOrders.length}`,
      title: "Venda alta",
      detail: `${formatNumber(highValueOrders.length)} venda(s) acima de ${formatCurrency(highSaleLimit)}.`,
      action: "Revisar margem e entrega",
      tone: "success",
    },
  ].filter(Boolean);
  const activeAutomationAlerts = automationAlerts.filter((alert) => !dismissedAutomationAlerts.includes(alert.id));
  const conversionRate = periodPedidos.length > 0 ? (periodCompletedPedidos.length / periodPedidos.length) * 100 : 0;
  const averageDailyRevenue = (isCashOperator ? periodCashRevenue : periodRevenue) / periodDays;
  const projectedRevenue = averageDailyRevenue * 30;
  const stockRiskScore = estoqueBaixo.length === 0 ? 100 : Math.max(0, 100 - estoqueBaixo.length * 12);
  const financeRiskScore = !canSeeFinance ? 80 : Math.max(0, 100 - contasVencidas.length * 22 - contasAVencer.length * 6);
  const logisticsRiskScore = !canSeeLogistics ? 80 : rotasAtivas > 0 || entregas.length === 0 ? 85 : 65;
  const revenueScore = revenueChangePercent >= 15 ? 100 : revenueChangePercent >= 0 ? 88 : revenueChangePercent >= -15 ? 66 : 42;
  const conversionScore = periodPedidos.length === 0 ? 70 : conversionRate >= 80 ? 100 : conversionRate >= 60 ? 82 : conversionRate >= 40 ? 58 : 35;
  const priorityStockItems = estoqueBaixo
    .map((item) => {
      const atual = Number(getStockQuantity(item) || 0);
      const minimo = Number(getStockMinimum(item) || 0);
      return {
        nome: getStockProductName(item),
        atual,
        minimo,
        faltam: Math.max(minimo - atual, 0),
      };
    })
    .sort((a, b) => b.faltam - a.faltam)
    .slice(0, 3);
  const operationalBiScore = Math.round(
    revenueScore * 0.25
    + conversionScore * 0.2
    + stockRiskScore * 0.18
    + financeRiskScore * 0.22
    + logisticsRiskScore * 0.15,
  );
  const operationalBiStatus = operationalBiScore >= 85 ?
    "Saudável"
    : operationalBiScore >= 70 ?
      "Atenção leve"
      : operationalBiScore >= 50 ?
        "Pressionado"
        : "Crítico";
  const operationalBiTone = operationalBiScore >= 85 ?
    "success"
    : operationalBiScore >= 70 ?
      "info"
      : operationalBiScore >= 50 ?
        "warning"
        : "danger";
  const operationalBiRows = [
    {
      area: "Comercial",
      status: revenueChangePercent >= 0 ? "Crescimento" : "Queda",
      score: revenueScore,
      metric: `${formatCurrency(periodRevenue)} no período`,
      insight: revenueChangeLabel,
      action: revenueChangePercent < 0 ? "Revisar funil, ofertas paradas e clientes sem recompra." : "Proteger margem e preparar estoque para demanda.",
    },
    {
      area: "Vendas",
      status: conversionRate >= 60 || periodPedidos.length === 0 ? "Estavel" : "Conversão baixa",
      score: conversionScore,
      metric: `${formatPercent(conversionRate)}%`,
      insight: `${formatNumber(periodCompletedPedidos.length)} concluido(s) de ${formatNumber(periodPedidos.length)} pedido(s).`,
      action: conversionRate < 60 && periodPedidos.length > 0 ? "Atacar pendentes, separação e follow-up hoje." : "Usar como base de meta do próximo período.",
    },
    {
      area: "Estoque",
      status: estoqueBaixo.length > 0 ? "Reposicao" : "Equilibrado",
      score: stockRiskScore,
      metric: `${formatNumber(estoqueBaixo.length)} baixo(s)`,
      insight: priorityStockItems.length > 0 ? priorityStockItems.map((item) => item.nome).join(" | ") : "Sem ruptura crítica detectada.",
      action: estoqueBaixo.length > 0 ? "Gerar compra, transferencia ou ajuste de mínimo." : "Manter revisão semanal de mínimo e giro.",
    },
    {
      area: "Financeiro",
      status: !canSeeFinance ? "Restrito" : contasVencidas.length > 0 ? "Cobrar" : "Controlado",
      score: financeRiskScore,
      metric: canSeeFinance ? `${formatNumber(contasVencidas.length)} vencida(s)` : "Sem permissão",
      insight: canSeeFinance ? `${formatNumber(contasAVencer.length)} titulo(s) vencem em até 7 dias.` : "Módulo financeiro restrito para este perfil.",
      action: canSeeFinance && contasVencidas.length > 0 ? "Priorizar cobrança e baixa antes de novas compras." : "Manter agenda preventiva de vencimentos.",
    },
    {
      area: "Logística",
      status: !canSeeLogistics ? "Restrito" : rotasAtivas > 0 ? "Em rota" : "Sem rota ativa",
      score: logisticsRiskScore,
      metric: canSeeLogistics ? `${formatNumber(entregas.length)} entrega(s)` : "Sem permissão",
      insight: canSeeLogistics ? `${formatNumber(rotasAtivas)} rota(s), ${formatNumber(veiculos.length)} veiculo(s), ${formatNumber(entregadores.length)} entregador(es).` : "Módulo logistico restrito para este perfil.",
      action: canSeeLogistics && entregas.length > 0 && rotasAtivas === 0 ? "Criar rota antes de prometer prazo ao cliente." : "Monitorar fechamento e comprovante das entregas.",
    },
  ];
  const operationalBiExportRows = operationalBiRows.map((item) => ({
    Area: item.area,
    Status: item.status,
    Score: `${item.score}/100`,
    Metrica: item.metric,
    Leitura: item.insight,
    Acao: item.action,
  }));
  const aiRecommendations = [
    {
      area: "Previsão de demanda",
      title: projectedRevenue > 0 ? "Receita projetada para 30 dias" : "Demanda insuficiente para projetar",
      metric: projectedRevenue > 0 ? formatCurrency(projectedRevenue) : "Sem base",
      detail: projectedRevenue > 0 ?
        `Base: media diaria de ${formatCurrency(averageDailyRevenue)} no período.`
        : "Registre vendas/caixa no período para liberar previsão.",
      action: projectedRevenue > previousRevenue && previousRevenue > 0 ?
        "Preparar estoque e equipe para alta de demanda."
        : "Acompanhar conversão e ticket antes de ampliar compra.",
      tone: projectedRevenue > 0 ? "success" : "warning",
    },
    {
      area: "Reposição inteligente",
      title: priorityStockItems.length > 0 ? "Comprar itens com maior ruptura" : "Estoque sem ruptura crítica",
      metric: priorityStockItems.length > 0 ? `${formatNumber(priorityStockItems.length)} prioridade(s)` : "Ok",
      detail: priorityStockItems.length > 0
        ?
        priorityStockItems.map((item) => `${item.nome}: faltam ${formatNumber(item.faltam)}`).join(" | ")
        : "Produtos carregados não indicam estoque abaixo do mínimo.",
      action: priorityStockItems.length > 0 ? "Gerar pedido de compra ou transferencia." : "Manter monitoramento por mínimo.",
      tone: priorityStockItems.length > 0 ? "warning" : "success",
    },
    canSeeFinance && {
      area: "Inadimplência",
      title: contasVencidas.length > 0 ? "Cobrança deve ser prioridade" : "Carteira sem vencidos críticos",
      metric: formatNumber(contasVencidas.length),
      detail: contasVencidas.length > 0 ?
        `${formatNumber(contasVencidas.length)} titulo(s) vencido(s) e ${formatNumber(contasAVencer.length)} a vencer.`
        : `${formatNumber(contasAVencer.length)} título(s) a vencer nos próximos 7 dias.`,
      action: contasVencidas.length > 0 ? "Executar lista de cobrança hoje." : "Agendar lembretes preventivos.",
      tone: contasVencidas.length > 0 ? "danger" : "info",
    },
    {
      area: "Melhoria operacional",
      title: conversionRate < 60 && periodPedidos.length > 0 ? "Conversão abaixo do ideal" : "Fluxo comercial estavel",
      metric: `${formatPercent(conversionRate)}%`,
      detail: `${formatNumber(periodCompletedPedidos.length)} concluido(s) de ${formatNumber(periodPedidos.length)} pedido(s).`,
      action: conversionRate < 60 && periodPedidos.length > 0 ?
        "Revisar pendências, separação e follow-up comercial."
        : "Usar este período como referência de meta.",
      tone: conversionRate < 60 && periodPedidos.length > 0 ? "warning" : "success",
    },
    canSeeLogistics && {
      area: "Logística",
      title: rotasAtivas > 0 ? "Rotas ativas em acompanhamento" : "Sem rota ativa",
      metric: formatNumber(rotasAtivas),
      detail: `${formatNumber(entregas.length)} entrega(s), ${formatNumber(veiculos.length)} veiculo(s), ${formatNumber(entregadores.length)} entregador(es).`,
      action: rotasAtivas > 0 ? "Monitorar atrasos e fechamento de romaneio." : "Criar rota antes de prometer entrega.",
      tone: rotasAtivas > 0 ? "info" : "warning",
    },
  ].filter(Boolean);
  const aiRecommendationRows = aiRecommendations.map((item) => ({
    Area: item.area,
    "Recomendação": item.title,
    Metrica: item.metric,
    Detalhe: item.detail,
    Acao: item.action,
  }));
  const executiveSnapshot = [
    {
      label: isCashOperator ? "Caixa / dia" : "Receita / dia",
      value: formatCurrency((isCashOperator ? periodCashRevenue : periodRevenue) / periodDays),
      detail: `${formatNumber(periodDays)} dia(s) no período`,
    },
    {
      label: "Ticket período",
      value: formatCurrency(isCashOperator ? periodCashTicket : periodAverageTicket),
      detail: isCashOperator
        ?
        `${formatNumber(periodCashMovements)} movimento(s) de caixa`
        : `${formatNumber(periodCompletedPedidos.length)} venda(s) concluídas`,
    },
    {
      label: "Conversao",
      value: `${formatNumber(periodPedidos.length > 0 ? (periodCompletedPedidos.length / periodPedidos.length) * 100 : 0)}%`,
      detail: `${formatNumber(periodPendingOrders.length)} pendente(s)`,
    },
    {
      label: "Alertas",
      value: formatNumber(activeAutomationAlerts.length),
      detail: activeAutomationAlerts.map((alert) => alert.title).join(" | ") || "Sem alertas ativos",
    },
  ];
  const dailyReportRows = [
    {
      Indicador: "Data",
      Valor: formatDate(todayKey),
      Detalhe: dailyReportDate === todayKey ? "Relatório diário gerado automaticamente" : "Aguardando geração automática",
    },
    {
      Indicador: "Vendas hoje",
      Valor: formatCurrency(vendas.vendasHoje),
      Detalhe: `${formatNumber(vendas.totalVendas)} venda(s) no painel`,
    },
    {
      Indicador: "Ticket médio",
      Valor: formatCurrency(vendas.ticketMedio),
      Detalhe: `${formatNumber(vendas.pedidosPendentes)} pedido(s) pendente(s)`,
    },
    {
      Indicador: "Estoque baixo",
      Valor: formatNumber(estoqueBaixo.length),
      Detalhe: "Produtos abaixo do mínimo",
    },
    {
      Indicador: "Contas críticas",
      Valor: canSeeFinance ? formatNumber(contasVencidas.length + contasAVencer.length) : "Restrito",
      Detalhe: canSeeFinance ?
        `${formatNumber(contasVencidas.length)} vencida(s) / ${formatNumber(contasAVencer.length)} a vencer`
        : "Sem permissão financeira",
    },
    {
      Indicador: "Logística",
      Valor: formatNumber(entregas.length),
      Detalhe: `${formatNumber(rotasAtivas)} rota(s) ativa(s)`,
    },
    {
      Indicador: "Alertas ativos",
      Valor: formatNumber(activeAutomationAlerts.length),
      Detalhe: activeAutomationAlerts.map((alert) => alert.title).join(" | ") || "Sem alertas ativos",
    },
  ];

  const actions = [
    produtos.length === 0 && "Cadastre produtos para liberar vendas no PDV.",
    clientes.length === 0 && "Cadastre clientes para operar pedidos completos.",
    canSeeFinance && Number(financeiro.lancamentos || 0) === 0 && "Registre receitas/despesas para ativar o painel financeiro.",
    canSeeLogistics && rotas.length === 0 && "Crie rotas para demonstrar a operação logística.",
    canSeeAdmin && usuarios.length <= 1 && "Crie usuários operacionais para demonstrar permissão por perfil.",
  ].filter(Boolean);
  return {
    actions,
    activeAutomationAlerts,
    aiRecommendationRows,
    aiRecommendations,
    averageDailyRevenue,
    contasAVencer,
    contasVencidas,
    conversionRate,
    dailyReportRows,
    executiveSnapshot,
    operationalBiExportRows,
    operationalBiRows,
    operationalBiScore,
    operationalBiStatus,
    operationalBiTone,
    projectedRevenue,
    rotasAtivas,
  };
}
