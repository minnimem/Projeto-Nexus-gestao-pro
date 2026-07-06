const ESSENTIAL_REPORT_FIELDS = ["numero", "cliente", "filial", "status", "valor", "data", "nome", "tipo", "descricao"];

export function getReportFieldKeys(card) {
  return Array.from(
    card.rows.reduce((headers, row) => {
      Object.keys(row || {}).forEach((key) => headers.add(key));
      return headers;
    }, new Set()),
  );
}

export function getSelectedReportFields(card, reportFieldSelection) {
  const availableFields = getReportFieldKeys(card);
  const selected = reportFieldSelection[card.key] || [];
  return selected.length ? selected.filter((field) => availableFields.includes(field)) : availableFields;
}

export function getSelectedReportRows(card, reportFieldSelection) {
  const fields = getSelectedReportFields(card, reportFieldSelection);
  return card.rows.map((row) =>
    fields.reduce((acc, field) => {
      acc[field] = row[field] || "";
      return acc;
    }, {}),
  );
}

export function toggleReportFieldSelection(current, reportCards, cardKey, field) {
  const card = reportCards.find((item) => item.key === cardKey);
  const availableFields = card ? getReportFieldKeys(card) : [];
  const savedSelection = current[cardKey] || [];
  const currentSelection = savedSelection.length ? savedSelection : availableFields;
  const nextSelection = currentSelection.includes(field)
    ? currentSelection.filter((item) => item !== field)
    : [...currentSelection, field];

  return {
    ...current,
    [cardKey]: nextSelection.length > 0 ? nextSelection : availableFields,
  };
}

export function setReportFieldPresetSelection(current, reportCards, cardKey, preset) {
  const card = reportCards.find((item) => item.key === cardKey);
  const availableFields = card ? getReportFieldKeys(card) : [];
  const essentialFields = availableFields.filter((field) => ESSENTIAL_REPORT_FIELDS.includes(field));

  return {
    ...current,
    [cardKey]: preset === "essential" && essentialFields.length > 0 ? essentialFields : availableFields,
  };
}
