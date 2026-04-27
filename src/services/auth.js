import { api } from "./api";

const SESSION_KEY = "nexus.session";
const TOKEN_KEY = "nexus.token";

export async function login({ login, senha }) {
  const session = await api.post("/auth/login", { login, senha });

  localStorage.setItem(TOKEN_KEY, session.token);
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  return session;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
}

export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem(TOKEN_KEY));
}
