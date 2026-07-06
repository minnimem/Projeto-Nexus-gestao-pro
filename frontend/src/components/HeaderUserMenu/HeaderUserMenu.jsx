import { LogOut } from "lucide-react";
import "./HeaderUserMenu.css";

export function HeaderUserMenu({
  activeModule,
  onLogout,
  session,
  setShowUserMenu,
  showUserMenu,
  userMenuRef,
}) {
  const userName = session.usuario || session.login;
  const initial = String(userName || "A").slice(0, 1).toUpperCase();

  return (
    <div className="user-menu-wrapper" ref={userMenuRef}>
      <button className="user-pill" onClick={() => setShowUserMenu((current) => !current)} type="button">
        <span className="user-avatar">{initial}</span>
        <div>
          <strong>{userName}</strong>
          <span>{session.perfil}</span>
        </div>
      </button>
      {showUserMenu && (
        <div className="user-menu">
          <div className="user-menu-head">
            <span className="user-avatar">{initial}</span>
            <div>
              <strong>{userName}</strong>
              <small>{session.perfil}</small>
            </div>
          </div>
          <div className="user-menu-meta">
            <span>Empresa</span>
            <strong>#{session.empresaId || "-"}</strong>
            <span>Plano</span>
            <strong>{session.plano.planoComercial || "STARTER"} / {session.plano.statusAssinatura || "TESTE"}</strong>
            <span>Módulo atual</span>
            <strong>{activeModule.label || "-"}</strong>
          </div>
          <button onClick={onLogout} type="button">
            <LogOut size={15} />
            Sair do sistema
          </button>
        </div>
      )}
    </div>
  );
}
