import { planMonthlyValues } from "../../../constants/admin.js";
import {
  formatCurrency,
  formatDate,
  formatNumber,
  getLocalDateKey,
} from "../../../utils/formatters.js";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function clampDueDay(year, month, dueDay) {
  const lastDay = new Date(year, month + 1, 0).getDate();
  return Math.min(Math.max(Number(dueDay || 10), 1), lastDay);
}

function dateForDueDay(year, month, dueDay) {
  return new Date(year, month, clampDueDay(year, month, dueDay), 12, 0, 0, 0);
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getBillingPriority(item) {
  if (item.billingStatus.status === "VENCIDO") return 0;
  if (item.billingStatus.status === "VENCENDO") return 1;
  if (item.statusAssinaturaNormalizado === "PENDENTE") return 2;
  return 3;
}

export function getPlanBillingStatus(item) {
  const status = String(item.statusAssinaturaNormalizado || item.statusAssinatura || "TESTE").toUpperCase();

  if (status === "CANCELADA") {
    return { status: "CANCELADA", label: "Cancelada", tone: "neutral", dueDate: null };
  }

  if (status === "TESTE") {
    return { status: "TESTE", label: "Em teste", tone: "info", dueDate: null };
  }

  const today = new Date();
  const dueDay = Number(item.dueDay || item.diaVencimentoPlano || 10);
  const lastPayment = parseDate(item.ultimoPagamentoPlano);
  let dueDate = dateForDueDay(today.getFullYear(), today.getMonth(), dueDay);

  if (lastPayment && lastPayment.getTime() >= dueDate.getTime()) {
    dueDate = dateForDueDay(today.getFullYear(), today.getMonth() + 1, dueDay);
  }

  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / MS_PER_DAY);

  if (status === "PENDENTE" || status === "SUSPENSA" || daysUntilDue < 0) {
    return { status: "VENCIDO", label: "Vencida", tone: "danger", dueDate };
  }

  if (daysUntilDue <= 5) {
    return { status: "VENCENDO", label: "Vence em breve", tone: "warning", dueDate };
  }

  return { status: "EM_DIA", label: "Em dia", tone: "success", dueDate };
}

export function buildPlanBillingMessage(item) {
  const company = item.nome || item.razaoSocial || "cliente";
  const plan = item.plano || "STARTER";
  const amount = formatCurrency(item.valorMensal || 0);
  const due = item.nextDueDate ? formatDate(item.nextDueDate) : item.dueDay ? `dia ${item.dueDay}` : "data a definir";

  if (item.ativo === false) {
    return `${company}: cadastro inativo no Nexus One. Validar reativacao ou encerramento da carteira do plano ${plan}.`;
  }

  if (item.statusAssinaturaNormalizado === "TESTE") {
    return `${company}: teste do Nexus One ativo. Sugerir conversão para o plano ${plan} (${amount}/mes).`;
  }

  if (item.billingStatus.status === "VENCIDO") {
    return `${company}: mensalidade do plano ${plan} está pendente. Valor ${amount}, vencimento ${due}.`;
  }

  if (item.billingStatus.status === "VENCENDO") {
    return `${company}: lembrete preventivo do plano ${plan}. Valor ${amount}, proximo vencimento ${due}.`;
  }

  return `${company}: assinatura ${plan} em acompanhamento. Valor ${amount}, proximo vencimento ${due}.`;
}

