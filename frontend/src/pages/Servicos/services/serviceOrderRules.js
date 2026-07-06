import { asList } from "../../../utils/formatters.js";
import { serviceKanbanColumns, serviceOrderPriorities, serviceOrderStatuses } from "../constants/serviceConstants.js";

export function stripServiceMarkers(observacao = "") {
  return String(observacao || "")
    .replace(/\[Prioridade:\s*(CRITICA|ALTA|MEDIA|BAIXA)\]\s*/gi, "")
    .replace(/\[Peças:\s*[^\]]+\]\s*/gi, "")
    .replace(/\[Pecas:\s*[^\]]+\]\s*/gi, "")
    .replace(/\[Evidências:\s*[^\]]+\]\s*/gi, "")
    .replace(/\[Evidencias:\s*[^\]]+\]\s*/gi, "")
    .replace(/\[Assinatura cliente:\s*(SIM|NAO)\]\s*/gi, "")
    .trim();
}

export function buildServiceStatusPayload({ ordem, nextStatus, session }) {
  const normalizedStatus = String(nextStatus || "").toUpperCase();

  if (!ordem?.id) {
    return { error: "OS nao encontrada." };
  }

  if (!serviceOrderStatuses.includes(normalizedStatus)) {
    return { error: "Status de OS invalido." };
  }

  return {
    payload: {
      id: ordem.id,
      empresaId: session?.empresaId || ordem.empresaId,
      clienteId: ordem.clienteId,
      tecnicoId: ordem.tecnicoId || null,
      filialId: ordem.filialId || null,
      status: normalizedStatus,
      titulo: ordem.titulo || "Ordem de servico",
      descricao: ordem.descricao || "",
      checklist: ordem.checklist || "",
      prazo: ordem.prazo || null,
      valorEstimado: Number(ordem.valorEstimado || 0),
      tipoServico: ordem.tipoServico || "",
      contratoId: ordem.contratoId || null,
      garantiaCoberta: Boolean(ordem.garantiaCoberta),
      garantiaAte: ordem.garantiaAte || null,
      recorrente: Boolean(ordem.recorrente),
      recorrenciaIntervaloMeses: ordem.recorrenciaIntervaloMeses || null,
      proximaRecorrencia: ordem.proximaRecorrencia || null,
      pecasUtilizadas: ordem.pecasUtilizadas || "",
      pecas: asList(ordem.pecas).map((item) => ({
        produtoId: item.produtoId,
        quantidade: Number(item.quantidade || 1),
        custoUnitario: Number(item.custoUnitario || 0),
        valorUnitario: Number(item.valorUnitario || 0),
      })),
      evidencias: ordem.evidencias || "",
      anexos: ordem.anexos || "",
      assinaturaCliente: Boolean(ordem.assinaturaCliente),
      assinaturaClienteNome: ordem.assinaturaClienteNome || "",
      assinaturaClienteDocumento: ordem.assinaturaClienteDocumento || "",
      assinaturaClienteObservacao: ordem.assinaturaClienteObservacao || "",
      observacao: ordem.observacao || "",
    },
  };
}

export function getServiceSlaState(ordem, now = new Date()) {
  const priority = serviceOrderPriorities.find((item) => item.value === ordem?.prioridade) || serviceOrderPriorities.find((item) => item.value === "MEDIA");
  const createdAt = ordem?.dataAbertura || ordem?.dataCriacao || ordem?.createdAt;
  const dueDate = ordem?.prazo ? new Date(ordem.prazo) : (createdAt ? new Date(new Date(createdAt).getTime() + priority.slaHours * 60 * 60 * 1000) : null);

  if (!dueDate || Number.isNaN(dueDate.getTime())) {
    return { status: "SEM_PRAZO", overdue: false, hoursRemaining: null, dueDate: null };
  }

  const closed = ["CONCLUIDA", "FATURADA", "CANCELADA"].includes(String(ordem?.status || "").toUpperCase());
  const hoursRemaining = Math.ceil((dueDate.getTime() - now.getTime()) / (60 * 60 * 1000));

  if (closed) {
    return { status: "ENCERRADA", overdue: false, hoursRemaining, dueDate: dueDate.toISOString().slice(0, 10) };
  }

  if (hoursRemaining < 0) {
    return { status: "ATRASADA", overdue: true, hoursRemaining, dueDate: dueDate.toISOString().slice(0, 10) };
  }

  if (hoursRemaining <= 8) {
    return { status: "ATENCAO", overdue: false, hoursRemaining, dueDate: dueDate.toISOString().slice(0, 10) };
  }

  return { status: "NO_PRAZO", overdue: false, hoursRemaining, dueDate: dueDate.toISOString().slice(0, 10) };
}

