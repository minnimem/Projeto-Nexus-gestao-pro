import { api } from "./api.js";
import { hasValidSession } from "./authSession.js";

const SESSION_KEY = "nexus.session";
const TOKEN_KEY = "nexus.token";

export function clearLegacyAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
}

export async function login({ login, senha }) {
  const session = await api.post("/auth/login", { login, senha });

  clearLegacyAuth();
  sessionStorage.setItem(TOKEN_KEY, session.token);
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));

  return session;
}

export function logout() {
  clearLegacyAuth();
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

export function getSession() {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    const session = JSON.parse(raw);
    if (!hasValidSession(session)) {
      logout();
      return null;
    }
    return session;
  } catch {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function isAuthenticated() {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw || !sessionStorage.getItem(TOKEN_KEY)) return false;

  try {
    const session = JSON.parse(raw);
    if (!hasValidSession(session)) {
      logout();
      return false;
    }
    return true;
  } catch {
    logout();
    return false;
  }
}

export { getJwtPayload, hasValidSession, isTokenExpired, isUserInactive } from "./authSession.js";
