import assert from "node:assert/strict";
import test from "node:test";

import { getJwtPayload, hasValidSession, isTokenExpired, isUserInactive } from "../services/authSession.js";
import { resolvePrivateRoute } from "./routeGuards.js";

function createJwt(payload) {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.`;
}

test("resolvePrivateRoute retorna fallback quando nao ha sessao", () => {
  assert.equal(resolvePrivateRoute(null, "dashboard", "login"), "login");
});

test("resolvePrivateRoute retorna conteudo protegido quando ha sessao", () => {
  const token = createJwt({ exp: Math.floor(Date.now() / 1000) + 60 });
  assert.equal(resolvePrivateRoute({ token }, "dashboard", "login"), "dashboard");
});

test("resolvePrivateRoute usa fallback nulo por padrao", () => {
  assert.equal(resolvePrivateRoute(undefined, "dashboard"), null);
});

test("resolvePrivateRoute bloqueia sessao com token expirado", () => {
  const token = createJwt({ exp: Math.floor(Date.now() / 1000) - 60 });
  assert.equal(resolvePrivateRoute({ token }, "dashboard", "login"), "login");
});

test("getJwtPayload le payload JWT base64url", () => {
  const token = createJwt({ sub: "admin", exp: 2_000 });
  assert.deepEqual(getJwtPayload(token), { sub: "admin", exp: 2_000 });
});

test("isTokenExpired respeita exp em segundos", () => {
  assert.equal(isTokenExpired(createJwt({ exp: 10 }), 9_999), false);
  assert.equal(isTokenExpired(createJwt({ exp: 10 }), 10_000), true);
});

test("hasValidSession exige token nao expirado", () => {
  assert.equal(hasValidSession(null), false);
  assert.equal(hasValidSession({ token: createJwt({ exp: 10 }) }, 9_999), true);
  assert.equal(hasValidSession({ token: createJwt({ exp: 10 }) }, 10_000), false);
});

test("hasValidSession bloqueia usuario inativo ou bloqueado", () => {
  const token = createJwt({ exp: Math.floor(Date.now() / 1000) + 60 });

  assert.equal(isUserInactive({ ativo: false }), true);
  assert.equal(isUserInactive({ bloqueado: true }), true);
  assert.equal(isUserInactive({ status: "INATIVO" }), true);
  assert.equal(hasValidSession({ token, ativo: false }), false);
  assert.equal(resolvePrivateRoute({ token, status: "BLOQUEADO" }, "dashboard", "login"), "login");
});
