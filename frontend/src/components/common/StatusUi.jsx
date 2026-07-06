import { AlertTriangle, CheckCircle2, RefreshCw, Search } from "lucide-react";

export function normalizeStatus(status) {
  return String(status || "").trim().toUpperCase();
}


export function TableEmptyState({ colSpan, icon: Icon = Search, title, detail }) {
  return (
    <tr>
      <td className="empty-cell premium-empty-cell" colSpan={colSpan}>
        <div className="premium-empty-state">
          <span>
            <Icon size={18} />
          </span>
          <strong>{title}</strong>
          {detail && <small>{detail}</small>}
        </div>
      </td>
    </tr>
  );
}

export function AlertToneIcon({ tone }) {
  const Icon = tone === "success" ? CheckCircle2 : tone === "info" ? RefreshCw : AlertTriangle;
  return (
    <span className={`topbar-alert-tone-icon ${tone}`}>
      <Icon size={15} />
    </span>
  );
}
