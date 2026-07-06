import { resolvePrivateRoute } from "./routeGuards";

export function PrivateRoute({ session, fallback = null, children }) {
  return resolvePrivateRoute(session, children, fallback);
}
