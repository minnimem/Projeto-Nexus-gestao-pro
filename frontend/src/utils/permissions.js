import { modules } from "../constants/modules.js";

const moduleAccess = {
  overview: ["ADMIN", "GERENTE", "VENDEDOR", "OPERADOR_CAIXA", "ESTOQUISTA", "FINANCEIRO"],
  pedidos: ["ADMIN", "GERENTE", "VENDEDOR"],
  caixa: ["ADMIN", "GERENTE", "OPERADOR_CAIXA"],
  clientes: ["ADMIN", "GERENTE", "VENDEDOR"],
  servicos: ["ADMIN", "GERENTE", "VENDEDOR"],
  produtos: ["ADMIN", "GERENTE", "VENDEDOR", "ESTOQUISTA"],
  financeiro: ["ADMIN", "GERENTE", "FINANCEIRO"],
  logistica: ["ADMIN", "GERENTE", "ESTOQUISTA"],
  colaboradores: ["ADMIN", "GERENTE"],
  relatorios: ["ADMIN", "GERENTE", "VENDEDOR", "ESTOQUISTA", "FINANCEIRO"],
  empresas: ["MASTER"],
  usuarios: ["ADMIN", "MASTER"],
};

const actionAccess = {
  manageCollaborators: ["ADMIN"],
  editRoute: ["ADMIN", "GERENTE", "ESTOQUISTA"],
  printRoute: ["ADMIN", "GERENTE", "ESTOQUISTA"],
  mutateFinance: ["ADMIN", "GERENTE", "FINANCEIRO"],
  reverseFinance: ["ADMIN"],
  seeProfit: ["ADMIN", "GERENTE", "FINANCEIRO"],
  operateCash: ["ADMIN", "GERENTE", "OPERADOR_CAIXA"],
  manageCommercialFollowUp: ["ADMIN", "GERENTE", "VENDEDOR"],
  exportJson: ["ADMIN"],
  managePlans: [],
};

function list(value) {
  return Array.isArray(value) ? value : [];
}

export function normalizePerfil(perfil) {
  return String(perfil || "").replace("ROLE_", "").trim().toUpperCase();
}

export function isMasterPerfil(perfil) {
  return normalizePerfil(perfil) === "MASTER";
}

export function isAdminPerfil(perfil) {
  return normalizePerfil(perfil) === "ADMIN";
}

export function isPrivilegedPerfil(perfil) {
  return isAdminPerfil(perfil) || isMasterPerfil(perfil);
}

function getPermissionLists(subject) {
  if (subject && typeof subject === "object") {
    return {
      extras: new Set(list(subject.permissoesExtras)),
      blocked: new Set(list(subject.permissoesBloqueadas)),
      perfil: normalizePerfil(subject.perfil),
    };
  }

  return { extras: new Set(), blocked: new Set(), perfil: normalizePerfil(subject) };
}

export function modulePermissionKey(moduleValue) {
  return `module:${moduleValue}`;
}

export function actionPermissionKey(action) {
  return `action:${action}`;
}

function planModuleKey(moduleValue) {
  if (moduleValue === "pedidos") return "vendas";
  if (moduleValue === "produtos") return "estoque";
  if (moduleValue === "colaboradores") return "usuarios";
  return moduleValue;
}

function planAllowsModule(subject, moduleValue) {
  if (!subject || typeof subject !== "object") return true;
  const planModules = subject.plano?.modulos;
  if (!planModules || typeof planModules !== "object") return true;
  return planModules[planModuleKey(moduleValue)] !== false;
}

export function canAccessModule(subject, moduleValue) {
  if (!moduleAccess[moduleValue]) return false;

  const { extras, blocked, perfil } = getPermissionLists(subject);
  const permissionKey = modulePermissionKey(moduleValue);

  if (isMasterPerfil(perfil)) return ["usuarios", "empresas"].includes(moduleValue);
  if (blocked.has(permissionKey) || !planAllowsModule(subject, moduleValue)) return false;
  if (moduleValue === "caixa") return ["ADMIN", "GERENTE", "OPERADOR_CAIXA"].includes(perfil);
  if (extras.has(permissionKey)) return true;
  return moduleAccess[moduleValue].includes(perfil);
}

export function getAccessibleModules(subject) {
  return modules.filter((module) => canAccessModule(subject, module.value));
}

export function canPerform(subject, action) {
  if (!actionAccess[action]) return false;

  const { extras, blocked, perfil } = getPermissionLists(subject);
  const permissionKey = actionPermissionKey(action);

  if (isMasterPerfil(perfil)) return action === "managePlans";
  if (action === "managePlans") return false;
  if (blocked.has(permissionKey)) return false;
  if (action === "operateCash") return ["ADMIN", "GERENTE", "OPERADOR_CAIXA"].includes(perfil);
  if (extras.has(permissionKey)) return true;
  return actionAccess[action].includes(perfil);
}
