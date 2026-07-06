import { moduleDescriptions } from "../../constants/modules";
import "./HeaderModuleSummary.css";

export function HeaderModuleSummary({ activeModule }) {
  return (
    <div className="header-module-summary">
      <span>Nexus One Command Center</span>
      <div className="breadcrumb-row">
        <strong>Nexus One</strong>
        <small>/</small>
        <strong>{activeModule.label || "Módulo"}</strong>
      </div>
      <h1>{activeModule.label}</h1>
      <p>{moduleDescriptions[activeModule.value] || "Gestão operacional integrada."}</p>
    </div>
  );
}
