import { hasValidSession } from "../services/authSession.js";

export function resolvePrivateRoute(session, children, fallback = null) {
  return hasValidSession(session) ? children : fallback;
}
