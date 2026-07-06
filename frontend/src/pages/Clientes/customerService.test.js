import assert from "node:assert/strict";
import test from "node:test";

import { customerService } from "./services/customerService.js";

function mockJsonResponse(data, ok = true) {
  return {
    ok,
    headers: new Headers({ "content-type": "application/json" }),
    json: async () => data,
    text: async () => JSON.stringify(data),
  };
}

test("cliente service lista, cria, edita e exclui clientes", async () => {
  const calls = [];
  globalThis.sessionStorage = { getItem: () => null };
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url, method: options.method || "GET", body: options.body ? JSON.parse(options.body) : null });
    return mockJsonResponse({ ok: true });
  };

  await customerService.list();
  await customerService.create({ nome: "Maria", cpf: "12345678901" });
  await customerService.update("c1", { nome: "Maria Silva" });
  await customerService.remove("c1");

  assert.deepEqual(calls, [
    { url: "http://localhost:8081/clientes", method: "GET", body: null },
    { url: "http://localhost:8081/clientes", method: "POST", body: { nome: "Maria", cpf: "12345678901" } },
    { url: "http://localhost:8081/clientes/c1", method: "PUT", body: { nome: "Maria Silva" } },
    { url: "http://localhost:8081/clientes/c1", method: "DELETE", body: null },
  ]);
});
