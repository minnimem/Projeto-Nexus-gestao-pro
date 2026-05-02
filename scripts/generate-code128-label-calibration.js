import fs from "node:fs";
import path from "node:path";

const outputPath = process.argv[2] || path.join("dist", "etiquetas-code128-calibracao.html");

const CODE128_PATTERNS = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213",
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132",
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211",
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331",
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111",
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214",
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141",
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141",
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112",
];

const samples = [
  { code: "7891000100012", name: "EAN numerico longo", price: "R$ 9,90" },
  { code: "SKU-TESTE-001", name: "SKU alfanumerico", price: "R$ 19,90" },
  { code: "PROD 123 ABC", name: "Codigo com espaco", price: "R$ 29,90" },
  { code: "CX-0000000001", name: "Codigo caixa", price: "R$ 39,90" },
  { code: "NEXUS-ONE-60X35", name: "Etiqueta 60x35", price: "R$ 49,90" },
  { code: "SEM-CODIGO", name: "Fallback", price: "R$ 0,00" },
];

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeCode128Value(value) {
  const clean = String(value || "")
    .replace(/[^\x20-\x7E]/g, "")
    .trim();
  return clean || "SEM-CODIGO";
}

function buildCode128Svg(value) {
  const text = normalizeCode128Value(value);
  const codes = [104, ...text.split("").map((char) => char.charCodeAt(0) - 32)];
  const checksum = codes.reduce((total, code, index) => total + code * (index === 0 ? 1 : index), 0) % 103;
  const sequence = [...codes, checksum, 106];
  const moduleWidth = 1.45;
  const height = 34;
  let x = 0;
  const bars = [];

  sequence.forEach((code) => {
    const pattern = CODE128_PATTERNS[code];
    if (!pattern) return;

    pattern.split("").forEach((widthChar, index) => {
      const width = Number(widthChar) * moduleWidth;
      if (index % 2 === 0) {
        bars.push(`<rect x="${x.toFixed(2)}" y="0" width="${width.toFixed(2)}" height="${height}" />`);
      }
      x += width;
    });
  });

  return `<svg class="label-barcode" viewBox="0 0 ${x.toFixed(2)} ${height}" preserveAspectRatio="none" aria-label="Codigo de barras ${escapeHtml(text)}">${bars.join("")}</svg>`;
}

function label(sample) {
  return `
    <section class="label-sheet">
      <div class="label-company">NEXUS ONE - TESTE</div>
      <div class="label-name">${escapeHtml(sample.name)}</div>
      <div class="label-price">${escapeHtml(sample.price)}</div>
      <div>
        ${buildCode128Svg(sample.code)}
        <div class="label-code">${escapeHtml(sample.code)}</div>
      </div>
    </section>
  `;
}

const html = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>Calibracao etiquetas Code128</title>
    <style>
      @page { size: A4; margin: 10mm; }
      body { margin: 0; color: #111827; font-family: Arial, sans-serif; }
      .label-batch {
        display: grid;
        grid-template-columns: repeat(3, 60mm);
        gap: 5mm 4mm;
        align-items: start;
      }
      .label-sheet {
        box-sizing: border-box;
        width: 60mm;
        height: 35mm;
        display: grid;
        grid-template-rows: auto auto auto 1fr auto;
        align-content: start;
        gap: 1.4mm;
        padding: 2mm;
        border: 0.2mm dashed #9ca3af;
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .label-company { font-size: 7px; font-weight: 800; text-transform: uppercase; }
      .label-name { overflow: hidden; font-size: 10px; font-weight: 900; line-height: 1.08; }
      .label-price { font-size: 13px; font-weight: 950; }
      .label-barcode {
        width: 100%;
        height: 8mm;
        display: block;
        fill: #111827;
      }
      .label-code {
        overflow: hidden;
        font-family: "Courier New", monospace;
        font-size: 7px;
        text-align: center;
        letter-spacing: 0;
        white-space: nowrap;
      }
    </style>
  </head>
  <body>
    <main class="label-batch">
      ${samples.map(label).join("")}
    </main>
  </body>
</html>
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, html, "utf8");
console.log(`Arquivo gerado: ${outputPath}`);
