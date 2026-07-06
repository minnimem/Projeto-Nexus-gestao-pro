import { escapeHtml, printHtmlDocument } from "./exporters";
import { asList, formatCurrency } from "./formatters";
import { buildCode128Svg, buildQrCodeSvg } from "./productLabelCodes";

export { buildCode128Svg, buildQrCodeSvg } from "./productLabelCodes";

export function printProductLabel(produto, companyName = "Nexus One") {
  if (!produto) return;

  const codigo = produto.codigoBarras || produto.sku || produto.id || "-";
  const barcode = buildCode128Svg(codigo);
  const qrCode = buildQrCodeSvg(codigo);
  const title = produto.nome || "Produto sem nome";
  const price = formatCurrency(produto.precoComDesconto || produto.precoVenda || 0);

  printHtmlDocument(
    `Etiqueta ${title}`,
    `
      <style>
        @page { size: 60mm 35mm; margin: 2mm; }
        html,
        body {
          width: 60mm;
          height: 35mm;
          margin: 0;
          overflow: hidden;
          color: #111827;
          font-family: Arial, sans-serif;
        }
        .label-sheet {
          box-sizing: border-box;
          width: 56mm;
          height: 31mm;
          display: grid;
          grid-template-rows: auto auto auto 1fr auto;
          align-content: start;
          gap: 1.4mm;
          padding: 1mm 0;
          break-inside: avoid;
          page-break-inside: avoid;
        }
        .label-company { font-size: 7px; font-weight: 800; text-transform: uppercase; }
        .label-name { overflow: hidden; font-size: 10px; font-weight: 900; line-height: 1.08; }
        .label-price { font-size: 13px; font-weight: 950; }
        .label-barcode {
          width: 100%;
          height: 7mm;
          display: block;
          fill: #111827;
        }
        .label-code-wrap {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 10mm;
          gap: 1.4mm;
          align-items: end;
        }
        .label-qr {
          width: 10mm;
          height: 10mm;
          display: block;
          shape-rendering: crispEdges;
        }
        .label-code {
          overflow: hidden;
          font-family: "Courier New", monospace;
          font-size: 7px;
          text-align: center;
          letter-spacing: 0;
          white-space: nowrap;
        }
        @media print {
          html,
          body {
            width: 60mm;
            height: 35mm;
            margin: 0;
          }
        }
      </style>
      <section class="label-sheet">
        <div class="label-company">${escapeHtml(companyName)}</div>
        <div class="label-name">${escapeHtml(title)}</div>
        <div class="label-price">${escapeHtml(price)}</div>
        <div class="label-code-wrap">
          <div>
          ${barcode}
          <div class="label-code">${escapeHtml(codigo)}</div>
          </div>
          ${qrCode}
        </div>
      </section> ?
    `,
  );
}

export function printProductLabels(produtos, companyName = "Nexus One") {
  const items = asList(produtos);
  if (!items.length) return;

  const labels = items
    .map((produto) => {
      const codigo = produto.codigoBarras || produto.sku || produto.id || "-";
      const barcode = buildCode128Svg(codigo);
      const qrCode = buildQrCodeSvg(codigo);
      const title = produto.nome || "Produto sem nome";
      const price = formatCurrency(produto.precoComDesconto || produto.precoVenda || 0);

      return `
        <section class="label-sheet">
          <div class="label-company">${escapeHtml(companyName)}</div>
          <div class="label-name">${escapeHtml(title)}</div>
          <div class="label-price">${escapeHtml(price)}</div>
          <div class="label-code-wrap">
            <div>
            ${barcode}
            <div class="label-code">${escapeHtml(codigo)}</div>
            </div>
            ${qrCode}
          </div>
        </section> ?
      `;
    })
    .join("");

  printHtmlDocument(
    "Etiquetas de produtos",
    `
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
          padding: 3mm;
          border: 1px dashed #94a3b8;
          break-inside: avoid;
        }
        .label-company { font-size: 7px; font-weight: 800; text-transform: uppercase; }
        .label-name { overflow: hidden; font-size: 10px; font-weight: 900; line-height: 1.08; }
        .label-price { font-size: 13px; font-weight: 950; }
        .label-barcode {
          width: 100%;
          height: 7mm;
          display: block;
          fill: #111827;
        }
        .label-code-wrap {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 10mm;
          gap: 1.4mm;
          align-items: end;
        }
        .label-qr {
          width: 10mm;
          height: 10mm;
          display: block;
          shape-rendering: crispEdges;
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
      <main class="label-batch">${labels}</main> ?
    `,
  );
}
