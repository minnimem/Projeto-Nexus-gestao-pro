import assert from "node:assert/strict";
import test from "node:test";

import {
  actionPermissionKey,
  canAccessModule,
  canPerform,
  getAccessibleModules,
  isAdminPerfil,
  isMasterPerfil,
  isPrivilegedPerfil,
  modulePermissionKey,
  normalizePerfil,
} from "./permissions.js";

test("normaliza perfis vindos do backend e identifica privilegios", () => {
  assert.equal(normalizePerfil("ROLE_ADMIN"), "ADMIN");
  assert.equal(normalizePerfil(" vendedor "), "VENDEDOR");
  assert.equal(isAdminPerfil("ROLE_ADMIN"), true);
  assert.equal(isMasterPerfil("MASTER"), true);
  assert.equal(isPrivilegedPerfil("GERENTE"), false);
});

test("bloqueia telas sensiveis para perfis sem permissao", () => {
  assert.equal(canAccessModule("VENDEDOR", "financeiro"), false);
  assert.equal(canAccessModule("VENDEDOR", "colaboradores"), false);
  assert.equal(canAccessModule("GERENTE", "financeiro"), true);
  assert.equal(canAccessModule("ADMIN", "usuarios"), true);
});

test("respeita permissoes extras e bloqueadas por usuario", () => {
  const subject = {
    perfil: "VENDEDOR",
    permissoesExtras: [modulePermissionKey("financeiro"), actionPermissionKey("mutateFinance")],
    permissoesBloqueadas: [modulePermissionKey("clientes")],
    plano: { modulos: { financeiro: true, clientes: true } },
  };

  assert.equal(canAccessModule(subject, "financeiro"), true);
  assert.equal(canAccessModule(subject, "clientes"), false);
  assert.equal(canPerform(subject, "mutateFinance"), true);
});

test("bloqueia modulos nao liberados pelo plano", () => {
  const subject = {
    perfil: "ADMIN",
    permissoesExtras: [modulePermissionKey("financeiro")],
    plano: { modulos: { financeiro: false } },
  };

  assert.equal(canAccessModule(subject, "financeiro"), false);
});

test("valida acoes sensiveis por perfil", () => {
  assert.equal(canPerform("VENDEDOR", "reverseFinance"), false);
  assert.equal(canPerform("FINANCEIRO", "mutateFinance"), true);
  assert.equal(canPerform("ADMIN", "reverseFinance"), true);
  assert.equal(canPerform("MASTER", "managePlans"), true);
  assert.equal(canPerform("ADMIN", "managePlans"), false);
});

test("nao quebra com plano ausente, modulo desconhecido ou acao desconhecida", () => {
  assert.equal(canAccessModule({ perfil: "ADMIN" }, "overview"), true);
  assert.equal(canAccessModule({ perfil: "ADMIN" }, "modulo-inexistente"), false);
  assert.equal(canPerform({ perfil: "ADMIN" }, "acao-inexistente"), false);
});

test("lista apenas modulos acessiveis para o perfil", () => {
  const values = getAccessibleModules("MASTER").map((module) => module.value);

  assert.deepEqual(values, ["empresas", "usuarios"]);
});
