import { userPermissionActions, userPermissionModules } from "../../../constants/admin.js";
import { asList, formatDateTime, formatNumber } from "../../../utils/formatters.js";
import { canAccessModule, canPerform, normalizePerfil } from "../../../utils/permissions.js";
import {
  getCollaboratorDepartment,
  getCollaboratorShift,
  getCollaboratorWorkStatus,
} from "./collaboratorViewModel.js";

export function buildCollaboratorGovernanceViewModel({
  auditoria,
  filteredUsers,
  getUserBranchLabel,
  usuarios,
}) {
  const usersWithManualPermissions = usuarios.filter((usuario) =>
    asList(usuario.permissoesExtras).length > 0 || asList(usuario.permissoesBloqueadas).length > 0
  );
  const blockedPermissionUsers = usuarios.filter((usuario) => asList(usuario.permissoesBloqueadas).length > 0);
  const permissionCoverageCards = [
    {
      key: "modules",
      label: "Módulos por perfil",
      value: `${formatNumber(userPermissionModules.length)} módulos`,
      detail: "Base de acesso operacional",
      tone: "success",
    },
    {
      key: "actions",
      label: "Ações sensíveis",
      value: `${formatNumber(userPermissionActions.length)} ações`,
      detail: "Financeiro, rotas, lucro e follow-up",
      tone: "info",
    },
    {
      key: "manual",
      label: "Permissões manuais",
      value: formatNumber(usersWithManualPermissions.length),
      detail: "Liberações ou bloqueios fora do perfil",
      tone: usersWithManualPermissions.length > 0 ? "warning" : "success",
    },
    {
      key: "blocked",
      label: "Bloqueios ativos",
      value: formatNumber(blockedPermissionUsers.length),
      detail: "Usuários com restrição manual",
      tone: blockedPermissionUsers.length > 0 ? "danger" : "success",
    },
  ];
  const permissionCoverageRows = usuarios.map((usuario) => {
    const allowedModules = userPermissionModules.filter((module) => canAccessModule(usuario, module.value));
    const allowedActions = userPermissionActions.filter((action) => canPerform(usuario, action.key));
    return {
      Colaborador: usuario.nome || usuario.login || "-",
      Perfil: usuario.perfil || "-",
      Filial: getUserBranchLabel(usuario),
      "Módulos liberados": allowedModules.map((module) => module.label).join(", ") || "-",
      "Ações liberadas": allowedActions.map((action) => action.label).join(", ") || "-",
      "Liberações manuais": asList(usuario.permissoesExtras).join(", ") || "-",
      "Bloqueios manuais": asList(usuario.permissoesBloqueadas).join(", ") || "-",
    };
  });
  const permissionProfileRows = Array.from(
    usuarios.reduce((map, usuario) => {
      const perfil = normalizePerfil(usuario.perfil) || "SEM PERFIL";
      const current = map.get(perfil) || { perfil, total: 0, modulos: new Set(), acoes: new Set(), manuais: 0 };
      current.total += 1;
      userPermissionModules
        .filter((module) => canAccessModule(usuario, module.value))
        .forEach((module) => current.modulos.add(module.label));
      userPermissionActions
        .filter((action) => canPerform(usuario, action.key))
        .forEach((action) => current.acoes.add(action.label));
      current.manuais += asList(usuario.permissoesExtras).length + asList(usuario.permissoesBloqueadas).length;
      map.set(perfil, current);
      return map;
    }, new Map()).values(),
  ).sort((a, b) => b.total - a.total);
  const auditByLogin = auditoria.reduce((map, evento) => {
    const login = String(evento.usuarioLogin || "").toLowerCase();
    if (!login) return map;
    const current = map.get(login) || [];
    current.push(evento);
    map.set(login, current);
    return map;
  }, new Map());
  const sensitiveAuditKeywords = ["LOGIN", "ACESSO", "PERMIS", "BLOQUE", "CANCEL", "ESTORN", "FINANCEIRO", "FISCAL", "EXCLU", "DELETE"];
  const userAuditSummary = usuarios.map((usuario) => {
    const events = [...(auditByLogin.get(String(usuario.login || "").toLowerCase()) || [])]
      .sort((a, b) => new Date(b.dataEvento || 0).getTime() - new Date(a.dataEvento || 0).getTime());
    const lastEvent = events[0];
    const sensitiveEvents = events.filter((evento) => {
      const text = [evento.modulo, evento.acao, evento.descricao].join(" ").toUpperCase();
      return sensitiveAuditKeywords.some((keyword) => text.includes(keyword));
    });
    return {
      usuario,
      events,
      lastEvent,
      sensitiveEvents,
      tone: sensitiveEvents.length > 0 ? "warning" : events.length > 0 ? "success" : "danger",
    };
  });
  const usersWithoutAudit = userAuditSummary.filter((row) => row.events.length === 0);
  const recentSensitiveAudit = userAuditSummary
    .flatMap((row) => row.sensitiveEvents.slice(0, 3).map((evento) => ({ evento, usuario: row.usuario })))
    .sort((a, b) => new Date(b.evento.dataEvento || 0).getTime() - new Date(a.evento.dataEvento || 0).getTime())
    .slice(0, 5);
  const collaboratorAuditRows = userAuditSummary.map((row) => ({
    Colaborador: row.usuario.nome || row.usuario.login || "-",
    Login: row.usuario.login || "-",
    Perfil: row.usuario.perfil || "-",
    Filial: getUserBranchLabel(row.usuario),
    "Último evento": row.lastEvent?.dataEvento ? formatDateTime(row.lastEvent.dataEvento) : "-",
    "Última ação": row.lastEvent?.acao || "-",
    Modulo: row.lastEvent?.modulo || "-",
    "Eventos sensíveis": formatNumber(row.sensitiveEvents.length),
    IP: row.lastEvent?.ip || row.lastEvent?.enderecoIp || "-",
  }));
  const collaboratorIssueRows = filteredUsers.map((usuario) => {
    const auditSummary = userAuditSummary.find((row) => String(row.usuario.login || "").toLowerCase() === String(usuario.login || "").toLowerCase());
    const workStatus = getCollaboratorWorkStatus(usuario);
    const issues = [
      normalizePerfil(usuario.perfil) !== "ADMIN" && !usuario.filialId && "Sem filial",
      !usuario.cargo && "Cargo pendente",
      getCollaboratorDepartment(usuario) === "Sem setor" && "Setor pendente",
      getCollaboratorShift(usuario) === "Comercial" && "Jornada padrão",
      (usuario.bloqueado || usuario.ativo === false) && "Acesso inativo/bloqueado",
      workStatus.key !== "ATIVO" && `Vinculo ${workStatus.label}`,
      !auditSummary.lastEvent && "Sem auditoria recente",
      asList(usuario.permissoesExtras).length > 0 && "Liberação manual",
      asList(usuario.permissoesBloqueadas).length > 0 && "Bloqueio manual",
    ].filter(Boolean);
    const severity = issues.some((issue) => /bloqueado|inativo|desligado|sem auditoria/i.test(issue)) ?
      "danger"
      : issues.some((issue) => /sem filial|cargo|setor|manual/i.test(issue)) ?
        "warning"
        : issues.length > 0 ?
          "info"
          : "success";
    const action = issues.length === 0 ?
      "Manter cadastro revisado"
      : issues.includes("Sem filial") ?
        "Vincular filial"
        : issues.includes("Cargo pendente") || issues.includes("Setor pendente") ?
          "Completar cadastro RH"
          : issues.includes("Sem auditoria recente") ?
            "Confirmar acesso/login"
            : "Revisar permissão ou vínculo";
    return {
      usuario,
      issues,
      severity,
      action,
      workStatus,
      lastEvent: auditSummary?.lastEvent,
    };
  }).sort((a, b) => {
    const severityWeight = { danger: 0, warning: 1, info: 2, success: 3 };
    return severityWeight[a.severity] - severityWeight[b.severity] || b.issues.length - a.issues.length;
  });
  const collaboratorIssueExportRows = collaboratorIssueRows.map((row) => ({
    Colaborador: row.usuario.nome || row.usuario.login || "-",
    Login: row.usuario.login || "-",
    Perfil: row.usuario.perfil || "-",
    Filial: getUserBranchLabel(row.usuario),
    Cargo: row.usuario.cargo || "-",
    Setor: getCollaboratorDepartment(row.usuario),
    Jornada: getCollaboratorShift(row.usuario),
    Vinculo: row.workStatus.label,
    Pendencias: row.issues.join(", ") || "Sem pendências",
    Acao: row.action,
    Severidade: row.severity,
    "Última auditoria": row.lastEvent?.dataEvento ? formatDateTime(row.lastEvent.dataEvento) : "-",
  }));
  const criticalCollaboratorIssues = collaboratorIssueRows.filter((row) => row.severity === "danger");
  const warningCollaboratorIssues = collaboratorIssueRows.filter((row) => row.severity === "warning");


  return {
    collaboratorAuditRows,
    collaboratorIssueExportRows,
    collaboratorIssueRows,
    criticalCollaboratorIssues,
    permissionCoverageCards,
    permissionCoverageRows,
    permissionProfileRows,
    recentSensitiveAudit,
    userAuditSummary,
    usersWithoutAudit,
    warningCollaboratorIssues,
  };
}
