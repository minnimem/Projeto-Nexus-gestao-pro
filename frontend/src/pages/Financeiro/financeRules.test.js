import assert from "node:assert/strict";
import test from "node:test";
import {
  buildFinanceCategoryPayload,
  buildFinanceChargeRequest,
  buildFinanceEditForm,
  buildCollectionFollowUpDraft,
  buildCollectionFollowUpPayload,
  buildFinanceLaunchPayloads,
  buildFinanceRecurrencePayload,
  buildFinanceUpdatePayload,
  buildGenerateRecurrenceRequest,
  createSimpleReconciliationSummary,
  createSimpleCashFlowSummary,
  createSimpleDreSummary,
  getCollectionFollowUpEndpointName,
  getFinanceLaunchMode,
  getFinanceStatusActionEndpointName,
  getFinanceStatusActionMessage,
  splitFinanceAccounts,
  validateFinanceForm,
} from "./services/financeRules.js";

const session = {
  usuarioId: "usuario-1",
  filialId: "filial-1",
};

const baseForm = {
  descricao: "Venda balcão",
  tipo: "RECEITA",
  categoria: "Venda",
  valor: "300",
  metodoPagamento: "PIX",
  status: "PENDENTE",
  dataVencimento: "2026-07-10",
  filialId: "",
  modoLancamento: "UNICO",
  parcelas: 1,
  intervaloMeses: 1,
  observacao: "Pedido P-001",
};

test("financeiro valida formulario e cria lancamento unico", () => {
  assert.equal(validateFinanceForm(baseForm), "");
  assert.equal(validateFinanceForm({ ...baseForm, descricao: " " }), "Informe a descrição do lançamento.");
  assert.equal(validateFinanceForm({ ...baseForm, valor: "0" }), "Informe um valor maior que zero.");

  const payloads = buildFinanceLaunchPayloads({ form: baseForm, session });
  assert.deepEqual(payloads, [{
    descricao: "Venda balcão",
    tipo: "RECEITA",
    categoria: "Venda",
    valor: 300,
    metodoPagamento: "PIX",
    status: "PENDENTE",
    dataVencimento: "2026-07-10",
    usuarioId: "usuario-1",
    filialId: "filial-1",
    observacao: "Pedido P-001",
  }]);
});

test("financeiro monta formulario e payload de edicao de lancamento", () => {
  const item = {
    id: "fin-1",
    descricao: "Receita original",
    tipo: "RECEITA",
    categoria: "Venda",
    valor: 450.75,
    metodoPagamento: "BOLETO",
    status: "PENDENTE",
    dataVencimento: "2026-07-15",
    filialId: "filial-2",
    observacao: "Pedido P-010",
  };

  const editForm = buildFinanceEditForm(item);
  assert.deepEqual(editForm, {
    descricao: "Receita original",
    tipo: "RECEITA",
    categoria: "Venda",
    valor: "450.75",
    metodoPagamento: "BOLETO",
    status: "PENDENTE",
    dataVencimento: "2026-07-15",
    filialId: "filial-2",
    modoLancamento: "UNICO",
    parcelas: 1,
    intervaloMeses: 1,
    observacao: "Pedido P-010",
  });

  const payload = buildFinanceUpdatePayload({
    form: { ...editForm, descricao: " Receita ajustada ", valor: "455.10" },
    session,
  });

  assert.deepEqual(payload, {
    descricao: "Receita ajustada",
    tipo: "RECEITA",
    categoria: "Venda",
    valor: 455.10,
    metodoPagamento: "BOLETO",
    status: "PENDENTE",
    dataVencimento: "2026-07-15",
    usuarioId: "usuario-1",
    filialId: "filial-2",
    observacao: "Pedido P-010",
  });
});