export function createServiceHistory(ordens = []) {
  return asList(ordens)
    .flatMap((ordem) => [
      {
        id: `${ordem.id}-abertura`,
        date: ordem.dataAbertura || ordem.dataCriacao || ordem.createdAt || "",
        title: `OS ${ordem.numero || ordem.id} aberta`,
        status: "ABERTA",
        ordem,
      },
      ordem.status && {
        id: `${ordem.id}-status`,
        date: ordem.dataAtualizacao || ordem.updatedAt || ordem.dataAbertura || ordem.dataCriacao || "",
        title: `Status atual: ${ordem.status}`,
        status: ordem.status,
        ordem,
      },
    ].filter(Boolean))
    .sort((first, second) => String(second.date).localeCompare(String(first.date)));
}

export function createServiceKanban(ordens = []) {
  return serviceKanbanColumns.map((column) => ({
    ...column,
    items: asList(ordens).filter((ordem) => String(ordem.status || "ABERTA").toUpperCase() === column.key),
  }));
}

export function buildServiceObservation(priority, observacao, pecas = "", evidencias = "", assinaturaCliente = "NAO") {
  const normalizedPriority = serviceOrderPriorities.some((item) => item.value === priority) ? priority : "MEDIA";
  const cleanedObservation = stripServiceMarkers(observacao);
  const markers = [
    `[Prioridade: ${normalizedPriority}]`,
    String(pecas || "").trim() && `[Peças: ${String(pecas).trim()}]`,
    String(evidencias || "").trim() && `[Evidências: ${String(evidencias).trim()}]`,
    `[Assinatura cliente: ${assinaturaCliente === "SIM" ? "SIM" : "NAO"}]`,
  ].filter(Boolean);
  return `${markers.join(" ")}${cleanedObservation ? ` ${cleanedObservation}` : ""}`;
}

export function parseServiceChecklist(checklist = "") {
  return String(checklist || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^\[(x|X| )\]\s*(.+)$/);
      return {
        done: match ? match[1].toLowerCase() === "x" : false,
        text: match ? match[2].trim() : line,
      };
    });
}

export function serializeServiceChecklist(items) {
  return items
    .filter((item) => item.text.trim())
    .map((item) => `[${item.done ? "x" : " "}] ${item.text.trim()}`)
    .join("\n");
}

export function validateServiceOrderForm(form) {
  if (!form.clienteId) return { error: "Selecione o cliente da OS.", step: "cliente" };
  if (!String(form.titulo || "").trim()) return { error: "Informe o título da OS.", step: "servico" };
  return { error: "", step: "" };
}

