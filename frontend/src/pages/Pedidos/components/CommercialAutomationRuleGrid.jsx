import { formatNumber } from "../../../utils/formatters";

export function CommercialAutomationRuleGrid({
  commercialAutomationRules,
  updateCommercialAutomationSetting,
}) {
  return (
    <div className="commercial-rule-grid configurable">
      {commercialAutomationRules.map((rule) => (
        <article className={`commercial-rule-card ${rule.tone}`} key={rule.key}>
          <label className="commercial-rule-toggle">
            <input
              checked={rule.enabled}
              type="checkbox"
              onChange={(event) => updateCommercialAutomationSetting(rule.settingKey, event.target.checked)}
            />
            <span>{rule.enabled ? "Ativa" : "Inativa"}</span>
          </label>
          <span>{rule.label}</span>
          <strong>{formatNumber(rule.count)}</strong>
          <small>{rule.description}</small>
          <em>{rule.status}</em>
        </article>
      ))}
    </div>
  );
}
