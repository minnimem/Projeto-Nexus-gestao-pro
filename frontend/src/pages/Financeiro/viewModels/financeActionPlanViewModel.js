import { AlertTriangle, CheckCircle2, CircleDollarSign, CreditCard, ReceiptText } from "lucide-react";
import { formatCurrency, formatNumber } from "../../../utils/formatters";

export function createFinanceActionPlanViewModel({
  caixasComDivergencia,
  caixasComDivergenciaRows,
  canceladosAdministrativamenteRows,
  cashDivergenceRef,
  contasAPagarVencidas,
  contasAReceberVencidas,
  dueFollowUps,
  filteredOrphanCancellationEvents,
  financeiroSemPedido,
  forecastBalance30Days,
  operatingResult,
  orphanHistoryRef,
  orphanOrdersRef,
  orphanlessRevenueRef,
  pedidosSemItens,
  pedidosSemItensRows,
  receitasSemPedidoRows,
  salesWithoutFinanceRef,
  selectedFinanceBranchLabel,
  totalAPagarVencido,
  totalAReceberVencido,
  vendasSemFinanceiro,
  vendasSemFinanceiroRows,
}) {
  const inconsistencyCards = [
    {
      key: "vendas-sem-financeiro",
      icon: ReceiptText,
      title: "Vendas sem financeiro",
      detail: "Pedidos recebidos que ainda não geraram receita aprovada.",
      count: vendasSemFinanceiro.length,
      status: vendasSemFinanceiro.length > 0 ? "Ação necessária" : "Sem ocorrências",
      severity: vendasSemFinanceiro.length > 0 ? "medium" : "neutral",
      rows: vendasSemFinanceiroRows,
      anchor: salesWithoutFinanceRef,
    },
    {
      key: "pedidos-sem-itens",
      icon: AlertTriangle,
      title: "Pedidos sem itens",
      detail: "Pedidos inconsistentes ja separados da conciliação principal.",
      count: pedidosSemItens.length,
      status: pedidosSemItens.length > 0 ? "Ação necessária" : "Sem ocorrências",
      severity: pedidosSemItens.length > 0 ? "high" : "neutral",
      rows: pedidosSemItensRows,
      anchor: orphanOrdersRef,
    },
    {
      key: "pedidos-sem-itens-cancelados",
      icon: CheckCircle2,
      title: "Cancelados administrativamente",
      detail: "Pedidos sem itens que já foram tratados pelo admin.",
      count: filteredOrphanCancellationEvents.length,
      status: filteredOrphanCancellationEvents.length > 0 ? "Histórico disponível" : "Sem histórico",
      severity: filteredOrphanCancellationEvents.length > 0 ? "resolved" : "neutral",
      rows: canceladosAdministrativamenteRows,
      anchor: orphanHistoryRef,
    },
    {
      key: "caixas-com-divergencia",
      icon: CreditCard,
      title: "Caixas com divergencia",
      detail: "Fechamentos onde saldo contado e calculado não bateram.",
      count: caixasComDivergencia.length,
      status: caixasComDivergencia.length > 0 ? "Conferir fechamento" : "Sem ocorrências",
      severity: caixasComDivergencia.length > 0 ? "high" : "neutral",
      rows: caixasComDivergenciaRows,
      anchor: cashDivergenceRef,
    },
    {
      key: "receitas-sem-pedido",
      icon: CircleDollarSign,
      title: "Receitas sem pedido",
      detail: "Lançamentos aprovados sem pedido vinculado.",
      count: financeiroSemPedido.length,
      status: financeiroSemPedido.length > 0 ? "Revisar vínculo" : "Sem ocorrências",
      severity: financeiroSemPedido.length > 0 ? "medium" : "neutral",
      rows: receitasSemPedidoRows,
      anchor: orphanlessRevenueRef,
    },
  ];
  const inconsistencyRows = inconsistencyCards.flatMap((card) => card.rows);
  const criticalInconsistencyCount = inconsistencyCards
    .filter((card) => card.severity === "high")
    .reduce((total, card) => total + Number(card.count || 0), 0);
  const mediumInconsistencyCount = inconsistencyCards
    .filter((card) => card.severity === "medium")
    .reduce((total, card) => total + Number(card.count || 0), 0);
  const financialActionPlan = [
    forecastBalance30Days < 0 && {
      key: "forecast-negative",
      severity: "danger",
      title: "Saldo previsto negativo nos próximos 30 dias",
      detail: `${formatCurrency(Math.abs(forecastBalance30Days))} de falta projetada. Priorize recebimentos e revise saidas.`,
      actionLabel: "Ver fluxo",
      action: "cash-flow",
    },
    totalAReceberVencido > 0 && {
      key: "receivables-overdue",
      severity: "danger",
      title: "Recebiveis vencidos exigem cobrança",
      detail: `${formatCurrency(totalAReceberVencido)} em ${formatNumber(contasAReceberVencidas.length)} titulo(s) vencido(s).`,
      actionLabel: "Abrir cobrança",
      action: "collection",
    },
    criticalInconsistencyCount > 0 && {
      key: "critical-inconsistencies",
      severity: "danger",
      title: "Inconsistencias críticas na conciliação",
      detail: `${formatNumber(criticalInconsistencyCount)} ocorrencia(s) de alto risco podem distorcer caixa/financeiro.`,
      actionLabel: "Ver painel",
      action: "inconsistencies",
    },
    operatingResult < 0 && {
      key: "negative-result",
      severity: "warning",
      title: "Resultado operacional negativo",
      detail: `${formatCurrency(operatingResult)} no DRE gerencial. Revise despesas e custos diretos.`,
      actionLabel: "Ver despesas",
      action: "expenses",
    },
    totalAPagarVencido > 0 && {
      key: "payables-overdue",
      severity: "warning",
      title: "Contas a pagar vencidas",
      detail: `${formatCurrency(totalAPagarVencido)} em ${formatNumber(contasAPagarVencidas.length)} titulo(s) vencido(s).`,
      actionLabel: "Ver pagamentos",
      action: "payables",
    },
    dueFollowUps.length > 0 && {
      key: "followups-due",
      severity: "info",
      title: "Follow-ups de cobrança pendentes",
      detail: `${formatNumber(dueFollowUps.length)} follow-up(s) vencidos ou para hoje.`,
      actionLabel: "Ver agenda",
      action: "collection",
    },
  ].filter(Boolean);
  const financialActionPlanRows = (
    financialActionPlan.length > 0
      ? financialActionPlan
      : [{
          key: "all-clear",
          severity: "success",
          title: "Financeiro sem ação crítica imédiata",
          detail: "DRE, previsão, cobranças e conciliação não indicam bloqueio urgente.",
          actionLabel: "Atualizado",
          action: "",
        }]
  ).map((item) => ({
    Prioridade: item.severity === "danger" ? "Crítica" : item.severity === "warning" ? "Atenção" : item.severity === "info" ? "Informativa" : "Ok",
    Acao: item.title,
    Detalhe: item.detail,
    Filial: selectedFinanceBranchLabel,
  }));

  return {
    criticalInconsistencyCount,
    financialActionPlan,
    financialActionPlanRows,
    inconsistencyCards,
    inconsistencyRows,
    mediumInconsistencyCount,
  };
}
