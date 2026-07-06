import { addMonthsToDateKey, getLocalDateKey } from "../../../utils/formatters.js";

export function getFinanceLaunchMode(form) {
  return {
    installmentCount: Math.max(1, Number(form.parcelas || 1)),
    intervalMonths: Math.max(1, Number(form.intervaloMeses || 1)),
    isInstallment: form.modoLancamento === "PARCELADO",
    isRecurring: form.modoLancamento === "RECORRENTE",
  };
}

export function validateFinanceForm(form) {
  const { installmentCount, isInstallment, isRecurring } = getFinanceLaunchMode(form);
  if (!String(form.descricao || "").trim()) return "Informe a descrição do lançamento.";
  if (Number(form.valor) <= 0) return "Informe um valor maior que zero.";
  if ((isInstallment || isRecurring) && installmentCount <= 1) {
    return "Informe ao menos 2 parcelas ou recorrências.";
  }
  return "";
}

export function buildFinanceRecurrencePayload({ form, session }) {
  const { installmentCount, intervalMonths } = getFinanceLaunchMode(form);
  return {
    descricao: form.descricao.trim(),
    tipo: form.tipo,
    categoria: form.categoria,
    valor: Number(form.valor),
    metodoPagamento: form.metodoPagamento,
    statusLancamento: form.status,
    dataInicio: form.dataVencimento || getLocalDateKey(),
    intervaloMeses: intervalMonths,
    totalGeracoes: installmentCount,
    gerarPrimeiroLancamento: true,
    usuarioId: session.usuarioId,
    filialId: form.filialId || session.filialId || null,
    observacao: form.observacao,
  };
}

export function buildFinanceLaunchPayloads({ form, session }) {
  const { installmentCount, intervalMonths, isInstallment } = getFinanceLaunchMode(form);
  const totalValue = Number(form.valor);
  const base = {
    tipo: form.tipo,
    categoria: form.categoria,
    metodoPagamento: form.metodoPagamento,
    status: form.status,
    usuarioId: session.usuarioId,
    filialId: form.filialId || session.filialId || null,
  };

  if (!isInstallment) {
    return [{
      ...base,
      descricao: form.descricao.trim(),
      valor: totalValue,
      dataVencimento: form.dataVencimento || null,
      observacao: form.observacao,
    }];
  }

  return Array.from({ length: installmentCount }, (_, index) => {
    const dueDate = addMonthsToDateKey(form.dataVencimento || getLocalDateKey(), index * intervalMonths);
    const suffix = `Parcela ${index + 1}/${installmentCount}`;
    return {
      ...base,
      descricao: `${form.descricao.trim()} - ${suffix}`,
      valor: Number((totalValue / installmentCount).toFixed(2)),
      dataVencimento: dueDate || null,
      observacao: [form.observacao, suffix].filter(Boolean).join(" | "),
    };
  });
}

export function buildFinanceUpdatePayload({ form, session }) {
  return buildFinanceLaunchPayloads({
    form: {
      ...form,
      modoLancamento: "UNICO",
      parcelas: 1,
      intervaloMeses: 1,
    },
    session,
  })[0];
}

export function buildFinanceEditForm(item) {
  return {
    descricao: item?.descricao || "",
    tipo: item?.tipo || "RECEITA",
    categoria: item?.categoria || "Venda",
    valor: item?.valor != null ? String(item.valor) : "",
    metodoPagamento: item?.metodoPagamento || "PIX",
    status: item?.status || "PENDENTE",
    dataVencimento: item?.dataVencimento || "",
    filialId: item?.filialId || "",
    modoLancamento: "UNICO",
    parcelas: 1,
    intervaloMeses: 1,
    observacao: item?.observacao || "",
  };
}

export function buildFinanceCategoryPayload(categoryForm) {
  return {
    nome: categoryForm.nome.trim(),
    descricao: categoryForm.descricao.trim(),
    tipo: "FINANCEIRO",
    centroCusto: Boolean(categoryForm.centroCusto),
    ativo: true,
  };
}

export function getFinanceStatusActionMessage(action) {
  if (action === "estornar") return "Lançamento estornado com auditoria.";
  if (action === "baixar") return "Lançamento baixado como aprovado.";
  return "Lançamento cancelado com histórico.";
}

export function getFinanceStatusActionEndpointName(action) {
  if (action === "estornar") return "estornar";
  if (action === "baixar") return "baixar";
  return "cancelar";
}

export function buildFinanceChargeRequest(item) {
  if (!item?.id) return { error: "Lançamento financeiro não informado." };
  if (item.tipo !== "RECEITA") return { error: "Cobrança só pode ser gerada para contas a receber." };
  if (item.status === "CANCELADO") return { error: "Lançamento cancelado não pode gerar cobrança." };
  return { id: item.id };
}

