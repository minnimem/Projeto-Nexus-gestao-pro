import { useState } from "react";
import { AppErrorBoundary } from "../components/common/AppErrorBoundary";
import { AuthLayout } from "../layouts/AuthLayout";
import { Dashboard } from "../pages/Dashboard/Dashboard";
import { Login } from "../pages/Login/Login";
import { clearLegacyAuth, getSession, isAuthenticated, logout } from "../services/auth";
import { PrivateRoute } from "./PrivateRoute";

export function AppRoutes() {
  const [session, setSession] = useState(() => {
    clearLegacyAuth();
    return isAuthenticated() ? getSession() : null;
  });

  function handleLogout() {
    logout();
    setSession(null);
  }

  const loginRoute = (
    <AuthLayout>
      <Login onLogin={setSession} />
    </AuthLayout>
  );

  return (
    <AppErrorBoundary>
      <PrivateRoute fallback={loginRoute} session={session}>
        <Dashboard onLogout={handleLogout} session={session} />
      </PrivateRoute>
    </AppErrorBoundary>
  );
}
