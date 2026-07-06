import assert from "node:assert/strict";
import test from "node:test";
import {
  buildServiceChecklistPayload,
  buildServiceObservation,
  buildServiceOrderPayload,
  buildServiceStatusPayload,
  createServiceHistory,
  createServiceKanban,
  getServiceActionSuccessMessage,
  getServiceSlaState,
  parseServiceChecklist,
  serializeServiceChecklist,
  stripServiceMarkers,
  validateServiceOrderForm,
} from "./services/serviceOrderRules.js";

const session = {
  empresaId: "empresa-1",
};

const form = {
  clienteId: "cliente-1",
  tecnicoId: "tecnico-1",
  filialId: "filial-1",
  prioridade: "ALTA",
  titulo: "Instalação de equipamento",
  descricao: "Instalar e testar equipamento",
  checklist: "[ ] Separar peça\n[x] Confirmar endereço",
  prazo: "2026-07-10",
  valorEstimado: "450",
  tipoServico: "AVULSO",
  contratoId: "",
  garantiaCoberta: "SIM",
  garantiaAte: "2026-12-31",
  recorrente: "SIM",
  recorrenciaIntervaloMeses: "3",
  proximaRecorrencia: "2026-10-10",
  pecasUtilizadas: "1x FILTRO-01",
  pecasItens: [{ productId: "produto-1", quantity: "2", unitCost: "25", unitSale: "40" }],
  evidencias: "Foto inicial anexada",
  assinaturaCliente: "SIM",
  assinaturaClienteNome: "Ana Cliente",
  assinaturaClienteDocumento: "123",
  assinaturaClienteObservacao: "Aceite presencial",
  observacao: "[Prioridade: MEDIA] Observação livre",
};

test("servicos valida formulario e monta payload de OS", () => {
  assert.deepEqual(validateServiceOrderForm({ ...form, clienteId: "" }), {
    error: "Selecione o cliente da OS.",
    step: "cliente",
  });
  assert.deepEqual(validateServiceOrderForm({ ...form, titulo: " " }), {
    error: "Informe o título da OS.",
    step: "servico",
  });
  assert.deepEqual(validateServiceOrderForm(form), { error: "", step: "" });

  const payload = buildServiceOrderPayload({ form, session });
  assert.equal(payload.empresaId, "empresa-1");
  assert.equal(payload.clienteId, "cliente-1");
  assert.equal(payload.status, "ABERTA");
  assert.equal(payload.titulo, "Instalação de equipamento");
  assert.equal(payload.valorEstimado, 450);
  assert.equal(payload.garantiaCoberta, true);
  assert.equal(payload.recorrente, true);
  assert.equal(payload.recorrenciaIntervaloMeses, 3);
  assert.deepEqual(payload.pecas, [{
    produtoId: "produto-1",
    quantidade: 2,
    custoUnitario: 25,
    valorUnitario: 40,
  }]);
  assert.match(payload.observacao, /\[Prioridade: ALTA\]/);
  assert.match(payload.observacao, /\[Peças: 1x FILTRO-01\]/);
  assert.match(payload.observacao, /\[Evidências: Foto inicial anexada\]/);
  assert.match(payload.observacao, /\[Assinatura cliente: SIM\]/);
});

test("servicos valida alteracao de status da OS", () => {
  assert.equal(buildServiceStatusPayload({ ordem: null, nextStatus: "EM_EXECUCAO", session }).error, "OS nao encontrada.");
  assert.equal(
    buildServiceStatusPayload({ ordem: { id: "os-1" }, nextStatus: "INVALIDO", session }).error,
    "Status de OS invalido.",
  );

  const result = buildServiceStatusPayload({
    ordem: {
      id: "os-1",
      empresaId: "empresa-antiga",
      clienteId: "cliente-1",
      status: "ABERTA",
      titulo: "Reparo",
      valorEstimado: "120",
      pecas: [{ produtoId: "produto-1", quantidade: "2", custoUnitario: "10", valorUnitario: "20" }],
    },
    nextStatus: "EM_EXECUCAO",
    session,
  });

  assert.equal(result.payload.empresaId, "empresa-1");
  assert.equal(result.payload.status, "EM_EXECUCAO");
  assert.equal(result.payload.valorEstimado, 120);
  assert.deepEqual(result.payload.pecas, [{
    produtoId: "produto-1",
    quantidade: 2,
    custoUnitario: 10,
    valorUnitario: 20,
  }]);
});