export function buildGenerateRecurrenceRequest(id, quantidade = 1) {
  if (!id) return { error: "Recorrência não informada." };
  const normalizedQuantity = Math.max(1, Math.floor(Number(quantidade || 1)));
  return { id, quantidade: normalizedQuantity };
}

export function createSimpleCashFlowSummary(movements) {
  const approvedOrPending = movements.filter((item) => ["APROVADO", "PENDENTE"].includes(String(item.status || "")));
  const entradas = approvedOrPending
    .filter((item) => item.tipo === "RECEITA")
    .reduce((total, item) => total + Number(item.valor || 0), 0);
  const saidas = approvedOrPending
    .filter((item) => item.tipo === "DESPESA")
    .reduce((total, item) => total + Number(item.valor || 0), 0);
  const pendentes = approvedOrPending
    .filter((item) => item.status === "PENDENTE")
    .reduce((total, item) => total + Number(item.valor || 0), 0);
  return {
    entradas,
    pendentes,
    saldo: entradas - saidas,
    saidas,
    totalRegistros: approvedOrPending.length,
  };
}

export function createSimpleDreSummary(movements) {
  const approved = movements.filter((item) => item.status === "APROVADO");
  const receitaBruta = approved
    .filter((item) => item.tipo === "RECEITA")
    .reduce((total, item) => total + Number(item.valor || 0), 0);
  const despesas = approved
    .filter((item) => item.tipo === "DESPESA")
    .reduce((total, item) => total + Number(item.valor || 0), 0);
  return {
    despesas,
    margemOperacional: receitaBruta > 0 ? ((receitaBruta - despesas) / receitaBruta) * 100 : 0,
    receitaBruta,
    resultadoOperacional: receitaBruta - despesas,
  };
}

export function buildCollectionFollowUpDraft({ item, today = new Date() }) {
  const title = Array.isArray(item?.titulosDetalhados) ? item.titulosDetalhados[0] : null;
  if (!title?.id) return { error: "Título financeiro não encontrado para agendar follow-up." };
  const nextDate = new Date(today);
  nextDate.setDate(nextDate.getDate() + 1);
  const nextKey = getLocalDateKey(nextDate);
  return {
    financeiroId: title.id,
    cliente: item.cliente || title.cliente || "Cliente não identificado",
    canal: "WhatsApp",
    proximaAcao: nextKey,
    observacao: `${item.risco ? `Risco ${item.risco}. ` : ""}${item.acao || "Retomar contato de cobrança"}. Cobrança de ${Number(title.valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} vencida em ${title.vencimento ? new Date(`${title.vencimento}T00:00:00`).toLocaleDateString("pt-BR") : "-"}.`,
  };
}

export function buildCollectionFollowUpPayload(form) {
  if (!form.financeiroId) return { error: "Selecione uma cobrança vencida para agendar." };
  return {
    financeiroId: form.financeiroId,
    canal: form.canal,
    proximaAcao: form.proximaAcao || null,
    observacao: form.observacao,
  };
}

export function getCollectionFollowUpEndpointName(action) {
  return action === "concluir" ? "concluirFollowUp" : "cancelarFollowUp";
}

export function createSimpleReconciliationSummary({
  caixas = [],
  movimentacoes = [],
  pedidoIdsComFinanceiro = new Set(),
  pedidos = [],
}) {
  const completedSaleStatuses = new Set(["FINALIZADA", "RECEBIDO", "ENTREGUE", "CONCLUIDO"]);
  const vendasRecebidas = pedidos.filter((pedido) => completedSaleStatuses.has(String(pedido.status || "")));
  const vendasSemFinanceiro = vendasRecebidas.filter((pedido) => !pedidoIdsComFinanceiro.has(String(pedido.id)));
  const totalVendasRecebidas = vendasRecebidas.reduce((total, pedido) => total + Number(pedido.valor || 0), 0);
  const totalCaixaVendas = caixas.reduce((total, caixa) => total + Number(caixa.totalVendas || 0), 0);
  const totalFinanceiroReceitas = movimentacoes
    .filter((item) => item.tipo === "RECEITA" && item.status === "APROVADO")
    .reduce((total, item) => total + Number(item.valor || 0), 0);
  return {
    caixaFinanceiroDiff: totalCaixaVendas - totalFinanceiroReceitas,
    totalCaixaVendas,
    totalFinanceiroReceitas,
    totalVendasRecebidas,
    vendasCaixaDiff: totalVendasRecebidas - totalCaixaVendas,
    vendasSemFinanceiro,
  };
}

export function splitFinanceAccounts(movements) {
  return {
    contasAReceber: movements.filter((item) => item.tipo === "RECEITA"),
    contasAPagar: movements.filter((item) => item.tipo === "DESPESA"),
    vencidos: movements.filter((item) => item.status === "PENDENTE" && item.vencido === true),
    inadimplentes: movements.filter((item) => item.tipo === "RECEITA" && item.status === "PENDENTE" && item.vencido === true),
  };
}
