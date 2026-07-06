import assert from "node:assert/strict";
import test from "node:test";

import { getSession, isAuthenticated, login, logout } from "./auth.js";

function createStorage() {
  const values = new Map();

  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    clear: () => values.clear(),
  };
}

function createJwt(payload) {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.`;
}

function mockJsonResponse(data, ok = true) {
  return {
    ok,
    headers: new Headers({ "content-type": "application/json" }),
    json: async () => data,
    text: async () => JSON.stringify(data),
  };
}

function resetAuthStorage() {
  globalThis.localStorage = createStorage();
  globalThis.sessionStorage = createStorage();
  globalThis.fetch = undefined;
}

test("login com usuario correto grava token e sessao", async () => {
  resetAuthStorage();
  const token = createJwt({ exp: Math.floor(Date.now() / 1000) + 60 });
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "http://localhost:8081/auth/login");
    assert.equal(options.method, "POST");
    assert.deepEqual(JSON.parse(options.body), { login: "admin", senha: "senha-correta" });

    return mockJsonResponse({
      token,
      usuario: "Admin",
      login: "admin",
      perfil: "ADMIN",
      ativo: true,
    });
  };

  const session = await login({ login: "admin", senha: "senha-correta" });

  assert.equal(session.token, token);
  assert.equal(sessionStorage.getItem("nexus.token"), token);
  assert.equal(JSON.parse(sessionStorage.getItem("nexus.session")).perfil, "ADMIN");
  assert.equal(isAuthenticated(), true);
  assert.equal(getSession().login, "admin");
});

test("login com senha errada propaga erro e nao grava sessao", async () => {
  resetAuthStorage();
  globalThis.fetch = async () => mockJsonResponse({ mensagem: "Login ou senha inválidos" }, false);

  await assert.rejects(
    () => login({ login: "admin", senha: "errada" }),
    /Login ou senha inválidos/,
  );

  assert.equal(sessionStorage.getItem("nexus.token"), null);
  assert.equal(sessionStorage.getItem("nexus.session"), null);
  assert.equal(isAuthenticated(), false);
});

test("logout limpa sessao atual e residuos antigos", () => {
  resetAuthStorage();
  sessionStorage.setItem("nexus.token", "token");
  sessionStorage.setItem("nexus.session", JSON.stringify({ token: "token" }));
  localStorage.setItem("nexus.token", "legacy-token");
  localStorage.setItem("nexus.session", "{}");

  logout();

  assert.equal(sessionStorage.getItem("nexus.token"), null);
  assert.equal(sessionStorage.getItem("nexus.session"), null);
  assert.equal(localStorage.getItem("nexus.token"), null);
  assert.equal(localStorage.getItem("nexus.session"), null);
});

test("getSession descarta sessao expirada ou inativa", () => {
  resetAuthStorage();
  const expiredToken = createJwt({ exp: Math.floor(Date.now() / 1000) - 60 });
  sessionStorage.setItem("nexus.token", expiredToken);
  sessionStorage.setItem("nexus.session", JSON.stringify({ token: expiredToken }));

  assert.equal(getSession(), null);
  assert.equal(isAuthenticated(), false);

  const validToken = createJwt({ exp: Math.floor(Date.now() / 1000) + 60 });
  sessionStorage.setItem("nexus.token", validToken);
  sessionStorage.setItem("nexus.session", JSON.stringify({ token: validToken, ativo: false }));

  assert.equal(getSession(), null);
  assert.equal(isAuthenticated(), false);
});
