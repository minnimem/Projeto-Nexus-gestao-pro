import { actionPermissionKey, canPerform } from "../../../utils/permissions.js";
import { asList } from "../../../utils/formatters.js";
import { sensitivePermissionDefinitions } from "../constants/permissionGovernance.js";

function normalizeRisk(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function buildSensitivePermissionGovernance(usuarios, formatNumber) {
  const sensitivePermissionCards = sensitivePermissionDefinitions.map((permission) => {
    const risk = normalizeRisk(permission.risk);
    const allowedUsers = usuarios.filter((usuario) => canPerform(usuario, permission.key));
    const manualUsers = allowedUsers.filter((usuario) =>
      asList(usuario.permissoesExtras).includes(actionPermissionKey(permission.key))
      || asList(usuario.permissoesBloqueadas).includes(actionPermissionKey(permission.key))
    );

    return {
      ...permission,
      allowedUsers,
      manualUsers,
      tone: risk === "critico" && allowedUsers.length > 1
        ? "danger"
        : manualUsers.length > 0
          ? "warning"
          : "success",
    };
  });

  const sensitivePermissionRows = sensitivePermissionCards.map((permission) => ({
    Permissão: permission.label,
    Risco: permission.risk,
    Liberados: formatNumber(permission.allowedUsers.length),
    Usuários: permission.allowedUsers.map((usuario) => usuario.nome || usuario.login || "-").join(", ") || "-",
    "Ajustes manuais": formatNumber(permission.manualUsers.length),
  }));

  const sensitivePermissionHardening = sensitivePermissionCards.map((permission) => {
    const risk = normalizeRisk(permission.risk);
    const recommendedLimit = risk === "critico" ? 1 : risk === "alto" ? 3 : 6;
    const overLimit = permission.allowedUsers.length > recommendedLimit;
    const hasManualOverride = permission.manualUsers.length > 0;
    const hasBlockedUser = permission.allowedUsers.some((usuario) => usuario.bloqueado || usuario.ativo === false);
    const status = overLimit || hasBlockedUser ? "danger" : hasManualOverride ? "warning" : "success";
    const action = hasBlockedUser
      ? "Remover acesso de usuários inativos"
      : overLimit
        ? "Reduzir liberados ou exigir aprovação"
        : hasManualOverride
          ? "Revisar exceção manual"
          : "Manter política atual";

    return {
      ...permission,
      recommendedLimit,
      overLimit,
      hasManualOverride,
      hasBlockedUser,
      status,
      action,
    };
  });

  const sensitiveHardeningRows = sensitivePermissionHardening.map((permission) => ({
    Permissão: permission.label,
    Risco: permission.risk,
    Liberados: formatNumber(permission.allowedUsers.length),
    "Limite recomendado": formatNumber(permission.recommendedLimit),
    "Excede limite": permission.overLimit ? "Sim" : "Não",
    "Ajuste manual": permission.hasManualOverride ? "Sim" : "Não",
    "Usuário inativo liberado": permission.hasBlockedUser ? "Sim" : "Não",
    Ação: permission.action,
  }));

  return {
    sensitivePermissionCards,
    sensitivePermissionRows,
    sensitivePermissionHardening,
    sensitiveHardeningRows,
  };
}
