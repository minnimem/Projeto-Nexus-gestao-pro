import { api } from "./api";

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
    return JSON.parse(raw);
  } catch {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(sessionStorage.getItem(TOKEN_KEY) && sessionStorage.getItem(SESSION_KEY));
}
