import assert from "node:assert/strict";
import test from "node:test";

import { loadDashboardSnapshot } from "./dashboardRefreshService.js";

test("atualizacao manual carrega modulo ativo e contador financeiro", async () => {
  const calls = [];
  const fixedDate = new Date("2026-07-05T10:30:00");

  const snapshot = await loadDashboardSnapshot({
    active: "overview",
    session: { perfil: "ADMIN" },
    now: () => fixedDate,
    loadModuleData: async (active, session) => {
      calls.push(["module", active, session.perfil]);
      return { vendas: { totalVendas: 2 } };
    },
    loadCriticalCount: async (session) => {
      calls.push(["critical", session.perfil]);
      return 3;
    },
  });

  assert.deepEqual(calls, [
    ["module", "overview", "ADMIN"],
    ["critical", "ADMIN"],
  ]);
  assert.deepEqual(snapshot.data, { vendas: { totalVendas: 2 } });
  assert.equal(snapshot.financeCriticalCount, 3);
  assert.equal(snapshot.lastUpdatedAt, fixedDate);
  assert.equal(snapshot.status, "success");
});

test("atualizacao manual propaga erro de carregamento para o hook tratar", async () => {
  await assert.rejects(
    () => loadDashboardSnapshot({
      active: "financeiro",
      session: { perfil: "ADMIN" },
      loadModuleData: async () => {
        throw new Error("Falha ao carregar módulo");
      },
      loadCriticalCount: async () => 0,
    }),
    /Falha ao carregar módulo/,
  );
});
