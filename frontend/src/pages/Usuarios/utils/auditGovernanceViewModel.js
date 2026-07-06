import {
  formatDateTime,
  formatNumber,
  formatPercent,
  getLocalDateKey,
} from "../../../utils/formatters.js";

const sensitiveAuditKeywords = [
  "CANCEL",
  "ESTORN",
  "EXCLU",
  "DELETE",
  "PERMIS",
  "ACESSO",
  "BLOQUE",
  "FISCAL",
  "FINANCEIRO",
];

function hasSensitiveAuditKeyword(evento) {
  const text = [evento.modulo, evento.acao, evento.descricao].join(" ").toUpperCase();
  return sensitiveAuditKeywords.some((keyword) => text.includes(keyword));
}

export function getAuditActor(evento) {
  return evento.usuarioNome || evento.usuarioLogin || "sistema";
}

export function getAuditTarget(evento) {
  return {
    entity: evento.entidade || evento.modulo || "-",
    id: evento.registroId || evento.referenciaId || "-",
    name: evento.registroNome || evento.nomeRegistro || evento.descricao || "-",
  };
}

export function getAuditCategory(evento) {
  const text = [evento.modulo, evento.acao, evento.descricao, evento.entidade].join(" ").toUpperCase();
  if (/EXCLU|DELETE/.test(text)) return "EXCLUSAO";
  if (/LOGIN|ACESSO/.test(text)) return "LOGIN_ACESSO";
  if (/PERMIS|BLOQUE/.test(text)) return "PERMISSAO";
  if (/EMPRESA|PLANO|ASSINATURA/.test(text)) return "EMPRESA_PLANO";
  if (/FISCAL|NFE|NFCE|NFSE/.test(text)) return "FISCAL";
  return "OPERACIONAL";
}

export function buildAuditGovernance(auditoria, usuarios, auditFilter, auditPage) {
  const auditModules = ["TODOS", ...Array.from(new Set(auditoria.map((evento) => evento.modulo).filter(Boolean)))];
  const auditActions = ["TODOS", ...Array.from(new Set(auditoria.map((evento) => evento.acao).filter(Boolean)))];
  const usersByLogin = new Map(
    usuarios
      .filter((usuario) => usuario.login)
      .map((usuario) => [String(usuario.login).toLowerCase(), usuario]),
  );

  function getAuditUserBranch(evento) {
    const usuario = evento.usuarioLogin ? usersByLogin.get(String(evento.usuarioLogin).toLowerCase()) : null;
    return usuario?.filial || "Empresa / sem filial";
  }

  const filteredAudit = auditoria.filter((evento) => {
    const eventKey = getLocalDateKey(evento.dataEvento);
    const text = [
      evento.usuarioLogin,
      evento.perfil,
      evento.modulo,
      evento.acao,
      evento.descricao,
      evento.registroId,
      getAuditUserBranch(evento),
    ].join(" ").toLowerCase();

    if (auditFilter.busca && !text.includes(auditFilter.busca.toLowerCase())) return false;
    if (auditFilter.modulo !== "TODOS" && evento.modulo !== auditFilter.modulo) return false;
    if (auditFilter.acao !== "TODOS" && evento.acao !== auditFilter.acao) return false;
    if (auditFilter.inicio && eventKey < auditFilter.inicio) return false;
    if (auditFilter.fim && eventKey > auditFilter.fim) return false;
    return true;
  });

  const auditPageSize = 10;
  const auditTotalPages = Math.max(Math.ceil(filteredAudit.length / auditPageSize), 1);
  const currentAuditPage = Math.min(auditPage, auditTotalPages - 1);
  const pagedAudit = filteredAudit.slice(
    currentAuditPage * auditPageSize,
    currentAuditPage * auditPageSize + auditPageSize,
  );

  const auditRows = filteredAudit.map((evento) => ({
    data: evento.dataEvento ? new Date(evento.dataEvento).toLocaleString("pt-BR") : "-",
    horario: evento.dataEvento ? formatDateTime(evento.dataEvento) : "-",
    usuario: evento.usuarioLogin || "-",
    quemExcluiu: getAuditCategory(evento) === "EXCLUSAO" ? getAuditActor(evento) : "-",
    ator: getAuditActor(evento),
    perfil: evento.perfil || "-",
    filial: getAuditUserBranch(evento),
    modulo: evento.modulo || "-",
    acao: evento.acao || "-",
    descricao: evento.descricao || "-",
    categoria: getAuditCategory(evento),
    entidade: getAuditTarget(evento).entity,
    registroId: getAuditTarget(evento).id,
    registroNome: getAuditTarget(evento).name,
    rota: evento.rota || "-",
  }));

  const criticalAuditEvents = filteredAudit.filter((evento) => hasSensitiveAuditKeyword(evento));
  const auditModuleSummary = Array.from(
    filteredAudit.reduce((map, evento) => {
      const key = evento.modulo || "Sem módulo";
      const current = map.get(key) || { modulo: key, eventos: 0, criticos: 0 };
      current.eventos += 1;
      current.criticos += hasSensitiveAuditKeyword(evento) ? 1 : 0;
      map.set(key, current);
      return map;
    }, new Map()).values(),
  ).sort((a, b) => b.criticos - a.criticos || b.eventos - a.eventos);

  const auditModuleRows = auditModuleSummary.map((item) => ({
    Modulo: item.modulo,
    Eventos: formatNumber(item.eventos),
    Criticos: formatNumber(item.criticos),
    Participacao: filteredAudit.length > 0 ? `${formatPercent((item.eventos / filteredAudit.length) * 100)}%` : "0%",
  }));

  const auditEntitySummary = Array.from(
    filteredAudit.reduce((map, evento) => {
      const key = `${evento.modulo || "Sem módulo"}:${evento.registroId || "Sem registro"}`;
      const current = map.get(key) || {
        key,
        modulo: evento.modulo || "Sem módulo",
        registroId: evento.registroId || "Sem registro",
        eventos: 0,
        criticos: 0,
        usuarios: new Set(),
        ultimaData: null,
        ultimaAcao: "",
      };
      current.eventos += 1;
      current.criticos += hasSensitiveAuditKeyword(evento) ? 1 : 0;
      if (evento.usuarioLogin) current.usuarios.add(evento.usuarioLogin);
      if (!current.ultimaData || new Date(evento.dataEvento || 0).getTime() > new Date(current.ultimaData || 0).getTime()) {
        current.ultimaData = evento.dataEvento;
        current.ultimaAcao = evento.acao || "-";
      }
      map.set(key, current);
      return map;
    }, new Map()).values(),
  ).sort((a, b) => b.criticos - a.criticos || new Date(b.ultimaData || 0).getTime() - new Date(a.ultimaData || 0).getTime());

  const auditEntityRows = auditEntitySummary.map((item) => ({
    Modulo: item.modulo,
    Entidade: item.registroId,
    Eventos: formatNumber(item.eventos),
    Criticos: formatNumber(item.criticos),
    Usuarios: Array.from(item.usuarios).join(", ") || "-",
    "Última ação": item.ultimaAcao,
    "Última data": item.ultimaData ? formatDateTime(item.ultimaData) : "-",
  }));

  return {
    auditActions,
    auditEntityRows,
    auditEntitySummary,
    auditModuleRows,
    auditModuleSummary,
    auditModules,
    auditRows,
    auditTotalPages,
    criticalAuditEvents,
    currentAuditPage,
    filteredAudit,
    getAuditUserBranch,
    pagedAudit,
  };
}
