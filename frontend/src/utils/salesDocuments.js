import { escapeHtml, printHtmlDocument } from "./exporters";
import { asList, formatCurrency, formatNumber } from "./formatters";
import { getMixedPaymentRows, getPaymentMethodLabel } from "./payments";

export function printSaleReceipt(sale, companyName = "Nexus One") {
  if (!sale) return;

  const rows = sale.itens
    .map(
      (item) => `
        <div class="receipt-item">
          <strong>${escapeHtml(item.nome)}</strong>
          <span>${escapeHtml(item.codigoBarras || "-")}</span>
          <div>
            <span>${escapeHtml(item.quantidade)} x ${escapeHtml(formatCurrency(item.preco))}</span>
            <strong>${escapeHtml(formatCurrency(item.preco * item.quantidade))}</strong>
          </div>
        </div> ?
      `,
    )
    .join("");
  const mixedRows = asList(sale.pagamentosMisturados)
    .map(
      (item) => `
        <div class="line">
          <span>${escapeHtml(item.label || getPaymentMethodLabel(item.method))}</span>
          <strong>${escapeHtml(formatCurrency(item.value))}</strong>
        </div> ?
      `,
    )
    .join("");

  const printWindow = window.open("", "_blank", "width=420,height=720");
  if (!printWindow) return;

  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>${escapeHtml(`Recibo ${sale.numero || sale.id || ""}`.trim())}</title>
        <style>
          @page { size: 80mm auto; margin: 4mm; }
          * { box-sizing: border-box; }
          body {
            width: 72mm;
            margin: 0 auto;
            color: #111827;
            font-family: "Courier New", monospace;
            font-size: 11px;
          }
          header {
            text-align: center;
            border-bottom: 1px dashed #111827;
            padding: 0 0 8px;
            margin-bottom: 8px;
          }
          h1 {
            margin: 0 0 4px;
            font-size: 15px;
            text-transform: uppercase;
          }
          p { margin: 2px 0; }
          .meta, .totals, .footer {
            border-top: 1px dashed #111827;
            margin-top: 8px;
            padding-top: 8px;
          }
          .line, .receipt-item div {
            display: flex;
            justify-content: space-between;
            gap: 8px;
          }
          .receipt-item {
            padding: 6px 0;
            border-bottom: 1px dotted #cbd5e1;
          }
          .receipt-item strong,
          .receipt-item span {
            display: block;
          }
          .receipt-item > strong {
            font-size: 11px;
            line-height: 1.25;
          }
          .receipt-item > span {
            color: #475569;
            margin: 2px 0 4px;
          }
          .grand {
            font-size: 14px;
            font-weight: 800;
            margin-top: 5px;
          }
          .footer {
            text-align: center;
            padding-bottom: 8px;
          }
          @media print {
            body { width: 72mm; }
          }
        </style>
      </head>
      <body>
        <header>
          <h1>${escapeHtml(companyName)}</h1>
          <p>RECIBO NAO FISCAL</p>
          <p>${escapeHtml(sale.data)}</p>
        </header>

        <section class="meta">
          <p><strong>Venda:</strong> ${escapeHtml(sale.numero || sale.id || "-")}</p>
          <p><strong>Cliente:</strong> ${escapeHtml(sale.cliente)}</p>
          <p><strong>Operador:</strong> ${escapeHtml(sale.vendedor)}</p>
        </section>

        <section>
          ${rows}
        </section>

        <section class="totals">
          <div class="line"><span>Subtotal</span><strong>${escapeHtml(formatCurrency(sale.subtotal))}</strong></div>
          <div class="line"><span>Desconto</span><strong>${escapeHtml(formatCurrency(sale.descontoValor))}</strong></div>
          <div class="line grand"><span>Total</span><strong>${escapeHtml(formatCurrency(sale.total))}</strong></div>
          <div class="line"><span>Pagamento</span><strong>${escapeHtml(getPaymentMethodLabel(sale.pagamento))}</strong></div>
          ${mixedRows ? `<div class="mixed-lines">${mixedRows}</div>` : ""}
          ${
            sale.parcelas && Number(sale.parcelas) > 1 ?
              `<div class="line"><span>Parcelas</span><strong>${escapeHtml(`${sale.parcelas}x`)}</strong></div>`
              : ""
          }
          ${
            sale.pagamento === "DINHEIRO" ?
              `
                <div class="line"><span>Recebido</span><strong>${escapeHtml(formatCurrency(sale.recebido))}</strong></div>
                <div class="line"><span>Troco</span><strong>${escapeHtml(formatCurrency(sale.troco))}</strong></div> ?
              `
              : ""
          }
        </section>

        <section class="footer">
          <p>Obrigado pela preferência.</p>
          <p>Documento sem valor fiscal.</p>
        </section>
      </body>
    </html> ?
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

export function printCashReceipt(receipt, companyName = "Nexus One") {
  if (!receipt) return;

  const items = asList(receipt.itens);
  const itemRows = items
    .map(
      (item) => `
        <div class="receipt-item">
          <strong>${escapeHtml(item.produto || item.nome || "Produto sem nome")}</strong>
          <div>
            <span>${escapeHtml(formatNumber(item.quantidade || 0))} x ${escapeHtml(formatCurrency(item.precoUnit || item.preco || 0))}</span>
            <strong>${escapeHtml(formatCurrency(item.subtotal || Number(item.quantidade || 0) * Number(item.precoUnit || item.preco || 0)))}</strong>
          </div>
        </div> ?
      `,
    )
    .join("");
  const mixedRows = asList(receipt.pagamentosMisturados)
    .map(
      (item) => `
        <div class="line">
          <span>${escapeHtml(item.label || getPaymentMethodLabel(item.method))}</span>
          <strong>${escapeHtml(formatCurrency(item.value))}</strong>
        </div> ?
      `,
    )
    .join("");

  printHtmlDocument(
    `Comprovante caixa ${receipt.numero || receipt.id || ""}`.trim(),
    `
      <style>
        @page { size: 80mm auto; margin: 5mm; }
        body { max-width: 74mm; margin: 0 auto; font-family: Arial, sans-serif; font-size: 11px; }
        header { text-align: center; border-bottom: 1px solid #111827; padding-bottom: 8px; margin-bottom: 8px; }
        h1 { margin: 0; font-size: 15px; text-transform: uppercase; }
        h2 { margin: 10px 0 6px; font-size: 11px; text-transform: uppercase; }
        p { margin: 2px 0; }
        .meta, .totals, .footer { border-top: 1px dashed #475569; margin-top: 8px; padding-top: 8px; }
        .line, .receipt-item div { display: flex; justify-content: space-between; gap: 8px; }
        .receipt-item { padding: 6px 0; border-bottom: 1px dotted #cbd5e1; }
        .receipt-item strong, .receipt-item span { display: block; }
        .grand { font-size: 14px; font-weight: 800; }
        .footer { text-align: center; color: #475569; }
      </style>
      <header>
        <h1>${escapeHtml(companyName)}</h1>
        <p>COMPROVANTE DE RECEBIMENTO</p>
        <p>${escapeHtml(receipt.data)}</p>
      </header>
      <section class="meta">
        <p><strong>Pedido:</strong> ${escapeHtml(receipt.numero || receipt.id || "-")}</p>
        <p><strong>Cliente:</strong> ${escapeHtml(receipt.cliente || "Cliente não informado")}</p>
        <p><strong>Operador:</strong> ${escapeHtml(receipt.operador || "-")}</p>
        <p><strong>Filial:</strong> ${escapeHtml(receipt.filial || "Empresa / sem filial")}</p>
      </section>
      <section>
        <h2>Itens</h2>
        ${itemRows || "<p>Itens não carregados neste comprovante.</p>"}
      </section>
      <section class="totals">
        <div class="line grand"><span>Total recebido</span><strong>${escapeHtml(formatCurrency(receipt.total))}</strong></div>
        <div class="line"><span>Forma</span><strong>${escapeHtml(getPaymentMethodLabel(receipt.pagamento))}</strong></div>
        ${receipt.parcelas && Number(receipt.parcelas) > 1 ? `<div class="line"><span>Parcelas</span><strong>${escapeHtml(`${receipt.parcelas}x`)}</strong></div>` : ""}
        ${mixedRows ? `<h2>Pagamento misto</h2>${mixedRows}` : ""}
      </section>
      <section class="footer">
        <p>Documento sem valor fiscal.</p>
        <p>Guarde para conferencia de caixa.</p>
      </section>
    `,
  );
}

export function printFiscalMirror(order, companyName = "Nexus One") {
  if (!order) return;

  const itens = asList(order.itens);
  const subtotal = itens.reduce((total, item) => total + Number(item.quantidade || 0) * Number(item.preco || 0), 0);
  const total = Number(order.total || order.valor || subtotal);
  const fiscalKey = [
    getLocalDateKey(order.data).replace(/-/g, ""),
    String(order.id || order.numero || "").replace(/\D/g, "").padStart(8, "0").slice(-8),
    String(Math.round(total * 100)).padStart(10, "0").slice(-10),
  ].join("");
  const rows = itens
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.nome)}</td>
          <td>${escapeHtml(item.codigoBarras || "-")}</td>
          <td>${escapeHtml(formatNumber(item.quantidade))}</td>
          <td>${escapeHtml(formatCurrency(item.preco))}</td>
          <td>${escapeHtml(formatCurrency(Number(item.preco || 0) * Number(item.quantidade || 0)))}</td>
        </tr> ?
      `,
    )
    .join("");

  printHtmlDocument(
    `Espelho fiscal ${order.numero || order.id || ""}`.trim(),
    `
      <header>
        <h1>Espelho fiscal interno</h1>
        <p>${escapeHtml(companyName)} - Pedido ${escapeHtml(order.numero || order.id || "-")}</p>
        <p>Documento de conferencia sem autorizacao SEFAZ.</p>
      </header>
      <div class="meta-grid">
        <div><span>Emitente</span><strong>${escapeHtml(companyName)}</strong></div>
        <div><span>Filial</span><strong>${escapeHtml(order.filial || "Empresa / sem filial")}</strong></div>
        <div><span>Cliente</span><strong>${escapeHtml(order.cliente || "Cliente não informado")}</strong></div>
        <div><span>Data</span><strong>${escapeHtml(formatDateTime(order.data))}</strong></div>
        <div><span>Status fiscal</span><strong>Aguardando autorizacao</strong></div>
        <div><span>Chave interna</span><strong>${escapeHtml(fiscalKey)}</strong></div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Produto</th>
            <th>Código</th>
            <th>Qtd</th>
            <th>Unitario</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="totals">
        <div><span>Subtotal</span><strong>${escapeHtml(formatCurrency(subtotal))}</strong></div>
        <div class="grand"><span>Total do pedido</span><strong>${escapeHtml(formatCurrency(total))}</strong></div>
      </div>
      <h2>Observacoes fiscais</h2>
      <p>Use este espelho para conferir cadastro, itens, valores e filial antes da emissão NF-e/NFC-e real.</p> ?
    `,
  );
}

export function printCommercialProposal(proposal, companyName = "Nexus One") {
  if (!proposal || asList(proposal.itens).length === 0) return;

  const rows = asList(proposal.itens)
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.nome)}</td>
          <td>${escapeHtml(item.codigoBarras || "-")}</td>
          <td>${escapeHtml(formatNumber(item.quantidade))}</td>
          <td>${escapeHtml(formatCurrency(item.preco))}</td>
          <td>${escapeHtml(formatCurrency(item.preco * item.quantidade))}</td>
        </tr> ?
      `,
    )
    .join("");

  printHtmlDocument(
    `Proposta comercial ${proposal.numero}`,
    `
      <header>
        <h1>Proposta comercial</h1>
        <p>${escapeHtml(companyName)} - ${escapeHtml(proposal.numero)} - Gerada em ${escapeHtml(proposal.data)}</p>
      </header>
      <div class="meta-grid">
        <div><span>Cliente</span><strong>${escapeHtml(proposal.cliente)}</strong></div>
        <div><span>Vendedor</span><strong>${escapeHtml(proposal.vendedor)}</strong></div>
        <div><span>Filial</span><strong>${escapeHtml(proposal.filial || "Empresa / sem filial")}</strong></div>
        <div><span>Validade</span><strong>${escapeHtml(proposal.validade)}</strong></div>
        <div><span>Entrega</span><strong>${escapeHtml(proposal.entrega)}</strong></div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Produto</th>
            <th>Código</th>
            <th>Qtd</th>
            <th>Unitario</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="totals">
        <div><span>Subtotal</span><strong>${escapeHtml(formatCurrency(proposal.subtotal))}</strong></div>
        <div><span>Desconto</span><strong>${escapeHtml(formatCurrency(proposal.descontoValor))}</strong></div>
        <div class="grand"><span>Total proposto</span><strong>${escapeHtml(formatCurrency(proposal.total))}</strong></div>
      </div>
      <h2>Observacoes</h2>
      <p>${escapeHtml(proposal.observacao || "Valores sujeitos a confirmação de estoque no fechamento da venda.")}</p>
      <h2>Condicoes comerciais</h2>
      <p>${escapeHtml(proposal.condicoesComerciais || "Validade sujeita a disponibilidade de estoque e confirmação comercial.")}</p>
      <div class="signature-grid">
        <div class="signature-line">Responsável pela proposta</div>
        <div class="signature-line">Aceite do cliente</div>
      </div> ?
    `,
  );
}