export function buildServiceOrderPayload({ form, session }) {
  return {
    empresaId: session.empresaId,
    clienteId: form.clienteId,
    tecnicoId: form.tecnicoId || null,
    filialId: form.filialId || null,
    status: "ABERTA",
    titulo: form.titulo.trim(),
    descricao: form.descricao.trim(),
    checklist: form.checklist.trim(),
    prazo: form.prazo || null,
    valorEstimado: form.valorEstimado ? Number(form.valorEstimado) : 0,
    tipoServico: form.tipoServico,
    contratoId: form.contratoId || null,
    garantiaCoberta: form.garantiaCoberta === "SIM",
    garantiaAte: form.garantiaAte || null,
    recorrente: form.recorrente === "SIM",
    recorrenciaIntervaloMeses: form.recorrente === "SIM" ? Number(form.recorrenciaIntervaloMeses || 1) : null,
    proximaRecorrencia: form.recorrente === "SIM" ? (form.proximaRecorrencia || null) : null,
    pecasUtilizadas: form.pecasUtilizadas.trim(),
    pecas: asList(form.pecasItens).map((item) => ({
      produtoId: item.productId,
      quantidade: Number(item.quantity || 1),
      custoUnitario: Number(item.unitCost || 0),
      valorUnitario: Number(item.unitSale || 0),
    })),
    evidencias: form.evidencias.trim(),
    assinaturaCliente: form.assinaturaCliente === "SIM",
    assinaturaClienteNome: form.assinaturaClienteNome.trim(),
    assinaturaClienteDocumento: form.assinaturaClienteDocumento.trim(),
    assinaturaClienteObservacao: form.assinaturaClienteObservacao.trim(),
    observacao: buildServiceObservation(
      form.prioridade,
      form.observacao,
      form.pecasUtilizadas,
      form.evidencias,
      form.assinaturaCliente,
    ),
  };
}

export function buildServiceChecklistPayload({ index, ordem, session }) {
  const items = parseServiceChecklist(ordem.checklist);
  if (!items[index]) return { error: "Item de checklist não encontrado." };
  const nextItems = items.map((item, itemIndex) =>
    itemIndex === index ? { ...item, done: !item.done } : item,
  );

  return {
    payload: {
      empresaId: session.empresaId || ordem.empresaId,
      clienteId: ordem.clienteId,
      tecnicoId: ordem.tecnicoId || null,
      filialId: ordem.filialId || null,
      status: ordem.status || "ABERTA",
      titulo: ordem.titulo || "Ordem de serviço",
      descricao: ordem.descricao || "",
      checklist: serializeServiceChecklist(nextItems),
      prazo: ordem.prazo || null,
      valorEstimado: Number(ordem.valorEstimado || 0),
      tipoServico: ordem.tipoServico || "",
      contratoId: ordem.contratoId || null,
      garantiaCoberta: Boolean(ordem.garantiaCoberta),
      garantiaAte: ordem.garantiaAte || null,
      recorrente: Boolean(ordem.recorrente),
      recorrenciaIntervaloMeses: ordem.recorrenciaIntervaloMeses || null,
      proximaRecorrencia: ordem.proximaRecorrencia || null,
      pecasUtilizadas: ordem.pecasUtilizadas || "",
      pecas: asList(ordem.pecas).map((item) => ({
        produtoId: item.produtoId,
        quantidade: Number(item.quantidade || 1),
        custoUnitario: Number(item.custoUnitario || 0),
        valorUnitario: Number(item.valorUnitario || 0),
      })),
      evidencias: ordem.evidencias || "",
      anexos: ordem.anexos || "",
      assinaturaCliente: Boolean(ordem.assinaturaCliente),
      assinaturaClienteNome: ordem.assinaturaClienteNome || "",
      assinaturaClienteDocumento: ordem.assinaturaClienteDocumento || "",
      assinaturaClienteObservacao: ordem.assinaturaClienteObservacao || "",
      observacao: ordem.observacao || "",
    },
  };
}

export function getServiceActionSuccessMessage(action, ordem, response = {}) {
  const number = response.numero || ordem?.numero || "";
  if (action === "invoice") return `OS ${number} faturada e vinculada ao financeiro.`;
  if (action === "consumeParts") return `Peças da OS ${number} baixadas no estoque.`;
  if (action === "attachment") return `Anexo incluído na OS ${number}.`;
  if (action === "signature") return `Assinatura registrada na OS ${number}.`;
  return `OS ${number} atualizada.`;
}
