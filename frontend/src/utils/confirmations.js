export function buildConfirmationText(action, subject, detail = "") {
  const normalizedDetail = detail ? ` ${detail}` : "";
  return `${action} ${subject}${normalizedDetail}?`;
}

export function requestConfirmation(message) {
  return window.confirm(message);
}
