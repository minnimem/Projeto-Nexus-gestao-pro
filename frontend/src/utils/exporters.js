import { asList } from "./formatters.js";

function csvValue(value) {
  if (value === null || value === undefined) return "";
  const text = typeof value === "object" ? JSON.stringify(value) : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function sanitizeExportFilename(filename, fallback = "nexus-one-export.csv") {
  const value = String(filename || fallback)
    .replace(/[<>:"/\\|*]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
  return value || fallback;
}

function getExportHeaders(rows) {
  const headers = new Set();
  rows.forEach((row) => {
    if (!row || typeof row !== "object") return;
    Object.keys(row).forEach((key) => headers.add(key));
  });
  return Array.from(headers);
}

function normalizeExportRows(rows) {
  return asList(rows).filter((row) => row && typeof row === "object");
}

export function downloadCsv(filename, rows) {
  const exportRows = normalizeExportRows(rows);
  if (!exportRows.length) return;

  const headers = getExportHeaders(exportRows);
  const csv = [
    "sep=,",
    headers.map(csvValue).join(","),
    ...exportRows.map((row) => headers.map((header) => csvValue(row[header])).join(",")),
  ].join("\n");

  downloadTextFile(sanitizeExportFilename(filename), `\uFEFF${csv}`, "text/csv;charset=utf-8");
}

export function downloadExcel(filename, rows, sheetName = "Nexus One") {
  const exportRows = normalizeExportRows(rows);
  if (!exportRows.length) return;

  const headers = getExportHeaders(exportRows);
  const tableRows = [
    `<tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr>`,
    ...exportRows.map((row) => `<tr>${headers.map((header) => `<td>${escapeHtml(row[header])}</td>`).join("")}</tr>`),
  ].join("");
  const html = `<!doctype html><html><head><meta charset="utf-8" /></head><body><table><caption>${escapeHtml(sheetName)} - ${exportRows.length} registro(s)</caption>${tableRows}</table></body></html>`;

  downloadTextFile(sanitizeExportFilename(filename), html, "application/vnd.ms-excel;charset=utf-8");
}

export function downloadJson(filename, payload) {
  downloadTextFile(sanitizeExportFilename(filename), JSON.stringify(payload, null, 2), "application/json;charset=utf-8");
}

export function downloadTextFile(filename, content, type = "text/plain;charset=utf-8") {
  const blob = new Blob([content || ""], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = sanitizeExportFilename(filename, "nexus-one-export.txt");
  link.click();
  URL.revokeObjectURL(url);
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function printHtmlDocument(title, bodyHtml) {
  const printWindow = window.open("", "_blank", "width=960,height=720");
  if (!printWindow) return;

  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>${escapeHtml(title)}</title>
        <style>
          @page { margin: 14mm; }
          * { box-sizing: border-box; }
          body { margin: 0; color: #0f172a; background: #f8fafc; font-family: Arial, sans-serif; }
          body > header, body > section, body > table, body > footer { max-width: 1120px; margin-left: auto; margin-right: auto; }
          header {
            position: relative;
            border: 1px solid #dbe3ee;
            border-top: 5px solid #0f2a5f;
            border-radius: 14px;
            margin: 24px auto 18px;
            padding: 18px 20px;
            background: linear-gradient(135deg, #ffffff 0%, #eef5ff 100%);
            box-shadow: 0 16px 32px rgba(15, 42, 95, 0.08);
          }
          h1 { margin: 0; font-size: 24px; color: #0f2a5f; letter-spacing: 0; }
          h2 { margin: 24px 0 10px; font-size: 16px; }
          p { margin: 6px 0; color: #475569; }
          table { width: 100%; border-collapse: collapse; margin-top: 14px; background: #ffffff; border: 1px solid #dbe3ee; }
          th, td { border-bottom: 1px solid #dbe3ee; padding: 9px 10px; text-align: left; font-size: 11px; vertical-align: top; overflow-wrap: anywhere; }
          th { color: #334155; background: #eef4ff; text-transform: uppercase; font-size: 10px; letter-spacing: 0; }
          tbody tr:nth-child(even) td { background: #f8fafc; }
          .totals { margin-left: auto; width: 320px; margin-top: 18px; }
          .totals div { display: flex; justify-content: space-between; padding: 7px 0; }
          .grand { border-top: 2px solid #0f2a5f; font-size: 18px; font-weight: 800; }
          .meta-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 18px; margin: 18px 0; }
          .meta-grid div { border: 1px solid #dbe3ee; border-radius: 10px; padding: 10px; background: #ffffff; }
          .meta-grid span { display: block; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; }
          .meta-grid strong { display: block; margin-top: 4px; font-size: 14px; }
          .report-kicker { display: block; color: #2563eb; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-bottom: 8px; }
          .executive-summary-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
          .executive-summary-grid div { min-height: 72px; box-shadow: 0 10px 22px rgba(15, 42, 95, 0.06); }
          .report-table { table-layout: auto; }
          .print-footer { margin-top: 18px; padding-top: 10px; border-top: 1px solid #dbe3ee; color: #64748b; font-size: 11px; text-align: right; }
          .signature-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; margin-top: 42px; }
          .signature-line { border-top: 1px solid #0f172a; padding-top: 8px; text-align: center; font-size: 12px; }
          .check-cell { width: 70px; }
          @media print {
            body { background: #ffffff; }
            header, .meta-grid div { box-shadow: none; }
            thead { display: table-header-group; }
            tr { break-inside: avoid; page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>${bodyHtml}</body>
    </html> ?
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

export function printRowsDocument(title, rows, companyName = "Nexus One") {
  const exportRows = normalizeExportRows(rows);
  if (!exportRows.length) return;

  const headers = getExportHeaders(exportRows);
  const generatedAt = new Date().toLocaleString("pt-BR");
  const tableRows = exportRows
    .map(
      (row) => `
        <tr>
          ${headers.map((header) => `<td>${escapeHtml(row[header])}</td>`).join("")}
        </tr> ?
      `,
    )
    .join("");

  printHtmlDocument(
    title,
    `
      <header>
        <span class="report-kicker">Relatorio executivo Nexus One</span>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(companyName)} - Gerado em ${escapeHtml(generatedAt)}</p>
      </header>
      <section class="meta-grid executive-summary-grid">
        <div>
          <span>Empresa</span>
          <strong>${escapeHtml(companyName)}</strong>
        </div>
        <div>
          <span>Registros</span>
          <strong>${escapeHtml(exportRows.length)}</strong>
        </div>
        <div>
          <span>Colunas</span>
          <strong>${escapeHtml(headers.length)}</strong>
        </div>
        <div>
          <span>Gerado em</span>
          <strong>${escapeHtml(generatedAt)}</strong>
        </div>
      </section>
      <table class="report-table">
        <thead>
          <tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
      <footer class="print-footer">
        Nexus One - Relatorio executivo - ${escapeHtml(exportRows.length)} registro(s)
      </footer> ?
    `,
  );
}
