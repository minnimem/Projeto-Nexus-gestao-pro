export function FiscalModelSelect({
  documento,
  fiscalModelOptions,
  pedido,
  selectedModel,
  setFiscalModelByOrder,
}) {
  return (
    <select
      className="mini-status-select fiscal-model-select"
      disabled={Boolean(documento)}
      value={selectedModel}
      onChange={(event) => setFiscalModelByOrder((current) => ({
        ...current,
        [pedido.id]: event.target.value,
      }))}
    >
      {fiscalModelOptions.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  );
}