test("financeiro gera parcelas com vencimentos e valores proporcionais", () => {
  const form = {
    ...baseForm,
    descricao: "Compra estoque",
    tipo: "DESPESA",
    categoria: "Compra de estoque",
    valor: "300",
    modoLancamento: "PARCELADO",
    parcelas: 3,
    intervaloMeses: 1,
  };

  assert.deepEqual(getFinanceLaunchMode(form), {
    installmentCount: 3,
    intervalMonths: 1,
    isInstallment: true,
    isRecurring: false,
  });

  const payloads = buildFinanceLaunchPayloads({ form, session });
  assert.equal(payloads.length, 3);
  assert.deepEqual(payloads.map((item) => item.valor), [100, 100, 100]);
  assert.deepEqual(payloads.map((item) => item.dataVencimento), ["2026-07-10", "2026-08-10", "2026-09-10"]);
  assert.match(payloads[1].descricao, /Parcela 2\/3/);
  assert.match(payloads[2].observacao, /Parcela 3\/3/);
});

test("financeiro cria payload de recorrencia e categoria financeira", () => {
  const recurringForm = {
    ...baseForm,
    descricao: "Mensalidade",
    modoLancamento: "RECORRENTE",
    parcelas: 6,
    intervaloMeses: 1,
    status: "PENDENTE",
  };

  assert.equal(validateFinanceForm({ ...recurringForm, parcelas: 1 }), "Informe ao menos 2 parcelas ou recorrências.");
  assert.deepEqual(buildFinanceRecurrencePayload({ form: recurringForm, session }), {
    descricao: "Mensalidade",
    tipo: "RECEITA",
    categoria: "Venda",
    valor: 300,
    metodoPagamento: "PIX",
    statusLancamento: "PENDENTE",
    dataInicio: "2026-07-10",
    intervaloMeses: 1,
    totalGeracoes: 6,
    gerarPrimeiroLancamento: true,
    usuarioId: "usuario-1",
    filialId: "filial-1",
    observacao: "Pedido P-001",
  });

  assert.deepEqual(buildFinanceCategoryPayload({
    nome: " Administrativo ",
    descricao: " Custos fixos ",
    centroCusto: true,
  }), {
    nome: "Administrativo",
    descricao: "Custos fixos",
    tipo: "FINANCEIRO",
    centroCusto: true,
    ativo: true,
  });
});

test("financeiro mapeia acoes de ciclo de vida", () => {
  assert.equal(getFinanceStatusActionEndpointName("baixar"), "baixar");
  assert.equal(getFinanceStatusActionEndpointName("estornar"), "estornar");
  assert.equal(getFinanceStatusActionEndpointName("cancelar"), "cancelar");
  assert.equal(getFinanceStatusActionMessage("baixar"), "Lançamento baixado como aprovado.");
  assert.equal(getFinanceStatusActionMessage("estornar"), "Lançamento estornado com auditoria.");
  assert.equal(getFinanceStatusActionMessage("cancelar"), "Lançamento cancelado com histórico.");
});

test("financeiro separa contas a pagar, receber, vencidos e inadimplentes", () => {
  const movements = [
    { id: "fin-1", tipo: "RECEITA", status: "PENDENTE", vencido: true },
    { id: "fin-2", tipo: "RECEITA", status: "APROVADO", vencido: false },
    { id: "fin-3", tipo: "DESPESA", status: "PENDENTE", vencido: true },
    { id: "fin-4", tipo: "DESPESA", status: "CANCELADO", vencido: false },
  ];

  const result = splitFinanceAccounts(movements);
  assert.deepEqual(result.contasAReceber.map((item) => item.id), ["fin-1", "fin-2"]);
  assert.deepEqual(result.contasAPagar.map((item) => item.id), ["fin-3", "fin-4"]);
  assert.deepEqual(result.vencidos.map((item) => item.id), ["fin-1", "fin-3"]);
  assert.deepEqual(result.inadimplentes.map((item) => item.id), ["fin-1"]);
});

test("financeiro valida geracao de cobranca e recorrencia manual", () => {
  assert.deepEqual(buildFinanceChargeRequest({ id: "fin-1", tipo: "RECEITA", status: "PENDENTE" }), {
    id: "fin-1",
  });
  assert.equal(
    buildFinanceChargeRequest({ id: "fin-2", tipo: "DESPESA", status: "PENDENTE" }).error,
    "Cobrança só pode ser gerada para contas a receber.",
  );
  assert.equal(
    buildFinanceChargeRequest({ id: "fin-3", tipo: "RECEITA", status: "CANCELADO" }).error,
    "Lançamento cancelado não pode gerar cobrança.",
  );
  assert.deepEqual(buildGenerateRecurrenceRequest("rec-1", "2.9"), { id: "rec-1", quantidade: 2 });
  assert.equal(buildGenerateRecurrenceRequest("", 2).error, "Recorrência não informada.");
});

