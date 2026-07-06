import { statusLabelByValue, statusToneByValue } from "../../constants/status";
import { normalizeStatus } from "../common/StatusUi";
import "./StatusBadge.css";

export function StatusBadge({ status, label }) {
  const normalized = normalizeStatus(status);
  const tone = statusToneByValue[normalized] || "neutral";
  return (
    <span className={`status-badge status-badge-${tone}`}>
      {label || statusLabelByValue[normalized] || status || "-"}
    </span>
  );
}

