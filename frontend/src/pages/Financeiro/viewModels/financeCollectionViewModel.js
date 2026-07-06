import { getAgingBucket } from "../../../utils/finance";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  getDaysOverdue,
  getLocalDateKey,
  isDateBeforeToday,
  isDateWithinNextDays,
} from "../../../utils/formatters";

function classifyCollectionRisk(item) {
  if (item.maiorAtraso >= 60 || item.total >= 5000) {
    return { risco: "Crítico", classe: "danger", acao: "Contato imediato e negociação formal", score: 3 };
  }
  if (item.maiorAtraso >= 30 || item.total >= 1500 || item.titulos >= 3) {
    return { risco: "Alto", classe: "warning", acao: "Priorizar cobrança hoje", score: 2 };
  }
  if (item.maiorAtraso >= 8 || item.total >= 500) {
    return { risco: "Médio", classe: "info", acao: "Agendar follow-up em até 24h", score: 1 };
  }
  return { risco: "Baixo", classe: "success", acao: "Acompanhar rotina de cobrança", score: 0 };
}

export function createFinanceCollectionViewModel({
  branchScopedFollowUps,
  contasAReceberVencidas,
  pedidosPorId,
}) {
  const contasAReceberVencidasDetalhadas = contasAReceberVencidas
    .map((item) => {
      const pedido = item.pedidoId ? pedidosPorId.get(String(item.pedidoId)) : null;
      const vencimento = item.dataVencimento || item.dataLancamento;
      const diasAtraso = getDaysOverdue(vencimento);
      return {
        ...item,
        cliente: pedido.cliente || "Cliente não identificado",
        clienteId: pedido.clienteId || null,
        pedidoNumero: pedido.numero || pedido.id || item.pedidoId || "-",
        vencimento,
        diasAtraso,
        faixa: getAgingBucket(diasAtraso),
      };
    })
    .sort((a, b) => b.diasAtraso - a.diasAtraso || Number(b.valor || 0) - Number(a.valor || 0));
  const agingBuckets = ["1-7 dias", "8-30 dias", "31-60 dias", "60+ dias"].map((faixa) => {
    const items = contasAReceberVencidasDetalhadas.filter((item) => item.faixa === faixa);
    return {
      faixa,
      quantidade: items.length,
      valor: items.reduce((total, item) => total + Number(item.valor || 0), 0),
    };
  });
  const maiorAtrasoDias = contasAReceberVencidasDetalhadas.reduce((maior, item) => Math.max(maior, item.diasAtraso), 0);
  const inadimplenciaRows = contasAReceberVencidasDetalhadas.map((item) => ({
    Cliente: item.cliente,
    Filial: item.filial || "Empresa / sem filial",
    "Lançamento": item.descricao || item.id || "Receita vencida",
    Pedido: item.pedidoNumero,
    Vencimento: formatDate(item.vencimento),
    "Dias em atraso": formatNumber(item.diasAtraso),
    Faixa: item.faixa,
    Categoria: item.categoria || "-",
    Pagamento: item.metodoPagamentoDescricao || item.metodoPagamento || "-",
    Valor: formatCurrency(item.valor),
    Observacao: item.observacao || "-",
  }));
  const cobrancaPorCliente = Array.from(
    contasAReceberVencidasDetalhadas.reduce((map, item) => {
      const key = item.clienteId || item.cliente;
      const current = map.get(key) || {
        cliente: item.cliente,
        filiais: new Set(),
        titulos: 0,
        total: 0,
        maiorAtraso: 0,
        ultimoVencimento: item.vencimento,
        observacoes: [],
        titulosDetalhados: [],
      };
      current.titulos += 1;
      current.total += Number(item.valor || 0);
      current.filiais.add(item.filial || "Empresa / sem filial");
      current.maiorAtraso = Math.max(current.maiorAtraso, item.diasAtraso);
      current.titulosDetalhados.push(item);
      if (String(item.vencimento || "") > String(current.ultimoVencimento || "")) {
        current.ultimoVencimento = item.vencimento;
      }
      if (item.observacao) current.observacoes.push(item.observacao);
      map.set(key, current);
      return map;
    }, new Map()).values(),
  )
    .map((item) => ({ ...item, ...classifyCollectionRisk(item) }))
    .sort((a, b) => b.score - a.score || b.maiorAtraso - a.maiorAtraso || b.total - a.total);
  const collectionRiskSummary = ["Crítico", "Alto", "Médio", "Baixo"].map((risco) => {
    const items = cobrancaPorCliente.filter((item) => item.risco === risco);
    return {
      risco,
      quantidade: items.length,
      total: items.reduce((sum, item) => sum + Number(item.total || 0), 0),
      classe: items[0].classe || (risco === "Crítico" ? "danger" : risco === "Alto" ? "warning" : risco === "Médio" ? "info" : "success"),
    };
  });
  const cobrancaRows = cobrancaPorCliente.map((item) => ({
    Cliente: item.cliente,
    Risco: item.risco,
    "Ação sugerida": item.acao,
    Filiais: Array.from(item.filiais).join(" | ") || "Empresa / sem filial",
    Títulos: formatNumber(item.titulos),
    "Total vencido": formatCurrency(item.total),
    "Maior atraso": `${formatNumber(item.maiorAtraso)} dia(s)`,
    "Último vencimento": formatDate(item.ultimoVencimento),
    "Histórico/observações": item.observacoes.slice(-3).join(" | ") || "Sem contato registrado",
  }));
  const followUpRows = branchScopedFollowUps.map((item) => ({
    Cliente: item.clienteNome || "Cliente não identificado",
    "Lançamento": item.financeiroDescricao || item.financeiroId || "-",
    Valor: formatCurrency(item.valor),
    Vencimento: item.vencimento ? formatDate(item.vencimento) : "-",
    Canal: item.canal || "-",
    "Próxima ação": item.proximaAcao ? formatDate(item.proximaAcao) : "-",
    Status: item.status || "-",
    "Notificação externa": item.notificacaoExternaEm ? formatDateTime(item.notificacaoExternaEm) : "-",
    Usuario: item.usuarioNome || "-",
    Filial: item.filial || "Empresa",
    Observacao: item.observacao || "-",
  }));
  const pendingFollowUps = branchScopedFollowUps.filter((item) => item.status === "PENDENTE");
  const dueFollowUps = pendingFollowUps.filter((item) =>
    isDateBeforeToday(item.proximaAcao) || getLocalDateKey(item.proximaAcao) === getLocalDateKey(),
  );
  const upcomingFollowUps = pendingFollowUps.filter((item) =>
    !dueFollowUps.some((due) => String(due.id) === String(item.id)) && isDateWithinNextDays(item.proximaAcao, 7),
  );
  const reminderFollowUps = [...dueFollowUps].sort((a, b) =>
    String(a.proximaAcao || "").localeCompare(String(b.proximaAcao || "")),
  );

  return {
    agingBuckets,
    cobrancaPorCliente,
    cobrancaRows,
    collectionRiskSummary,
    contasAReceberVencidasDetalhadas,
    dueFollowUps,
    followUpRows,
    inadimplenciaRows,
    maiorAtrasoDias,
    pendingFollowUps,
    reminderFollowUps,
    upcomingFollowUps,
  };
}