test("financeiro calcula fluxo de caixa e DRE gerencial simples", () => {
  const movements = [
    { tipo: "RECEITA", status: "APROVADO", valor: 1000 },
    { tipo: "RECEITA", status: "PENDENTE", valor: 500 },
    { tipo: "DESPESA", status: "APROVADO", valor: 300 },
    { tipo: "DESPESA", status: "PENDENTE", valor: 200 },
    { tipo: "RECEITA", status: "CANCELADO", valor: 999 },
  ];

  assert.deepEqual(createSimpleCashFlowSummary(movements), {
    entradas: 1500,
    pendentes: 700,
    saldo: 1000,
    saidas: 500,
    totalRegistros: 4,
  });
  assert.deepEqual(createSimpleDreSummary(movements), {
    despesas: 300,
    margemOperacional: 70,
    receitaBruta: 1000,
    resultadoOperacional: 700,
  });
});

test("financeiro monta follow-up de cobranca", () => {
  const draft = buildCollectionFollowUpDraft({
    item: {
      cliente: "Ana Cliente",
      risco: "Alto",
      acao: "Priorizar cobrança hoje",
      titulosDetalhados: [{ id: "fin-1", valor: 250, vencimento: "2026-07-01" }],
    },
    today: new Date("2026-07-05T12:00:00"),
  });

  assert.equal(draft.financeiroId, "fin-1");
  assert.equal(draft.cliente, "Ana Cliente");
  assert.equal(draft.proximaAcao, "2026-07-06");
  assert.match(draft.observacao, /Risco Alto/);

  assert.deepEqual(buildCollectionFollowUpPayload(draft), {
    financeiroId: "fin-1",
    canal: "WhatsApp",
    proximaAcao: "2026-07-06",
    observacao: draft.observacao,
  });
  assert.equal(buildCollectionFollowUpPayload({}).error, "Selecione uma cobrança vencida para agendar.");
  assert.equal(buildCollectionFollowUpDraft({ item: { titulosDetalhados: [] } }).error, "Título financeiro não encontrado para agendar follow-up.");
  assert.equal(getCollectionFollowUpEndpointName("concluir"), "concluirFollowUp");
  assert.equal(getCollectionFollowUpEndpointName("cancelar"), "cancelarFollowUp");
});

test("financeiro calcula conciliacao e pedidos sem financeiro", () => {
  const summary = createSimpleReconciliationSummary({
    caixas: [{ totalVendas: 300 }],
    movimentacoes: [
      { id: "fin-1", pedidoId: "pedido-1", tipo: "RECEITA", status: "APROVADO", valor: 100 },
      { id: "fin-2", pedidoId: "pedido-2", tipo: "RECEITA", status: "APROVADO", valor: 150 },
      { id: "fin-3", tipo: "DESPESA", status: "APROVADO", valor: 50 },
    ],
    pedidoIdsComFinanceiro: new Set(["pedido-1", "pedido-2"]),
    pedidos: [
      { id: "pedido-1", status: "RECEBIDO", valor: 100 },
      { id: "pedido-2", status: "CONCLUIDO", valor: 150 },
      { id: "pedido-3", status: "ENTREGUE", valor: 80 },
      { id: "pedido-4", status: "PENDENTE", valor: 60 },
    ],
  });

  assert.equal(summary.totalVendasRecebidas, 330);
  assert.equal(summary.totalCaixaVendas, 300);
  assert.equal(summary.totalFinanceiroReceitas, 250);
  assert.equal(summary.vendasCaixaDiff, 30);
  assert.equal(summary.caixaFinanceiroDiff, 50);
  assert.deepEqual(summary.vendasSemFinanceiro.map((pedido) => pedido.id), ["pedido-3"]);
});
