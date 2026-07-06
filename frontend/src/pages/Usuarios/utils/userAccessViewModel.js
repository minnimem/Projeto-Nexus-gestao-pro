import { userPermissionActions } from "../../../constants/admin";
import { modules } from "../../../constants/modules";
import {
  canAccessModule,
  canPerform,
  isAdminPerfil,
  isPrivilegedPerfil,
} from "../../../utils/permissions";
import { asList, formatNumber } from "../../../utils/formatters";
import { permissionProfiles } from "../constants/permissionGovernance";

export function buildUserAccessViewModel({
  usuarios,
  filiais,
  userBranchFilter,
  userProfileFilter,
  criticalAuditEventsCount,
}) {
  const ativos = usuarios.filter((usuario) => usuario.ativo !== false).length;
  const admins = usuarios.filter((usuario) => isAdminPerfil(usuario.perfil)).length;
  const bloqueados = usuarios.filter((usuario) => usuario.bloqueado).length;
  const usuariosSemFilial = usuarios.filter((usuario) =>
    !isPrivilegedPerfil(usuario.perfil) && !usuario.filialId
  ).length;
  const selectedUserBranchLabel = userBranchFilter === "TODAS" ?
    "Todas as filiais"
    : userBranchFilter === "EMPRESA" ?
      "Empresa / sem filial"
      : filiais.find((filial) => String(filial.id) === userBranchFilter).nome || "Filial";

  const filteredUsers = usuarios.filter((usuario) => {
    const matchesProfile = userProfileFilter === "TODOS" || usuario.perfil === userProfileFilter;
    const matchesBranch = userBranchFilter === "TODAS"
      || (userBranchFilter === "EMPRESA" ? !usuario.filialId : String(usuario.filialId || "") === userBranchFilter);
    return matchesProfile && matchesBranch;
  });

  const userBranchRows = [
    {
      id: "EMPRESA",
      nome: "Empresa / sem filial",
      total: usuarios.filter((usuario) => !usuario.filialId).length,
      ativos: usuarios.filter((usuario) => !usuario.filialId && usuario.ativo !== false && !usuario.bloqueado).length,
    },
    ...filiais.map((filial) => ({
      id: filial.id,
      nome: filial.nome,
      total: usuarios.filter((usuario) => String(usuario.filialId || "") === String(filial.id)).length,
      ativos: usuarios.filter((usuario) =>
        String(usuario.filialId || "") === String(filial.id) && usuario.ativo !== false && !usuario.bloqueado
      ).length,
    })),
  ];

  const modulePermissionRows = permissionProfiles.map((perfil) => ({
    perfil,
    modules: modules.map((module) => ({
      key: module.value,
      label: module.label,
      allowed: canAccessModule(perfil, module.value),
    })),
  }));

  const permissionMatrixRows = permissionProfiles.map((perfil) => {
    const row = { Perfil: perfil };
    modules.forEach((module) => {
      row[module.label] = canAccessModule(perfil, module.value) ? "Liberado" : "Bloqueado";
    });
    userPermissionActions.forEach((action) => {
      row[action.label] = canPerform(perfil, action.key) ? "Liberado" : "Bloqueado";
    });
    return row;
  });

  const usersWithManualPermissions = usuarios.filter((usuario) =>
    asList(usuario.permissoesExtras).length > 0 || asList(usuario.permissoesBloqueadas).length > 0
  );
  const manualPermissionRows = usersWithManualPermissions.map((usuario) => ({
    Usuario: usuario.login || usuario.nome || "-",
    Nome: usuario.nome || "-",
    Perfil: usuario.perfil || "-",
    Filial: usuario.filial || "Empresa / sem filial",
    Liberacoes: asList(usuario.permissoesExtras).join(", ") || "-",
    Bloqueios: asList(usuario.permissoesBloqueadas).join(", ") || "-",
  }));

  const permissionGovernancePlan = [
    admins === 0 && {
      key: "without-admin",
      severity: "danger",
      title: "Empresa sem administrador ativo",
      detail: "Crie ou libere um ADMIN antes de operar em produção.",
    },
    usersWithManualPermissions.length > 0 && {
      key: "manual-permissions",
      severity: "warning",
      title: "Permissões manuais em uso",
      detail: `${formatNumber(usersWithManualPermissions.length)} usuario(s) possuem liberacoes ou bloqueios fora do perfil padrão.`,
    },
    criticalAuditEventsCount > 0 && {
      key: "critical-audit",
      severity: "info",
      title: "Eventos sensíveis auditados",
      detail: `${formatNumber(criticalAuditEventsCount)} evento(s) critico(s) no filtro atual.`,
    },
    usuariosSemFilial > 0 && {
      key: "users-without-branch",
      severity: "warning",
      title: "Usuários sem filial",
      detail: `${formatNumber(usuariosSemFilial)} usuario(s) operacional(is) precisam de filial para rastreabilidade.`,
    },
  ].filter(Boolean);

  return {
    admins,
    ativos,
    bloqueados,
    filteredUsers,
    manualPermissionRows,
    modulePermissionRows,
    permissionGovernancePlan,
    permissionMatrixRows,
    selectedUserBranchLabel,
    userBranchRows,
    usersWithManualPermissions,
    usuariosSemFilial,
  };
}