test("servicos calcula SLA da OS", () => {
  const now = new Date("2026-07-05T12:00:00.000Z");

  assert.deepEqual(getServiceSlaState({}, now), {
    status: "SEM_PRAZO",
    overdue: false,
    hoursRemaining: null,
    dueDate: null,
  });
  assert.deepEqual(getServiceSlaState({ status: "ABERTA", prazo: "2026-07-05T10:00:00.000Z" }, now), {
    status: "ATRASADA",
    overdue: true,
    hoursRemaining: -2,
    dueDate: "2026-07-05",
  });
  assert.equal(getServiceSlaState({ status: "ABERTA", prazo: "2026-07-05T18:00:00.000Z" }, now).status, "ATENCAO");
  assert.equal(getServiceSlaState({ status: "ABERTA", prioridade: "ALTA", dataAbertura: "2026-07-05T00:00:00.000Z" }, now).status, "NO_PRAZO");
  assert.equal(getServiceSlaState({ status: "CONCLUIDA", prazo: "2026-07-04T12:00:00.000Z" }, now).status, "ENCERRADA");
});

test("servicos monta historico e kanban de OS", () => {
  const ordens = [
    { id: "os-1", numero: "OS-1", status: "ABERTA", dataAbertura: "2026-07-01", dataAtualizacao: "2026-07-02" },
    { id: "os-2", numero: "OS-2", status: "EM_EXECUCAO", dataAbertura: "2026-07-03", dataAtualizacao: "2026-07-04" },
  ];

  const history = createServiceHistory(ordens);
  assert.equal(history[0].id, "os-2-status");
  assert.equal(history[0].title, "Status atual: EM_EXECUCAO");
  assert.equal(history.at(-1).title, "OS OS-1 aberta");

  const kanban = createServiceKanban(ordens);
  assert.equal(kanban.find((column) => column.key === "ABERTA").items.length, 1);
  assert.equal(kanban.find((column) => column.key === "EM_EXECUCAO").items[0].id, "os-2");
});

test("servicos trata marcadores, checklist e edição de checklist", () => {
  assert.equal(
    stripServiceMarkers("[Prioridade: ALTA] [Peças: X] [Evidências: Y] [Assinatura cliente: SIM] Texto"),
    "Texto",
  );
  assert.equal(
    buildServiceObservation("INVALIDA", "Texto", "", "", "NAO"),
    "[Prioridade: MEDIA] [Assinatura cliente: NAO] Texto",
  );

  const checklist = parseServiceChecklist("[ ] Diagnosticar\n[x] Testar\r\nConcluir");
  assert.deepEqual(checklist, [
    { done: false, text: "Diagnosticar" },
    { done: true, text: "Testar" },
    { done: false, text: "Concluir" },
  ]);
  assert.equal(serializeServiceChecklist(checklist), "[ ] Diagnosticar\n[x] Testar\n[ ] Concluir");

  const ordem = {
    id: "os-1",
    empresaId: "empresa-1",
    clienteId: "cliente-1",
    checklist: "[ ] Diagnosticar\n[x] Testar",
    titulo: "Ordem de serviço",
    valorEstimado: "100",
    pecas: [{ produtoId: "produto-1", quantidade: "1", custoUnitario: "10", valorUnitario: "20" }],
  };
  const result = buildServiceChecklistPayload({ index: 0, ordem, session });
  assert.equal(result.payload.checklist, "[x] Diagnosticar\n[x] Testar");
  assert.deepEqual(result.payload.pecas, [{
    produtoId: "produto-1",
    quantidade: 1,
    custoUnitario: 10,
    valorUnitario: 20,
  }]);
  assert.equal(buildServiceChecklistPayload({ index: 5, ordem, session }).error, "Item de checklist não encontrado.");
});

test("servicos padroniza mensagens de faturamento, estoque, anexos e assinatura", () => {
  const ordem = { numero: "OS-10" };
  assert.equal(getServiceActionSuccessMessage("invoice", ordem), "OS OS-10 faturada e vinculada ao financeiro.");
  assert.equal(getServiceActionSuccessMessage("consumeParts", ordem), "Peças da OS OS-10 baixadas no estoque.");
  assert.equal(getServiceActionSuccessMessage("attachment", ordem), "Anexo incluído na OS OS-10.");
  assert.equal(getServiceActionSuccessMessage("signature", ordem), "Assinatura registrada na OS OS-10.");
});
