import { formatDate, formatDateTime, formatNumber, getLocalDateKey, isDateBeforeToday } from "../../../utils/formatters";
import { serviceOrderPriorities } from "../constants/serviceConstants";
import { asList, formatCurrency } from "../../../utils/formatters";
export function parseServicePriority(observacao = "") {
  const match = String(observacao || "").match(/\[Prioridade:\s*(CRITICA|ALTA|MEDIA|BAIXA)\]/i);
  return match ? match[1].toUpperCase() : "MEDIA";
}

export function stripServicePriority(observacao = "") {
  return String(observacao || "").replace(/\[Prioridade:\s*(CRITICA|ALTA|MEDIA|BAIXA)\]\s*/i, "").trim();
}

export function parseServiceMarker(observacao = "", marker) {
  const expression = new RegExp(`\\[${marker}:\\s*([^\\]]+)\\]`, "i");
  const match = String(observacao || "").match(expression);
  return match ? match[1].trim() : "";
}

export function stripServiceMarkers(observacao = "") {
  return stripServicePriority(observacao)
    .replace(/\[Pecas:\s*[^\]]+\]\s*/gi, "")
    .replace(/\[Evid(:e|\)ncias:\s*[^\]]+\]\s*/gi, "")
    .replace(/\[Assinatura cliente:\s*(SIM|NAO)\]\s*/gi, "")
    .trim();
}

export function buildServiceObservation(priority, observacao, pecas = "", evidencias = "", assinaturaCliente = "NAO") {
  const normalizedPriority = serviceOrderPriorities.some((item) => item.value === priority) ? priority : "MEDIA";
  const cleanedObservation = stripServiceMarkers(observacao);
  const markers = [
    `[Prioridade: ${normalizedPriority}]`,
    String(pecas || "").trim() && `[Pecas: ${String(pecas).trim()}]`,
    String(evidencias || "").trim() && `[Evidencias: ${String(evidencias).trim()}]`,
    `[Assinatura cliente: ${assinaturaCliente === "SIM" ? "SIM" : "NAO"}]`,
  ].filter(Boolean);
  return `${markers.join(" ")}${cleanedObservation ? ` ${cleanedObservation}` : ""}`;
}

export function parseServiceChecklist(checklist = "") {
  return String(checklist || "")
    .split(/\r\n/)
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

export function getServiceSla(ordem) {
  if (ordem.dataConclusao) return { label: "Concluída", tone: "success", days: 0 };
  if (!ordem.prazo) return { label: "Sem prazo", tone: "neutral", days: null };

  const dueDate = new Date(`${ordem.prazo}T00:00:00`);
  const today = new Date(`${getLocalDateKey()}T00:00:00`);
  if (Number.isNaN(dueDate.getTime())) return { label: "Prazo inválido", tone: "warning", days: null };

  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / 86400000);
  if (diffDays < 0) return { label: `${Math.abs(diffDays)} dia(s) vencida`, tone: "danger", days: diffDays };
  if (diffDays === 0) return { label: "Vence hoje", tone: "warning", days: 0 };
  if (diffDays <= 2) return { label: `${diffDays} dia(s) restantes`, tone: "warning", days: diffDays };
  return { label: `${diffDays} dia(s) restantes`, tone: "success", days: diffDays };
}

export function getServiceRecurrenceStatus(ordem) {
  if (!ordem.recorrente) return { label: "Não recorrente", tone: "neutral", days: null };
  if (!ordem.proximaRecorrencia) return { label: "Sem próxima data", tone: "warning", days: null };

  const recurrenceDate = new Date(`${ordem.proximaRecorrencia}T00:00:00`);
  const today = new Date(`${getLocalDateKey()}T00:00:00`);
  if (Number.isNaN(recurrenceDate.getTime())) return { label: "Data inválida", tone: "warning", days: null };

  const diffDays = Math.ceil((recurrenceDate.getTime() - today.getTime()) / 86400000);
  if (diffDays < 0) return { label: `${Math.abs(diffDays)} dia(s) vencida`, tone: "danger", days: diffDays };
  if (diffDays === 0) return { label: "Vence hoje", tone: "warning", days: 0 };
  if (diffDays <= 7) return { label: `${diffDays} dia(s)`, tone: "warning", days: diffDays };
  if (diffDays <= 30) return { label: `${diffDays} dia(s)`, tone: "info", days: diffDays };
  return { label: `${diffDays} dia(s)`, tone: "success", days: diffDays };
}

