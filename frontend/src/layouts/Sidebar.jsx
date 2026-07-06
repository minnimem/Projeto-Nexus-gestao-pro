import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { formatNumber } from "../utils/formatters";
import "./Sidebar.css";

export function Sidebar({
  active,
  collapsed,
  financeCriticalCount,
  modules,
  onActivate,
  onToggle,
}) {
  return (
    <aside className="sidebar">
      <div className="brand mini">
        <span>N</span>
        <div>
          <strong>Nexus One</strong>
          <small>Gestão Pro</small>
        </div>
        <button
          className="sidebar-collapse-button"
          onClick={onToggle}
          title={collapsed ? "Expandir menu" : "Recolher menu"}
          type="button"
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      <nav>
        {modules.map((item) => {
          const Icon = item.icon;
          const hasFinanceAlert = item.value === "financeiro" && financeCriticalCount > 0;

          return (
            <button
              className={`${active === item.value ? "active" : ""}${hasFinanceAlert ? " has-alert" : ""}`}
              key={item.value}
              onClick={() => onActivate(item.value)}
              title={collapsed ? item.label : undefined}
              type="button"
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {hasFinanceAlert && (
                <strong className="menu-alert-badge">{formatNumber(financeCriticalCount)}</strong>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-signal">
        <span>Suite operacional</span>
        <strong>ERP + PDV</strong>
        <small>Fiscal, estoque, caixa e financeiro no mesmo painel.</small>
      </div>
    </aside>
  );
}
