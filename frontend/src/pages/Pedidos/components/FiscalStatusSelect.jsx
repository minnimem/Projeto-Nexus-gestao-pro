export function FiscalStatusSelect({
  fiscalStatusOptions,
  getFiscalStatus,
  pedido,
  updateFiscalStatus,
}) {
  return (
    <select
      className="mini-status-select"
      value={getFiscalStatus(pedido)}
      onChange={(event) => updateFiscalStatus(pedido, event.target.value)}
    >
      {fiscalStatusOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