export function getServiceEvidence(ordem) {
  const observacao = ordem.observacao || "";
  const evidencias = [ordem.evidencias, ordem.anexos].filter(Boolean).join(" / ");
  return {
    pecas: ordem.pecasUtilizadas || parseServiceMarker(observacao, "Pecas"),
    evidencias: evidencias || parseServiceMarker(observacao, "Evidencias"),
    assinaturaCliente: Boolean(ordem.assinaturaCliente) || parseServiceMarker(observacao, "Assinatura cliente") === "SIM",
    assinaturaClienteNome: ordem.assinaturaClienteNome || "",
    assinaturaClienteDocumento: ordem.assinaturaClienteDocumento || "",
    assinaturaClienteObservacao: ordem.assinaturaClienteObservacao || "",
    assinaturaClienteRegistradaEm: ordem.assinaturaClienteRegistradaEm || "",
  };
}

export function getServiceTimelineRows(ordem) {
  if (!ordem) return [];
  const sla = getServiceSla(ordem);
  const checklist = parseServiceChecklist(ordem.checklist);
  const doneCount = checklist.filter((item) => item.done).length;
  const evidence = getServiceEvidence(ordem);
  return [
    {
      label: "Abertura",
      detail: ordem.dataCriacao ? `Criada em ${formatDateTime(ordem.dataCriacao)}` : "Registro inicial da OS",
      tone: "info",
    },
    ordem.tecnico && {
      label: "Responsável",
      detail: `${ordem.tecnico} designado para atendimento`,
      tone: "info",
    },
    {
      label: "SLA",
      detail: `${sla.label}${ordem.prazo ? ` / prazo ${formatDate(ordem.prazo)}` : ""}`,
      tone: sla.tone,
    },
    checklist.length > 0 && {
      label: "Checklist",
      detail: `${formatNumber(doneCount)} de ${formatNumber(checklist.length)} item(ns) concluído(s)`,
      tone: doneCount === checklist.length ? "success" : "warning",
    },
    evidence.pecas && {
      label: "Peças",
      detail: evidence.pecas,
      tone: "info",
    },
    evidence.evidencias && {
      label: "Evidências",
      detail: evidence.evidencias,
      tone: "info",
    },
    {
      label: "Assinatura",
      detail: evidence.assinaturaCliente
        ?
        [
            evidence.assinaturaClienteNome || "Cliente validou a execução",
            evidence.assinaturaClienteDocumento && `doc. ${evidence.assinaturaClienteDocumento}`,
            evidence.assinaturaClienteRegistradaEm && formatDateTime(evidence.assinaturaClienteRegistradaEm),
          ].filter(Boolean).join(" / ")
        : "Assinatura do cliente pendente",
      tone: evidence.assinaturaCliente ? "success" : "warning",
    },
    ordem.dataConclusao && {
      label: "Conclusão",
      detail: `Concluída em ${formatDateTime(ordem.dataConclusao)}`,
      tone: "success",
    },
  ].filter(Boolean);
}

export function getServicePartProductLabel(produto) {
  return produto.nome || produto.nomeProduto || produto.descricao || "Produto sem nome";
}

export function getServicePartProductIdentifier(produto) {
  return produto.sku || produto.codigoBarras || produto.codBarras || getServicePartProductLabel(produto);
}

export function serializeServiceParts(items) {
  return asList(items)
    .filter((item) => item.identifier && Number(item.quantity || 0) > 0)
    .map((item) => `${Number(item.quantity || 1)}x ${item.identifier}`)
    .join("; ");
}

export function getServicePartCost(produto) {
  return Number(produto.precoCompra ?? produto.custo ?? 0);
}

export function getServicePartSale(produto) {
  return Number(produto.precoVenda ?? produto.precoComDesconto ?? 0);
}

