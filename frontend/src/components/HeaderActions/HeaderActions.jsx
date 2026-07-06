import { Download, LogOut, Moon, RefreshCw, Sun } from "lucide-react";
import { canPerform } from "../../utils/permissions";
import "./HeaderActions.css";

export function HeaderActions({
  exportActiveModule,
  refreshActiveModule,
  session,
  setThemeMode,
  status,
  themeMode,
}) {
  return (
    <>
      {canPerform(session, "exportJson") && (
        <button
          className="topbar-export-button"
          disabled={status !== "success"}
          onClick={exportActiveModule}
          type="button"
        >
          <Download size={15} />
          Exportar JSON
        </button>
      )}
      <button
        className="topbar-theme-button"
        onClick={() => setThemeMode((current) => (current === "dark" ? "light" : "dark"))}
        title={themeMode === "dark" ? "Usar tema claro" : "Usar tema black"}
        type="button"
      >
        {themeMode === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        {themeMode === "dark" ? "Light" : "Black"}
      </button>
      <button
        className="topbar-refresh-button"
        disabled={status === "loading"}
        onClick={refreshActiveModule}
        type="button"
      >
        <RefreshCw className={status === "loading" ? "spin" : ""} size={15} />
        Atualizar
      </button>
    </>
  );
}

export function HeaderLogoutAction({ onLogout }) {
  return (
    <button className="topbar-logout-button" onClick={onLogout} type="button">
      <LogOut size={15} />
      Sair
    </button>
  );
}
