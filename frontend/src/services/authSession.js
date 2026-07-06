function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return atob(padded);
}

export function getJwtPayload(token) {
  if (!token || typeof token !== "string") return null;
  const [, payload] = token.split(".");
  if (!payload) return null;

  try {
    return JSON.parse(decodeBase64Url(payload));
  } catch {
    return null;
  }
}

export function isTokenExpired(token, nowMs = Date.now()) {
  const payload = getJwtPayload(token);
  if (!payload?.exp) return false;
  return Number(payload.exp) * 1000 <= nowMs;
}

export function isUserInactive(session) {
  const status = String(session?.status || "").trim().toUpperCase();

  return (
    session?.ativo === false ||
    session?.bloqueado === true ||
    status === "INATIVO" ||
    status === "BLOQUEADO" ||
    status === "SUSPENSO"
  );
}

export function hasValidSession(session, nowMs = Date.now()) {
  return Boolean(session?.token && !isTokenExpired(session.token, nowMs) && !isUserInactive(session));
}