export function buildPlanBillingPayload(empresaPlano, statusAssinatura, observacaoComercial) {
  return {
    planoComercial: empresaPlano.planoComercial || empresaPlano.plano || "STARTER",
    statusAssinatura,
    limiteUsuarios: Number(empresaPlano.limiteUsuarios ?? empresaPlano.plano?.limites?.usuarios ?? 0),
    limiteFiliais: Number(empresaPlano.limiteFiliais ?? empresaPlano.plano?.limites?.filiais ?? 0),
    limiteCaixas: Number(empresaPlano.limiteCaixas ?? empresaPlano.plano?.limites?.caixas ?? 0),
    limiteProdutos: Number(empresaPlano.limiteProdutos ?? empresaPlano.plano?.limites?.produtos ?? 0),
    valorMensalPlano: Number(empresaPlano.valorMensalPlano ?? empresaPlano.valorMensal ?? planMonthlyValues[empresaPlano.plano] ?? 0),
    diaVencimentoPlano: Number(empresaPlano.diaVencimentoPlano ?? empresaPlano.dueDay ?? 10),
    ultimoPagamentoPlano: statusAssinatura === "ATIVA" ? getLocalDateKey() : (empresaPlano.ultimoPagamentoPlano || null),
    fiscalLiberado: Boolean(empresaPlano.fiscalLiberado),
    pagamentosLiberado: Boolean(empresaPlano.pagamentosLiberado),
    notificacoesLiberado: Boolean(empresaPlano.notificacoesLiberado),
    logisticaLiberada: Boolean(empresaPlano.logisticaLiberada),
    servicosLiberado: Boolean(empresaPlano.servicosLiberado),
    auditoriaAvancadaLiberada: Boolean(empresaPlano.auditoriaAvancadaLiberada),
    observacaoComercial,
  };
}