export function createServiceDashboardViewModel({
  contratos = [],
  finishedStatuses = new Set(["CONCLUIDA", "FATURADA"]),
  historyClienteId = "TODOS",
  historyEndDate = "",
  historyStartDate = "",
  historyStatus = "TODOS",
  historyTecnicoId = "TODOS",
  ordens = [],
  timelineFocusOrder = null,
}) {
  const timelineRows = getServiceTimelineRows(timelineFocusOrder);
  const servicePartHistoryRows = ordens.flatMap((ordem) =>
    asList(ordem.pecas).map((peca) => ({
      OS: ordem.numero || ordem.id,
      Cliente: ordem.cliente || "-",
      "Técnico": ordem.tecnico || "Sem técnico",
      Status: ordem.status || "-",
      Produto: peca.produto || "-",
      SKU: peca.sku || "-",
      Quantidade: formatNumber(peca.quantidade || 0),
      "Custo unitário": formatCurrency(peca.custoUnitario || 0),
      "Valor unitário": formatCurrency(peca.valorUnitario || 0),
      "Custo total": formatCurrency(peca.custoTotal || 0),
      "Venda total": formatCurrency(peca.valorTotal || 0),
      Margem: formatCurrency(peca.margem || 0),
    })),
  );
  const servicePartProductRows = Array.from(
    ordens.flatMap((ordem) => asList(ordem.pecas)).reduce((map, peca) => {
      const key = peca.produto || peca.produtoId || "Produto sem nome";
      const current = map.get(key) || { produto: key, quantidade: 0, custo: 0, venda: 0, margem: 0 };
      current.quantidade += Number(peca.quantidade || 0);
      current.custo += Number(peca.custoTotal || 0);
      current.venda += Number(peca.valorTotal || 0);
      current.margem += Number(peca.margem || 0);
      map.set(key, current);
      return map;
    }, new Map()).values(),
  ).sort((a, b) => b.margem - a.margem);
  const servicePartTechnicianRows = Array.from(
    ordens.reduce((map, ordem) => {
      const pecas = asList(ordem.pecas);
      if (pecas.length === 0) return map;
      const key = ordem.tecnico || "Sem técnico";
      const current = map.get(key) || { tecnico: key, os: 0, quantidade: 0, custo: 0, venda: 0, margem: 0 };
      current.os += 1;
      pecas.forEach((peca) => {
        current.quantidade += Number(peca.quantidade || 0);
        current.custo += Number(peca.custoTotal || 0);
        current.venda += Number(peca.valorTotal || 0);
        current.margem += Number(peca.margem || 0);
      });
      map.set(key, current);
      return map;
    }, new Map()).values(),
  ).sort((a, b) => b.margem - a.margem);
  const serviceHistoryOrders = ordens.filter((ordem) => {
    const openedKey = getLocalDateKey(ordem.dataAbertura || ordem.criadoEm || ordem.atualizadoEm);
    const matchesPeriod = (!historyStartDate || openedKey >= historyStartDate) && (!historyEndDate || openedKey <= historyEndDate);
    const matchesClient = historyClienteId === "TODOS" || String(ordem.clienteId || "") === historyClienteId;
    const matchesTechnician = historyTecnicoId === "TODOS" || String(ordem.tecnicoId || "") === historyTecnicoId;
    const matchesStatus = historyStatus === "TODOS" || String(ordem.status || "") === historyStatus;
    return matchesPeriod && matchesClient && matchesTechnician && matchesStatus;
  });
  const serviceHistoryFinished = serviceHistoryOrders.filter((ordem) => finishedStatuses.has(String(ordem.status || "")));
  const serviceHistoryRows = serviceHistoryOrders.map((ordem) => {
    const evidence = getServiceEvidence(ordem);
    return {
      Numero: ordem.numero || ordem.id,
      Abertura: formatDateTime(ordem.dataAbertura || ordem.criadoEm),
      Conclusao: ordem.dataConclusao ? formatDateTime(ordem.dataConclusao) : "-",
      Cliente: ordem.cliente || "-",
      "Técnico": ordem.tecnico || "-",
      Status: ordem.status || "-",
      Tipo: ordem.tipoServico || "-",
      Contrato: contratos.find((contrato) => String(contrato.id) === String(ordem.contratoId)).nome || "-",
      Garantia: ordem.garantiaCoberta ? `Até ${formatDate(ordem.garantiaAte)}` : "Não",
      "Recorrência": ordem.recorrente ? `${ordem.recorrenciaIntervaloMeses || 1} mes(es) / próx. ${formatDate(ordem.proximaRecorrencia)}` : "Não",
      Prioridade: parseServicePriority(ordem.observacao),
      SLA: getServiceSla(ordem).label,
      Valor: formatCurrency(ordem.valorEstimado || 0),
      "Peças estruturadas": formatNumber(asList(ordem.pecas).length),
      "Evidências completas": evidence.pecas && evidence.evidencias && evidence.assinaturaCliente ? "Sim" : "Não",
      "Título": ordem.titulo || "-",
    };
  });
  const recurringServiceOrders = serviceHistoryOrders
    .filter((ordem) => ordem.recorrente)
    .map((ordem) => {
      const recurrenceStatus = getServiceRecurrenceStatus(ordem);
      const billingStatus = ordem.financeiroId
        ?
        "Faturada"
        : Number(ordem.valorEstimado || 0) > 0 && ["CONCLUIDA", "FATURADA"].includes(String(ordem.status || "")) ?
          "Faturamento pendente"
          : Number(ordem.valorEstimado || 0) > 0 ?
            "Valor previsto"
            : "Sem valor";
      return { ordem, recurrenceStatus, billingStatus };
    })
    .sort((first, second) => (first.recurrenceStatus.days ?? 9999) - (second.recurrenceStatus.days ?? 9999));
  const recurringServiceRows = recurringServiceOrders.map(({ ordem, recurrenceStatus, billingStatus }) => ({
    OS: ordem.numero || ordem.id,
    Cliente: ordem.cliente || "-",
    Contrato: contratos.find((contrato) => String(contrato.id) === String(ordem.contratoId)).nome || "-",
    Intervalo: `${formatNumber(ordem.recorrenciaIntervaloMeses || 1)} mes(es)`,
    "Próxima recorrência": ordem.proximaRecorrencia ? formatDate(ordem.proximaRecorrencia) : "-",
    Status: recurrenceStatus.label,
    Faturamento: billingStatus,
    Valor: formatCurrency(ordem.valorEstimado || 0),
  }));

  return {
    nextRecurringServices: recurringServiceOrders.filter((item) => ["warning", "info"].includes(item.recurrenceStatus.tone)),
    overdueRecurringServices: recurringServiceOrders.filter((item) => item.recurrenceStatus.tone === "danger"),
    recurringServiceOrders,
    recurringServiceRows,
    serviceHistoryAverageCycle: serviceHistoryFinished.length > 0
      ?
      serviceHistoryFinished.reduce((total, ordem) => {
          const opened = new Date(ordem.dataAbertura || ordem.criadoEm || ordem.atualizadoEm || ordem.dataConclusao);
          const closed = new Date(ordem.dataConclusao || ordem.atualizadoEm || ordem.dataAbertura);
          if (Number.isNaN(opened.getTime()) || Number.isNaN(closed.getTime())) return total;
          return total + Math.max(0, Math.ceil((closed.getTime() - opened.getTime()) / 86400000));
        }, 0) / serviceHistoryFinished.length
      : 0,
    serviceHistoryEvidenceComplete: serviceHistoryOrders.filter((ordem) => {
      const evidence = getServiceEvidence(ordem);
      return Boolean(evidence.pecas && evidence.evidencias && evidence.assinaturaCliente);
    }),
    serviceHistoryFinished,
    serviceHistoryOrders,
    serviceHistoryOverdue: serviceHistoryOrders.filter((ordem) => getServiceSla(ordem).tone === "danger"),
    serviceHistoryRows,
    serviceHistoryValue: serviceHistoryOrders.reduce((total, ordem) => total + Number(ordem.valorEstimado || 0), 0),
    servicePartHistoryRows,
    servicePartTechnicianRows,
    timelineRows,
    topServicePartProducts: servicePartProductRows.slice(0, 4),
    topServicePartTechnicians: servicePartTechnicianRows.slice(0, 4),
  };
}
