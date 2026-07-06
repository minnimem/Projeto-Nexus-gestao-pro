import { Loader2 } from "lucide-react";
import { ActiveDashboardModule } from "./ActiveDashboardModule";
import "./DashboardModulePanel.css";

export function DashboardModulePanel({
  active,
  activeModule,
  data,
  error,
  onRefresh,
  periodPreset,
  periodRange,
  session,
  status,
}) {
  return (
    <section
      aria-busy={status === "loading"}
      className={active === "caixa" ? "content-card cash-register-content" : "content-card"}
    >
      {active !== "caixa" && (
        <div className="section-title">
          <div>
            <h2>Dashboard executivo</h2>
            <p>Dados reais do Spring Boot em http://localhost:8081</p>
          </div>
          <span className={`status ${status}`}>{status}</span>
        </div>
      )}

      {status === "loading" && (
        <div className="loading-state" role="status" aria-live="polite">
          <Loader2 className="spin" />
          Buscando dados reais da API...
        </div>
      )}

      {status === "error" && (
        <div className="error-box" role="alert">
          {error}
          <small>
            Confirme se o Spring Boot está rodando na porta 8081 e se o usuário possui permissão para este endpoint.
          </small>
        </div>
      )}

      {status === "success" && (
        <ActiveDashboardModule
          active={active}
          activeModule={activeModule}
          data={data}
          onRefresh={onRefresh}
          periodPreset={periodPreset}
          periodRange={periodRange}
          session={session}
        />
      )}
    </section>
  );
}