export function buildPlanBillingViewModel(masterEmpresas, planBillingFilter, selectedPlanBillingIds) {
  const planBillingItems = masterEmpresas.map((item) => {
    const status = String(item.statusAssinatura || "TESTE").toUpperCase();
    const plano = String(item.planoComercial || "STARTER").toUpperCase();
    const valorMensal = Number(item.valorMensalPlano ?? item.plano?.valorMensalPlano ?? planMonthlyValues[plano] ?? 0);
    const createdAt = item.dataCadastro ? new Date(item.dataCadastro) : null;
    const dueDay = Number(
      item.diaVencimentoPlano
        || item.plano?.diaVencimentoPlano
        || (createdAt && !Number.isNaN(createdAt.getTime()) ? createdAt.getDate() : 10),
    );
    const ultimoPagamentoPlano = item.ultimoPagamentoPlano || item.plano?.ultimoPagamentoPlano || null;
    const billingStatus = getPlanBillingStatus({
      ...item,
      statusAssinaturaNormalizado: status,
      dueDay,
      ultimoPagamentoPlano,
    });
    const action = item.ativo === false ?
      "Reativar ou encerrar carteira"
      : ["PENDENTE", "SUSPENSA"].includes(status)
        ?
        "Priorizar cobrança"
        : status === "TESTE" ?
          "Converter teste em assinatura"
          : billingStatus.status === "VENCIDO" ?
            "Cobrar mensalidade vencida"
            : billingStatus.status === "VENCENDO" ?
              "Enviar lembrete preventivo"
              : status === "CANCELADA" ?
                "Validar cancelamento"
                : "Manter acompanhamento";

    return {
      ...item,
      plano,
      statusAssinaturaNormalizado: status,
      valorMensal,
      dueDay,
      ultimoPagamentoPlano,
      nextDueDate: billingStatus.dueDate ? getLocalDateKey(billingStatus.dueDate) : "",
      billingStatus,
      action,
      tone: billingStatus.tone,
    };
  }).sort((first, second) => {
    const firstScore = getBillingPriority(first);
    const secondScore = getBillingPriority(second);
    if (firstScore !== secondScore) return firstScore - secondScore;
    return String(first.nextDueDate || "9999-12-31").localeCompare(String(second.nextDueDate || "9999-12-31"));
  });

  const planBillingFilteredItems = planBillingItems.filter((item) => {
    if (planBillingFilter === "TODOS") return true;
    if (planBillingFilter === "COBRAR") {
      return item.ativo === false
        || ["PENDENTE", "SUSPENSA"].includes(item.statusAssinaturaNormalizado)
        || ["VENCIDO", "VENCENDO"].includes(item.billingStatus.status);
    }
    if (planBillingFilter === "VENCIDAS") return item.billingStatus.status === "VENCIDO";
    if (planBillingFilter === "VENCENDO") return item.billingStatus.status === "VENCENDO";
    if (planBillingFilter === "TESTE") return item.statusAssinaturaNormalizado === "TESTE";
    if (planBillingFilter === "ATIVAS") return item.ativo !== false && item.statusAssinaturaNormalizado === "ATIVA";
    return item.plano === planBillingFilter;
  });

  const planBillingRows = planBillingFilteredItems.map((item) => ({
    Empresa: item.nome || item.razaoSocial || "-",
    CNPJ: item.cnpj || "-",
    Plano: item.plano,
    Status: item.ativo === false ? "INATIVA" : item.statusAssinaturaNormalizado,
    Cobranca: item.billingStatus.label,
    "Valor mensal": formatCurrency(item.valorMensal),
    "Vencimento base": item.dueDay ? `Dia ${String(item.dueDay).padStart(2, "0")}` : "A definir",
    "Próximo vencimento": item.nextDueDate ? formatDate(item.nextDueDate) : "-",
    "Último pagamento": item.ultimoPagamentoPlano ? formatDate(item.ultimoPagamentoPlano) : "-",
    Usuarios: formatNumber(item.usuariosAtivos || 0),
    Filiais: formatNumber(item.filiais || 0),
    Acao: item.action,
    Mensagem: buildPlanBillingMessage(item),
  }));

  const selectedPlanBillingItems = planBillingFilteredItems.filter((item) =>
    selectedPlanBillingIds.includes(String(item.id || ""))
  );
  const planBillingOpenItems = planBillingItems.filter((item) =>
    item.ativo === false
    || ["PENDENTE", "SUSPENSA"].includes(item.statusAssinaturaNormalizado)
    || ["VENCIDO", "VENCENDO"].includes(item.billingStatus.status)
  );
  const planBillingMonthlyTotal = planBillingItems
    .filter((item) => item.ativo !== false && item.statusAssinaturaNormalizado === "ATIVA")
    .reduce((total, item) => total + item.valorMensal, 0);
  const planBillingOpenTotal = planBillingOpenItems.reduce((total, item) => total + item.valorMensal, 0);
  const planBillingTrialTotal = planBillingItems.filter((item) => item.statusAssinaturaNormalizado === "TESTE").length;
  const planBillingOverdueItems = planBillingItems.filter((item) => item.billingStatus.status === "VENCIDO");
  const planBillingDueSoonItems = planBillingItems.filter((item) => item.billingStatus.status === "VENCENDO");
  const planBillingOverdueTotal = planBillingOverdueItems.reduce((total, item) => total + item.valorMensal, 0);
  const planBillingDueSoonTotal = planBillingDueSoonItems.reduce((total, item) => total + item.valorMensal, 0);
  const planBillingRecommendedAction = planBillingOverdueItems.length > 0 ?
    `Priorizar ${formatNumber(planBillingOverdueItems.length)} assinatura(s) vencida(s), impacto ${formatCurrency(planBillingOverdueTotal)}.`
    : planBillingDueSoonItems.length > 0 ?
      `Enviar lembrete preventivo para ${formatNumber(planBillingDueSoonItems.length)} assinatura(s), impacto ${formatCurrency(planBillingDueSoonTotal)}.`
      : planBillingTrialTotal > 0 ?
        `Converter ${formatNumber(planBillingTrialTotal)} empresa(s) em teste para assinatura ativa.`
        : "Carteira sem ação urgente de cobrança.";

  return {
    planBillingDueSoonItems,
    planBillingDueSoonTotal,
    planBillingFilteredItems,
    planBillingItems,
    planBillingMonthlyTotal,
    planBillingOpenItems,
    planBillingOpenTotal,
    planBillingOverdueItems,
    planBillingOverdueTotal,
    planBillingRecommendedAction,
    planBillingRows,
    planBillingTrialTotal,
    selectedPlanBillingItems,
  };
}
