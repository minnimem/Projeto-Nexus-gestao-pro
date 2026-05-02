import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Barcode,
  Boxes,
  ChartNoAxesCombined,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  Copy,
  CreditCard,
  Download,
  FileText,
  Mail,
  Loader2,
  LockKeyhole,
  LogOut,
  MapPin,
  MapPinned,
  Minus,
  Navigation,
  PackageCheck,
  Pencil,
  Plus,
  Printer,
  ReceiptText,
  Route,
  Search,
  ShieldCheck,
  ShoppingCart,
  Phone,
  Truck,
  UserRound,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";
import { clearLegacyAuth, getSession, isAuthenticated, login, logout } from "./services/auth";
import { endpoints } from "./services/resources";

const modules = [
  { label: "Visao Geral", icon: ChartNoAxesCombined, value: "overview" },
  { label: "Vendas", icon: ShoppingCart, value: "pedidos" },
  { label: "Caixa", icon: CreditCard, value: "caixa" },
  { label: "Clientes", icon: UserRound, value: "clientes" },
  { label: "Estoque", icon: Boxes, value: "produtos" },
  { label: "Financeiro", icon: WalletCards, value: "financeiro" },
  { label: "Logistica", icon: Route, value: "logistica" },
  { label: "Colaboradores", icon: UsersRound, value: "colaboradores" },
  { label: "Relatorios", icon: FileText, value: "relatorios" },
  { label: "Admin", icon: ShieldCheck, value: "usuarios" },
];

const moduleAccess = {
  overview: ["ADMIN", "GERENTE", "VENDEDOR", "ESTOQUISTA", "FINANCEIRO"],
  pedidos: ["ADMIN", "GERENTE", "VENDEDOR"],
  caixa: ["ADMIN", "GERENTE", "VENDEDOR", "OPERADOR_CAIXA", "FINANCEIRO"],
  clientes: ["ADMIN", "GERENTE", "VENDEDOR"],
  produtos: ["ADMIN", "GERENTE", "VENDEDOR", "ESTOQUISTA"],
  financeiro: ["ADMIN", "GERENTE", "FINANCEIRO"],
  logistica: ["ADMIN", "GERENTE"],
  colaboradores: ["ADMIN", "GERENTE"],
  relatorios: ["ADMIN", "GERENTE", "VENDEDOR", "ESTOQUISTA", "FINANCEIRO"],
  usuarios: ["ADMIN"],
};

function normalizePerfil(perfil) {
  return String(perfil || "").replace("ROLE_", "").toUpperCase();
}

const actionAccess = {
  manageCollaborators: ["ADMIN"],
  editRoute: ["ADMIN", "GERENTE"],
  printRoute: ["ADMIN", "GERENTE"],
  mutateFinance: ["ADMIN", "GERENTE", "FINANCEIRO"],
  reverseFinance: ["ADMIN"],
  seeProfit: ["ADMIN", "GERENTE", "FINANCEIRO"],
  operateCash: ["ADMIN", "GERENTE", "VENDEDOR", "OPERADOR_CAIXA"],
};

function getPermissionLists(subject) {
  if (subject && typeof subject === "object") {
    return {
      extras: new Set(asList(subject.permissoesExtras)),
      blocked: new Set(asList(subject.permissoesBloqueadas)),
      perfil: normalizePerfil(subject.perfil),
    };
  }

  return {
    extras: new Set(),
    blocked: new Set(),
    perfil: normalizePerfil(subject),
  };
}

function modulePermissionKey(moduleValue) {
  return `module:${moduleValue}`;
}

function actionPermissionKey(action) {
  return `action:${action}`;
}

function canAccessModule(subject, moduleValue) {
  const { extras, blocked, perfil } = getPermissionLists(subject);
  const permissionKey = modulePermissionKey(moduleValue);

  if (blocked.has(permissionKey)) return false;
  if (extras.has(permissionKey)) return true;
  return moduleAccess[moduleValue]?.includes(perfil);
}

function getAccessibleModules(subject) {
  return modules.filter((module) => canAccessModule(subject, module.value));
}

function canPerform(subject, action) {
  const { extras, blocked, perfil } = getPermissionLists(subject);
  const permissionKey = actionPermissionKey(action);

  if (blocked.has(permissionKey)) return false;
  if (extras.has(permissionKey)) return true;
  return actionAccess[action]?.includes(perfil);
}

function safeApi(promise, fallback) {
  return promise.catch(() => fallback);
}

function getFinanceCriticalBadgeCount(financeiro, pedidos, caixas) {
  const completedSaleStatuses = new Set(["FINALIZADA", "RECEBIDO", "ENTREGUE", "CONCLUIDO"]);
  const movimentacoes = asList(financeiro?.movimentacoes);
  const approvedRevenuePedidoIds = new Set(
    movimentacoes
      .filter((item) => item.tipo === "RECEITA" && item.status === "APROVADO" && item.pedidoId)
      .map((item) => String(item.pedidoId)),
  );

  const pedidosSemItens = asList(pedidos)
    .filter((pedido) => completedSaleStatuses.has(String(pedido.status || "")))
    .filter((pedido) => !approvedRevenuePedidoIds.has(String(pedido.id)))
    .filter((pedido) => asList(pedido.itens).length === 0)
    .length;

  const caixasComDivergencia = asList(caixas)
    .filter((caixa) => Number(caixa.divergencia || 0) !== 0)
    .length;

  return pedidosSemItens + caixasComDivergencia;
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const numberFormatter = new Intl.NumberFormat("pt-BR");
const installmentPaymentMethods = ["CARTAO_CREDITO", "BOLETO"];
const cashPaymentOptions = [
  { value: "DINHEIRO", label: "Dinheiro" },
  { value: "PIX", label: "Pix" },
  { value: "CARTAO_CREDITO", label: "Credito" },
  { value: "CARTAO_DEBITO", label: "Debito" },
  { value: "BOLETO", label: "Boleto" },
  { value: "MISTO", label: "Misto" },
];

function formatCurrency(value) {
  return currencyFormatter.format(Number(value || 0));
}

function formatNumber(value) {
  return numberFormatter.format(Number(value || 0));
}

function canInstallmentPayment(method) {
  return installmentPaymentMethods.includes(method);
}

function getPaymentMethodLabel(method) {
  return cashPaymentOptions.find((option) => option.value === method)?.label || method || "Nao informado";
}

function getMixedPaymentTotal(payments) {
  if (!payments || typeof payments !== "object") return 0;
  return Object.values(payments).reduce((sum, value) => sum + parseDecimalInput(value), 0);
}

function getMixedPaymentRows(payments) {
  if (!payments || typeof payments !== "object") return [];
  return Object.entries(payments)
    .map(([method, value]) => ({
      method,
      label: getPaymentMethodLabel(method),
      value: parseDecimalInput(value),
    }))
    .filter((item) => item.value > 0);
}

function formatMixedPaymentDetails(payments) {
  return getMixedPaymentRows(payments)
    .map((item) => `${item.label}: ${formatCurrency(item.value)}`)
    .join(" | ");
}

function getMixedPaymentObservation(observation) {
  const text = String(observation || "");
  const marker = "Pagamento misto:";
  const index = text.indexOf(marker);
  return index >= 0 ? text.slice(index + marker.length).trim() : "";
}

function parseDecimalInput(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
  const text = String(value ?? "").trim();
  if (!text) return 0;

  const compact = text.replace(/\s/g, "");
  const hasComma = compact.includes(",");
  const hasDot = compact.includes(".");
  let normalized = compact;

  if (hasComma && hasDot) {
    normalized =
      compact.lastIndexOf(",") > compact.lastIndexOf(".")
        ? compact.replace(/\./g, "").replace(",", ".")
        : compact.replace(/,/g, "");
  } else if (hasComma) {
    normalized = compact.replace(/\./g, "").replace(",", ".");
  } else {
    normalized = compact.replace(/,/g, "");
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}

function formatDateTime(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatShortDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(new Date(value));
}

function getLocalDateKey(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addMonthsToDateKey(value, months) {
  const base = value ? new Date(`${value}T00:00:00`) : new Date();
  if (Number.isNaN(base.getTime())) return "";
  const target = new Date(base);
  target.setMonth(target.getMonth() + Number(months || 0));
  return getLocalDateKey(target);
}

function isDateBeforeToday(value) {
  const dateKey = getLocalDateKey(value);
  return Boolean(dateKey) && dateKey < getLocalDateKey();
}

function isDateWithinNextDays(value, days) {
  const dateKey = getLocalDateKey(value);
  if (!dateKey || isDateBeforeToday(value)) return false;

  const limit = new Date();
  limit.setHours(0, 0, 0, 0);
  limit.setDate(limit.getDate() + Number(days || 0));
  return dateKey <= getLocalDateKey(limit);
}

function getDaysOverdue(value) {
  const dateKey = getLocalDateKey(value);
  if (!dateKey || dateKey >= getLocalDateKey()) return 0;

  const dueDate = new Date(`${dateKey}T00:00:00`);
  const today = new Date(`${getLocalDateKey()}T00:00:00`);
  return Math.max(Math.floor((today - dueDate) / 86400000), 0);
}

function getAgingBucket(days) {
  if (days <= 7) return "1-7 dias";
  if (days <= 30) return "8-30 dias";
  if (days <= 60) return "31-60 dias";
  return "60+ dias";
}

function formatMonth(value) {
  const [year, month] = String(value).split("-");
  if (!year || !month) return value;
  return new Intl.DateTimeFormat("pt-BR", { month: "short", year: "2-digit" }).format(
    new Date(Number(year), Number(month) - 1, 1),
  );
}

function getSaleAmount(item) {
  return Number(item?.total || item?.valorTotal || item?.valor || 0);
}

function getSaleDateKey(item) {
  return String(item?.data || item?.dia || item?.periodo || "").slice(0, 10);
}

function groupSalesByPeriod(items, period) {
  const grouped = new Map();

  items.forEach((item) => {
    const dateKey = getSaleDateKey(item);
    if (!dateKey) return;
    const key = period === "ano" ? dateKey.slice(0, 4) : period === "mes" ? dateKey.slice(0, 7) : dateKey;
    grouped.set(key, (grouped.get(key) || 0) + getSaleAmount(item));
  });

  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => ({
      key,
      label: period === "dia" ? formatShortDate(key) : period === "mes" ? formatMonth(key) : key,
      value,
    }));
}

function isWithinLastDays(value, days) {
  if (!value || !days) return true;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return true;
  const limit = new Date();
  limit.setHours(0, 0, 0, 0);
  limit.setDate(limit.getDate() - Number(days));
  return date >= limit;
}

function getDataCount(data) {
  if (Array.isArray(data)) return data.length;
  if (data && typeof data === "object") return Object.keys(data).length;
  return 0;
}

function asList(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.content)) return value.content;
  if (Array.isArray(value?.value)) return value.value;
  return [];
}

function csvValue(value) {
  if (value === null || value === undefined) return "";
  const text = typeof value === "object" ? JSON.stringify(value) : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadCsv(filename, rows) {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);
  const csv = [
    headers.map(csvValue).join(","),
    ...rows.map((row) => headers.map((header) => csvValue(row[header])).join(",")),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function printHtmlDocument(title, bodyHtml) {
  const printWindow = window.open("", "_blank", "width=960,height=720");
  if (!printWindow) return;

  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>${escapeHtml(title)}</title>
        <style>
          body { margin: 32px; color: #0f172a; font-family: Arial, sans-serif; }
          header { border-bottom: 2px solid #0f2a5f; margin-bottom: 22px; padding-bottom: 14px; }
          h1 { margin: 0; font-size: 24px; }
          h2 { margin: 24px 0 10px; font-size: 16px; }
          p { margin: 6px 0; color: #475569; }
          table { width: 100%; border-collapse: collapse; margin-top: 14px; }
          th, td { border-bottom: 1px solid #dbe3ee; padding: 10px; text-align: left; font-size: 12px; }
          th { color: #334155; background: #f8fafc; text-transform: uppercase; }
          .totals { margin-left: auto; width: 320px; margin-top: 18px; }
          .totals div { display: flex; justify-content: space-between; padding: 7px 0; }
          .grand { border-top: 2px solid #0f2a5f; font-size: 18px; font-weight: 800; }
          .meta-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 18px; margin: 18px 0; }
          .meta-grid div { border: 1px solid #dbe3ee; border-radius: 10px; padding: 10px; }
          .meta-grid span { display: block; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; }
          .meta-grid strong { display: block; margin-top: 4px; font-size: 14px; }
          .signature-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; margin-top: 42px; }
          .signature-line { border-top: 1px solid #0f172a; padding-top: 8px; text-align: center; font-size: 12px; }
          .check-cell { width: 70px; }
          @media print { body { margin: 18mm; } }
        </style>
      </head>
      <body>${bodyHtml}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

function printRowsDocument(title, rows, companyName = "Nexus One") {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);
  const tableRows = rows
    .map(
      (row) => `
        <tr>
          ${headers.map((header) => `<td>${escapeHtml(row[header])}</td>`).join("")}
        </tr>
      `,
    )
    .join("");

  printHtmlDocument(
    title,
    `
      <header>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(companyName)} - Gerado em ${escapeHtml(new Date().toLocaleString("pt-BR"))}</p>
      </header>
      <table>
        <thead>
          <tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
    `,
  );
}

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

  return `
    <svg class="label-barcode" viewBox="0 0 ${x.toFixed(2)} ${height}" preserveAspectRatio="none" aria-label="Codigo de barras ${escapeHtml(text)}">
      ${bars.join("")}
    </svg>
  `;
}

function printProductLabel(produto, companyName = "Nexus One") {
  if (!produto) return;

  const codigo = produto.codigoBarras || produto.sku || produto.id || "-";
  const barcode = buildCode128Svg(codigo);
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
        <div>
          ${barcode}
          <div class="label-code">${escapeHtml(codigo)}</div>
        </div>
      </section>
    `,
  );
}

function printProductLabels(produtos, companyName = "Nexus One") {
  const items = asList(produtos);
  if (!items.length) return;

  const labels = items
    .map((produto) => {
      const codigo = produto.codigoBarras || produto.sku || produto.id || "-";
      const barcode = buildCode128Svg(codigo);
      const title = produto.nome || "Produto sem nome";
      const price = formatCurrency(produto.precoComDesconto || produto.precoVenda || 0);

      return `
        <section class="label-sheet">
          <div class="label-company">${escapeHtml(companyName)}</div>
          <div class="label-name">${escapeHtml(title)}</div>
          <div class="label-price">${escapeHtml(price)}</div>
          <div>
            ${barcode}
            <div class="label-code">${escapeHtml(codigo)}</div>
          </div>
        </section>
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
      <main class="label-batch">${labels}</main>
    `,
  );
}

function printSaleReceipt(sale, companyName = "Nexus One") {
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
        </div>
      `,
    )
    .join("");
  const mixedRows = asList(sale.pagamentosMisturados)
    .map(
      (item) => `
        <div class="line">
          <span>${escapeHtml(item.label || getPaymentMethodLabel(item.method))}</span>
          <strong>${escapeHtml(formatCurrency(item.value))}</strong>
        </div>
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
            sale.parcelas && Number(sale.parcelas) > 1
              ? `<div class="line"><span>Parcelas</span><strong>${escapeHtml(`${sale.parcelas}x`)}</strong></div>`
              : ""
          }
          ${
            sale.pagamento === "DINHEIRO"
              ? `
                <div class="line"><span>Recebido</span><strong>${escapeHtml(formatCurrency(sale.recebido))}</strong></div>
                <div class="line"><span>Troco</span><strong>${escapeHtml(formatCurrency(sale.troco))}</strong></div>
              `
              : ""
          }
        </section>

        <section class="footer">
          <p>Obrigado pela preferencia.</p>
          <p>Documento sem valor fiscal.</p>
        </section>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

function printFiscalMirror(order, companyName = "Nexus One") {
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
        </tr>
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
        <div><span>Cliente</span><strong>${escapeHtml(order.cliente || "Cliente nao informado")}</strong></div>
        <div><span>Data</span><strong>${escapeHtml(formatDateTime(order.data))}</strong></div>
        <div><span>Status fiscal</span><strong>Aguardando autorizacao</strong></div>
        <div><span>Chave interna</span><strong>${escapeHtml(fiscalKey)}</strong></div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Produto</th>
            <th>Codigo</th>
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
      <p>Use este espelho para conferir cadastro, itens, valores e filial antes da emissao NF-e/NFC-e real.</p>
    `,
  );
}

function printCommercialProposal(proposal, companyName = "Nexus One") {
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
        </tr>
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
            <th>Codigo</th>
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
      <p>${escapeHtml(proposal.observacao || "Valores sujeitos a confirmacao de estoque no fechamento da venda.")}</p>
      <div class="signature-grid">
        <div class="signature-line">Responsavel pela proposta</div>
        <div class="signature-line">Aceite do cliente</div>
      </div>
    `,
  );
}

function KpiCard({ icon: Icon, label, value, tone, detail }) {
  return (
    <article className={`kpi ${tone || ""}`}>
      <div className="kpi-icon">
        <Icon size={20} />
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function ExecutiveDashboard({ data, session }) {
  const [dismissedAutomationAlerts, setDismissedAutomationAlerts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("nexus-one-automation-alerts-dismissed") || "[]");
    } catch {
      return [];
    }
  });
  const [dailyReportDate, setDailyReportDate] = useState(() =>
    localStorage.getItem("nexus-one-daily-report-date") || "",
  );
  const canSeeFinance = canAccessModule(session, "financeiro");
  const canSeeLogistics = canAccessModule(session, "logistica");
  const canSeeAdmin = canAccessModule(session, "usuarios");
  const vendas = data?.vendas || {};
  const todayKey = getLocalDateKey();
  const financeiro = data?.financeiro || {};
  const clientes = asList(data?.clientes);
  const produtos = asList(data?.produtos);
  const pedidos = asList(data?.pedidos);
  const filiais = asList(data?.filiais);
  const estoqueBaixoApi = asList(data?.estoqueBaixo);
  const estoqueBaixoFallback = produtos
    .filter(isLowStockProduct)
    .map((produto) => ({
      id: produto.id,
      produtoId: produto.id,
      produto: produto.nome,
      nomeProduto: produto.nome,
      quantidade: getProductStockQuantity(produto),
      quantidadeAtual: getProductStockQuantity(produto),
      qtaMinimo: getProductStockMinimum(produto),
      estoqueMinimo: getProductStockMinimum(produto),
    }));
  const estoqueBaixo = [
    ...estoqueBaixoApi,
    ...estoqueBaixoFallback.filter(
      (fallback) =>
        !estoqueBaixoApi.some(
          (item) =>
            String(item.produtoId || item.id || getStockProductName(item)) ===
            String(fallback.produtoId || fallback.id || getStockProductName(fallback)),
        ),
    ),
  ];
  const entregas = asList(data?.logistica?.entregas);
  const rotas = asList(data?.logistica?.rotas);
  const veiculos = asList(data?.logistica?.veiculos);
  const entregadores = asList(data?.logistica?.entregadores);
  const usuarios = asList(data?.usuarios);
  const ultimosPedidos = asList(vendas?.ultimosPedidos).slice(0, 5);
  const branchSourceRows = [
    { id: "EMPRESA", nome: "Empresa / sem filial" },
    ...filiais.map((filial) => ({ id: filial.id, nome: filial.nome })),
  ];
  const completedOverviewStatuses = new Set(["FINALIZADA", "RECEBIDO", "ENTREGUE", "CONCLUIDO"]);
  const branchOverviewRows = branchSourceRows
    .map((branch) => {
      const matchesBranch = (item) =>
        branch.id === "EMPRESA" ? !item?.filialId : String(item?.filialId || "") === String(branch.id);
      const branchPedidos = pedidos.filter(matchesBranch);
      const branchCompleted = branchPedidos.filter((pedido) => completedOverviewStatuses.has(String(pedido.status || "")));
      const branchUsers = usuarios.filter(matchesBranch);
      const branchDeliveries = entregas.filter(matchesBranch);
      return {
        id: branch.id,
        filial: branch.nome,
        receita: branchCompleted.reduce((total, pedido) => total + Number(pedido.valor || 0), 0),
        vendas: branchCompleted.length,
        pendentes: branchPedidos.filter((pedido) => ["PENDENTE", "SEPARACAO", "SEPARADO"].includes(String(pedido.status || ""))).length,
        equipe: branchUsers.filter((usuario) => usuario.ativo !== false && !usuario.bloqueado).length,
        entregas: branchDeliveries.length,
      };
    })
    .filter((row) => row.vendas > 0 || row.pendentes > 0 || row.equipe > 0 || row.entregas > 0)
    .sort((a, b) => b.receita - a.receita || b.vendas - a.vendas)
    .slice(0, 6);
  const rotasAtivas = rotas.filter((rota) =>
    ["ABERTA", "EM_ANDAMENTO"].includes(rota.status),
  ).length;
  const financeiroMovimentacoes = asList(financeiro?.movimentacoes);
  const contasPendentes = financeiroMovimentacoes.filter((item) => item.status === "PENDENTE");
  const contasVencidas = canSeeFinance
    ? contasPendentes.filter((item) => isDateBeforeToday(item.dataVencimento || item.dataLancamento))
    : [];
  const contasAVencer = canSeeFinance
    ? contasPendentes.filter((item) => isDateWithinNextDays(item.dataVencimento || item.dataLancamento, 7))
    : [];
  const ticketMedio = Number(vendas?.ticketMedio || 0);
  const highSaleLimit = Math.max(ticketMedio * 3, 1000);
  const highValueOrders = pedidos
    .filter((pedido) => completedOverviewStatuses.has(String(pedido.status || "")))
    .filter((pedido) => Number(pedido.valor || 0) >= highSaleLimit);
  const automationAlerts = [
    estoqueBaixo.length > 0 && {
      id: `stock-low-${getLocalDateKey()}-${estoqueBaixo.length}`,
      title: "Estoque baixo",
      detail: `${formatNumber(estoqueBaixo.length)} produto(s) abaixo do minimo operacional.`,
      action: "Gerar reposicao ou compra",
      tone: "warning",
    },
    contasVencidas.length > 0 && {
      id: `finance-overdue-${getLocalDateKey()}-${contasVencidas.length}`,
      title: "Conta vencida",
      detail: `${formatNumber(contasVencidas.length)} titulo(s) financeiro(s) vencidos.`,
      action: "Priorizar cobranca/baixa",
      tone: "danger",
    },
    contasAVencer.length > 0 && {
      id: `finance-due-${getLocalDateKey()}-${contasAVencer.length}`,
      title: "Conta vencendo",
      detail: `${formatNumber(contasAVencer.length)} titulo(s) vencem nos proximos 7 dias.`,
      action: "Agendar follow-up",
      tone: "info",
    },
    highValueOrders.length > 0 && {
      id: `high-sale-${getLocalDateKey()}-${highValueOrders.length}`,
      title: "Venda alta",
      detail: `${formatNumber(highValueOrders.length)} venda(s) acima de ${formatCurrency(highSaleLimit)}.`,
      action: "Revisar margem e entrega",
      tone: "success",
    },
  ].filter(Boolean);
  const activeAutomationAlerts = automationAlerts.filter((alert) => !dismissedAutomationAlerts.includes(alert.id));
  const dailyReportRows = [
    {
      Indicador: "Data",
      Valor: formatDate(todayKey),
      Detalhe: dailyReportDate === todayKey ? "Relatorio diario gerado automaticamente" : "Aguardando geracao automatica",
    },
    {
      Indicador: "Vendas hoje",
      Valor: formatCurrency(vendas?.vendasHoje),
      Detalhe: `${formatNumber(vendas?.totalVendas)} venda(s) no painel`,
    },
    {
      Indicador: "Ticket medio",
      Valor: formatCurrency(vendas?.ticketMedio),
      Detalhe: `${formatNumber(vendas?.pedidosPendentes)} pedido(s) pendente(s)`,
    },
    {
      Indicador: "Estoque baixo",
      Valor: formatNumber(estoqueBaixo.length),
      Detalhe: "Produtos abaixo do minimo",
    },
    {
      Indicador: "Contas criticas",
      Valor: canSeeFinance ? formatNumber(contasVencidas.length + contasAVencer.length) : "Restrito",
      Detalhe: canSeeFinance
        ? `${formatNumber(contasVencidas.length)} vencida(s) / ${formatNumber(contasAVencer.length)} a vencer`
        : "Sem permissao financeira",
    },
    {
      Indicador: "Logistica",
      Valor: formatNumber(entregas.length),
      Detalhe: `${formatNumber(rotasAtivas)} rota(s) ativa(s)`,
    },
    {
      Indicador: "Alertas ativos",
      Valor: formatNumber(activeAutomationAlerts.length),
      Detalhe: activeAutomationAlerts.map((alert) => alert.title).join(" | ") || "Sem alertas ativos",
    },
  ];

  const actions = [
    produtos.length === 0 && "Cadastre produtos para liberar vendas no PDV.",
    clientes.length === 0 && "Cadastre clientes para operar pedidos completos.",
    canSeeFinance && Number(financeiro?.lancamentos || 0) === 0 && "Registre receitas/despesas para ativar o painel financeiro.",
    canSeeLogistics && rotas.length === 0 && "Crie rotas para demonstrar a operacao logistica.",
    canSeeAdmin && usuarios.length <= 1 && "Crie usuarios operacionais para demonstrar permissao por perfil.",
  ].filter(Boolean);

  useEffect(() => {
    localStorage.setItem("nexus-one-automation-alerts-dismissed", JSON.stringify(dismissedAutomationAlerts));
  }, [dismissedAutomationAlerts]);

  useEffect(() => {
    if (dailyReportDate === todayKey) return;
    localStorage.setItem("nexus-one-daily-report-date", todayKey);
    setDailyReportDate(todayKey);
  }, [dailyReportDate, todayKey]);

  function dismissAutomationAlert(id) {
    setDismissedAutomationAlerts((current) => Array.from(new Set([...current, id])));
  }

  function restoreAutomationAlerts() {
    setDismissedAutomationAlerts([]);
  }

  return (
    <div className="dashboard-view overview-view">
      <section className="kpi-grid">
        <KpiCard
          icon={CircleDollarSign}
          label="Receita"
          value={canSeeFinance ? formatCurrency(financeiro?.receitaTotal) : "Restrito"}
          detail={canSeeFinance ? "Financeiro aprovado no periodo" : "Visivel para ADMIN/GERENTE/FINANCEIRO"}
          tone="green"
        />
        <KpiCard
          icon={ShoppingCart}
          label="Vendas"
          value={formatNumber(vendas?.totalVendas)}
          detail={`${formatNumber(vendas?.pedidosPendentes)} pedidos pendentes`}
          tone="blue"
        />
        <KpiCard
          icon={Boxes}
          label="Produtos"
          value={formatNumber(produtos.length)}
          detail={`${formatNumber(estoqueBaixo.length)} em estoque baixo`}
          tone="amber"
        />
        <KpiCard
          icon={ArrowUpRight}
          label="Lucro"
          value={canSeeFinance ? formatCurrency(financeiro?.lucro) : "Restrito"}
          detail={`${formatNumber(clientes.length)} clientes na carteira`}
          tone="dark"
        />
      </section>

      <section className="overview-grid">
        <article className="panel">
          <div className="panel-title compact">
            <div>
              <h2>Saude comercial</h2>
              <p>Indicadores consolidados do dia.</p>
            </div>
          </div>

          <div className="health-list">
            <div>
              <span>Vendas hoje</span>
              <strong>{formatCurrency(vendas?.vendasHoje)}</strong>
            </div>
            <div>
              <span>Ticket medio</span>
              <strong>{formatCurrency(vendas?.ticketMedio)}</strong>
            </div>
            <div>
              <span>Lancamentos</span>
              <strong>{canSeeFinance ? formatNumber(financeiro?.lancamentos) : "-"}</strong>
            </div>
            <div>
              <span>Pedidos pagos</span>
              <strong>{canSeeFinance ? formatNumber(financeiro?.pedidosPagos) : "-"}</strong>
            </div>
          </div>
        </article>

        <article className="panel">
          <div className="panel-title compact">
            <div>
              <h2>Operacao</h2>
              <p>Estoque, frota e equipe.</p>
            </div>
          </div>

          <div className="health-list">
            <div>
              <span>Entregas</span>
              <strong>{formatNumber(entregas.length)}</strong>
            </div>
            <div>
              <span>Rotas ativas</span>
              <strong>{formatNumber(rotasAtivas)}</strong>
            </div>
            <div>
              <span>Veiculos</span>
              <strong>{formatNumber(veiculos.length)}</strong>
            </div>
            <div>
              <span>Entregadores</span>
              <strong>{formatNumber(entregadores.length)}</strong>
            </div>
          </div>
        </article>
      </section>

      <section className="panel automation-alert-panel">
        <div className="account-plan-head">
          <div>
            <h3>Alertas automaticos</h3>
            <p>Prioridades geradas a partir de estoque, financeiro e vendas.</p>
          </div>
          <div className="account-plan-actions">
            <span>{formatNumber(activeAutomationAlerts.length)} ativo(s)</span>
            {dismissedAutomationAlerts.length > 0 && (
              <button onClick={restoreAutomationAlerts} type="button">
                Reativar
              </button>
            )}
          </div>
        </div>
        <div className="automation-alert-grid">
          {activeAutomationAlerts.length === 0 ? (
            <div className="empty-selection compact">Nenhum alerta automatico ativo agora.</div>
          ) : (
            activeAutomationAlerts.map((alert) => (
              <div className={`automation-alert-card ${alert.tone}`} key={alert.id}>
                <div>
                  <span>{alert.title}</span>
                  <strong>{alert.detail}</strong>
                  <small>{alert.action}</small>
                </div>
                <button onClick={() => dismissAutomationAlert(alert.id)} type="button">
                  Ocultar
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="panel daily-report-panel">
        <div className="account-plan-head">
          <div>
            <h3>Relatorio diario automatico</h3>
            <p>Resumo operacional do dia gerado ao abrir a visao geral.</p>
          </div>
          <div className="account-plan-actions">
            <span>{dailyReportDate === todayKey ? `Gerado em ${formatDate(todayKey)}` : "Gerando..."}</span>
            <button onClick={() => downloadCsv(`nexus-one-relatorio-diario-${todayKey}.csv`, dailyReportRows)} type="button">
              <Download size={15} />
              CSV
            </button>
            <button onClick={() => printRowsDocument(`Relatorio diario ${formatDate(todayKey)}`, dailyReportRows, session?.empresa || "Nexus One")} type="button">
              <Printer size={15} />
              PDF
            </button>
          </div>
        </div>
        <div className="daily-report-grid">
          {dailyReportRows.slice(1).map((row) => (
            <div className="daily-report-card" key={row.Indicador}>
              <span>{row.Indicador}</span>
              <strong>{row.Valor}</strong>
              <small>{row.Detalhe}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="panel account-plan-summary">
        <div className="account-plan-head">
          <div>
            <h3>Operacao por filial</h3>
            <p>Vendas, pendencias, equipe e entregas em uma leitura rapida.</p>
          </div>
          <span>{formatNumber(branchOverviewRows.length)} filial(is)</span>
        </div>
        <div className="account-plan-grid compact-catalog-grid">
          {branchOverviewRows.length === 0 ? (
            <div className="empty-selection compact">Nenhuma filial com movimento para resumir.</div>
          ) : (
            branchOverviewRows.map((row) => (
              <div className="account-plan-item" key={row.id}>
                <span>{row.filial}</span>
                <strong>{formatCurrency(row.receita)}</strong>
                <small>{formatNumber(row.vendas)} venda(s) / {formatNumber(row.pendentes)} pendente(s)</small>
                <small>{formatNumber(row.equipe)} ativo(s) / {formatNumber(row.entregas)} entrega(s)</small>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="dashboard-grid overview-detail-grid">
        <article className="panel orders-panel">
          <div className="panel-title">
            <div>
              <h2>Ultimos pedidos</h2>
              <p>Resumo para decisao rapida.</p>
            </div>
            <span>{ultimosPedidos.length} registros</span>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {ultimosPedidos.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="empty-cell">
                      Nenhum pedido encontrado.
                    </td>
                  </tr>
                ) : (
                  ultimosPedidos.map((pedido) => (
                    <tr key={pedido.id}>
                      <td>
                        <strong>{pedido.cliente || "Cliente nao informado"}</strong>
                        <small>{pedido.id}</small>
                      </td>
                      <td>{formatDate(pedido.data)}</td>
                      <td>
                        <span className={`pill ${String(pedido.status || "").toLowerCase()}`}>
                          {pedido.status || "-"}
                        </span>
                      </td>
                      <td>{formatCurrency(pedido.valor)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>

        <aside className="panel side-panel inventory-tools-panel">
          <div className="panel-title compact">
            <div>
              <h2>Prioridades</h2>
              <p>Proximas acoes para demonstracao.</p>
            </div>
          </div>

          <div className="action-list">
            {actions.length === 0 && estoqueBaixo.length === 0 ? (
              <div className="action-item success">
                <CheckCircle2 size={18} />
                Operacao pronta para apresentacao.
              </div>
            ) : (
              actions.map((action) => (
                <div className="action-item" key={action}>
                  <AlertTriangle size={18} />
                  {action}
                </div>
              ))
            )}

            {estoqueBaixo.length > 0 && (
              <div className="action-item stock-priority">
                <div className="stock-alert-icon">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <strong>{formatNumber(estoqueBaixo.length)} item(ns) precisam de reposicao</strong>
                  <small className="stock-alert-copy">
                    Produtos abaixo do minimo definido. Priorize a entrada no estoque.
                  </small>
                  <div className="priority-stock-list">
                    {estoqueBaixo.slice(0, 5).map((item) => {
                      const atual = Number(getStockQuantity(item) || 0);
                      const minimo = Number(getStockMinimum(item) || 0);
                      const faltam = Math.max(minimo - atual, 0);

                      return (
                        <div className="priority-stock-row" key={item.produtoId || item.id || getStockProductName(item)}>
                          <div>
                            <span>{getStockProductName(item)}</span>
                            <small>Atual {formatNumber(atual)} / Min {formatNumber(minimo)}</small>
                          </div>
                          <strong>Faltam {formatNumber(faltam)}</strong>
                        </div>
                      );
                    })}
                  </div>
                  {estoqueBaixo.length > 5 && (
                    <em>+{formatNumber(estoqueBaixo.length - 5)} item(ns) em estoque baixo</em>
                  )}
                </div>
              </div>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}

function SalesOverview({ data, onRefresh, session }) {
  const [chartPeriod, setChartPeriod] = useState("dia");
  const [salesBranchFilter, setSalesBranchFilter] = useState("TODAS");
  const [orderStatusFilter, setOrderStatusFilter] = useState("todos");
  const [orderPeriodFilter, setOrderPeriodFilter] = useState("todos");
  const [sellerRankingFilter, setSellerRankingFilter] = useState({ inicio: "", fim: "" });
  const [commercialSellerFilter, setCommercialSellerFilter] = useState("TODOS");
  const [commercialFollowUpForm, setCommercialFollowUpForm] = useState(initialCommercialFollowUpForm);
  const [sellerGoalDrafts, setSellerGoalDrafts] = useState({});
  const [savingOrderAction, setSavingOrderAction] = useState("");
  const [orderMessage, setOrderMessage] = useState(null);
  const [commissionRateInput, setCommissionRateInput] = useState("");
  const canManageNotifications = ["ADMIN", "GERENTE"].includes(normalizePerfil(session.perfil));
  const [fiscalStatusByOrder, setFiscalStatusByOrder] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("nexus-one-fiscal-status-by-order") || "{}");
    } catch {
      return {};
    }
  });
  const [fiscalHistory, setFiscalHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("nexus-one-fiscal-history") || "[]");
    } catch {
      return [];
    }
  });
  const ultimosPedidos = data?.ultimosPedidos || [];
  const rankingProdutos = data?.rankingProdutos || [];
  const pedidosBase = asList(data?.pedidos).length > 0 ? asList(data?.pedidos) : ultimosPedidos;
  const usuarios = asList(data?.usuarios);
  const filiais = asList(data?.filiais);
  const commercialFollowUps = asList(data?.followUpsComerciais);
  const selectedSalesBranchLabel = salesBranchFilter === "TODAS"
    ? "Todas as filiais"
    : salesBranchFilter === "EMPRESA"
      ? "Empresa / sem filial"
      : filiais.find((filial) => String(filial.id) === salesBranchFilter)?.nome || "Filial";
  const branchScopedOrders = pedidosBase.filter((pedido) => {
    if (salesBranchFilter === "TODAS") return true;
    if (salesBranchFilter === "EMPRESA") return !pedido.filialId;
    return String(pedido.filialId || "") === salesBranchFilter;
  });
  const branchScopedRecentOrders = (asList(data?.pedidos).length > 0 ? branchScopedOrders : ultimosPedidos)
    .filter((pedido) => {
      if (salesBranchFilter === "TODAS") return true;
      if (salesBranchFilter === "EMPRESA") return !pedido.filialId;
      return String(pedido.filialId || "") === salesBranchFilter;
    })
    .sort((a, b) => String(b.data || "").localeCompare(String(a.data || "")));
  const branchCompletedOrders = branchScopedOrders.filter((pedido) =>
    ["FINALIZADA", "RECEBIDO", "ENTREGUE", "CONCLUIDO"].includes(String(pedido.status || "")),
  );
  const vendasPorDia = salesBranchFilter === "TODAS" && asList(data?.vendasPorDia).length > 0
    ? data.vendasPorDia
    : branchCompletedOrders;
  const chartRows = groupSalesByPeriod(vendasPorDia, chartPeriod);
  const maxSaleValue = Math.max(...chartRows.map((item) => item.value), 1);
  const totalChartValue = chartRows.reduce((total, item) => total + item.value, 0);
  const branchProductRanking = Array.from(
    branchScopedOrders.reduce((map, pedido) => {
      asList(pedido.itens).forEach((item) => {
        const produto = item.produto || item.nomeProduto || "Produto sem nome";
        const current = map.get(produto) || { produto, quantidade: 0, valorTotal: 0 };
        const quantidade = Number(item.quantidade || 0);
        const preco = Number(item.precoUnit || item.precoUnitario || item.preco || 0);
        current.quantidade += quantidade;
        current.valorTotal += quantidade * preco;
        map.set(produto, current);
      });
      return map;
    }, new Map()).values(),
  ).sort((a, b) => Number(b.quantidade || 0) - Number(a.quantidade || 0));
  const topProducts = (salesBranchFilter === "TODAS" || branchProductRanking.length === 0 ? rankingProdutos : branchProductRanking).slice(0, 5);
  const maxProductQty = Math.max(...topProducts.map((item) => Number(item.quantidade || 0)), 1);
  const commissionPercent = Number(data?.comissaoConfig?.percentualPadrao ?? 3);
  const commissionRate = commissionPercent / 100;
  const canManageCommission = ["ADMIN", "GERENTE"].includes(normalizePerfil(session?.perfil));
  const commissionStatuses = new Set(["FINALIZADA", "RECEBIDO", "ENTREGUE", "CONCLUIDO"]);
  const sellers = usuarios.filter((usuario) => ["VENDEDOR", "GERENTE"].includes(String(usuario.perfil || "")));
  const sellerByName = new Map();
  sellers.forEach((usuario) => {
    [usuario.nome, usuario.login].filter(Boolean).forEach((value) => {
      sellerByName.set(String(value).toLowerCase(), usuario);
    });
  });
  const rankingSales = branchScopedOrders.filter((pedido) => {
    if (!commissionStatuses.has(String(pedido.status || ""))) return false;
    const saleKey = getLocalDateKey(pedido.data);
    if (!saleKey) return false;
    if (sellerRankingFilter.inicio && saleKey < sellerRankingFilter.inicio) return false;
    if (sellerRankingFilter.fim && saleKey > sellerRankingFilter.fim) return false;
    return true;
  });
  const sellerCommissionSummary = Array.from(
    rankingSales
      .reduce((map, pedido) => {
        const key = pedido.usuario || pedido.vendedor || "Vendedor nao informado";
        const usuario = sellerByName.get(String(key).toLowerCase());
        const current = map.get(key) || {
          vendedor: key,
          usuario,
          pedidos: 0,
          total: 0,
          comissao: 0,
          meta: Number(usuario?.metaVendas || 0),
          atingimento: 0,
          faltam: 0,
          filiais: new Set(),
        };
        const valor = Number(pedido.valor || 0);
        current.pedidos += 1;
        current.total += valor;
        current.comissao = current.total * commissionRate;
        current.atingimento = current.meta > 0 ? Math.min((current.total / current.meta) * 100, 999) : 0;
        current.faltam = Math.max(current.meta - current.total, 0);
        current.filiais.add(pedido.filial || "Empresa / sem filial");
        map.set(key, current);
        return map;
      }, new Map()).values(),
  ).sort((a, b) => b.total - a.total);
  const sellerRankingTotal = sellerCommissionSummary.reduce((total, item) => total + item.total, 0);
  const sellerRankingGoal = sellerCommissionSummary.reduce((total, item) => total + Number(item.meta || 0), 0);
  const sellerRankingProgress = sellerRankingGoal > 0 ? (sellerRankingTotal / sellerRankingGoal) * 100 : 0;
  const sellerCommissionRows = sellerCommissionSummary.map((item) => ({
    Vendedor: item.vendedor,
    Filiais: Array.from(item.filiais || []).join(" | ") || selectedSalesBranchLabel,
    Pedidos: formatNumber(item.pedidos),
    Vendas: formatCurrency(item.total),
    Meta: item.meta > 0 ? formatCurrency(item.meta) : "-",
    Atingimento: item.meta > 0 ? `${formatNumber(item.atingimento)}%` : "-",
    "Faltam para meta": item.meta > 0 ? formatCurrency(item.faltam) : "-",
    [`Comissao ${formatNumber(commissionPercent)}%`]: formatCurrency(item.comissao),
  }));
  const orderStatusOptions = [
    { value: "todos", label: "Todos" },
    { value: "FINALIZADA", label: "Finalizadas" },
    { value: "ORCAMENTO", label: "Orcamentos" },
    { value: "PENDENTE", label: "Pendentes" },
    { value: "SEPARACAO", label: "Separacao" },
    { value: "SEPARADO", label: "Separados" },
    { value: "RECEBIDO", label: "Recebidos" },
  ];
  const orderPeriodOptions = [
    { value: "todos", label: "Tudo", days: null },
    { value: "7", label: "7 dias", days: 7 },
    { value: "30", label: "30 dias", days: 30 },
  ];
  const selectedOrderPeriod = orderPeriodOptions.find((option) => option.value === orderPeriodFilter);
  const filteredOrders = branchScopedRecentOrders.filter((pedido) => {
    const statusOk = orderStatusFilter === "todos" || pedido.status === orderStatusFilter;
    const periodOk = isWithinLastDays(pedido.data, selectedOrderPeriod?.days);
    return statusOk && periodOk;
  });
  const fiscalStatusOptions = [
    { value: "PENDENTE", label: "Pendente" },
    { value: "AUTORIZADO", label: "Autorizado" },
    { value: "REJEITADO", label: "Rejeitado" },
    { value: "CANCELADO", label: "Cancelado" },
  ];
  const getFiscalStatus = (pedido) => fiscalStatusByOrder[pedido?.id] || "PENDENTE";
  const fiscalControlOrders = branchScopedRecentOrders.filter((pedido) => String(pedido.status || "") !== "ORCAMENTO");
  const fiscalControlRows = fiscalControlOrders.map((pedido) => ({
    Pedido: pedido.numero || pedido.id,
    Cliente: pedido.cliente || "Cliente nao informado",
    Filial: pedido.filial || "Empresa / sem filial",
    Data: formatDateTime(pedido.data),
    Valor: formatCurrency(pedido.valor),
    "Status pedido": pedido.status || "-",
    "Status fiscal": getFiscalStatus(pedido),
    "Ultima alteracao": fiscalHistory.find((item) => String(item.orderId) === String(pedido.id))?.data || "-",
  }));
  const fiscalHistoryRows = fiscalHistory.map((item) => ({
    Data: item.data,
    Pedido: item.pedido,
    Cliente: item.cliente,
    Filial: item.filial,
    "Status anterior": item.anterior,
    "Status novo": item.novo,
    Usuario: item.usuario,
    Observacao: item.observacao,
  }));
  const fiscalStatusSummary = fiscalStatusOptions.map((option) => ({
    ...option,
    count: fiscalControlOrders.filter((pedido) => getFiscalStatus(pedido) === option.value).length,
  }));
  const commercialFollowUpStatuses = new Set(["ORCAMENTO", "PENDENTE", "SEPARACAO", "SEPARADO"]);
  const allCommercialFollowUpOrders = branchScopedOrders
    .filter((pedido) => commercialFollowUpStatuses.has(String(pedido.status || "")))
    .sort((a, b) => String(b.data || "").localeCompare(String(a.data || "")));
  const commercialFollowUpOrders = allCommercialFollowUpOrders
    .filter((pedido) => commercialSellerFilter === "TODOS" || String(pedido.usuario || pedido.vendedor || "Vendedor nao informado") === commercialSellerFilter)
    .sort((a, b) => String(b.data || "").localeCompare(String(a.data || "")));
  const commercialFollowUpSummary = Array.from(
    commercialFollowUpOrders.reduce((map, pedido) => {
      const vendedor = pedido.usuario || pedido.vendedor || "Vendedor nao informado";
      const current = map.get(vendedor) || {
        vendedor,
        orcamentos: 0,
        pendentes: 0,
        separacao: 0,
        valorAberto: 0,
        ultimoContato: pedido.data,
        registros: 0,
      };
      const status = String(pedido.status || "");

      current.orcamentos += status === "ORCAMENTO" ? 1 : 0;
      current.pendentes += status === "PENDENTE" ? 1 : 0;
      current.separacao += ["SEPARACAO", "SEPARADO"].includes(status) ? 1 : 0;
      current.valorAberto += Number(pedido.valor || 0);
      current.registros += 1;
      if (String(pedido.data || "") > String(current.ultimoContato || "")) {
        current.ultimoContato = pedido.data;
      }
      map.set(vendedor, current);
      return map;
    }, new Map()).values(),
  ).sort((a, b) => b.valorAberto - a.valorAberto);
  const commercialFollowUpRows = commercialFollowUpOrders.map((pedido) => ({
    Vendedor: pedido.usuario || pedido.vendedor || "Vendedor nao informado",
    Cliente: pedido.cliente || "-",
    Filial: pedido.filial || "Empresa / sem filial",
    Pedido: pedido.numero || pedido.id,
    Status: pedido.status || "-",
    Produtos: getOrderProductSummary(pedido),
    "Ultimo contato": formatDateTime(pedido.data),
    Valor: formatCurrency(pedido.valor),
    "Proxima acao": pedido.status === "ORCAMENTO"
      ? "Retomar proposta"
      : pedido.status === "PENDENTE"
        ? "Confirmar recebimento"
        : "Acompanhar separacao",
  }));
  const commercialFunnelStages = [
    {
      key: "ORCAMENTO",
      label: "Propostas",
      action: "Retomar proposta",
      orders: commercialFollowUpOrders.filter((pedido) => String(pedido.status || "") === "ORCAMENTO"),
    },
    {
      key: "PENDENTE",
      label: "A receber",
      action: "Confirmar pagamento",
      orders: commercialFollowUpOrders.filter((pedido) => String(pedido.status || "") === "PENDENTE"),
    },
    {
      key: "SEPARACAO",
      label: "Separacao",
      action: "Acompanhar entrega",
      orders: commercialFollowUpOrders.filter((pedido) => ["SEPARACAO", "SEPARADO"].includes(String(pedido.status || ""))),
    },
  ].map((stage) => {
    const valor = stage.orders.reduce((total, pedido) => total + Number(pedido.valor || 0), 0);
    const latest = stage.orders
      .map((pedido) => pedido.data)
      .filter(Boolean)
      .sort((a, b) => String(b).localeCompare(String(a)))[0];

    return {
      ...stage,
      valor,
      latest,
      ticketMedio: stage.orders.length > 0 ? valor / stage.orders.length : 0,
    };
  });
  const branchScopedCommercialFollowUps = commercialFollowUps.filter((item) => {
    if (salesBranchFilter === "TODAS") return true;
    if (salesBranchFilter === "EMPRESA") return !item.filialId;
    return String(item.filialId || "") === salesBranchFilter;
  });
  const commercialFollowUpHistoryRows = branchScopedCommercialFollowUps.map((item) => ({
    Vendedor: item.vendedor || "-",
    Cliente: item.clienteNome || "Cliente nao identificado",
    Filial: item.filial || "Empresa / sem filial",
    Pedido: item.pedidoNumero || item.pedidoId || "-",
    Status: item.status || "-",
    Canal: item.canal || "-",
    "Proxima acao": item.proximaAcao ? formatDate(item.proximaAcao) : "-",
    "Notificacao externa": item.notificacaoExternaEm ? formatDateTime(item.notificacaoExternaEm) : "-",
    Valor: formatCurrency(item.valor),
    Usuario: item.usuarioNome || "-",
    Observacao: item.observacao || "-",
  }));
  const pendingCommercialFollowUps = branchScopedCommercialFollowUps.filter((item) => item.status === "PENDENTE");
  const dueCommercialFollowUps = pendingCommercialFollowUps.filter((item) =>
    isDateBeforeToday(item.proximaAcao) || getLocalDateKey(item.proximaAcao) === getLocalDateKey(),
  );
  const commercialSellerOptions = ["TODOS", ...Array.from(new Set(allCommercialFollowUpOrders.map((pedido) => pedido.usuario || pedido.vendedor || "Vendedor nao informado")))];
  const salesKpis = {
    totalVendas: branchCompletedOrders.length,
    pendentes: branchScopedOrders.filter((pedido) => String(pedido.status || "") === "PENDENTE").length,
    orcamentos: branchScopedOrders.filter((pedido) => String(pedido.status || "") === "ORCAMENTO").length,
    separacao: branchScopedOrders.filter((pedido) => String(pedido.status || "") === "SEPARACAO").length,
    separados: branchScopedOrders.filter((pedido) => String(pedido.status || "") === "SEPARADO").length,
    receita: branchCompletedOrders.reduce((total, pedido) => total + Number(pedido.valor || 0), 0),
    vendasHoje: branchCompletedOrders
      .filter((pedido) => getLocalDateKey(pedido.data) === getLocalDateKey())
      .reduce((total, pedido) => total + Number(pedido.valor || 0), 0),
  };

  useEffect(() => {
    setCommissionRateInput(String(commissionPercent));
  }, [commissionPercent]);

  useEffect(() => {
    setSellerGoalDrafts(
      sellers.reduce((acc, usuario) => {
        acc[usuario.id] = usuario.metaVendas ?? "";
        return acc;
      }, {}),
    );
  }, [usuarios]);

  useEffect(() => {
    localStorage.setItem("nexus-one-fiscal-status-by-order", JSON.stringify(fiscalStatusByOrder));
  }, [fiscalStatusByOrder]);

  useEffect(() => {
    localStorage.setItem("nexus-one-fiscal-history", JSON.stringify(fiscalHistory));
  }, [fiscalHistory]);

  function updateFiscalStatus(pedido, status) {
    const orderId = pedido?.id;
    if (!orderId) return;
    const previous = getFiscalStatus(pedido);
    if (previous === status) return;

    setFiscalStatusByOrder((current) => ({
      ...current,
      [orderId]: status,
    }));
    setFiscalHistory((current) => [
      {
        id: `${orderId}-${Date.now()}`,
        orderId,
        pedido: pedido.numero || pedido.id,
        cliente: pedido.cliente || "Cliente nao informado",
        filial: pedido.filial || "Empresa / sem filial",
        anterior: previous,
        novo: status,
        usuario: session?.nome || session?.login || session?.perfil || "Usuario",
        data: new Date().toLocaleString("pt-BR"),
        observacao: status === "REJEITADO"
          ? "Revisar dados cadastrais/itens antes da autorizacao real."
          : status === "CANCELADO"
            ? "Cancelamento interno registrado para conferencia."
            : status === "AUTORIZADO"
              ? "Autorizacao interna simulada."
              : "Status fiscal retornou para pendente.",
      },
      ...current,
    ].slice(0, 80));
  }

  function renderFiscalStatusControl(pedido) {
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

  async function handleConvertQuote(id) {
    if (!id) return;

    setSavingOrderAction(id);
    setOrderMessage(null);
    try {
      await endpoints.pedidos.converterOrcamento(id);
      await onRefresh();
      setOrderStatusFilter("PENDENTE");
      setOrderMessage({ type: "success", text: "Orcamento convertido em pedido pendente." });
    } catch (error) {
      setOrderMessage({ type: "error", text: error.message || "Nao foi possivel converter o orcamento." });
    } finally {
      setSavingOrderAction("");
    }
  }

  async function handlePrintSavedQuote(id) {
    if (!id) return;

    setSavingOrderAction(id);
    setOrderMessage(null);
    try {
      const pedido = await endpoints.pedidos.obter(id);
      const itensResponse = await safeApi(endpoints.pedidos.itens(id), []);
      const itensPedido = asList(pedido.itens);
      const itens = (itensPedido.length > 0 ? itensPedido : asList(itensResponse)).map((item) => ({
        nome: item.produto || item.nomeProduto || "Produto sem nome",
        codigoBarras: item.codigoBarras || item.sku || "",
        quantidade: Number(item.quantidade || 0),
        preco: Number(item.precoUnit || item.precoUnitario || item.preco || 0),
      }));
      const subtotal = itens.reduce((total, item) => total + item.quantidade * item.preco, 0);
      const total = Number(pedido.valor || pedido.total || subtotal);
      const descontoValor = Math.max(subtotal - total, 0);

      printCommercialProposal(
        {
          numero: pedido.numero || pedido.id,
          cliente: pedido.cliente || "Cliente nao informado",
          vendedor: pedido.usuario || pedido.vendedor || "Usuario",
          filial: pedido.filial || "Empresa / sem filial",
          data: formatDateTime(pedido.data),
          validade: "A combinar",
          entrega: pedido.tipoEntregaDescricao || pedido.tipoEntrega || "Retirada na loja",
          itens,
          subtotal,
          descontoValor,
          total,
          observacao: pedido.observacaoEntrega || pedido.observacao || "",
        },
        pedido.empresa || "Nexus One",
      );
      setOrderMessage({ type: "success", text: "Orcamento enviado para impressao." });
    } catch (error) {
      setOrderMessage({ type: "error", text: error.message || "Nao foi possivel imprimir o orcamento." });
    } finally {
      setSavingOrderAction("");
    }
  }

  async function handlePrintFiscalMirror(id) {
    if (!id) return;

    setSavingOrderAction(`fiscal-${id}`);
    setOrderMessage(null);
    try {
      const pedido = await endpoints.pedidos.obter(id);
      const itensResponse = await safeApi(endpoints.pedidos.itens(id), []);
      const itensPedido = asList(pedido.itens);
      const itens = (itensPedido.length > 0 ? itensPedido : asList(itensResponse)).map((item) => ({
        nome: item.produto || item.nomeProduto || "Produto sem nome",
        codigoBarras: item.codigoBarras || item.sku || "",
        quantidade: Number(item.quantidade || 0),
        preco: Number(item.precoUnit || item.precoUnitario || item.preco || 0),
      }));

      printFiscalMirror(
        {
          id: pedido.id,
          numero: pedido.numero,
          cliente: pedido.cliente || "Cliente nao informado",
          filial: pedido.filial || "Empresa / sem filial",
          data: pedido.data,
          valor: pedido.valor || pedido.total,
          itens,
        },
        pedido.empresa || session?.empresa || "Nexus One",
      );
      setOrderMessage({ type: "success", text: "Espelho fiscal enviado para impressao." });
    } catch (error) {
      setOrderMessage({ type: "error", text: error.message || "Nao foi possivel imprimir o espelho fiscal." });
    } finally {
      setSavingOrderAction("");
    }
  }

  async function handleSeparationAction(id, action) {
    if (!id) return;

    setSavingOrderAction(id);
    setOrderMessage(null);
    try {
      if (action === "start") {
        await endpoints.pedidos.iniciarSeparacao(id);
        setOrderStatusFilter("SEPARACAO");
        setOrderMessage({ type: "success", text: "Separacao iniciada para o pedido." });
      } else {
        await endpoints.pedidos.concluirSeparacao(id);
        setOrderStatusFilter("SEPARADO");
        setOrderMessage({ type: "success", text: "Pedido separado e pronto para recebimento." });
      }
      await onRefresh();
    } catch (error) {
      setOrderMessage({ type: "error", text: error.message || "Nao foi possivel atualizar a separacao." });
    } finally {
      setSavingOrderAction("");
    }
  }

  async function handleSaveCommissionConfig() {
    const percentual = Number(commissionRateInput);
    if (!Number.isFinite(percentual) || percentual < 0 || percentual > 100) {
      setOrderMessage({ type: "error", text: "Percentual de comissao deve ficar entre 0 e 100." });
      return;
    }

    setSavingOrderAction("commission-config");
    setOrderMessage(null);
    try {
      await endpoints.comissoes.atualizarConfig({ percentualPadrao: percentual });
      setOrderMessage({ type: "success", text: "Regra de comissao atualizada." });
      await onRefresh();
    } catch (error) {
      setOrderMessage({ type: "error", text: error.message || "Nao foi possivel salvar a comissao." });
    } finally {
      setSavingOrderAction("");
    }
  }

  async function handleSaveSellerGoal(usuario) {
    if (!usuario?.id) return;

    const meta = Number(sellerGoalDrafts[usuario.id] || 0);
    if (!Number.isFinite(meta) || meta < 0) {
      setOrderMessage({ type: "error", text: "Meta de vendas deve ser zero ou maior." });
      return;
    }

    setSavingOrderAction(`meta-${usuario.id}`);
    setOrderMessage(null);

    try {
      await endpoints.usuarios.atualizar(usuario.id, {
        nome: usuario.nome,
        login: usuario.login,
        perfil: usuario.perfil,
        cargo: usuario.cargo || null,
        departamento: usuario.departamento || null,
        salario: usuario.salario ?? null,
        metaVendas: meta,
        dataInicio: usuario.dataInicio || null,
        telefone: usuario.telefone || null,
        email: usuario.email || null,
        documento: usuario.documento || null,
      });
      setOrderMessage({ type: "success", text: "Meta do vendedor atualizada." });
      await onRefresh();
    } catch (error) {
      setOrderMessage({ type: "error", text: error.message || "Nao foi possivel salvar a meta." });
    } finally {
      setSavingOrderAction("");
    }
  }

  function startCommercialFollowUp(pedido) {
    if (!pedido?.id) {
      setOrderMessage({ type: "error", text: "Pedido nao encontrado para follow-up comercial." });
      return;
    }

    setCommercialFollowUpForm({
      pedidoId: pedido.id,
      cliente: pedido.cliente || "Cliente nao informado",
      canal: "WhatsApp",
      proximaAcao: getLocalDateKey(new Date(Date.now() + 24 * 60 * 60 * 1000)),
      observacao: pedido.status === "ORCAMENTO" ? "Retomar proposta comercial." : "Retomar andamento do pedido.",
    });
  }

  async function handleCreateCommercialFollowUp(event) {
    event.preventDefault();

    if (!commercialFollowUpForm.pedidoId) {
      setOrderMessage({ type: "error", text: "Selecione um pedido para registrar follow-up." });
      return;
    }

    setSavingOrderAction("commercial-follow-up");
    setOrderMessage(null);

    try {
      await endpoints.pedidos.criarFollowUp({
        pedidoId: commercialFollowUpForm.pedidoId,
        canal: commercialFollowUpForm.canal,
        proximaAcao: commercialFollowUpForm.proximaAcao || null,
        observacao: commercialFollowUpForm.observacao,
      });
      setCommercialFollowUpForm(initialCommercialFollowUpForm);
      setOrderMessage({ type: "success", text: "Follow-up comercial registrado." });
      await onRefresh();
    } catch (error) {
      setOrderMessage({ type: "error", text: error.message || "Nao foi possivel registrar follow-up comercial." });
    } finally {
      setSavingOrderAction("");
    }
  }

  async function handleCommercialFollowUpStatus(id, action) {
    if (!id) return;
    setSavingOrderAction(`commercial-follow-up-${id}`);
    setOrderMessage(null);

    try {
      if (action === "concluir") {
        await endpoints.pedidos.concluirFollowUp(id);
        setOrderMessage({ type: "success", text: "Follow-up comercial concluido." });
      } else {
        await endpoints.pedidos.cancelarFollowUp(id);
        setOrderMessage({ type: "success", text: "Follow-up comercial cancelado." });
      }
      await onRefresh();
    } catch (error) {
      setOrderMessage({ type: "error", text: error.message || "Nao foi possivel atualizar o follow-up comercial." });
    } finally {
      setSavingOrderAction("");
    }
  }

  async function handleSendCommercialNotifications() {
    setSavingOrderAction("commercial-notifications");
    setOrderMessage(null);

    try {
      const result = await endpoints.notificacoes.enviarFollowUps();
      if (!result?.ativo) {
        setOrderMessage({ type: "error", text: "Notificacoes externas estao desativadas ou sem webhook configurado." });
      } else if (Number(result.totalEnviado || 0) === 0) {
        setOrderMessage({ type: "success", text: "Nenhum follow-up vencido ou de hoje aguardava notificacao." });
      } else {
        setOrderMessage({
          type: "success",
          text: `${formatNumber(result.comerciaisEnviadas)} notificacao(oes) comercial(is) enviada(s). Total geral: ${formatNumber(result.totalEnviado)}.`,
        });
      }
      await onRefresh();
    } catch (error) {
      setOrderMessage({ type: "error", text: error.message || "Nao foi possivel enviar notificacoes comerciais." });
    } finally {
      setSavingOrderAction("");
    }
  }

  return (
    <div className="dashboard-view">
      <section className="kpi-grid">
        <KpiCard
          icon={ShoppingCart}
          label="Total de vendas"
          value={formatNumber(salesKpis.totalVendas)}
          detail={`Pedidos concluidos / ${selectedSalesBranchLabel}`}
          tone="blue"
        />
        <KpiCard
          icon={ClipboardList}
          label="Pendentes"
          value={formatNumber(salesKpis.pendentes)}
          detail="Pedidos aguardando andamento"
          tone="amber"
        />
        <KpiCard
          icon={FileText}
          label="Orcamentos"
          value={formatNumber(salesKpis.orcamentos)}
          detail="Propostas salvas aguardando conversao"
          tone="blue"
        />
        <KpiCard
          icon={PackageCheck}
          label="Separacao"
          value={formatNumber(salesKpis.separacao)}
          detail={`${formatNumber(salesKpis.separados)} pedidos prontos`}
          tone="amber"
        />
        <KpiCard
          icon={CircleDollarSign}
          label="Receita total"
          value={formatCurrency(salesKpis.receita)}
          detail="Somatorio de vendas concluidas"
          tone="green"
        />
        <KpiCard
          icon={ArrowUpRight}
          label="Vendas hoje"
          value={formatCurrency(salesKpis.vendasHoje)}
          detail={selectedSalesBranchLabel}
          tone="dark"
        />
      </section>

      <section className="panel account-plan-summary">
        <div className="account-plan-head">
          <div>
            <h3>Filtro operacional</h3>
            <p>Filtre vendas, ranking, follow-up e pedidos por filial.</p>
          </div>
          <div className="account-plan-actions">
            <label className="commission-config-control">
              <span>Filial</span>
              <select
                value={salesBranchFilter}
                onChange={(event) => {
                  setSalesBranchFilter(event.target.value);
                  setCommercialSellerFilter("TODOS");
                }}
              >
                <option value="TODAS">Todas as filiais</option>
                <option value="EMPRESA">Empresa / sem filial</option>
                {filiais.map((filial) => (
                  <option key={filial.id} value={filial.id}>
                    {filial.matriz ? "Matriz" : "Filial"} - {filial.nome}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </section>

      <section className="analytics-grid">
        <article className="panel chart-panel">
          <div className="panel-title chart-title">
            <div>
              <h2>Crescimento de vendas</h2>
              <p>Analise por dia, mes ou ano com dados reais dos pedidos.</p>
            </div>
            <div className="chart-tabs" aria-label="Periodo do grafico de vendas">
              {[
                ["dia", "Dia"],
                ["mes", "Mes"],
                ["ano", "Ano"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={chartPeriod === value ? "active" : ""}
                  onClick={() => setChartPeriod(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {chartRows.length === 0 ? (
            <div className="empty-chart">Nenhuma venda finalizada para montar o grafico.</div>
          ) : (
            <>
              <div className="chart-summary">
                <div>
                  <span>Total no grafico</span>
                  <strong>{formatCurrency(totalChartValue)}</strong>
                </div>
                <div>
                  <span>Periodos</span>
                  <strong>{formatNumber(chartRows.length)}</strong>
                </div>
              </div>
              <div className="sales-chart">
                {chartRows.map((item) => (
                  <div className="sales-bar" key={item.key}>
                    <div className="sales-bar-track" title={`${item.label}: ${formatCurrency(item.value)}`}>
                      <span style={{ height: `${Math.max((item.value / maxSaleValue) * 100, 8)}%` }} />
                    </div>
                    <strong>{item.label}</strong>
                    <small>{formatCurrency(item.value)}</small>
                  </div>
                ))}
              </div>
            </>
          )}
        </article>

        <article className="panel chart-panel">
          <div className="panel-title compact">
            <div>
              <h2>Produtos que mais vendem</h2>
              <p>Priorize compra, estoque e promocao.</p>
            </div>
          </div>

          {topProducts.length === 0 ? (
            <div className="empty-chart">Nenhum produto ranqueado no periodo.</div>
          ) : (
            <div className="product-chart-list">
              {topProducts.map((item) => {
                const quantity = Number(item.quantidade || 0);
                return (
                  <div className="product-chart-row" key={item.produto}>
                    <div>
                      <strong>{item.produto}</strong>
                      <span>
                        {formatNumber(quantity)} un. | {formatCurrency(item.valorTotal)}
                      </span>
                    </div>
                    <div className="product-bar-track">
                      <span style={{ width: `${Math.max((quantity / maxProductQty) * 100, 7)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </article>
      </section>

      <section className="panel account-plan-summary">
        <div className="account-plan-head">
          <div>
            <h3>Ranking por vendedor</h3>
            <p>Metas, comissao e periodo customizado sobre vendas concluidas.</p>
          </div>
          <div className="account-plan-actions">
            {canManageCommission && (
              <>
                <label className="commission-config-control">
                  <span>Comissao (%)</span>
                  <input
                    min="0"
                    max="100"
                    step="0.01"
                    type="number"
                    value={commissionRateInput}
                    onChange={(event) => setCommissionRateInput(event.target.value)}
                    title="Percentual de comissao"
                  />
                </label>
                <button
                  disabled={savingOrderAction === "commission-config"}
                  onClick={handleSaveCommissionConfig}
                  type="button"
                >
                  {savingOrderAction === "commission-config" ? "Salvando..." : "Salvar %"}
                </button>
              </>
            )}
            <button
              disabled={sellerCommissionRows.length === 0}
              onClick={() => downloadCsv(`nexus-one-ranking-vendedores-${getLocalDateKey()}.csv`, sellerCommissionRows)}
              type="button"
            >
              <Download size={15} />
              CSV
            </button>
            <button
              disabled={sellerCommissionRows.length === 0}
              onClick={() => printRowsDocument("Ranking por vendedor", sellerCommissionRows, "Nexus One")}
              type="button"
            >
              <Printer size={15} />
              PDF
            </button>
          </div>
        </div>

        <div className="sales-period-filter seller-ranking-filter">
          <label>
            <span>Inicio</span>
            <input
              type="date"
              value={sellerRankingFilter.inicio}
              onChange={(event) =>
                setSellerRankingFilter((current) => ({ ...current, inicio: event.target.value }))
              }
            />
          </label>
          <label>
            <span>Fim</span>
            <input
              type="date"
              value={sellerRankingFilter.fim}
              onChange={(event) =>
                setSellerRankingFilter((current) => ({ ...current, fim: event.target.value }))
              }
            />
          </label>
          <button
            disabled={!sellerRankingFilter.inicio && !sellerRankingFilter.fim}
            onClick={() => setSellerRankingFilter({ inicio: "", fim: "" })}
            type="button"
          >
            <X size={16} />
            Limpar periodo
          </button>
        </div>

        <div className="sales-period-summary seller-ranking-summary">
          <div>
            <span>Vendas no periodo</span>
            <strong>{formatCurrency(sellerRankingTotal)}</strong>
          </div>
          <div>
            <span>Meta somada</span>
            <strong>{sellerRankingGoal > 0 ? formatCurrency(sellerRankingGoal) : "-"}</strong>
          </div>
          <div>
            <span>Atingimento</span>
            <strong>{sellerRankingGoal > 0 ? `${formatNumber(sellerRankingProgress)}%` : "-"}</strong>
          </div>
        </div>

        <div className="account-plan-grid">
          {sellerCommissionSummary.length === 0 ? (
            <div className="empty-selection compact">Nenhuma venda concluida no periodo selecionado.</div>
          ) : (
            sellerCommissionSummary.slice(0, 8).map((item) => (
              <div className="account-plan-item seller-ranking-card" key={item.vendedor}>
                <span>{item.vendedor}</span>
                <strong>{formatCurrency(item.total)}</strong>
                <small>
                  {formatNumber(item.pedidos)} pedidos / {formatCurrency(item.comissao)} comissao / {formatNumber(commissionPercent)}%
                </small>
                <small>{Array.from(item.filiais || []).join(" | ") || selectedSalesBranchLabel}</small>
                <div className="seller-goal-progress">
                  <span style={{ width: `${Math.min(item.atingimento, 100)}%` }} />
                </div>
                <small>
                  Meta {item.meta > 0 ? formatCurrency(item.meta) : "-"} / {item.meta > 0 ? `${formatNumber(item.atingimento)}%` : "sem meta"}
                </small>
                {canManageCommission && item.usuario && (
                  <div className="seller-goal-editor">
                    <input
                      min="0"
                      step="0.01"
                      type="number"
                      value={sellerGoalDrafts[item.usuario.id] ?? ""}
                      onChange={(event) =>
                        setSellerGoalDrafts((current) => ({ ...current, [item.usuario.id]: event.target.value }))
                      }
                      placeholder="Meta"
                    />
                    <button
                      disabled={savingOrderAction === `meta-${item.usuario.id}`}
                      onClick={() => handleSaveSellerGoal(item.usuario)}
                      type="button"
                    >
                      {savingOrderAction === `meta-${item.usuario.id}` ? "..." : "Salvar"}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      <section className="panel account-plan-summary">
        <div className="account-plan-head">
          <div>
            <h3>Follow-up comercial</h3>
            <p>Orcamentos e pedidos em aberto organizados por vendedor.</p>
          </div>
          <div className="account-plan-actions">
            <label className="commission-config-control">
              <span>Vendedor</span>
              <select value={commercialSellerFilter} onChange={(event) => setCommercialSellerFilter(event.target.value)}>
                {commercialSellerOptions.map((vendedor) => (
                  <option key={vendedor} value={vendedor}>
                    {vendedor === "TODOS" ? "Todos" : vendedor}
                  </option>
                ))}
              </select>
            </label>
            <button
              disabled={commercialFollowUpRows.length === 0}
              onClick={() => downloadCsv(`nexus-one-follow-up-comercial-${getLocalDateKey()}.csv`, commercialFollowUpRows)}
              type="button"
            >
              <Download size={15} />
              CSV
            </button>
            <button
              disabled={commercialFollowUpRows.length === 0}
              onClick={() => printRowsDocument("Follow-up comercial por vendedor", commercialFollowUpRows, "Nexus One")}
              type="button"
            >
              <Printer size={15} />
              PDF
            </button>
          </div>
        </div>

        <div className="account-plan-grid commercial-funnel-grid">
          {commercialFunnelStages.map((stage) => (
            <div className="account-plan-item commercial-funnel-card" key={stage.key}>
              <span>{stage.label}</span>
              <strong>{formatCurrency(stage.valor)}</strong>
              <small>{formatNumber(stage.orders.length)} oportunidades / ticket {formatCurrency(stage.ticketMedio)}</small>
              <small>{stage.action}</small>
              <small>Ultima movimentacao {stage.latest ? formatDateTime(stage.latest) : "-"}</small>
            </div>
          ))}
        </div>

        <div className="account-plan-grid commercial-followup-grid">
          {commercialFollowUpSummary.length === 0 ? (
            <div className="empty-selection compact">Nenhum orcamento ou pedido em aberto para follow-up.</div>
          ) : (
            commercialFollowUpSummary.slice(0, 8).map((item) => (
              <button
                className={commercialSellerFilter === item.vendedor ? "account-plan-item active" : "account-plan-item"}
                key={item.vendedor}
                onClick={() => setCommercialSellerFilter(item.vendedor)}
                type="button"
              >
                <span>{item.vendedor}</span>
                <strong>{formatCurrency(item.valorAberto)}</strong>
                <small>
                  {formatNumber(item.orcamentos)} orc. / {formatNumber(item.pendentes)} pend. / {formatNumber(item.separacao)} separacao
                </small>
                <small>{selectedSalesBranchLabel}</small>
                <small>Ultimo contato {item.ultimoContato ? formatDateTime(item.ultimoContato) : "-"}</small>
              </button>
            ))
          )}
        </div>

        {commercialFollowUpForm.pedidoId && (
          <form className="compact-form product-form collection-followup-form" onSubmit={handleCreateCommercialFollowUp}>
            <div className="finance-form-row">
              <label className="form-control">
                <span>Cliente</span>
                <input readOnly value={commercialFollowUpForm.cliente} />
              </label>
              <label className="form-control">
                <span>Canal</span>
                <select
                  value={commercialFollowUpForm.canal}
                  onChange={(event) => setCommercialFollowUpForm((prev) => ({ ...prev, canal: event.target.value }))}
                >
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Telefone">Telefone</option>
                  <option value="Email">Email</option>
                  <option value="Presencial">Presencial</option>
                </select>
              </label>
              <label className="form-control">
                <span>Proxima acao</span>
                <input
                  type="date"
                  value={commercialFollowUpForm.proximaAcao}
                  onChange={(event) => setCommercialFollowUpForm((prev) => ({ ...prev, proximaAcao: event.target.value }))}
                />
              </label>
            </div>
            <label className="form-control">
              <span>Observacao</span>
              <textarea
                value={commercialFollowUpForm.observacao}
                onChange={(event) => setCommercialFollowUpForm((prev) => ({ ...prev, observacao: event.target.value }))}
              />
            </label>
            <div className="cash-action-buttons compact-bulk-actions">
              <button className="checkout-button" disabled={savingOrderAction === "commercial-follow-up"} type="submit">
                {savingOrderAction === "commercial-follow-up" ? <Loader2 className="spin" size={17} /> : <Plus size={17} />}
                Registrar follow-up
              </button>
              <button className="report-export secondary" onClick={() => setCommercialFollowUpForm(initialCommercialFollowUpForm)} type="button">
                <X size={17} />
                Cancelar
              </button>
            </div>
          </form>
        )}

        {branchScopedCommercialFollowUps.length > 0 && (
          <div className="commercial-followup-history">
            <div className="panel-title compact">
              <div>
                <h3>Historico persistido</h3>
                <p>{formatNumber(pendingCommercialFollowUps.length)} pendentes / {formatNumber(dueCommercialFollowUps.length)} hoje ou vencidos.</p>
              </div>
              <div className="account-plan-actions">
                <button
                  disabled={commercialFollowUpHistoryRows.length === 0}
                  onClick={() => downloadCsv(`nexus-one-follow-up-comercial-historico-${getLocalDateKey()}.csv`, commercialFollowUpHistoryRows)}
                  type="button"
                >
                  <Download size={15} />
                  CSV
                </button>
                <button
                  disabled={commercialFollowUpHistoryRows.length === 0}
                  onClick={() => printRowsDocument("Historico de follow-up comercial", commercialFollowUpHistoryRows, "Nexus One")}
                  type="button"
                >
                  <Printer size={15} />
                  PDF
                </button>
              </div>
            </div>
            <div className="account-plan-grid commercial-followup-grid">
              {branchScopedCommercialFollowUps.slice(0, 4).map((item) => (
                <div className="account-plan-item collection-card" key={item.id}>
                  <span>{item.clienteNome || "Cliente nao identificado"}</span>
                  <strong>{item.proximaAcao ? formatDate(item.proximaAcao) : "Sem data"}</strong>
                  <small>{item.pedidoNumero || item.pedidoId} / {item.canal || "-"} / {item.status || "-"}</small>
                  <small>Filial: {item.filial || "Empresa"}</small>
                  {item.notificacaoExternaEm && (
                    <small>Notificado em {formatDateTime(item.notificacaoExternaEm)}</small>
                  )}
                  <small>{item.observacao || "Sem observacao"}</small>
                  {item.status === "PENDENTE" && (
                    <div className="table-actions">
                      <button disabled={savingOrderAction === `commercial-follow-up-${item.id}`} onClick={() => handleCommercialFollowUpStatus(item.id, "concluir")} type="button">
                        Concluir
                      </button>
                      <button disabled={savingOrderAction === `commercial-follow-up-${item.id}`} onClick={() => handleCommercialFollowUpStatus(item.id, "cancelar")} type="button">
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="table-wrap compact-table">
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Vendedor</th>
                <th>Status</th>
                <th>Proxima acao</th>
                <th>Valor</th>
                <th>Acao</th>
              </tr>
            </thead>
            <tbody>
              {commercialFollowUpOrders.length === 0 ? (
                <tr>
                  <td className="empty-cell" colSpan="6">Nenhum follow-up comercial encontrado.</td>
                </tr>
              ) : (
                commercialFollowUpOrders.slice(0, 8).map((pedido) => (
                  <tr key={pedido.id}>
                    <td>
                      <strong>{pedido.cliente || "Cliente nao informado"}</strong>
                      <small>{pedido.numero || pedido.id}</small>
                      <small>Filial: {pedido.filial || "Empresa"}</small>
                      <small>{getOrderProductSummary(pedido)}</small>
                    </td>
                    <td>{pedido.usuario || pedido.vendedor || "Vendedor nao informado"}</td>
                    <td>
                      <span className={`pill ${String(pedido.status || "").toLowerCase()}`}>{pedido.status || "-"}</span>
                    </td>
                    <td>
                      {pedido.status === "ORCAMENTO"
                        ? "Retomar proposta"
                        : pedido.status === "PENDENTE"
                          ? "Confirmar recebimento"
                          : "Acompanhar separacao"}
                      <small>{formatDateTime(pedido.data)}</small>
                    </td>
                    <td>{formatCurrency(pedido.valor)}</td>
                    <td>
                      <button className="mini-action-button" onClick={() => startCommercialFollowUp(pedido)} type="button">
                        <Phone size={15} />
                        Agendar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel account-plan-summary">
        <div className="account-plan-head">
          <div>
            <h3>Controle fiscal interno</h3>
            <p>Status de autorizacao/rejeicao para conferencia antes da integracao SEFAZ.</p>
          </div>
          <div className="account-plan-actions">
            <button
              disabled={fiscalControlRows.length === 0}
              onClick={() => downloadCsv(`nexus-one-controle-fiscal-${getLocalDateKey()}.csv`, fiscalControlRows)}
              type="button"
            >
              <Download size={15} />
              CSV
            </button>
            <button
              disabled={fiscalControlRows.length === 0}
              onClick={() => printRowsDocument("Controle fiscal interno", fiscalControlRows, session?.empresa || "Nexus One")}
              type="button"
            >
              <Printer size={15} />
              PDF
            </button>
          </div>
        </div>
        <div className="account-plan-grid compact-catalog-grid">
          {fiscalStatusSummary.map((item) => (
            <div className="account-plan-item fiscal-status-card" key={item.value}>
              <span>{item.label}</span>
              <strong>{formatNumber(item.count)} pedido(s)</strong>
              <small>{selectedSalesBranchLabel}</small>
            </div>
          ))}
        </div>
        <div className="commercial-followup-history">
          <div className="account-plan-head">
            <div>
              <h3>Historico fiscal</h3>
              <p>Alteracoes internas de autorizacao, rejeicao e cancelamento.</p>
            </div>
            <div className="account-plan-actions">
              <button
                disabled={fiscalHistoryRows.length === 0}
                onClick={() => downloadCsv(`nexus-one-historico-fiscal-${getLocalDateKey()}.csv`, fiscalHistoryRows)}
                type="button"
              >
                <Download size={15} />
                CSV
              </button>
              <button
                disabled={fiscalHistoryRows.length === 0}
                onClick={() => printRowsDocument("Historico fiscal interno", fiscalHistoryRows, session?.empresa || "Nexus One")}
                type="button"
              >
                <Printer size={15} />
                PDF
              </button>
            </div>
          </div>
          <div className="account-plan-grid commercial-followup-grid">
            {fiscalHistory.length === 0 ? (
              <div className="empty-selection compact">Nenhuma alteracao fiscal registrada.</div>
            ) : (
              fiscalHistory.slice(0, 6).map((item) => (
                <div className="account-plan-item fiscal-status-card" key={item.id}>
                  <span>{item.anterior} para {item.novo}</span>
                  <strong>{item.pedido}</strong>
                  <small>{item.cliente} / {item.filial}</small>
                  <small>{item.data} / {item.usuario}</small>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        <article className="panel orders-panel">
          <div className="panel-title">
            <div>
              <h2>Ultimos pedidos</h2>
              <p>Movimentacoes recentes vindas do PostgreSQL.</p>
            </div>
            <span>{filteredOrders.length} registros</span>
          </div>

          <div className="order-filter-grid">
            <div className="chart-tabs compact-tabs" aria-label="Filtrar pedidos por status">
              {orderStatusOptions.map((option) => (
                <button
                  className={orderStatusFilter === option.value ? "active" : ""}
                  key={option.value}
                  onClick={() => setOrderStatusFilter(option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="chart-tabs compact-tabs" aria-label="Filtrar pedidos por periodo">
              {orderPeriodOptions.map((option) => (
                <button
                  className={orderPeriodFilter === option.value ? "active" : ""}
                  key={option.value}
                  onClick={() => setOrderPeriodFilter(option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          {orderMessage && <p className={`form-message ${orderMessage.type}`}>{orderMessage.text}</p>}

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th>Valor</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-cell">
                      Nenhum pedido encontrado para o filtro selecionado.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((pedido) => (
                    <tr key={pedido.id}>
                      <td>
                        <strong>{pedido.cliente || "Cliente nao informado"}</strong>
                        <small>{pedido.id}</small>
                      </td>
                      <td>{formatDate(pedido.data)}</td>
                      <td>
                        <span className={`pill ${String(pedido.status || "").toLowerCase()}`}>
                          {pedido.status || "-"}
                        </span>
                      </td>
                      <td>{formatCurrency(pedido.valor)}</td>
                      <td>
                        {pedido.status === "ORCAMENTO" ? (
                          <div className="table-actions">
                            <button
                              className="mini-action-button"
                              disabled={savingOrderAction === pedido.id}
                              onClick={() => handlePrintSavedQuote(pedido.id)}
                              type="button"
                            >
                              <Printer size={15} />
                              Imprimir
                            </button>
                            <button
                              className="mini-action-button"
                              disabled={savingOrderAction === pedido.id}
                              onClick={() => handleConvertQuote(pedido.id)}
                              type="button"
                            >
                              {savingOrderAction === pedido.id ? "Processando..." : "Converter"}
                            </button>
                          </div>
                        ) : pedido.status === "PENDENTE" ? (
                          <div className="table-actions">
                            {renderFiscalStatusControl(pedido)}
                            <button
                              className="mini-action-button"
                              disabled={savingOrderAction === pedido.id}
                              onClick={() => handleSeparationAction(pedido.id, "start")}
                              type="button"
                            >
                              {savingOrderAction === pedido.id ? "Processando..." : "Separar"}
                            </button>
                            <button
                              className="mini-action-button"
                              disabled={savingOrderAction === `fiscal-${pedido.id}`}
                              onClick={() => handlePrintFiscalMirror(pedido.id)}
                              type="button"
                            >
                              <ReceiptText size={15} />
                              Fiscal
                            </button>
                          </div>
                        ) : pedido.status === "SEPARACAO" ? (
                          <div className="table-actions">
                            {renderFiscalStatusControl(pedido)}
                            <button
                              className="mini-action-button"
                              disabled={savingOrderAction === pedido.id}
                              onClick={() => handleSeparationAction(pedido.id, "finish")}
                              type="button"
                            >
                              {savingOrderAction === pedido.id ? "Processando..." : "Concluir"}
                            </button>
                            <button
                              className="mini-action-button"
                              disabled={savingOrderAction === `fiscal-${pedido.id}`}
                              onClick={() => handlePrintFiscalMirror(pedido.id)}
                              type="button"
                            >
                              <ReceiptText size={15} />
                              Fiscal
                            </button>
                          </div>
                        ) : pedido.status === "SEPARADO" ? (
                          <div className="table-actions">
                            {renderFiscalStatusControl(pedido)}
                            <button
                              className="mini-action-button"
                              disabled={savingOrderAction === `fiscal-${pedido.id}`}
                              onClick={() => handlePrintFiscalMirror(pedido.id)}
                              type="button"
                            >
                              <ReceiptText size={15} />
                              Fiscal
                            </button>
                          </div>
                        ) : (
                          <div className="table-actions">
                            {renderFiscalStatusControl(pedido)}
                            <button
                              className="mini-action-button"
                              disabled={savingOrderAction === `fiscal-${pedido.id}`}
                              onClick={() => handlePrintFiscalMirror(pedido.id)}
                              type="button"
                            >
                              <ReceiptText size={15} />
                              Fiscal
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>

        <aside className="panel side-panel">
          <div className="panel-title compact">
            <div>
              <h2>Performance</h2>
              <p>Resumo operacional.</p>
            </div>
          </div>

          <div className="metric-list">
            <div>
              <span>Ticket medio</span>
              <strong>{formatCurrency(data?.ticketMedio)}</strong>
            </div>
            <div>
              <span>Dias com venda</span>
              <strong>{formatNumber(vendasPorDia.length)}</strong>
            </div>
            <div>
              <span>Produtos no ranking</span>
              <strong>{formatNumber(rankingProdutos.length)}</strong>
            </div>
          </div>

          <div className="ranking">
            <h3>Ranking de produtos</h3>
            {rankingProdutos.length === 0 ? (
              <p>Nenhum produto ranqueado no periodo.</p>
            ) : (
              rankingProdutos.map((item) => (
                <div className="ranking-row" key={item.produto}>
                  <span>{item.produto}</span>
                  <strong>{formatCurrency(item.valorTotal)}</strong>
                </div>
              ))
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}

function getProductId(produto) {
  return produto?.id || produto?.idProduto;
}

function getProductPrice(produto) {
  return Number(produto?.precoComDesconto ?? produto?.precoVenda ?? 0);
}

function getClientId(cliente) {
  return cliente?.id || cliente?.idCliente;
}

function getClientName(cliente) {
  return cliente?.nome || "Cliente sem nome";
}

function getOrderProductSummary(pedido) {
  const items = asList(pedido?.itens);

  if (items.length === 0) {
    return pedido?.produto || pedido?.nomeProduto || "Produtos nao carregados";
  }

  return items
    .map((item) => {
      const name =
        item?.produto?.nomeProduto ||
        item?.produto?.nome ||
        item?.produto ||
        item?.nomeProduto ||
        item?.descricao ||
        "Produto sem nome";
      const quantity = item?.quantidade ? `${formatNumber(item.quantidade)}x ` : "";
      return `${quantity}${name}`;
    })
    .join(", ");
}

function getPriorityPayload(value) {
  const priorities = {
    BAIXA: "Baixa",
    NORMAL: "Normal",
    ALTA: "Alta",
    URGENTE: "Urgente",
  };
  return priorities[value] || value || "Normal";
}

function PointOfSale({
  produtos,
  clientes,
  session,
  onSaleCreated,
  cashMode = false,
  caixa = null,
  canOperateCash = true,
}) {
  const [selectedClienteId, setSelectedClienteId] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [priority, setPriority] = useState("Normal");
  const [paymentMethod, setPaymentMethod] = useState("PIX");
  const [paymentInstallments, setPaymentInstallments] = useState(1);
  const [deliveryType, setDeliveryType] = useState("RETIRADA_LOJA");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [receivedAmount, setReceivedAmount] = useState("");
  const [mixedPayments, setMixedPayments] = useState({
    PIX: "",
    DINHEIRO: "",
    CARTAO_CREDITO: "",
    CARTAO_DEBITO: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [lastSale, setLastSale] = useState(null);
  const formRef = useRef(null);
  const clientSearchRef = useRef(null);
  const productSearchRef = useRef(null);
  const isPayOnDelivery = paymentMethod === "PAGAR_NA_ENTREGA";
  const isMixedPayment = paymentMethod === "MISTO";
  const paymentOptions = cashMode
    ? cashPaymentOptions
    : [
      { value: "PIX", label: "Pix" },
      { value: "DINHEIRO", label: "Dinheiro" },
      { value: "CARTAO_CREDITO", label: "Cartao credito" },
      { value: "CARTAO_DEBITO", label: "Cartao debito" },
      { value: "BOLETO", label: "Boleto" },
      { value: "MISTO", label: "Misto" },
    ];

  const activeProducts = produtos.filter((produto) => produto.ativo !== false);
  const filteredProducts = activeProducts
    .filter((produto) => {
      const text = `${produto.nome || ""} ${produto.codigoBarras || ""}`.toLowerCase();
      return text.includes(productSearch.toLowerCase());
    })
    .slice(0, 8);

  const selectedCliente = clientes.find(
    (cliente) => String(getClientId(cliente)) === String(selectedClienteId),
  );
  const filteredClientes = clientes
    .filter((cliente) => {
      const text = `${getClientName(cliente)} ${cliente.cpf || ""} ${cliente.email || ""}`.toLowerCase();
      return text.includes(clientSearch.toLowerCase());
    })
    .slice(0, 8);

  const subtotal = cart.reduce(
    (total, item) => total + item.preco * item.quantidade,
    0,
  );
  const descontoValor = subtotal * (Number(discount || 0) / 100);
  const total = Math.max(subtotal - descontoValor, 0);
  const received = Number(receivedAmount || 0);
  const change = paymentMethod === "DINHEIRO" ? Math.max(received - total, 0) : 0;
  const mixedPaymentTotal = getMixedPaymentTotal(mixedPayments);
  const mixedPaymentDifference = isMixedPayment ? Number((mixedPaymentTotal - total).toFixed(2)) : 0;
  const proposalNumber = `PROP-${getLocalDateKey().replace(/-/g, "")}-${String(Date.now()).slice(-5)}`;
  const proposalBranchLabel = session?.filial || "Empresa / sem filial";
  const buildProposal = () => ({
    numero: proposalNumber,
    cliente: selectedCliente ? getClientName(selectedCliente) : "Cliente nao informado",
    vendedor: session.nome || session.login || session.perfil || "Usuario",
    filial: proposalBranchLabel,
    data: new Date().toLocaleString("pt-BR"),
    validade: new Intl.DateTimeFormat("pt-BR").format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
    entrega: deliveryType === "ENTREGA" ? deliveryAddress || "Entrega a combinar" : "Retirada na loja",
    itens: cart,
    subtotal,
    descontoValor,
    total,
    observacao: deliveryNote,
  });
  const proposalRows = cart.map((item) => ({
    Proposta: proposalNumber,
    Cliente: selectedCliente ? getClientName(selectedCliente) : "Cliente nao informado",
    Filial: proposalBranchLabel,
    Produto: item.nome,
    Codigo: item.codigoBarras || "-",
    Quantidade: formatNumber(item.quantidade),
    Unitario: formatCurrency(item.preco),
    Total: formatCurrency(item.preco * item.quantidade),
  }));

  function addProduct(produto) {
    const produtoId = getProductId(produto);
    const estoqueDisponivel = Number(getProductStockQuantity(produto) || 0);

    if (!produtoId) {
      setMessage({ type: "error", text: "Produto sem identificador valido." });
      return;
    }

    if (estoqueDisponivel <= 0) {
      setMessage({ type: "error", text: `${produto.nome || "Produto"} sem estoque disponivel.` });
      return;
    }

    setCart((prev) => {
      const exists = prev.find((item) => item.produtoId === produtoId);

      if (exists) {
        if (exists.quantidade >= estoqueDisponivel) {
          setMessage({
            type: "error",
            text: `${exists.nome} possui apenas ${formatNumber(estoqueDisponivel)} un. em estoque.`,
          });
          return prev;
        }

        return prev.map((item) =>
          item.produtoId === produtoId
            ? { ...item, quantidade: item.quantidade + 1 }
            : item,
        );
      }

      return [
        ...prev,
        {
          produtoId,
          nome: produto.nome || "Produto sem nome",
          codigoBarras: produto.codigoBarras,
          preco: getProductPrice(produto),
          quantidade: 1,
          estoqueDisponivel,
        },
      ];
    });
  }

  function addProductFromSearch() {
    const query = productSearch.trim();
    if (!query) return;

    const normalizedQuery = query.toLowerCase();
    const exactBarcodeMatch = activeProducts.find(
      (produto) => String(produto.codigoBarras || "").toLowerCase() === normalizedQuery,
    );
    const exactNameMatch = activeProducts.find(
      (produto) => String(produto.nome || "").toLowerCase() === normalizedQuery,
    );
    const productToAdd = exactBarcodeMatch || exactNameMatch || (filteredProducts.length === 1 ? filteredProducts[0] : null);

    if (!productToAdd) {
      setMessage({ type: "error", text: "Produto nao encontrado para o codigo informado." });
      return;
    }

    addProduct(productToAdd);
    setProductSearch("");
    setMessage(null);
  }

  function changeQuantity(produtoId, delta) {
    setCart((prev) =>
      prev.map((item) => {
        if (item.produtoId !== produtoId) return item;

        const estoqueDisponivel = Number(item.estoqueDisponivel || 0);
        const nextQuantity = Math.max(1, item.quantidade + delta);

        if (delta > 0 && estoqueDisponivel > 0 && nextQuantity > estoqueDisponivel) {
          setMessage({
            type: "error",
            text: `${item.nome} possui apenas ${formatNumber(estoqueDisponivel)} un. em estoque.`,
          });
          return item;
        }

        return { ...item, quantidade: nextQuantity };
      }),
    );
  }

  function removeProduct(produtoId) {
    setCart((prev) => prev.filter((item) => item.produtoId !== produtoId));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (cashMode && !caixa?.id) {
      setMessage({ type: "error", text: "Abra um caixa antes de finalizar vendas no PDV." });
      return;
    }

    if (cashMode && !canOperateCash) {
      setMessage({ type: "error", text: "Seu perfil nao tem permissao para operar o caixa." });
      return;
    }

    if (!selectedClienteId) {
      setMessage({ type: "error", text: "Selecione o cliente da venda." });
      return;
    }

    if (cart.length === 0) {
      setMessage({ type: "error", text: "Adicione pelo menos um produto." });
      return;
    }

    if (!session.usuarioId) {
      setMessage({ type: "error", text: "Sessao sem usuarioId para registrar a venda." });
      return;
    }

    if (cashMode && paymentMethod === "DINHEIRO" && received < total) {
      setMessage({ type: "error", text: "Valor recebido em dinheiro menor que o total da venda." });
      return;
    }

    if (cashMode && isMixedPayment && Math.abs(mixedPaymentDifference) > 0.009) {
      setMessage({ type: "error", text: "A soma do pagamento misto deve ser igual ao total da venda." });
      return;
    }

    const itemSemEstoque = cart.find(
      (item) => Number(item.estoqueDisponivel || 0) <= 0 || item.quantidade > Number(item.estoqueDisponivel || 0),
    );

    if (itemSemEstoque) {
      setMessage({
        type: "error",
        text: `${itemSemEstoque.nome} nao possui estoque suficiente para finalizar a venda.`,
      });
      return;
    }

    setSaving(true);
    setMessage(null);
    setLastSale(null);

    try {
      const pedido = await endpoints.pedidos.criar({
        clienteId: selectedClienteId,
        usuarioId: session.usuarioId,
        filialId: session.filialId || null,
        prioridade: getPriorityPayload(priority),
        metodoPagamento: paymentMethod,
        parcelas: canInstallmentPayment(paymentMethod) ? Number(paymentInstallments || 1) : 1,
        tipoEntrega: deliveryType,
        enderecoEntrega: deliveryType === "ENTREGA" ? deliveryAddress : "",
        observacaoEntrega: deliveryNote,
        desconto: Number(discount || 0),
        itens: cart.map((item) => ({
          produtoId: item.produtoId,
          quantidade: item.quantidade,
        })),
      });

      if (cashMode) {
        const vendaRecebida = await endpoints.pedidos.finalizar(pedido.id, {
          metodoPagamento: paymentMethod,
          parcelas: canInstallmentPayment(paymentMethod) ? Number(paymentInstallments || 1) : 1,
          detalhesPagamento: isMixedPayment ? formatMixedPaymentDetails(mixedPayments) : "",
        });
        setLastSale({
          id: vendaRecebida.id || pedido.id,
          numero: vendaRecebida.numero || pedido.numero,
          cliente: selectedCliente ? getClientName(selectedCliente) : "Cliente nao informado",
          vendedor: session.nome || session.login || session.perfil || "Usuario",
          pagamento: paymentMethod,
          parcelas: canInstallmentPayment(paymentMethod) ? Number(paymentInstallments || 1) : 1,
          data: new Date().toLocaleString("pt-BR"),
          itens: cart,
          subtotal,
          descontoValor,
          total,
          recebido: received,
          troco: change,
          pagamentosMisturados: getMixedPaymentRows(mixedPayments),
        });
      } else if (isPayOnDelivery) {
        setLastSale(null);
      } else {
        setLastSale(null);
      }

      setCart([]);
      setDiscount(0);
      setDeliveryType("RETIRADA_LOJA");
      setDeliveryAddress("");
      setDeliveryNote("");
      setReceivedAmount("");
      setMixedPayments({
        PIX: "",
        DINHEIRO: "",
        CARTAO_CREDITO: "",
        CARTAO_DEBITO: "",
      });
      setPaymentInstallments(1);
      setProductSearch("");
      setClientSearch("");
      setSelectedClienteId("");
      setMessage({
        type: "success",
        text: cashMode
          ? `Venda ${pedido.numero || ""} recebida no caixa com sucesso.`
          : `Pedido ${pedido.numero || ""} registrado. O caixa deve receber o pagamento para finalizar.`,
      });
      await onSaleCreated();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  function handlePrintProposal() {
    if (cart.length === 0) {
      setMessage({ type: "error", text: "Adicione pelo menos um produto para gerar proposta." });
      return;
    }

    printCommercialProposal(buildProposal(), session?.empresa || "Nexus One");
  }

  function handleExportProposalCsv() {
    if (cart.length === 0) {
      setMessage({ type: "error", text: "Adicione pelo menos um produto para exportar proposta." });
      return;
    }

    downloadCsv(`nexus-one-proposta-${proposalNumber}.csv`, [
      ...proposalRows,
      {
        Proposta: proposalNumber,
        Cliente: selectedCliente ? getClientName(selectedCliente) : "Cliente nao informado",
        Filial: proposalBranchLabel,
        Produto: "TOTAL",
        Codigo: "",
        Quantidade: "",
        Unitario: "",
        Total: formatCurrency(total),
      },
    ]);
  }

  async function handleSaveQuote() {
    if (cart.length === 0) {
      setMessage({ type: "error", text: "Adicione pelo menos um produto para salvar orcamento." });
      return;
    }

    if (!selectedClienteId) {
      setMessage({ type: "error", text: "Selecione um cliente para salvar orcamento." });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const pedido = await endpoints.pedidos.criar({
        clienteId: selectedClienteId,
        usuarioId: session.usuarioId,
        filialId: session.filialId || null,
        prioridade: getPriorityPayload(priority),
        metodoPagamento: paymentMethod,
        parcelas: canInstallmentPayment(paymentMethod) ? Number(paymentInstallments || 1) : 1,
        tipoEntrega: deliveryType,
        enderecoEntrega: deliveryType === "ENTREGA" ? deliveryAddress : "",
        observacaoEntrega: deliveryNote,
        desconto: Number(discount || 0),
        orcamento: true,
        itens: cart.map((item) => ({
          produtoId: item.produtoId,
          quantidade: item.quantidade,
        })),
      });

      setMessage({ type: "success", text: `Orcamento ${pedido.numero || ""} salvo com sucesso.` });
      await onSaleCreated();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    function handleShortcut(event) {
      if (event.altKey || event.ctrlKey || event.metaKey || saving) return;

      if (event.key === "F2") {
        event.preventDefault();
        productSearchRef.current?.focus();
        productSearchRef.current?.select();
      }

      if (event.key === "F4") {
        event.preventDefault();
        clientSearchRef.current?.focus();
        clientSearchRef.current?.select();
      }

      if (event.key === "F8") {
        event.preventDefault();
        formRef.current?.requestSubmit();
      }

      if (event.key === "Escape") {
        setProductSearch("");
        setClientSearch(selectedCliente ? getClientName(selectedCliente) : "");
        setMessage(null);
      }
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [saving, selectedCliente]);

  return (
    <form ref={formRef} className={cashMode ? "pos-grid cash-pos-grid" : "pos-grid"} onSubmit={handleSubmit}>
      <article className="panel pos-panel">
        <div className="panel-title">
          <div>
            <h2>{cashMode ? "PDV do caixa" : "Nova venda"}</h2>
            <p>
              {cashMode
                ? "Venda direta no caixa. Para receber venda do vendedor, use a lista de pagamentos acima."
                : "Monte o pedido com cliente, forma de pagamento e desconto para o caixa receber."}
            </p>
          </div>
          <span>{cashMode && caixa ? `Caixa ${caixa.status}` : `${formatNumber(activeProducts.length)} produtos`}</span>
        </div>

        <div className="pos-form-grid">
          <label className="form-control client-picker-control">
            <span>{cashMode ? "Cliente da venda" : "Cliente"}</span>
            <div className="client-search-box">
              <Search size={17} />
              <input
                ref={clientSearchRef}
                value={clientSearch}
                onChange={(event) => {
                  setClientSearch(event.target.value);
                  setSelectedClienteId("");
                }}
                placeholder="Digite o nome do cliente"
              />
            </div>
            {clientSearch && !selectedClienteId && (
              <div className="client-results">
                {filteredClientes.length === 0 ? (
                  <button className="client-result empty" disabled type="button">
                    Nenhum cliente encontrado
                  </button>
                ) : (
                  filteredClientes.map((cliente) => (
                    <button
                      className="client-result"
                      key={getClientId(cliente)}
                      onClick={() => {
                        setSelectedClienteId(getClientId(cliente));
                        setClientSearch(getClientName(cliente));
                      }}
                      type="button"
                    >
                      <strong>{getClientName(cliente)}</strong>
                      <small>{cliente.cpf || cliente.email || "Cliente cadastrado"}</small>
                    </button>
                  ))
                )}
              </div>
            )}
          </label>

          {!cashMode && (
            <label className="form-control">
            <span>Prioridade</span>
            <select value={priority} onChange={(event) => setPriority(event.target.value)}>
              <option value="Normal">Normal</option>
              <option value="Alta">Alta</option>
              <option value="Urgente">Urgente</option>
              <option value="Baixa">Baixa</option>
            </select>
          </label>
          )}

          <div className="form-control delivery-control">
            <span>Entrega</span>
            <div className="delivery-options">
              <button
                className={deliveryType === "RETIRADA_LOJA" ? "active" : ""}
                onClick={() => setDeliveryType("RETIRADA_LOJA")}
                type="button"
              >
                <PackageCheck size={16} />
                Retirar na loja
              </button>
              <button
                className={deliveryType === "ENTREGA" ? "active" : ""}
                onClick={() => setDeliveryType("ENTREGA")}
                type="button"
              >
                <Truck size={16} />
                Entregar
              </button>
            </div>
          </div>

          {deliveryType === "ENTREGA" && (
            <label className="form-control client-picker-control">
              <span>Endereco de entrega</span>
              <input
                value={deliveryAddress}
                onChange={(event) => setDeliveryAddress(event.target.value)}
                placeholder="Endereco, numero, bairro e complemento"
              />
            </label>
          )}

          <label className="form-control client-picker-control">
            <span>Observacao da entrega</span>
            <input
              value={deliveryNote}
              onChange={(event) => setDeliveryNote(event.target.value)}
              placeholder={deliveryType === "ENTREGA" ? "Ex.: tocar campainha" : "Ex.: cliente retira no balcao"}
            />
          </label>

          <label className="form-control">
            <span>Desconto (%)</span>
            <input
              max="100"
              min="0"
              type="number"
              value={discount}
              onChange={(event) => setDiscount(Math.min(100, Number(event.target.value || 0)))}
            />
          </label>

          {!cashMode && (
            <label className="form-control">
            <span>Pagamento</span>
            <select
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
            >
              <option value="PIX">Pix</option>
              <option value="DINHEIRO">Dinheiro</option>
              <option value="CARTAO_CREDITO">Cartao credito</option>
              <option value="CARTAO_DEBITO">Cartao debito</option>
              <option value="BOLETO">Boleto</option>
              <option value="MISTO">Misto</option>
            </select>
          </label>
          )}
        </div>

        <label className="search-field product-search">
          {cashMode ? <Barcode size={17} /> : <Search size={17} />}
          <input
            ref={productSearchRef}
            value={productSearch}
            onChange={(event) => setProductSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addProductFromSearch();
              }
            }}
            placeholder={cashMode ? "Ler codigo de barras ou buscar produto" : "Buscar produto para adicionar"}
          />
        </label>

        <div className="product-pick-list">
          {filteredProducts.length === 0 ? (
            <div className="empty-selection">Nenhum produto ativo encontrado.</div>
          ) : (
            filteredProducts.map((produto) => (
              <button
                className="product-pick"
                key={getProductId(produto)}
                onClick={() => addProduct(produto)}
                type="button"
              >
                  <span>
                    <strong>{produto.nome || "Produto sem nome"}</strong>
                    <small>
                      {produto.codigoBarras || "Sem codigo"} | Estoque {formatNumber(getProductStockQuantity(produto))}
                    </small>
                  </span>
                <em>{formatCurrency(getProductPrice(produto))}</em>
                <Plus size={17} />
              </button>
            ))
          )}
        </div>
      </article>

      <aside className="panel side-panel checkout-panel">
        <div className="panel-title compact">
          <div>
            <h2>Carrinho</h2>
            <p>{selectedCliente ? getClientName(selectedCliente) : "Aguardando cliente"}</p>
          </div>
        </div>

        <div className="cart-list">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <ReceiptText size={24} />
              <span>Nenhum item adicionado.</span>
            </div>
          ) : (
            cart.map((item) => (
              <div className="cart-row" key={item.produtoId}>
                <div>
                  <strong>{item.nome}</strong>
                  <small>
                    {formatCurrency(item.preco)} un. | Estoque {formatNumber(item.estoqueDisponivel)}
                  </small>
                </div>
                <div className="qty-control">
                  <button
                    onClick={() => changeQuantity(item.produtoId, -1)}
                    title="Diminuir"
                    type="button"
                  >
                    <Minus size={14} />
                  </button>
                  <span>{item.quantidade}</span>
                  <button
                    onClick={() => changeQuantity(item.produtoId, 1)}
                    title="Aumentar"
                    type="button"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <strong>{formatCurrency(item.preco * item.quantidade)}</strong>
                <button
                  className="icon-danger"
                  onClick={() => removeProduct(item.produtoId)}
                  title="Remover"
                  type="button"
                >
                  <X size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="total-card">
          <div>
            <span>Subtotal</span>
            <strong>{formatCurrency(subtotal)}</strong>
          </div>
          <div>
            <span>Desconto</span>
            <strong>{formatCurrency(descontoValor)}</strong>
          </div>
          <div className="grand-total">
            <span>Total</span>
            <strong>{formatCurrency(total)}</strong>
          </div>
        </div>

        {cashMode && (
          <div className="cash-payment-panel">
            <span>Forma de pagamento</span>
            <div className="cash-payment-options">
              {paymentOptions.map((option) => (
                <button
                    className={paymentMethod === option.value ? "active" : ""}
                    key={option.value}
                    onClick={() => {
                      setPaymentMethod(option.value);
                      if (!canInstallmentPayment(option.value)) setPaymentInstallments(1);
                      if (option.value !== "DINHEIRO") setReceivedAmount("");
                    }}
                    type="button"
                  >
                  <CreditCard size={16} />
                  {option.label}
                </button>
              ))}
            </div>
            {paymentMethod === "DINHEIRO" && (
              <div className="cash-received-grid">
                <label className="form-control">
                  <span>Recebido</span>
                  <input
                    min="0"
                    step="0.01"
                    type="number"
                    value={receivedAmount}
                    onChange={(event) => setReceivedAmount(event.target.value)}
                    placeholder="0,00"
                  />
                </label>
                <div>
                  <span>Troco</span>
                  <strong>{formatCurrency(change)}</strong>
                </div>
              </div>
            )}
            {isMixedPayment && (
              <div className="mixed-payment-grid">
                {Object.keys(mixedPayments).map((method) => (
                  <label className="form-control" key={method}>
                    <span>{getPaymentMethodLabel(method)}</span>
                    <input
                      min="0"
                      step="0.01"
                      type="number"
                      value={mixedPayments[method]}
                      onChange={(event) =>
                        setMixedPayments((prev) => ({
                          ...prev,
                          [method]: event.target.value,
                        }))
                      }
                      placeholder="0,00"
                    />
                  </label>
                ))}
                <div className={`mixed-payment-balance ${Math.abs(mixedPaymentDifference) < 0.009 ? "ok" : "pending"}`}>
                  <span>{mixedPaymentDifference >= 0 ? "Excedente" : "Falta"}</span>
                  <strong>{formatCurrency(Math.abs(mixedPaymentDifference))}</strong>
                </div>
              </div>
            )}
            {canInstallmentPayment(paymentMethod) && (
              <label className="form-control">
                <span>Parcelas</span>
                <select
                  value={paymentInstallments}
                  onChange={(event) => setPaymentInstallments(Number(event.target.value))}
                >
                  {Array.from({ length: 12 }, (_, index) => index + 1).map((parcela) => (
                    <option key={parcela} value={parcela}>
                      {parcela}x de {formatCurrency(total / parcela)}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        )}

        {message && <p className={`form-message ${message.type}`}>{message.text}</p>}

        {lastSale && (
          <button
            className="invoice-button"
            onClick={() => printSaleReceipt(lastSale, session?.empresa || "Nexus One")}
            type="button"
          >
            <Printer size={17} />
            Imprimir recibo
          </button>
        )}

        <button className="invoice-button secondary" disabled={cart.length === 0} onClick={handlePrintProposal} type="button">
          <FileText size={17} />
          Imprimir proposta
        </button>

        <button className="invoice-button secondary" disabled={cart.length === 0} onClick={handleExportProposalCsv} type="button">
          <Download size={17} />
          CSV proposta
        </button>

        <button className="invoice-button secondary" disabled={saving || cart.length === 0 || !selectedClienteId} onClick={handleSaveQuote} type="button">
          <FileText size={17} />
          Salvar orcamento
        </button>

        <button className="checkout-button" disabled={saving} type="submit">
          {saving ? <Loader2 className="spin" size={17} /> : <CreditCard size={17} />}
          {saving
            ? "Registrando..."
            : isPayOnDelivery
              ? "Registrar para entrega"
              : cashMode
                ? "Finalizar no caixa"
                : "Enviar para o caixa"}
        </button>
      </aside>
    </form>
  );
}

function SalesDashboard({ data, session, onRefresh }) {
  const [view, setView] = useState("overview");
  const dashboard = data?.dashboard || data || {};
  const produtos = asList(data?.produtos);
  const clientes = asList(data?.clientes);

  return (
    <div className="dashboard-view sales-view">
      <div className="view-switch" role="tablist" aria-label="Vendas">
        <button
          className={view === "overview" ? "active" : ""}
          onClick={() => setView("overview")}
          type="button"
        >
          <ChartNoAxesCombined size={17} />
          Visao geral
        </button>
        <button
          className={view === "pdv" ? "active" : ""}
          onClick={() => setView("pdv")}
          type="button"
        >
          <ShoppingCart size={17} />
          Nova venda
        </button>
      </div>

      {view === "overview" ? (
        <SalesOverview data={dashboard} onRefresh={onRefresh} session={session} />
      ) : (
        <PointOfSale
          clientes={clientes}
          onSaleCreated={onRefresh}
          produtos={produtos}
          session={session}
        />
      )}
    </div>
  );
}

const DEFAULT_STOCK_MINIMUM = 5;

function getStockProductName(item) {
  return (
    item?.produto?.nomeProduto ||
    item?.produto?.nome ||
    item?.nomeProduto ||
    item?.nome ||
    "Produto sem nome"
  );
}

function getStockQuantity(item) {
  return item?.quantidadeAtual ?? item?.quantidade ?? item?.saldo ?? 0;
}

function getStockMinimum(item) {
  return Number(
    item?.estoqueMinimo ??
      item?.qtaMinimo ??
      item?.limiteMinimo ??
      item?.produto?.estoqueMinimo ??
      item?.produto?.qtaMinimo ??
      DEFAULT_STOCK_MINIMUM,
  );
}

function getProductStockQuantity(produto) {
  return produto?.quantidadeEstoque ?? produto?.estoqueAtual ?? getStockQuantity(produto);
}

function getProductStockMinimum(produto) {
  return getStockMinimum(produto);
}

function isLowStockProduct(produto) {
  const minimum = getProductStockMinimum(produto);
  return produto?.ativo && minimum > 0 && getProductStockQuantity(produto) <= minimum;
}

function generateProductBarcode(produtos) {
  const year = new Date().getFullYear();
  const prefix = `NX${year}`;
  const nextNumber =
    produtos
      .map((produto) => produto?.codigoBarras || "")
      .filter((codigo) => codigo.startsWith(prefix))
      .map((codigo) => Number(codigo.slice(prefix.length)))
      .filter(Number.isFinite)
      .reduce((max, value) => Math.max(max, value), 0) + 1;

  return `${prefix}${String(nextNumber).padStart(5, "0")}`;
}

function formatProfit(value) {
  const numeric = Number(value || 0);
  const percent = numeric > 0 && numeric <= 10 ? numeric * 100 : numeric;
  return `${formatNumber(percent)}%`;
}

const initialCustomerForm = {
  nome: "",
  cpf: "",
  dataNascimento: "",
  email: "",
  telefone: "",
  endereco: "",
};

const initialCommercialFollowUpForm = {
  pedidoId: "",
  cliente: "",
  canal: "WhatsApp",
  proximaAcao: "",
  observacao: "",
};

function CustomerDashboard({ data, onRefresh }) {
  const [search, setSearch] = useState("");
  const [customerBranchFilter, setCustomerBranchFilter] = useState("TODAS");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [form, setForm] = useState(initialCustomerForm);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const clientes = asList(data?.clientes || data);
  const pedidos = asList(data?.pedidos);
  const filiais = asList(data?.filiais);
  const completedCustomerStatuses = new Set(["FINALIZADA", "RECEBIDO", "ENTREGUE", "CONCLUIDO"]);

  function getCustomerOrders(cliente) {
    return pedidos.filter((pedido) => String(pedido.clienteId || "") === String(getClientId(cliente)));
  }

  function matchesCustomerBranch(cliente) {
    if (customerBranchFilter === "TODAS") return true;
    const customerOrders = getCustomerOrders(cliente);
    if (customerBranchFilter === "EMPRESA") {
      return customerOrders.length === 0 || customerOrders.some((pedido) => !pedido.filialId);
    }
    return customerOrders.some((pedido) => String(pedido.filialId || "") === customerBranchFilter);
  }

  function getCustomerBranchLabel(cliente) {
    const customerOrders = getCustomerOrders(cliente);
    const branchOrder = customerOrders.find((pedido) => pedido.filialId || pedido.filial);
    if (!branchOrder) return "Empresa / sem filial";
    return branchOrder.filial || filiais.find((filial) => String(filial.id) === String(branchOrder.filialId))?.nome || "Filial";
  }

  const branchFilteredClientes = clientes.filter(matchesCustomerBranch);
  const clientesComEmail = branchFilteredClientes.filter((cliente) => cliente.email).length;
  const clientesComTelefone = branchFilteredClientes.filter((cliente) => cliente.telefone).length;
  const clientesNovosMes = branchFilteredClientes.filter((cliente) => {
    if (!cliente.dataCriacao) return false;
    const criado = new Date(cliente.dataCriacao);
    const hoje = new Date();
    return criado.getMonth() === hoje.getMonth() && criado.getFullYear() === hoje.getFullYear();
  }).length;

  const filteredClientes = branchFilteredClientes.filter((cliente) => {
    const text = `${cliente.nome || ""} ${cliente.cpf || ""} ${cliente.email || ""}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });
  const selectedCustomer = filteredClientes.find((cliente) => String(getClientId(cliente)) === String(selectedCustomerId))
    || filteredClientes[0]
    || null;
  const selectedCustomerOrders = selectedCustomer
    ? getCustomerOrders(selectedCustomer)
        .sort((a, b) => String(b.data || "").localeCompare(String(a.data || "")))
    : [];
  const selectedCustomerCompletedOrders = selectedCustomerOrders.filter((pedido) =>
    completedCustomerStatuses.has(String(pedido.status || "")),
  );
  const selectedCustomerRevenue = selectedCustomerCompletedOrders.reduce((total, pedido) => total + Number(pedido.valor || 0), 0);
  const selectedCustomerAverageTicket =
    selectedCustomerCompletedOrders.length > 0
      ? selectedCustomerRevenue / selectedCustomerCompletedOrders.length
      : 0;
  const selectedCustomerLastOrder = selectedCustomerOrders[0];
  const customerHistoryRows = selectedCustomerOrders.map((pedido) => ({
    Pedido: pedido.numero || pedido.id,
    Filial: pedido.filial || "Empresa / sem filial",
    Produtos: getOrderProductSummary(pedido),
    Data: formatDateTime(pedido.data),
    Status: pedido.status || "-",
    Vendedor: pedido.usuario || "-",
    Pagamento: pedido.metodoPagamentoDescricao || pedido.metodoPagamento || "-",
    Entrega: pedido.tipoEntregaDescricao || pedido.tipoEntrega || "-",
    Valor: formatCurrency(pedido.valor),
  }));

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const cpf = form.cpf.replace(/\D/g, "");

    if (!form.nome.trim()) {
      setMessage({ type: "error", text: "Informe o nome do cliente." });
      return;
    }

    if (cpf.length !== 11) {
      setMessage({ type: "error", text: "CPF precisa ter 11 digitos." });
      return;
    }

    if (!form.dataNascimento) {
      setMessage({ type: "error", text: "Informe a data de nascimento." });
      return;
    }

    if (!form.email.trim()) {
      setMessage({ type: "error", text: "Informe o email do cliente." });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      await endpoints.clientes.criar({
        ...form,
        nome: form.nome.trim(),
        cpf,
        email: form.email.trim(),
        telefone: form.telefone.trim(),
        endereco: form.endereco.trim(),
      });

      setForm(initialCustomerForm);
      setMessage({ type: "success", text: "Cliente cadastrado com sucesso." });
      setShowCustomerForm(false);
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dashboard-view">
      <section className="kpi-grid">
          <KpiCard
            icon={UserRound}
            label="Clientes"
            value={formatNumber(branchFilteredClientes.length)}
            detail={customerBranchFilter === "TODAS" ? "Base comercial ativa" : "Filtro por filial ativo"}
            tone="blue"
          />
        <KpiCard
          icon={Mail}
          label="Com email"
          value={formatNumber(clientesComEmail)}
          detail="Prontos para contato digital"
          tone="green"
        />
        <KpiCard
          icon={Phone}
          label="Com telefone"
          value={formatNumber(clientesComTelefone)}
          detail="Atendimento e pos-venda"
          tone="amber"
        />
        <KpiCard
          icon={ArrowUpRight}
          label="Novos no mes"
          value={formatNumber(clientesNovosMes)}
          detail="Crescimento da carteira"
          tone="dark"
        />
      </section>

      <section className="dashboard-grid customer-grid single-column-grid">
        <aside className="panel side-panel">
          <div className="panel-title compact">
            <div>
              <h2>Historico do cliente</h2>
              <p>Compras, ticket e ultima movimentacao.</p>
            </div>
          </div>

          <label className="form-control">
            <span>Cliente</span>
            <select
              value={selectedCustomer ? getClientId(selectedCustomer) : ""}
              onChange={(event) => setSelectedCustomerId(event.target.value)}
            >
              {filteredClientes.map((cliente) => (
                <option key={getClientId(cliente)} value={getClientId(cliente)}>
                  {getClientName(cliente)}
                </option>
              ))}
            </select>
          </label>

          <label className="form-control">
            <span>Filial</span>
            <select value={customerBranchFilter} onChange={(event) => setCustomerBranchFilter(event.target.value)}>
              <option value="TODAS">Todas as filiais</option>
              <option value="EMPRESA">Empresa / sem filial</option>
              {filiais.map((filial) => (
                <option key={filial.id} value={filial.id}>
                  {filial.matriz ? "Matriz" : "Filial"} - {filial.nome}
                </option>
              ))}
            </select>
          </label>

          <div className="reconciliation-grid compact-metrics-grid">
            <div>
              <span>Pedidos</span>
              <strong>{formatNumber(selectedCustomerOrders.length)}</strong>
              <small>{formatNumber(selectedCustomerCompletedOrders.length)} concluidos</small>
            </div>
            <div>
              <span>Total comprado</span>
              <strong>{formatCurrency(selectedCustomerRevenue)}</strong>
              <small>historico carregado</small>
            </div>
            <div>
              <span>Ticket medio</span>
              <strong>{formatCurrency(selectedCustomerAverageTicket)}</strong>
              <small>pedidos concluidos</small>
            </div>
          </div>

          {selectedCustomerLastOrder ? (
            <div className="due-account-list">
              <div className="due-account-card">
                <strong>Ultima compra</strong>
                <span className="due-account-date">{formatDateTime(selectedCustomerLastOrder.data)}</span>
                <small className="due-account-status">
                  {selectedCustomerLastOrder.status || "-"} / {formatCurrency(selectedCustomerLastOrder.valor)}
                </small>
              </div>
            </div>
          ) : (
            <div className="empty-selection compact">Nenhuma compra encontrada para este cliente.</div>
          )}

          <div className="account-plan-actions">
            <button
              disabled={customerHistoryRows.length === 0}
              onClick={() => downloadCsv(`nexus-one-historico-cliente-${getLocalDateKey()}.csv`, customerHistoryRows)}
              type="button"
            >
              <Download size={15} />
              CSV
            </button>
            <button
              disabled={customerHistoryRows.length === 0}
              onClick={() => printRowsDocument(`Historico de ${getClientName(selectedCustomer)}`, customerHistoryRows, "Nexus One")}
              type="button"
            >
              <Printer size={15} />
              PDF
            </button>
          </div>

          <div className="table-wrap compact-table">
            <table>
              <tbody>
                {selectedCustomerOrders.length === 0 ? (
                  <tr>
                    <td className="empty-cell">Sem pedidos para exibir.</td>
                  </tr>
                ) : (
                  selectedCustomerOrders.slice(0, 6).map((pedido) => (
                    <tr key={pedido.id}>
                      <td>
                        <strong>{pedido.numero || pedido.id}</strong>
                        <small>Filial: {pedido.filial || "Empresa"}</small>
                        <small>{getOrderProductSummary(pedido)}</small>
                        <small>{formatDateTime(pedido.data)} / {pedido.usuario || "Vendedor nao informado"}</small>
                      </td>
                      <td>{pedido.status || "-"}</td>
                      <td>{formatCurrency(pedido.valor)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </aside>

        <article className="panel orders-panel">
          <div className="panel-title">
            <div>
              <h2>Carteira de clientes</h2>
              <p>Cadastro limpo vindo do Spring Boot, sem relacionamento pesado.</p>
            </div>
            <div className="panel-actions">
              <span>{filteredClientes.length} clientes</span>
              <button
                className="panel-action-button"
                onClick={() => {
                  setMessage(null);
                  setShowCustomerForm(true);
                }}
                type="button"
              >
                <Plus size={17} />
                Novo cliente
              </button>
            </div>
          </div>

          <div className="customer-filter-row">
            <label className="search-field">
              <Search size={17} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nome, CPF ou email"
              />
            </label>
            <label className="form-control">
              <span>Filial</span>
              <select value={customerBranchFilter} onChange={(event) => setCustomerBranchFilter(event.target.value)}>
                <option value="TODAS">Todas</option>
                <option value="EMPRESA">Empresa / sem filial</option>
                {filiais.map((filial) => (
                  <option key={filial.id} value={filial.id}>
                    {filial.matriz ? "Matriz" : "Filial"} - {filial.nome}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Contato</th>
                  <th>Filial</th>
                  <th>Endereco</th>
                  <th>Nascimento</th>
                  <th>Cadastro</th>
                  <th>Acao</th>
                </tr>
              </thead>
              <tbody>
                {filteredClientes.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-cell">
                      Nenhum cliente encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredClientes.map((cliente) => (
                    <tr key={getClientId(cliente)}>
                      <td>
                        <strong>{getClientName(cliente)}</strong>
                        <small>{cliente.cpf || "-"}</small>
                      </td>
                      <td>
                        <strong>{cliente.email || "-"}</strong>
                        <small>{cliente.telefone || "Sem telefone"}</small>
                      </td>
                      <td>{getCustomerBranchLabel(cliente)}</td>
                      <td>
                        <span className="code-cell">
                          <MapPin size={14} />
                          {cliente.endereco || "-"}
                        </span>
                      </td>
                      <td>{formatDate(cliente.dataNascimento)}</td>
                      <td>{formatDate(cliente.dataCriacao)}</td>
                      <td>
                        <button
                          className="mini-action-button"
                          onClick={() => setSelectedCustomerId(getClientId(cliente))}
                          type="button"
                        >
                          Historico
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>

      </section>

      {showCustomerForm && (
        <div className="modal-backdrop" role="presentation">
          <aside className="panel modal-panel">
            <div className="panel-title compact">
              <div>
                <h2>Novo cliente</h2>
                <p>Cadastro rapido para vendas e PDV.</p>
              </div>
              <button
                className="modal-close"
                onClick={() => setShowCustomerForm(false)}
                title="Fechar"
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <form className="compact-form" onSubmit={handleSubmit}>
              <label className="form-control">
                <span>Nome</span>
                <input
                  value={form.nome}
                  onChange={(event) => updateForm("nome", event.target.value)}
                  placeholder="Nome completo"
                />
              </label>

              <div className="finance-form-row">
                <label className="form-control">
                  <span>CPF</span>
                  <input
                    value={form.cpf}
                    onChange={(event) => updateForm("cpf", event.target.value)}
                    placeholder="Somente numeros"
                  />
                </label>
                <label className="form-control">
                  <span>Nascimento</span>
                  <input
                    type="date"
                    value={form.dataNascimento}
                    onChange={(event) => updateForm("dataNascimento", event.target.value)}
                  />
                </label>
              </div>

              <label className="form-control">
                <span>Email</span>
                <input
                  value={form.email}
                  onChange={(event) => updateForm("email", event.target.value)}
                  placeholder="cliente@email.com"
                />
              </label>

              <label className="form-control">
                <span>Telefone</span>
                <input
                  value={form.telefone}
                  onChange={(event) => updateForm("telefone", event.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </label>

              <label className="form-control">
                <span>Endereco</span>
                <textarea
                  value={form.endereco}
                  onChange={(event) => updateForm("endereco", event.target.value)}
                  placeholder="Rua, numero, bairro, cidade"
                />
              </label>

              {message && <p className={`form-message ${message.type}`}>{message.text}</p>}

              <button className="checkout-button" disabled={saving} type="submit">
                {saving ? <Loader2 className="spin" size={17} /> : <Plus size={17} />}
                {saving ? "Salvando..." : "Salvar cliente"}
              </button>
            </form>
          </aside>
        </div>
      )}
    </div>
  );
}

const initialProductForm = {
  sku: "",
  codBarras: "",
  nomeProduto: "",
  descricao: "",
  precoCompra: "",
  precoVenda: "",
  descontoPercentual: 0,
  qtaMinimo: DEFAULT_STOCK_MINIMUM,
  qtaMaximo: "",
  garantiaMes: 0,
  idCategoria: "",
  idMarca: "",
  idFornecedor: "",
};

const initialProductCategoryForm = {
  nome: "",
  descricao: "",
};

const initialBrandForm = {
  nome: "",
  descricao: "",
};

const initialSupplierForm = {
  nome: "",
  tipoDocumento: "CNPJ",
  documento: "",
  telefone: "",
  email: "",
  endereco: "",
};

const initialPurchaseForm = {
  produtoId: "",
  fornecedorId: "",
  quantidade: 1,
  valorTotal: "",
  metodoPagamento: "BOLETO",
  status: "PENDENTE",
  dataVencimento: "",
  numeroDocumento: "",
  observacao: "",
};

const initialInventoryCountForm = {
  produtoId: "",
  quantidadeContada: "",
  observacao: "",
};

const initialStockTransferForm = {
  produtoId: "",
  origem: "GERAL",
  destino: "",
  quantidade: 1,
  observacao: "",
};

function ProductDashboard({ data, onRefresh, session }) {
  const [search, setSearch] = useState("");
  const [productPage, setProductPage] = useState(0);
  const [inventoryBranchFilter, setInventoryBranchFilter] = useState("TODAS");
  const [stockProductSearch, setStockProductSearch] = useState("");
  const [productForm, setProductForm] = useState(initialProductForm);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productSaving, setProductSaving] = useState(false);
  const [productMessage, setProductMessage] = useState(null);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [showProductCategoryForm, setShowProductCategoryForm] = useState(false);
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [supplierForm, setSupplierForm] = useState(initialSupplierForm);
  const [productCategoryForm, setProductCategoryForm] = useState(initialProductCategoryForm);
  const [brandForm, setBrandForm] = useState(initialBrandForm);
  const [supplierSaving, setSupplierSaving] = useState(false);
  const [productCategorySaving, setProductCategorySaving] = useState(false);
  const [brandSaving, setBrandSaving] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState(initialPurchaseForm);
  const [purchaseItems, setPurchaseItems] = useState([]);
  const [purchaseSaving, setPurchaseSaving] = useState(false);
  const [inventoryCountForm, setInventoryCountForm] = useState(initialInventoryCountForm);
  const [inventorySaving, setInventorySaving] = useState(false);
  const [stockTransferForm, setStockTransferForm] = useState(initialStockTransferForm);
  const [stockTransferSaving, setStockTransferSaving] = useState(false);
  const [activeInventoryTool, setActiveInventoryTool] = useState("adjustment");
  const [adjustment, setAdjustment] = useState({
    produtoId: "",
    quantidade: 1,
    type: "entrada",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const canManageNotifications = ["ADMIN", "GERENTE"].includes(normalizePerfil(session?.perfil));

  const produtos = asList(data?.produtos);
  const fornecedores = asList(data?.fornecedores);
  const productCategories = asList(data?.categorias).filter((categoria) => categoria.ativo !== false);
  const marcas = asList(data?.marcas);
  const pedidos = asList(data?.pedidos);
  const compras = asList(data?.compras);
  const estoqueSaldos = asList(data?.estoqueSaldos);
  const filiais = asList(data?.filiais);
  const selectedInventoryBranchLabel = inventoryBranchFilter === "TODAS"
    ? "Todas as filiais"
    : inventoryBranchFilter === "EMPRESA"
      ? "Empresa / sem filial"
      : filiais.find((filial) => String(filial.id) === inventoryBranchFilter)?.nome || "Filial";
  const branchScopedStock = estoqueSaldos.filter((saldo) => {
    if (inventoryBranchFilter === "TODAS") return true;
    if (inventoryBranchFilter === "EMPRESA") return !saldo.filialId;
    return String(saldo.filialId || "") === inventoryBranchFilter;
  });
  const branchStockByProduct = branchScopedStock.reduce((map, saldo) => {
    const key = String(saldo.produtoId || saldo.idProduto || saldo.codigoBarras || saldo.produto || "");
    if (!key) return map;
    const current = map.get(key) || { quantidade: 0, minimo: null, maximo: null };
    current.quantidade += Number(saldo.quantidade || saldo.quantidadeAtual || 0);
    current.minimo = saldo.qtaMinimo ?? saldo.estoqueMinimo ?? current.minimo;
    current.maximo = saldo.qtaMaximo ?? saldo.estoqueMaximo ?? current.maximo;
    map.set(key, current);
    return map;
  }, new Map());
  function getFilteredProductStock(produto) {
    if (inventoryBranchFilter === "TODAS") {
      return getProductStockQuantity(produto);
    }

    const keys = [produto.id, produto.idProduto, produto.codigoBarras, produto.nome, produto.nomeProduto]
      .filter(Boolean)
      .map((value) => String(value));
    const stock = keys.map((key) => branchStockByProduct.get(key)).find(Boolean);
    return stock ? stock.quantidade : 0;
  }

  function getFilteredProductMinimum(produto) {
    if (inventoryBranchFilter === "TODAS") {
      return getProductStockMinimum(produto);
    }

    const keys = [produto.id, produto.idProduto, produto.codigoBarras, produto.nome, produto.nomeProduto]
      .filter(Boolean)
      .map((value) => String(value));
    const stock = keys.map((key) => branchStockByProduct.get(key)).find(Boolean);
    return Number(stock?.minimo ?? getProductStockMinimum(produto));
  }
  const estoqueBaixoApi = asList(data?.estoqueBaixo);
  const estoqueBaixoFallback = produtos
    .filter(isLowStockProduct)
    .map((produto) => ({
      id: produto.id,
      produtoId: produto.id,
      produto: produto.nome,
      nomeProduto: produto.nome,
      quantidade: getProductStockQuantity(produto),
      quantidadeAtual: getProductStockQuantity(produto),
      qtaMinimo: getProductStockMinimum(produto),
      estoqueMinimo: getProductStockMinimum(produto),
    }));
  const allLowStockItems = [
    ...estoqueBaixoApi,
    ...estoqueBaixoFallback.filter(
      (fallback) =>
        !estoqueBaixoApi.some(
          (item) =>
            String(item.produtoId || item.id || getStockProductName(item)) ===
            String(fallback.produtoId || fallback.id || getStockProductName(fallback)),
        ),
    ),
  ];
  const branchLowStockFallback = produtos
    .filter((produto) => produto.ativo && getFilteredProductMinimum(produto) > 0 && getFilteredProductStock(produto) <= getFilteredProductMinimum(produto))
    .map((produto) => ({
      id: produto.id,
      produtoId: produto.id,
      produto: produto.nome,
      nomeProduto: produto.nome,
      quantidade: getFilteredProductStock(produto),
      quantidadeAtual: getFilteredProductStock(produto),
      qtaMinimo: getFilteredProductMinimum(produto),
      estoqueMinimo: getFilteredProductMinimum(produto),
    }));
  const estoqueBaixo = inventoryBranchFilter === "TODAS" ? allLowStockItems : branchLowStockFallback;
  const branchFilteredProducts = inventoryBranchFilter === "TODAS"
    ? produtos
    : produtos.filter((produto) => getFilteredProductStock(produto) > 0 || branchStockByProduct.size === 0);
  const ativos = branchFilteredProducts.filter((produto) => produto.ativo).length;
  const saldoEstoque = branchFilteredProducts.reduce(
    (total, produto) => total + Number(getFilteredProductStock(produto)),
    0,
  );
  const valorCatalogo = branchFilteredProducts.reduce(
    (total, produto) => total + Number(produto.precoComDesconto || produto.precoVenda || 0),
    0,
  );
  const selectedProduct = produtos.find((produto) => produto.id === adjustment.produtoId);
  const selectedPurchaseProduct = produtos.find((produto) => produto.id === purchaseForm.produtoId);
  const selectedPurchaseSupplier = fornecedores.find((fornecedor) => fornecedor.id === purchaseForm.fornecedorId);
  const selectedInventoryProduct = produtos.find((produto) => produto.id === inventoryCountForm.produtoId);
  const selectedTransferProduct = produtos.find((produto) => produto.id === stockTransferForm.produtoId);
  const transferLocations = Array.from(
    new Set(["GERAL", ...estoqueSaldos.map((saldo) => saldo.localizacao).filter(Boolean)]),
  );
  const selectedTransferOriginStock = estoqueSaldos.find(
    (saldo) =>
      String(saldo.produtoId) === String(stockTransferForm.produtoId) &&
      String(saldo.localizacao || "GERAL").toUpperCase() === String(stockTransferForm.origem || "GERAL").toUpperCase(),
  );
  const inventoryDifference = selectedInventoryProduct && inventoryCountForm.quantidadeContada !== ""
    ? Number(inventoryCountForm.quantidadeContada) - getProductStockQuantity(selectedInventoryProduct)
    : 0;
  const stockSearchResults = produtos
    .filter((produto) => {
      const text = `${produto.nome || ""} ${produto.codigoBarras || ""}`.toLowerCase();
      return text.includes(stockProductSearch.toLowerCase());
    })
    .slice(0, 8);

  const filteredProducts = branchFilteredProducts.filter((produto) => {
    const text = `${produto.nome || ""} ${produto.codigoBarras || ""} ${produto.categoria || ""} ${produto.marca || ""} ${produto.fornecedor || ""}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });
  const productPageSize = 10;
  const productTotalPages = Math.max(Math.ceil(filteredProducts.length / productPageSize), 1);
  const currentProductPage = Math.min(productPage, productTotalPages - 1);
  const paginatedProducts = filteredProducts.slice(
    currentProductPage * productPageSize,
    currentProductPage * productPageSize + productPageSize,
  );
  const inventoryRows = filteredProducts.map((produto) => ({
    Produto: produto.nome || "Produto sem nome",
    Codigo: produto.codigoBarras || "-",
    SKU: produto.sku || "-",
    Categoria: produto.categoria || "-",
    Marca: produto.marca || "-",
    Fornecedor: produto.fornecedor || "-",
    Preco: formatCurrency(produto.precoComDesconto || produto.precoVenda || 0),
    "Preco base": formatCurrency(produto.precoVenda || 0),
    Lucro: formatCurrency(produto.lucro || 0),
    Estoque: formatNumber(getFilteredProductStock(produto)),
    "Estoque minimo": formatNumber(getFilteredProductMinimum(produto)),
    Filial: selectedInventoryBranchLabel,
    Status: produto.ativo ? "ATIVO" : "INATIVO",
  }));
  const stockLocationRows = branchScopedStock.map((saldo) => ({
    Produto: saldo.produto || "Produto sem nome",
    Codigo: saldo.codigoBarras || "-",
    Filial: saldo.filial || "Empresa",
    Local: saldo.localizacao || "GERAL",
    Quantidade: formatNumber(saldo.quantidade || 0),
    "Estoque minimo": saldo.qtaMinimo == null ? "-" : formatNumber(saldo.qtaMinimo),
    "Estoque maximo": saldo.qtaMaximo == null ? "-" : formatNumber(saldo.qtaMaximo),
  }));
  const soldProductKeys = new Set();
  pedidos.forEach((pedido) => {
    asList(pedido.itens).forEach((item) => {
      [item.produtoId, item.idProduto, item.codigoBarras, item.produto, item.nomeProduto]
        .filter(Boolean)
        .forEach((value) => soldProductKeys.add(String(value).toLowerCase()));
    });
  });
  const staleStockProducts = branchFilteredProducts
    .filter((produto) => getFilteredProductStock(produto) > 0)
    .filter((produto) => {
      const keys = [produto.id, produto.idProduto, produto.codigoBarras, produto.nome, produto.nomeProduto]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());
      return keys.every((key) => !soldProductKeys.has(key));
    })
    .slice(0, 8);
  const staleStockRows = staleStockProducts.map((produto) => ({
    Produto: produto.nome || "Produto sem nome",
    Codigo: produto.codigoBarras || "-",
    Filial: selectedInventoryBranchLabel,
    Estoque: formatNumber(getFilteredProductStock(produto)),
    "Preco venda": formatCurrency(produto.precoComDesconto || produto.precoVenda || 0),
    Status: produto.ativo ? "ATIVO" : "INATIVO",
    Observacao: pedidos.length > 0 ? "Sem venda encontrada nos pedidos carregados" : "Pedidos nao carregados",
  }));
  const purchaseTotal = purchaseItems.reduce((total, item) => total + Number(item.subtotal || 0), 0);
  const purchaseHistoryRows = compras.map((compra) => ({
    Data: formatDateTime(compra.dataCompra),
    Filial: compra.filial || selectedInventoryBranchLabel,
    Fornecedor: compra.fornecedor || "-",
    Documento: compra.numeroDocumento || "-",
    Itens: formatNumber(asList(compra.itens).length),
    Status: compra.status || "-",
    Pagamento: compra.metodoPagamento || "-",
    Total: formatCurrency(compra.valorTotal),
  }));

  useEffect(() => {
    setProductPage(0);
  }, [search, inventoryBranchFilter]);
  const inventoryToolButtons = [
    { key: "product", label: "Produto", icon: Plus, detail: "Novo cadastro" },
    { key: "adjustment", label: "Ajuste", icon: PackageCheck, detail: "Entrada ou saida" },
    { key: "purchase", label: "Compra", icon: Truck, detail: "Fornecedor e NF" },
    { key: "count", label: "Contagem", icon: ClipboardList, detail: "Inventario fisico" },
    { key: "transfer", label: "Transferir", icon: MapPinned, detail: "Entre locais" },
    { key: "history", label: "Compras", icon: ReceiptText, detail: "Historico" },
    { key: "alerts", label: "Alertas", icon: AlertTriangle, detail: `${formatNumber(estoqueBaixo.length)} baixo` },
  ];

  function openInventoryTool(tool) {
    setActiveInventoryTool(tool);
    setShowProductForm(tool === "product");
    if (tool !== "product") {
      setShowProductCategoryForm(false);
      setShowBrandForm(false);
      setShowSupplierForm(false);
    }
  }

  async function handleSendStockNotifications() {
    setSaving(true);
    setMessage(null);

    try {
      const result = await endpoints.notificacoes.enviarEstoqueBaixo();
      if (!result?.ativo) {
        setMessage({ type: "error", text: "Notificacoes externas estao desativadas ou sem webhook configurado." });
      } else if (Number(result.itensEnviados || 0) === 0) {
        setMessage({ type: "success", text: "Nenhum item em estoque baixo aguardava notificacao." });
      } else {
        setMessage({ type: "success", text: `${formatNumber(result.itensEnviados)} item(ns) de estoque baixo enviados ao webhook.` });
      }
      await onRefresh();
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Nao foi possivel enviar alerta de estoque baixo." });
    } finally {
      setSaving(false);
    }
  }

  function updateProductForm(field, value) {
    setProductForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleGenerateBarcode() {
    updateProductForm("codBarras", generateProductBarcode(produtos));
    setProductMessage({ type: "success", text: "Codigo de barras gerado automaticamente." });
  }

  async function handleCreateProduct(event) {
    event.preventDefault();
    const nomeProduto = productForm.nomeProduto.trim();

    if (!nomeProduto) {
      setProductMessage({ type: "error", text: "Informe o nome do produto." });
      return;
    }

    const existingProduct = produtos.find(
      (produto) => String(produto.nome || "").trim().toLowerCase() === nomeProduto.toLowerCase(),
    );

    if (existingProduct) {
      setProductMessage({
        type: "error",
        text: `Produto "${existingProduct.nome}" ja existe. Atualize o cadastro existente para nao criar duplicidade.`,
      });
      return;
    }

    if (Number(productForm.precoCompra) <= 0 || Number(productForm.precoVenda) <= 0) {
      setProductMessage({ type: "error", text: "Informe precos maiores que zero." });
      return;
    }

    if (Number(productForm.qtaMinimo) < 0 || Number(productForm.qtaMaximo || 0) < 0) {
      setProductMessage({ type: "error", text: "Limites de estoque nao podem ser negativos." });
      return;
    }

    if (
      Number(productForm.qtaMaximo || 0) > 0 &&
      Number(productForm.qtaMinimo || 0) > Number(productForm.qtaMaximo)
    ) {
      setProductMessage({
        type: "error",
        text: "Estoque minimo nao pode ser maior que o estoque maximo.",
      });
      return;
    }

    setProductSaving(true);
    setProductMessage(null);

    const codigoBarras = productForm.codBarras.trim() || generateProductBarcode(produtos);
    if (!productForm.codBarras.trim()) {
      updateProductForm("codBarras", codigoBarras);
    }

    try {
      await endpoints.produtos.criar({
        sku: productForm.sku.trim() || null,
        codBarras: codigoBarras,
        nomeProduto,
        descricao: productForm.descricao.trim(),
        precoCompra: Number(productForm.precoCompra),
        precoVenda: Number(productForm.precoVenda),
        descontoPercentual: Number(productForm.descontoPercentual || 0),
        qtaMinimo: Number(productForm.qtaMinimo || 0),
        qtaMaximo: productForm.qtaMaximo === "" ? null : Number(productForm.qtaMaximo),
        garantiaMes: Number(productForm.garantiaMes || 0),
        idCategoria: productForm.idCategoria || null,
        idMarca: productForm.idMarca || null,
        idFornecedor: productForm.idFornecedor || null,
      });

      setProductForm(initialProductForm);
      setProductMessage({ type: "success", text: "Produto cadastrado com sucesso." });
      setShowProductForm(false);
      await onRefresh();
    } catch (err) {
      setProductMessage({ type: "error", text: err.message });
    } finally {
      setProductSaving(false);
    }
  }

  async function handleCreateSupplier(event) {
    event.preventDefault();

    if (!supplierForm.nome.trim() || !supplierForm.documento.trim()) {
      setProductMessage({ type: "error", text: "Informe nome e documento do fornecedor." });
      return;
    }

    setSupplierSaving(true);
    setProductMessage(null);

    try {
      const fornecedor = await endpoints.fornecedores.criar({
        nome: supplierForm.nome.trim(),
        tipoDocumento: supplierForm.tipoDocumento,
        documento: supplierForm.documento.replace(/\D/g, ""),
        telefone: supplierForm.telefone.trim(),
        email: supplierForm.email.trim() || null,
        endereco: supplierForm.endereco.trim(),
      });

      setSupplierForm(initialSupplierForm);
      setShowSupplierForm(false);
      setProductForm((prev) => ({ ...prev, idFornecedor: fornecedor.id || "" }));
      setPurchaseForm((prev) => ({ ...prev, fornecedorId: fornecedor.id || prev.fornecedorId }));
      setProductMessage({ type: "success", text: "Fornecedor cadastrado com sucesso." });
      await onRefresh();
    } catch (err) {
      setProductMessage({ type: "error", text: err.message });
    } finally {
      setSupplierSaving(false);
    }
  }

  async function handleCreateProductCategory(event) {
    event.preventDefault();

    if (!productCategoryForm.nome.trim()) {
      setProductMessage({ type: "error", text: "Informe o nome da categoria." });
      return;
    }

    setProductCategorySaving(true);
    setProductMessage(null);

    try {
      const categoria = await endpoints.categorias.criar({
        nome: productCategoryForm.nome.trim(),
        descricao: productCategoryForm.descricao.trim(),
        tipo: "PRODUTO",
        ativo: true,
      });

      setProductCategoryForm(initialProductCategoryForm);
      setShowProductCategoryForm(false);
      setProductForm((prev) => ({ ...prev, idCategoria: categoria.id || "" }));
      setProductMessage({ type: "success", text: "Categoria de produto cadastrada." });
      await onRefresh();
    } catch (err) {
      setProductMessage({ type: "error", text: err.message });
    } finally {
      setProductCategorySaving(false);
    }
  }

  async function handleCreateBrand(event) {
    event.preventDefault();

    if (!brandForm.nome.trim()) {
      setProductMessage({ type: "error", text: "Informe o nome da marca." });
      return;
    }

    setBrandSaving(true);
    setProductMessage(null);

    try {
      const marca = await endpoints.marcas.criar({
        nome: brandForm.nome.trim(),
        descricao: brandForm.descricao.trim(),
      });

      setBrandForm(initialBrandForm);
      setShowBrandForm(false);
      setProductForm((prev) => ({ ...prev, idMarca: marca.id || "" }));
      setProductMessage({ type: "success", text: "Marca cadastrada." });
      await onRefresh();
    } catch (err) {
      setProductMessage({ type: "error", text: err.message });
    } finally {
      setBrandSaving(false);
    }
  }

  async function handlePurchaseEntry(event) {
    event.preventDefault();

    const itemsToSubmit = purchaseItems.length > 0
      ? purchaseItems
      : selectedPurchaseProduct && Number(purchaseForm.quantidade) > 0 && Number(purchaseForm.valorTotal) > 0
        ? [{
            produtoId: selectedPurchaseProduct.id,
            produto: selectedPurchaseProduct.nome,
            quantidade: Number(purchaseForm.quantidade),
            precoUnitario: Number(purchaseForm.valorTotal),
            subtotal: Number(purchaseForm.quantidade) * Number(purchaseForm.valorTotal),
          }]
        : [];

    if (!purchaseForm.fornecedorId || itemsToSubmit.length === 0) {
      setMessage({ type: "error", text: "Selecione fornecedor e adicione ao menos um item valido." });
      return;
    }

    setPurchaseSaving(true);
    setMessage(null);

    try {
      await endpoints.compras.criar({
        fornecedorId: purchaseForm.fornecedorId,
        metodoPagamento: purchaseForm.metodoPagamento,
        status: purchaseForm.status,
        dataVencimento: purchaseForm.dataVencimento || null,
        numeroDocumento: purchaseForm.numeroDocumento.trim(),
        observacao: purchaseForm.observacao.trim(),
        itens: itemsToSubmit.map((item) => ({
          produtoId: item.produtoId,
          quantidade: Number(item.quantidade),
          precoUnitario: Number(item.precoUnitario),
        })),
      });

      setPurchaseForm(initialPurchaseForm);
      setPurchaseItems([]);
      setMessage({ type: "success", text: "Compra registrada com itens, estoque e financeiro." });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setPurchaseSaving(false);
    }
  }

  function handleAddPurchaseItem() {
    if (!selectedPurchaseProduct || Number(purchaseForm.quantidade) <= 0 || Number(purchaseForm.valorTotal) <= 0) {
      setMessage({ type: "error", text: "Selecione produto, quantidade e preco unitario maior que zero." });
      return;
    }

    const quantidade = Number(purchaseForm.quantidade);
    const precoUnitario = Number(purchaseForm.valorTotal);
    const item = {
      produtoId: selectedPurchaseProduct.id,
      produto: selectedPurchaseProduct.nome || "Produto sem nome",
      quantidade,
      precoUnitario,
      subtotal: quantidade * precoUnitario,
    };

    setPurchaseItems((current) => [...current, item]);
    setPurchaseForm((prev) => ({ ...prev, produtoId: "", quantidade: 1, valorTotal: "" }));
    setMessage(null);
  }

  function handleRemovePurchaseItem(index) {
    setPurchaseItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  async function handleInventoryCount(event) {
    event.preventDefault();

    if (!inventoryCountForm.produtoId || inventoryCountForm.quantidadeContada === "") {
      setMessage({ type: "error", text: "Selecione o produto e informe a contagem fisica." });
      return;
    }

    if (Number(inventoryCountForm.quantidadeContada) < 0) {
      setMessage({ type: "error", text: "Contagem fisica nao pode ser negativa." });
      return;
    }

    setInventorySaving(true);
    setMessage(null);

    try {
      await endpoints.estoque.ajuste({
        produtoId: inventoryCountForm.produtoId,
        quantidadeContada: Number(inventoryCountForm.quantidadeContada),
        observacao: inventoryCountForm.observacao.trim(),
      });

      setInventoryCountForm(initialInventoryCountForm);
      setMessage({
        type: "success",
        text: inventoryDifference === 0
          ? "Inventario registrado sem divergencia."
          : `Inventario ajustado em ${formatNumber(Math.abs(inventoryDifference))} unidade(s).`,
      });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setInventorySaving(false);
    }
  }

  async function handleStockTransfer(event) {
    event.preventDefault();

    const origem = (stockTransferForm.origem || "GERAL").trim();
    const destino = stockTransferForm.destino.trim();
    const quantidade = Number(stockTransferForm.quantidade);

    if (!stockTransferForm.produtoId || !destino || quantidade <= 0) {
      setMessage({ type: "error", text: "Selecione o produto, informe destino e quantidade valida." });
      return;
    }

    if (origem.toUpperCase() === destino.toUpperCase()) {
      setMessage({ type: "error", text: "Origem e destino devem ser diferentes." });
      return;
    }

    setStockTransferSaving(true);
    setMessage(null);

    try {
      await endpoints.estoque.transferencia({
        produtoId: stockTransferForm.produtoId,
        origem,
        destino,
        quantidade,
        observacao: stockTransferForm.observacao.trim(),
      });

      setStockTransferForm(initialStockTransferForm);
      setMessage({ type: "success", text: "Transferencia registrada com sucesso." });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setStockTransferSaving(false);
    }
  }

  async function handleAdjustment(event) {
    event.preventDefault();
    if (!adjustment.produtoId || Number(adjustment.quantidade) <= 0) {
      setMessage({ type: "error", text: "Selecione um produto e informe uma quantidade valida." });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      if (adjustment.type === "entrada") {
        await endpoints.estoque.entrada(adjustment.produtoId, adjustment.quantidade);
      } else {
        await endpoints.estoque.saida(adjustment.produtoId, adjustment.quantidade);
      }

      setMessage({ type: "success", text: "Estoque atualizado com sucesso." });
      setStockProductSearch("");
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dashboard-view">
      <section className="kpi-grid">
        <KpiCard
          icon={Boxes}
          label="Produtos cadastrados"
          value={formatNumber(branchFilteredProducts.length)}
          detail={selectedInventoryBranchLabel}
          tone="blue"
        />
        <KpiCard
          icon={CheckCircle2}
          label="Unidades em estoque"
          value={formatNumber(saldoEstoque)}
          detail={`${formatNumber(ativos)} produtos ativos / ${selectedInventoryBranchLabel}`}
          tone="green"
        />
        <KpiCard
          icon={AlertTriangle}
          label="Estoque baixo"
          value={formatNumber(estoqueBaixo.length)}
          detail="Itens abaixo do limite operacional"
          tone="amber"
        />
        <KpiCard
          icon={CircleDollarSign}
          label="Valor catalogo"
          value={formatCurrency(valorCatalogo)}
          detail="Soma dos precos atuais"
          tone="dark"
        />
        <KpiCard
          icon={Truck}
          label="Fornecedores"
          value={formatNumber(fornecedores.length)}
          detail="Base de compras e reposicao"
          tone="blue"
        />
      </section>

      <section className="panel stale-stock-panel">
        <div className="panel-title compact">
          <div>
            <h2>Estoque parado</h2>
            <p>Produtos com saldo e sem venda encontrada nos pedidos carregados.</p>
          </div>
          <div className="account-plan-actions">
            <button
              disabled={staleStockRows.length === 0}
              onClick={() => downloadCsv(`nexus-one-estoque-parado-${getLocalDateKey()}.csv`, staleStockRows)}
              type="button"
            >
              <Download size={15} />
              CSV
            </button>
            <button
              disabled={staleStockRows.length === 0}
              onClick={() => printRowsDocument("Estoque parado", staleStockRows, data?.empresa?.nome || "Nexus One")}
              type="button"
            >
              <Printer size={15} />
              PDF
            </button>
          </div>
        </div>
        <div className="table-wrap compact-table">
          <table>
            <tbody>
              {staleStockProducts.length === 0 ? (
                <tr>
                  <td className="empty-cell" colSpan="4">Nenhum produto parado identificado com os dados atuais.</td>
                </tr>
              ) : (
                staleStockProducts.map((produto) => (
                  <tr key={produto.id || produto.codigoBarras || produto.nome}>
                    <td>
                      <strong>{produto.nome || "Produto sem nome"}</strong>
                      <small>{produto.codigoBarras || "Sem codigo"}</small>
                    </td>
                    <td>{formatCurrency(produto.precoComDesconto || produto.precoVenda || 0)}</td>
                    <td>{formatNumber(getProductStockQuantity(produto))} un.</td>
                    <td>
                      <button
                        className="mini-action-button"
                        onClick={() => printProductLabel(produto, data?.empresa?.nome || "Nexus One")}
                        type="button"
                      >
                        <Printer size={15} />
                        Etiqueta
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="inventory-command-panel">
        <div>
          <strong>Operacoes de estoque</strong>
          <span>Escolha uma acao para abrir o formulario certo.</span>
        </div>
        <label className="inventory-branch-filter">
          <span>Filial</span>
          <select value={inventoryBranchFilter} onChange={(event) => setInventoryBranchFilter(event.target.value)}>
            <option value="TODAS">Todas as filiais</option>
            <option value="EMPRESA">Empresa / sem filial</option>
            {filiais.map((filial) => (
              <option key={filial.id} value={filial.id}>
                {filial.matriz ? "Matriz" : "Filial"} - {filial.nome}
              </option>
            ))}
          </select>
        </label>
        <div className="inventory-command-grid">
          {inventoryToolButtons.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                className={activeInventoryTool === tool.key ? "active" : ""}
                key={tool.key}
                onClick={() => openInventoryTool(tool.key)}
                type="button"
              >
                <Icon size={18} />
                <span>
                  <strong>{tool.label}</strong>
                  <small>{tool.detail}</small>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="dashboard-grid inventory-grid">
        <article className="panel orders-panel">
          <div className="panel-title">
            <div>
              <h2>Produtos e estoque</h2>
              <p>Lista real consumida do endpoint /produtos. Filtro: {selectedInventoryBranchLabel}.</p>
            </div>
            <div className="panel-actions">
              <span>{filteredProducts.length} itens / 10 por pagina</span>
              <button
                className="panel-action-button secondary"
                disabled={filteredProducts.length === 0}
                onClick={() => printProductLabels(filteredProducts, data?.empresa?.nome || "Nexus One")}
                type="button"
              >
                <Printer size={17} />
                Etiquetas
              </button>
              <button
                className="panel-action-button secondary"
                disabled={inventoryRows.length === 0}
                onClick={() => downloadCsv(`nexus-one-inventario-${getLocalDateKey()}.csv`, inventoryRows)}
                type="button"
              >
                <Download size={17} />
                CSV
              </button>
              <button
                className="panel-action-button secondary"
                disabled={inventoryRows.length === 0}
                onClick={() => printRowsDocument("Inventario de produtos", inventoryRows, data?.empresa?.nome || "Nexus One")}
                type="button"
              >
                <Printer size={17} />
                PDF
              </button>
              <button className="panel-action-button" onClick={() => openInventoryTool("product")} type="button">
                <Plus size={17} />
                Novo produto
              </button>
            </div>
          </div>

          <div className="customer-filter-row">
            <label className="search-field">
              <Search size={17} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nome ou codigo de barras"
              />
            </label>
            <label className="form-control">
              <span>Filial</span>
              <select value={inventoryBranchFilter} onChange={(event) => setInventoryBranchFilter(event.target.value)}>
                <option value="TODAS">Todas</option>
                <option value="EMPRESA">Empresa / sem filial</option>
                {filiais.map((filial) => (
                  <option key={filial.id} value={filial.id}>
                    {filial.matriz ? "Matriz" : "Filial"} - {filial.nome}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Codigo</th>
                  <th>Categoria</th>
                  <th>Marca</th>
                  <th>Fornecedor</th>
                  <th>Preco</th>
                  <th>Lucro</th>
                  <th>Estoque</th>
                  <th>Status</th>
                  <th>Acao</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="empty-cell">
                      Nenhum produto encontrado.
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((produto) => (
                    <tr key={produto.id}>
                      <td>
                        <strong>{produto.nome || "Produto sem nome"}</strong>
                        <small>{produto.id}</small>
                      </td>
                      <td>
                        <span className="code-cell">
                          <Barcode size={14} />
                          {produto.codigoBarras || "-"}
                        </span>
                      </td>
                      <td>{produto.categoria || "-"}</td>
                      <td>{produto.marca || "-"}</td>
                      <td>{produto.fornecedor || "-"}</td>
                      <td>
                        <strong>{formatCurrency(produto.precoComDesconto)}</strong>
                        <small>Base {formatCurrency(produto.precoVenda)}</small>
                      </td>
                      <td>{formatProfit(produto.lucro)}</td>
                      <td>
                        <span
                          className={`stock-badge ${
                            getFilteredProductMinimum(produto) > 0 && getFilteredProductStock(produto) <= getFilteredProductMinimum(produto)
                              ? "low"
                              : getFilteredProductStock(produto) > 0
                                ? "ok"
                                : "empty"
                          }`}
                        >
                          {formatNumber(getFilteredProductStock(produto))}
                        </span>
                        <small>Min {formatNumber(getFilteredProductMinimum(produto))}</small>
                      </td>
                      <td>
                        <span className={`pill ${produto.ativo ? "entregue" : "cancelado"}`}>
                          {produto.ativo ? "ATIVO" : "INATIVO"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="mini-action-button"
                          onClick={() => printProductLabel(produto, data?.empresa?.nome || "Nexus One")}
                          type="button"
                        >
                          <Printer size={15} />
                          Etiqueta
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredProducts.length > productPageSize && (
            <div className="table-pagination">
              <button
                disabled={currentProductPage === 0}
                onClick={() => setProductPage((page) => Math.max(page - 1, 0))}
                type="button"
              >
                Anterior
              </button>
              <span>
                Pagina {formatNumber(currentProductPage + 1)} de {formatNumber(productTotalPages)}
              </span>
              <button
                disabled={currentProductPage >= productTotalPages - 1}
                onClick={() => setProductPage((page) => Math.min(page + 1, productTotalPages - 1))}
                type="button"
              >
                Proximo
              </button>
            </div>
          )}
        </article>

        <aside className="panel side-panel inventory-workbench-panel">
          {activeInventoryTool === "product" && showProductForm && (
            <div className="inline-form-panel">
              <div className="panel-title compact">
                <div>
                  <h2>Novo produto</h2>
                  <p>Cadastro comercial conectado ao /produtos.</p>
                </div>
                <button
                  className="modal-close"
                  onClick={() => {
                    setShowProductForm(false);
                    setActiveInventoryTool("adjustment");
                  }}
                  title="Fechar"
                  type="button"
                >
                  <X size={18} />
                </button>
              </div>

              <form className="compact-form product-form" onSubmit={handleCreateProduct}>
                <label className="form-control">
                  <span>Nome</span>
                  <input
                    value={productForm.nomeProduto}
                    onChange={(event) => updateProductForm("nomeProduto", event.target.value)}
                    placeholder="Nome do produto"
                  />
                </label>

            <div className="finance-form-row">
              <label className="form-control">
                <span>Codigo barras</span>
                <div className="barcode-field">
                  <input
                    value={productForm.codBarras}
                    onChange={(event) => updateProductForm("codBarras", event.target.value)}
                    placeholder="Gerado automaticamente"
                  />
                  <button
                    className="barcode-generate-button"
                    onClick={handleGenerateBarcode}
                    title="Gerar codigo de barras"
                    type="button"
                  >
                    <Barcode size={16} />
                    Gerar
                  </button>
                </div>
              </label>
              <label className="form-control">
                <span>SKU</span>
                <input
                  value={productForm.sku}
                  onChange={(event) => updateProductForm("sku", event.target.value)}
                  placeholder="SKU-001"
                />
              </label>
            </div>

            <div className="finance-form-row">
              <label className="form-control">
                <span>Categoria</span>
                <select
                  value={productForm.idCategoria}
                  onChange={(event) => updateProductForm("idCategoria", event.target.value)}
                >
                  <option value="">Sem categoria</option>
                  {productCategories.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nome}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-control">
                <span>Marca</span>
                <select
                  value={productForm.idMarca}
                  onChange={(event) => updateProductForm("idMarca", event.target.value)}
                >
                  <option value="">Sem marca</option>
                  {marcas.map((marca) => (
                    <option key={marca.id} value={marca.id}>
                      {marca.nome}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="finance-form-row">
              <div className="form-control">
                <span>Nova categoria</span>
                <button
                  className="panel-action-button secondary"
                  onClick={() => setShowProductCategoryForm(true)}
                  type="button"
                >
                  <Plus size={16} />
                  Categoria
                </button>
              </div>
              <div className="form-control">
                <span>Nova marca</span>
                <button
                  className="panel-action-button secondary"
                  onClick={() => setShowBrandForm(true)}
                  type="button"
                >
                  <Plus size={16} />
                  Marca
                </button>
              </div>
            </div>

            <div className="finance-form-row">
              <label className="form-control">
                <span>Fornecedor</span>
                <select
                  value={productForm.idFornecedor}
                  onChange={(event) => updateProductForm("idFornecedor", event.target.value)}
                >
                  <option value="">Sem fornecedor</option>
                  {fornecedores.map((fornecedor) => (
                    <option key={fornecedor.id} value={fornecedor.id}>
                      {fornecedor.nome}
                    </option>
                  ))}
                </select>
              </label>
              <div className="form-control">
                <span>Cadastro</span>
                <button
                  className="panel-action-button secondary"
                  onClick={() => setShowSupplierForm(true)}
                  type="button"
                >
                  <Plus size={16} />
                  Fornecedor
                </button>
              </div>
            </div>

            <div className="finance-form-row">
              <label className="form-control">
                <span>Compra</span>
                <input
                  min="0.01"
                  step="0.01"
                  type="number"
                  value={productForm.precoCompra}
                  onChange={(event) => updateProductForm("precoCompra", event.target.value)}
                />
              </label>
              <label className="form-control">
                <span>Venda</span>
                <input
                  min="0.01"
                  step="0.01"
                  type="number"
                  value={productForm.precoVenda}
                  onChange={(event) => updateProductForm("precoVenda", event.target.value)}
                />
              </label>
            </div>

            <div className="finance-form-row">
              <label className="form-control">
                <span>Estoque minimo</span>
                <input
                  min="0"
                  type="number"
                  value={productForm.qtaMinimo}
                  onChange={(event) => updateProductForm("qtaMinimo", event.target.value)}
                />
              </label>
              <label className="form-control">
                <span>Estoque maximo</span>
                <input
                  min="0"
                  placeholder="Sem limite"
                  type="number"
                  value={productForm.qtaMaximo}
                  onChange={(event) => updateProductForm("qtaMaximo", event.target.value)}
                />
              </label>
            </div>

            <div className="finance-form-row">
              <label className="form-control">
                <span>Desconto %</span>
                <input
                  max="100"
                  min="0"
                  step="0.01"
                  type="number"
                  value={productForm.descontoPercentual}
                  onChange={(event) =>
                    updateProductForm("descontoPercentual", event.target.value)
                  }
                />
              </label>
              <label className="form-control">
                <span>Garantia mes</span>
                <input
                  min="0"
                  type="number"
                  value={productForm.garantiaMes}
                  onChange={(event) => updateProductForm("garantiaMes", event.target.value)}
                />
              </label>
            </div>

            <label className="form-control">
              <span>Descricao</span>
              <textarea
                value={productForm.descricao}
                onChange={(event) => updateProductForm("descricao", event.target.value)}
                placeholder="Detalhes comerciais do produto"
              />
            </label>

            {productMessage && (
              <p className={`form-message ${productMessage.type}`}>{productMessage.text}</p>
            )}

                <button className="checkout-button" disabled={productSaving} type="submit">
                  {productSaving ? <Loader2 className="spin" size={17} /> : <Plus size={17} />}
                  {productSaving ? "Salvando..." : "Salvar produto"}
                </button>
              </form>
            </div>
          )}

          {activeInventoryTool === "product" && showProductCategoryForm && (
            <div className="inline-form-panel">
              <div className="panel-title compact">
                <div>
                  <h2>Nova categoria</h2>
                  <p>Cadastro usado para classificar produtos.</p>
                </div>
                <button
                  className="modal-close"
                  onClick={() => setShowProductCategoryForm(false)}
                  title="Fechar"
                  type="button"
                >
                  <X size={18} />
                </button>
              </div>

              <form className="compact-form product-form" onSubmit={handleCreateProductCategory}>
                <label className="form-control">
                  <span>Nome</span>
                  <input
                    value={productCategoryForm.nome}
                    onChange={(event) => setProductCategoryForm((prev) => ({ ...prev, nome: event.target.value }))}
                    placeholder="Ex: Bebidas, Limpeza, Eletronicos"
                  />
                </label>
                <label className="form-control">
                  <span>Descricao</span>
                  <textarea
                    value={productCategoryForm.descricao}
                    onChange={(event) => setProductCategoryForm((prev) => ({ ...prev, descricao: event.target.value }))}
                    placeholder="Uso interno da categoria"
                  />
                </label>
                <button className="checkout-button" disabled={productCategorySaving} type="submit">
                  {productCategorySaving ? <Loader2 className="spin" size={17} /> : <Plus size={17} />}
                  {productCategorySaving ? "Salvando..." : "Salvar categoria"}
                </button>
              </form>
            </div>
          )}

          {activeInventoryTool === "product" && showBrandForm && (
            <div className="inline-form-panel">
              <div className="panel-title compact">
                <div>
                  <h2>Nova marca</h2>
                  <p>Cadastro usado no produto e nos relatorios.</p>
                </div>
                <button
                  className="modal-close"
                  onClick={() => setShowBrandForm(false)}
                  title="Fechar"
                  type="button"
                >
                  <X size={18} />
                </button>
              </div>

              <form className="compact-form product-form" onSubmit={handleCreateBrand}>
                <label className="form-control">
                  <span>Nome</span>
                  <input
                    value={brandForm.nome}
                    onChange={(event) => setBrandForm((prev) => ({ ...prev, nome: event.target.value }))}
                    placeholder="Marca"
                  />
                </label>
                <label className="form-control">
                  <span>Descricao</span>
                  <textarea
                    value={brandForm.descricao}
                    onChange={(event) => setBrandForm((prev) => ({ ...prev, descricao: event.target.value }))}
                    placeholder="Observacao interna"
                  />
                </label>
                <button className="checkout-button" disabled={brandSaving} type="submit">
                  {brandSaving ? <Loader2 className="spin" size={17} /> : <Plus size={17} />}
                  {brandSaving ? "Salvando..." : "Salvar marca"}
                </button>
              </form>
            </div>
          )}

          {activeInventoryTool === "product" && showSupplierForm && (
            <div className="inline-form-panel">
              <div className="panel-title compact">
                <div>
                  <h2>Novo fornecedor</h2>
                  <p>Cadastro usado em produtos e compras.</p>
                </div>
                <button
                  className="modal-close"
                  onClick={() => setShowSupplierForm(false)}
                  title="Fechar"
                  type="button"
                >
                  <X size={18} />
                </button>
              </div>

              <form className="compact-form product-form" onSubmit={handleCreateSupplier}>
                <label className="form-control">
                  <span>Nome</span>
                  <input
                    value={supplierForm.nome}
                    onChange={(event) => setSupplierForm((prev) => ({ ...prev, nome: event.target.value }))}
                    placeholder="Fornecedor"
                  />
                </label>
                <div className="finance-form-row">
                  <label className="form-control">
                    <span>Tipo</span>
                    <select
                      value={supplierForm.tipoDocumento}
                      onChange={(event) => setSupplierForm((prev) => ({ ...prev, tipoDocumento: event.target.value }))}
                    >
                      <option value="CNPJ">CNPJ</option>
                      <option value="CPF">CPF</option>
                    </select>
                  </label>
                  <label className="form-control">
                    <span>Documento</span>
                    <input
                      value={supplierForm.documento}
                      onChange={(event) => setSupplierForm((prev) => ({ ...prev, documento: event.target.value }))}
                      placeholder="Somente numeros"
                    />
                  </label>
                </div>
                <div className="finance-form-row">
                  <label className="form-control">
                    <span>Telefone</span>
                    <input
                      value={supplierForm.telefone}
                      onChange={(event) => setSupplierForm((prev) => ({ ...prev, telefone: event.target.value }))}
                    />
                  </label>
                  <label className="form-control">
                    <span>Email</span>
                    <input
                      value={supplierForm.email}
                      onChange={(event) => setSupplierForm((prev) => ({ ...prev, email: event.target.value }))}
                    />
                  </label>
                </div>
                <label className="form-control">
                  <span>Endereco</span>
                  <textarea
                    value={supplierForm.endereco}
                    onChange={(event) => setSupplierForm((prev) => ({ ...prev, endereco: event.target.value }))}
                  />
                </label>
                <button className="checkout-button" disabled={supplierSaving} type="submit">
                  {supplierSaving ? <Loader2 className="spin" size={17} /> : <Plus size={17} />}
                  {supplierSaving ? "Salvando..." : "Salvar fornecedor"}
                </button>
              </form>
            </div>
          )}

          {activeInventoryTool === "purchase" && (
          <section className="inventory-tool-card inventory-purchase-card">
          <div className="panel-title compact">
            <div>
              <h2>Compra com fornecedor</h2>
              <p>Entrada de estoque com despesa no financeiro.</p>
            </div>
          </div>

          <form className="stock-form" onSubmit={handlePurchaseEntry}>
            <label>
              <span>Fornecedor</span>
              <select
                value={purchaseForm.fornecedorId}
                onChange={(event) => setPurchaseForm((prev) => ({ ...prev, fornecedorId: event.target.value }))}
              >
                <option value="">Selecione</option>
                {fornecedores.map((fornecedor) => (
                  <option key={fornecedor.id} value={fornecedor.id}>
                    {fornecedor.nome}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Produto</span>
              <select
                value={purchaseForm.produtoId}
                onChange={(event) => setPurchaseForm((prev) => ({ ...prev, produtoId: event.target.value }))}
              >
                <option value="">Selecione</option>
                {produtos.map((produto) => (
                  <option key={produto.id} value={produto.id}>
                    {produto.nome}
                  </option>
                ))}
              </select>
            </label>
            {selectedPurchaseProduct && (
              <p className="stock-current">
                Saldo atual: <strong>{formatNumber(getProductStockQuantity(selectedPurchaseProduct))}</strong>{" "}
                unidades
              </p>
            )}
            {selectedPurchaseSupplier && (
              <p className="stock-current">
                Fornecedor: <strong>{selectedPurchaseSupplier.documento}</strong>
              </p>
            )}
            <div className="finance-form-row">
              <label>
                <span>Quantidade</span>
                <input
                  min="1"
                  type="number"
                  value={purchaseForm.quantidade}
                  onChange={(event) => setPurchaseForm((prev) => ({ ...prev, quantidade: event.target.value }))}
                />
              </label>
              <label>
                <span>Preco unitario</span>
                <input
                  min="0.01"
                  step="0.01"
                  type="number"
                  value={purchaseForm.valorTotal}
                  onChange={(event) => setPurchaseForm((prev) => ({ ...prev, valorTotal: event.target.value }))}
                />
              </label>
            </div>
            <button className="panel-action-button secondary" onClick={handleAddPurchaseItem} type="button">
              <Plus size={16} />
              Adicionar item
            </button>
            {purchaseItems.length > 0 && (
              <div className="table-wrap compact-table">
                <table>
                  <tbody>
                    {purchaseItems.map((item, index) => (
                      <tr key={`${item.produtoId}-${index}`}>
                        <td>
                          <strong>{item.produto}</strong>
                          <small>
                            {formatNumber(item.quantidade)} x {formatCurrency(item.precoUnitario)}
                          </small>
                        </td>
                        <td>{formatCurrency(item.subtotal)}</td>
                        <td>
                          <button className="mini-action-button" onClick={() => handleRemovePurchaseItem(index)} type="button">
                            Remover
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td><strong>Total</strong></td>
                      <td><strong>{formatCurrency(purchaseTotal)}</strong></td>
                      <td />
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            <div className="finance-form-row">
              <label>
                <span>Pagamento</span>
                <select
                  value={purchaseForm.metodoPagamento}
                  onChange={(event) => setPurchaseForm((prev) => ({ ...prev, metodoPagamento: event.target.value }))}
                >
                  {cashPaymentOptions.filter((option) => option.value !== "MISTO").map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Status</span>
                <select
                  value={purchaseForm.status}
                  onChange={(event) => setPurchaseForm((prev) => ({ ...prev, status: event.target.value }))}
                >
                  <option value="PENDENTE">Pendente</option>
                  <option value="APROVADO">Pago</option>
                </select>
              </label>
            </div>
            <div className="finance-form-row">
              <label>
                <span>Vencimento</span>
                <input
                  type="date"
                  value={purchaseForm.dataVencimento}
                  onChange={(event) => setPurchaseForm((prev) => ({ ...prev, dataVencimento: event.target.value }))}
                />
              </label>
              <label>
                <span>Documento</span>
                <input
                  value={purchaseForm.numeroDocumento}
                  onChange={(event) => setPurchaseForm((prev) => ({ ...prev, numeroDocumento: event.target.value }))}
                  placeholder="NF, pedido ou boleto"
                />
              </label>
            </div>
            <label>
              <span>Observacao</span>
              <textarea
                value={purchaseForm.observacao}
                onChange={(event) => setPurchaseForm((prev) => ({ ...prev, observacao: event.target.value }))}
              />
            </label>
            <button disabled={purchaseSaving} type="submit">
              {purchaseSaving ? <Loader2 className="spin" size={17} /> : <PackageCheck size={17} />}
              {purchaseSaving ? "Registrando..." : "Registrar compra"}
            </button>
          </form>
          </section>
          )}

          {activeInventoryTool === "history" && (
          <section className="inventory-tool-card inventory-history-card">
          <div className="panel-title compact">
            <div>
              <h2>Historico de compras</h2>
              <p>Ultimas compras de estoque registradas.</p>
            </div>
            <div className="account-plan-actions">
              <button
                disabled={purchaseHistoryRows.length === 0}
                onClick={() => downloadCsv(`nexus-one-compras-${getLocalDateKey()}.csv`, purchaseHistoryRows)}
                type="button"
              >
                <Download size={15} />
                CSV
              </button>
              <button
                disabled={purchaseHistoryRows.length === 0}
                onClick={() => printRowsDocument("Historico de compras", purchaseHistoryRows, data?.empresa?.nome || "Nexus One")}
                type="button"
              >
                <Printer size={15} />
                PDF
              </button>
            </div>
          </div>

          <div className="table-wrap compact-table">
            <table>
              <tbody>
                {compras.length === 0 ? (
                  <tr>
                    <td className="empty-cell">Nenhuma compra registrada.</td>
                  </tr>
                ) : (
                  compras.slice(0, 6).map((compra) => (
                    <tr key={compra.id}>
                      <td>
                        <strong>{compra.fornecedor || "Fornecedor"}</strong>
                        <small>{formatDateTime(compra.dataCompra)} / {compra.filial || selectedInventoryBranchLabel}</small>
                        <small>{compra.numeroDocumento || "Sem documento"}</small>
                      </td>
                      <td>{formatNumber(asList(compra.itens).length)} itens</td>
                      <td>{formatCurrency(compra.valorTotal)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          </section>
          )}

          {activeInventoryTool === "count" && (
          <section className="inventory-tool-card">
          <div className="panel-title compact">
            <div>
              <h2>Contagem fisica</h2>
              <p>Inventario com ajuste automatico da divergencia.</p>
            </div>
          </div>

          <form className="stock-form" onSubmit={handleInventoryCount}>
            <label>
              <span>Produto</span>
              <select
                value={inventoryCountForm.produtoId}
                onChange={(event) =>
                  setInventoryCountForm((prev) => ({ ...prev, produtoId: event.target.value }))
                }
              >
                <option value="">Selecione</option>
                {produtos.map((produto) => (
                  <option key={produto.id} value={produto.id}>
                    {produto.nome}
                  </option>
                ))}
              </select>
            </label>

            {selectedInventoryProduct && (
              <div className="reconciliation-grid compact-metrics-grid">
                <div>
                  <span>Sistema</span>
                  <strong>{formatNumber(getProductStockQuantity(selectedInventoryProduct))}</strong>
                  <small>saldo atual</small>
                </div>
                <div>
                  <span>Divergencia</span>
                  <strong>{formatNumber(inventoryDifference)}</strong>
                  <small>{inventoryDifference === 0 ? "sem ajuste" : inventoryDifference > 0 ? "entrada" : "saida"}</small>
                </div>
              </div>
            )}

            <label>
              <span>Contagem fisica</span>
              <input
                min="0"
                type="number"
                value={inventoryCountForm.quantidadeContada}
                onChange={(event) =>
                  setInventoryCountForm((prev) => ({ ...prev, quantidadeContada: event.target.value }))
                }
              />
            </label>

            <label>
              <span>Observacao</span>
              <textarea
                value={inventoryCountForm.observacao}
                onChange={(event) =>
                  setInventoryCountForm((prev) => ({ ...prev, observacao: event.target.value }))
                }
                placeholder="Ex: contagem mensal, avaria, sobra fisica"
              />
            </label>

            <button disabled={inventorySaving} type="submit">
              {inventorySaving ? <Loader2 className="spin" size={17} /> : <ClipboardList size={17} />}
              {inventorySaving ? "Ajustando..." : "Registrar inventario"}
            </button>
          </form>
          </section>
          )}

          {activeInventoryTool === "transfer" && (
          <section className="inventory-tool-card">
          <div className="panel-title compact">
            <div>
              <h2>Transferencia entre locais</h2>
              <p>Movimente saldo entre matriz, deposito e filiais.</p>
            </div>
            <div className="account-plan-actions">
              <button
                disabled={stockLocationRows.length === 0}
                onClick={() => downloadCsv(`nexus-one-saldos-local-${getLocalDateKey()}.csv`, stockLocationRows)}
                type="button"
              >
                <Download size={15} />
                CSV
              </button>
              <button
                disabled={stockLocationRows.length === 0}
                onClick={() => printRowsDocument("Saldos por local", stockLocationRows, data?.empresa?.nome || "Nexus One")}
                type="button"
              >
                <Printer size={15} />
                PDF
              </button>
            </div>
          </div>

          <form className="stock-form" onSubmit={handleStockTransfer}>
            <label>
              <span>Produto</span>
              <select
                value={stockTransferForm.produtoId}
                onChange={(event) =>
                  setStockTransferForm((prev) => ({ ...prev, produtoId: event.target.value }))
                }
              >
                <option value="">Selecione</option>
                {produtos.map((produto) => (
                  <option key={produto.id} value={produto.id}>
                    {produto.nome}
                  </option>
                ))}
              </select>
            </label>

            {selectedTransferProduct && (
              <div className="reconciliation-grid compact-metrics-grid">
                <div>
                  <span>Origem</span>
                  <strong>{formatNumber(selectedTransferOriginStock?.quantidade || 0)}</strong>
                  <small>{stockTransferForm.origem || "GERAL"}</small>
                </div>
                <div>
                  <span>Total</span>
                  <strong>{formatNumber(getProductStockQuantity(selectedTransferProduct))}</strong>
                  <small>saldo geral</small>
                </div>
              </div>
            )}

            <div className="finance-form-row">
              <label>
                <span>Origem</span>
                <select
                  value={stockTransferForm.origem}
                  onChange={(event) =>
                    setStockTransferForm((prev) => ({ ...prev, origem: event.target.value }))
                  }
                >
                  {transferLocations.map((local) => (
                    <option key={local} value={local}>
                      {local}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Destino</span>
                <input
                  value={stockTransferForm.destino}
                  onChange={(event) =>
                    setStockTransferForm((prev) => ({ ...prev, destino: event.target.value }))
                  }
                  placeholder="Ex: FILIAL CENTRO"
                />
              </label>
            </div>

            <label>
              <span>Quantidade</span>
              <input
                min="1"
                type="number"
                value={stockTransferForm.quantidade}
                onChange={(event) =>
                  setStockTransferForm((prev) => ({ ...prev, quantidade: event.target.value }))
                }
              />
            </label>

            <label>
              <span>Observacao</span>
              <textarea
                value={stockTransferForm.observacao}
                onChange={(event) =>
                  setStockTransferForm((prev) => ({ ...prev, observacao: event.target.value }))
                }
                placeholder="Ex: reposicao filial, remanejamento, avaria"
              />
            </label>

            <button disabled={stockTransferSaving} type="submit">
              {stockTransferSaving ? <Loader2 className="spin" size={17} /> : <Truck size={17} />}
              {stockTransferSaving ? "Transferindo..." : "Transferir saldo"}
            </button>
          </form>
          </section>
          )}

          {activeInventoryTool === "adjustment" && (
          <section className="inventory-tool-card">
          <div className="panel-title compact">
            <div>
              <h2>Ajuste rapido</h2>
              <p>Entrada e saida conectadas ao Spring Boot.</p>
            </div>
          </div>

          <form className="stock-form" onSubmit={handleAdjustment}>
            <label className="stock-product-search">
              <span>Produto</span>
              <div className="client-search-box">
                <Search size={17} />
                <input
                  value={selectedProduct ? selectedProduct.nome : stockProductSearch}
                  onChange={(event) => {
                    setStockProductSearch(event.target.value);
                    setAdjustment((prev) => ({ ...prev, produtoId: "" }));
                  }}
                  placeholder="Digite nome ou codigo do produto"
                />
                {selectedProduct && (
                  <button
                    className="inline-clear-button"
                    onClick={() => {
                      setStockProductSearch("");
                      setAdjustment((prev) => ({ ...prev, produtoId: "" }));
                    }}
                    title="Limpar produto"
                    type="button"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
              {!selectedProduct && stockProductSearch.trim() && (
                <div className="client-results stock-search-results">
                  {stockSearchResults.length === 0 ? (
                    <button className="client-result empty" disabled type="button">
                      Nenhum produto encontrado
                    </button>
                  ) : (
                    stockSearchResults.map((produto) => (
                      <button
                        className="client-result"
                        key={produto.id}
                        onClick={() => {
                          setAdjustment((prev) => ({ ...prev, produtoId: produto.id }));
                          setStockProductSearch(produto.nome || "");
                        }}
                        type="button"
                      >
                        <strong>{produto.nome || "Produto sem nome"}</strong>
                        <small>
                          {produto.codigoBarras || "Sem codigo"} | Estoque{" "}
                          {formatNumber(getProductStockQuantity(produto))}
                        </small>
                      </button>
                    ))
                  )}
                </div>
              )}
            </label>

            {selectedProduct && (
              <p className="stock-current">
                Saldo atual: <strong>{formatNumber(getProductStockQuantity(selectedProduct))}</strong>{" "}
                unidades
              </p>
            )}

            <label>
              <span>Quantidade</span>
              <input
                min="1"
                type="number"
                value={adjustment.quantidade}
                onChange={(event) =>
                  setAdjustment((prev) => ({ ...prev, quantidade: event.target.value }))
                }
              />
            </label>

            <div className="segmented">
              <button
                className={adjustment.type === "entrada" ? "active" : ""}
                onClick={() => setAdjustment((prev) => ({ ...prev, type: "entrada" }))}
                type="button"
              >
                Entrada
              </button>
              <button
                className={adjustment.type === "saida" ? "active" : ""}
                onClick={() => setAdjustment((prev) => ({ ...prev, type: "saida" }))}
                type="button"
              >
                Saida
              </button>
            </div>

            <button disabled={saving} type="submit">
              {saving ? <Loader2 className="spin" size={17} /> : <PackageCheck size={17} />}
              {saving ? "Atualizando..." : "Atualizar estoque"}
            </button>

            {message && <p className={`form-message ${message.type}`}>{message.text}</p>}
          </form>
          </section>
          )}

          {activeInventoryTool === "alerts" && (
          <section className="inventory-tool-card inventory-alert-card">
          <div className="ranking stock-alerts">
            <div className="panel-title compact">
              <div>
                <h3>Alertas de estoque</h3>
                <p>{formatNumber(estoqueBaixo.length)} item(ns) abaixo do limite operacional.</p>
              </div>
              {canManageNotifications && (
                <button
                  className="mini-action-button"
                  disabled={saving || estoqueBaixo.length === 0}
                  onClick={handleSendStockNotifications}
                  type="button"
                >
                  {saving ? <Loader2 className="spin" size={15} /> : <Mail size={15} />}
                  Notificar
                </button>
              )}
            </div>
            {estoqueBaixo.length === 0 ? (
              <p>Nenhum produto em estoque baixo agora.</p>
            ) : (
              estoqueBaixo.map((item) => (
                <div className="ranking-row" key={item.id || getStockProductName(item)}>
                  <span>
                    {getStockProductName(item)}
                    <small>Minimo {formatNumber(getStockMinimum(item))}</small>
                  </span>
                  <strong>{formatNumber(getStockQuantity(item))} un.</strong>
                </div>
              ))
            )}
          </div>
          </section>
          )}
        </aside>
      </section>
    </div>
  );
}

const initialFinanceForm = {
  descricao: "",
  tipo: "RECEITA",
  categoria: "Venda",
  valor: "",
  metodoPagamento: "PIX",
  status: "APROVADO",
  dataVencimento: "",
  filialId: "",
  modoLancamento: "UNICO",
  parcelas: 1,
  intervaloMeses: 1,
  observacao: "",
};

const initialFinanceCategoryForm = {
  nome: "",
  descricao: "",
  centroCusto: true,
};

const initialCollectionFollowUpForm = {
  financeiroId: "",
  cliente: "",
  canal: "WhatsApp",
  proximaAcao: "",
  observacao: "",
};

function FinanceDashboard({ data, session, onRefresh }) {
  const [form, setForm] = useState(initialFinanceForm);
  const [categoryForm, setCategoryForm] = useState(initialFinanceCategoryForm);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showFinanceForm, setShowFinanceForm] = useState(false);
  const [financeFilter, setFinanceFilter] = useState("TODOS");
  const [financeCategoryFilter, setFinanceCategoryFilter] = useState("");
  const [financeBranchFilter, setFinanceBranchFilter] = useState("TODAS");
  const [financePage, setFinancePage] = useState(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [hydratedPedidos, setHydratedPedidos] = useState([]);
  const [selectedCharge, setSelectedCharge] = useState(null);
  const [collectionFollowUpForm, setCollectionFollowUpForm] = useState(initialCollectionFollowUpForm);
  const [selectedOrphanIds, setSelectedOrphanIds] = useState([]);
  const [orphanHistoryPage, setOrphanHistoryPage] = useState(0);
  const [orphanHistoryFilter, setOrphanHistoryFilter] = useState({
    busca: "",
    inicio: "",
    fim: "",
    preset: "TODOS",
  });
  const movimentacoes = asList(data?.movimentacoes);
  const recorrencias = asList(data?.recorrencias);
  const followUps = asList(data?.followUps);
  const filiais = asList(data?.filiais);
  const financeCategories = asList(data?.categorias).filter((categoria) => categoria.ativo !== false);
  function matchesFinanceBranch(item) {
    if (financeBranchFilter === "TODAS") return true;
    if (financeBranchFilter === "EMPRESA") return !item.filialId;
    return String(item.filialId || "") === financeBranchFilter;
  }
  const branchScopedMovimentacoes = movimentacoes.filter(matchesFinanceBranch);
  const branchScopedRecorrencias = recorrencias.filter(matchesFinanceBranch);
  const branchScopedFollowUps = followUps.filter(matchesFinanceBranch);
  const selectedFinanceBranchLabel = financeBranchFilter === "TODAS"
    ? "Todas as filiais"
    : financeBranchFilter === "EMPRESA"
      ? "Empresa / sem filial"
      : filiais.find((filial) => String(filial.id) === financeBranchFilter)?.nome || "Filial";
  const financeBaseMovimentacoes = branchScopedMovimentacoes.filter((item) => {
    if (financeFilter === "PENDENTES") return item.status === "PENDENTE";
    if (financeFilter === "VENCIDAS") return item.status === "PENDENTE" && isDateBeforeToday(item.dataVencimento || item.dataLancamento);
    if (financeFilter === "A_RECEBER_VENCER") return item.tipo === "RECEITA" && item.status === "PENDENTE" && isDateWithinNextDays(item.dataVencimento || item.dataLancamento, 7);
    if (financeFilter === "A_PAGAR_VENCER") return item.tipo === "DESPESA" && item.status === "PENDENTE" && isDateWithinNextDays(item.dataVencimento || item.dataLancamento, 7);
    if (financeFilter === "RECEITAS") return item.tipo === "RECEITA";
    if (financeFilter === "DESPESAS") return item.tipo === "DESPESA";
    if (financeFilter === "APROVADAS") return item.status === "APROVADO";
    return true;
  });
  const filteredMovimentacoes = financeBaseMovimentacoes.filter((item) =>
    financeCategoryFilter ? (item.categoria || "Sem categoria") === financeCategoryFilter : true,
  );
  const financeFilterOptions = [
    { value: "TODOS", label: "Todos", count: branchScopedMovimentacoes.length },
    { value: "PENDENTES", label: "Pendentes", count: branchScopedMovimentacoes.filter((item) => item.status === "PENDENTE").length },
    {
      value: "VENCIDAS",
      label: "Vencidas",
      count: branchScopedMovimentacoes.filter((item) => item.status === "PENDENTE" && isDateBeforeToday(item.dataVencimento || item.dataLancamento)).length,
    },
    {
      value: "A_RECEBER_VENCER",
      label: "Receber 7d",
      count: branchScopedMovimentacoes.filter((item) => item.tipo === "RECEITA" && item.status === "PENDENTE" && isDateWithinNextDays(item.dataVencimento || item.dataLancamento, 7)).length,
    },
    {
      value: "A_PAGAR_VENCER",
      label: "Pagar 7d",
      count: branchScopedMovimentacoes.filter((item) => item.tipo === "DESPESA" && item.status === "PENDENTE" && isDateWithinNextDays(item.dataVencimento || item.dataLancamento, 7)).length,
    },
    { value: "RECEITAS", label: "Receitas", count: branchScopedMovimentacoes.filter((item) => item.tipo === "RECEITA").length },
    { value: "DESPESAS", label: "Despesas", count: branchScopedMovimentacoes.filter((item) => item.tipo === "DESPESA").length },
    { value: "APROVADAS", label: "Aprovadas", count: branchScopedMovimentacoes.filter((item) => item.status === "APROVADO").length },
  ];
  const financePageSize = 10;
  const financeTotalPages = Math.max(Math.ceil(filteredMovimentacoes.length / financePageSize), 1);
  const currentFinancePage = Math.min(financePage, financeTotalPages - 1);
  const pagedMovimentacoes = filteredMovimentacoes.slice(
    currentFinancePage * financePageSize,
    currentFinancePage * financePageSize + financePageSize,
  );
  const financeFilterLabel = financeFilterOptions.find((option) => option.value === financeFilter)?.label || "Todos";
  const financeMovementRows = filteredMovimentacoes.map((item) => ({
    Data: formatDateTime(item.dataLancamento),
    Vencimento: item.dataVencimento ? formatDate(item.dataVencimento) : "-",
    Descricao: item.descricao || "Lancamento sem descricao",
    Tipo: item.tipo || "-",
    Status: item.status || "-",
    Pagamento: item.metodoPagamentoDescricao || item.metodoPagamento || "-",
    Categoria: item.categoria || "-",
    Filial: item.filial || "Empresa",
    Cobranca: item.codigoCobranca || "-",
    Pix: item.pixCopiaCola || "-",
    Boleto: item.boletoLinhaDigitavel || "-",
    Valor: formatCurrency(item.valor),
    Observacao: item.observacao || "-",
  }));
  const recurringFinanceRows = branchScopedRecorrencias.map((item) => ({
    Regra: item.descricao || "-",
    Filial: item.filial || "Empresa / sem filial",
    Tipo: item.tipo || "-",
    Categoria: item.categoria || "-",
    Valor: formatCurrency(item.valor),
    "Proxima geracao": item.proximaGeracao ? formatDate(item.proximaGeracao) : "-",
    Intervalo: `${formatNumber(item.intervaloMeses || 1)} mes(es)`,
    Geradas: item.totalGeracoes
      ? `${formatNumber(item.geracoesRealizadas || 0)}/${formatNumber(item.totalGeracoes)}`
      : formatNumber(item.geracoesRealizadas || 0),
    Status: item.ativo ? "Ativa" : "Pausada",
  }));
  const activeRecurrences = branchScopedRecorrencias.filter((item) => item.ativo !== false);
  const nextRecurrences = [...activeRecurrences]
    .sort((a, b) => String(a.proximaGeracao || "").localeCompare(String(b.proximaGeracao || "")))
    .slice(0, 4);
  const financeCategorySummary = Array.from(
    financeBaseMovimentacoes.reduce((map, item) => {
      const key = item.categoria || "Sem categoria";
      const current = map.get(key) || { categoria: key, receitas: 0, despesas: 0, pendentes: 0, total: 0, registros: 0 };
      const valor = Number(item.valor || 0);
      const isDespesa = item.tipo === "DESPESA";

      current.receitas += item.tipo === "RECEITA" ? valor : 0;
      current.despesas += isDespesa ? valor : 0;
      current.pendentes += item.status === "PENDENTE" ? valor : 0;
      current.total += isDespesa ? -valor : valor;
      current.registros += 1;
      map.set(key, current);
      return map;
    }, new Map()).values(),
  ).sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
  const financeCategoryRows = financeCategorySummary.map((item) => ({
    Categoria: item.categoria,
    Receitas: formatCurrency(item.receitas),
    Despesas: formatCurrency(item.despesas),
    Pendentes: formatCurrency(item.pendentes),
    Saldo: formatCurrency(item.total),
    Registros: formatNumber(item.registros),
  }));
  const financeBranchSummary = Array.from(
    branchScopedMovimentacoes.reduce((map, item) => {
      const key = item.filialId || "EMPRESA";
      const current = map.get(key) || {
        id: key,
        filial: item.filial || "Empresa",
        receitas: 0,
        despesas: 0,
        pendentes: 0,
        aprovadas: 0,
        registros: 0,
      };
      const valor = Number(item.valor || 0);

      current.receitas += item.tipo === "RECEITA" && item.status === "APROVADO" ? valor : 0;
      current.despesas += item.tipo === "DESPESA" && item.status === "APROVADO" ? valor : 0;
      current.pendentes += item.status === "PENDENTE" ? valor : 0;
      current.aprovadas += item.status === "APROVADO" ? 1 : 0;
      current.registros += 1;
      map.set(key, current);
      return map;
    }, new Map()).values(),
  ).sort((a, b) => (b.receitas - b.despesas) - (a.receitas - a.despesas));
  const financeBranchRows = financeBranchSummary.map((item) => ({
    Filial: item.filial,
    Receitas: formatCurrency(item.receitas),
    Despesas: formatCurrency(item.despesas),
    Lucro: formatCurrency(item.receitas - item.despesas),
    Pendentes: formatCurrency(item.pendentes),
    Aprovadas: formatNumber(item.aprovadas),
    Registros: formatNumber(item.registros),
  }));
  const financeCategoryOptions = Array.from(
    new Set([
      ...financeCategories.map((categoria) => categoria.nome).filter(Boolean),
      "Venda",
      "Compra de estoque",
      "Taxas",
      "Servicos",
      "Administrativo",
      ...financeCategorySummary.map((item) => item.categoria).filter((categoria) => categoria !== "Sem categoria"),
    ]),
  ).sort((a, b) => a.localeCompare(b));
  const pedidos = asList(data?.pedidos);
  const caixas = asList(data?.caixas);
  const auditoria = asList(data?.auditoria);
  const canMutateFinance = canPerform(session, "mutateFinance");
  const canReverseFinance = canPerform(session, "reverseFinance");
  const canSeeProfit = canPerform(session, "seeProfit");
  const isAdmin = normalizePerfil(session.perfil) === "ADMIN";
  const canManageNotifications = ["ADMIN", "GERENTE"].includes(normalizePerfil(session.perfil));
  const salesWithoutFinanceRef = useRef(null);
  const orphanOrdersRef = useRef(null);
  const orphanHistoryRef = useRef(null);
  const cashDivergenceRef = useRef(null);
  const orphanlessRevenueRef = useRef(null);
  const inconsistencyPanelRef = useRef(null);
  const collectionAgendaRef = useRef(null);
  const completedSaleStatuses = new Set(["FINALIZADA", "RECEBIDO", "ENTREGUE", "CONCLUIDO"]);
  const vendasRecebidas = pedidos.filter((pedido) => completedSaleStatuses.has(String(pedido.status || "")));
  const totalVendasRecebidas = vendasRecebidas.reduce((total, pedido) => total + Number(pedido.valor || 0), 0);
  const totalCaixaVendas = caixas.reduce((total, caixa) => total + Number(caixa.totalVendas || 0), 0);
  const receitaAprovadaFiltrada = branchScopedMovimentacoes
    .filter((item) => item.tipo === "RECEITA" && item.status === "APROVADO")
    .reduce((total, item) => total + Number(item.valor || 0), 0);
  const despesaAprovadaFiltrada = branchScopedMovimentacoes
    .filter((item) => item.tipo === "DESPESA" && item.status === "APROVADO")
    .reduce((total, item) => total + Number(item.valor || 0), 0);
  const lucroFiltrado = receitaAprovadaFiltrada - despesaAprovadaFiltrada;
  const totalFinanceiroReceitas = branchScopedMovimentacoes
    .filter((item) => item.tipo === "RECEITA" && item.status === "APROVADO")
    .reduce((total, item) => total + Number(item.valor || 0), 0);
  const contasAReceber = branchScopedMovimentacoes.filter((item) => item.tipo === "RECEITA" && item.status === "PENDENTE");
  const contasAPagar = branchScopedMovimentacoes.filter((item) => item.tipo === "DESPESA" && item.status === "PENDENTE");
  const contasAReceberVencidas = contasAReceber.filter((item) => isDateBeforeToday(item.dataVencimento || item.dataLancamento));
  const contasAPagarVencidas = contasAPagar.filter((item) => isDateBeforeToday(item.dataVencimento || item.dataLancamento));
  const contasAReceberAVencer = contasAReceber.filter((item) => isDateWithinNextDays(item.dataVencimento || item.dataLancamento, 7));
  const contasAPagarAVencer = contasAPagar.filter((item) => isDateWithinNextDays(item.dataVencimento || item.dataLancamento, 7));
  const totalAReceber = contasAReceber.reduce((total, item) => total + Number(item.valor || 0), 0);
  const totalAPagar = contasAPagar.reduce((total, item) => total + Number(item.valor || 0), 0);
  const totalAReceberVencido = contasAReceberVencidas.reduce((total, item) => total + Number(item.valor || 0), 0);
  const totalAPagarVencido = contasAPagarVencidas.reduce((total, item) => total + Number(item.valor || 0), 0);
  const totalAReceberAVencer = contasAReceberAVencer.reduce((total, item) => total + Number(item.valor || 0), 0);
  const totalAPagarAVencer = contasAPagarAVencer.reduce((total, item) => total + Number(item.valor || 0), 0);
  const totalContasVencidas = contasAReceberVencidas.length + contasAPagarVencidas.length;
  const totalContasAVencer = contasAReceberAVencer.length + contasAPagarAVencer.length;
  const cashFlowDays = Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + index);
    const dateKey = getLocalDateKey(date);
    const dayMovements = branchScopedMovimentacoes.filter((item) => {
      if (!["APROVADO", "PENDENTE"].includes(String(item.status || ""))) return false;
      const referenceDate = item.status === "PENDENTE"
        ? item.dataVencimento || item.dataLancamento
        : item.dataLancamento;
      return getLocalDateKey(referenceDate) === dateKey;
    });
    const entradas = dayMovements
      .filter((item) => item.tipo === "RECEITA")
      .reduce((total, item) => total + Number(item.valor || 0), 0);
    const saidas = dayMovements
      .filter((item) => item.tipo === "DESPESA")
      .reduce((total, item) => total + Number(item.valor || 0), 0);
    const pendentes = dayMovements
      .filter((item) => item.status === "PENDENTE")
      .reduce((total, item) => total + Number(item.valor || 0), 0);

    return {
      key: dateKey,
      label: formatShortDate(dateKey),
      entradas,
      saidas,
      pendentes,
      saldo: entradas - saidas,
      registros: dayMovements.length,
    };
  });
  const cashFlowRows = cashFlowDays.map((item) => ({
    Data: item.label,
    Entradas: formatCurrency(item.entradas),
    Saidas: formatCurrency(item.saidas),
    Pendentes: formatCurrency(item.pendentes),
    Saldo: formatCurrency(item.saldo),
    Registros: formatNumber(item.registros),
  }));
  const cashFlowTotalEntradas = cashFlowDays.reduce((total, item) => total + item.entradas, 0);
  const cashFlowTotalSaidas = cashFlowDays.reduce((total, item) => total + item.saidas, 0);
  const cashFlowSaldo = cashFlowTotalEntradas - cashFlowTotalSaidas;
  const ordenarPorVencimento = (items) =>
    [...items].sort((a, b) =>
      String(a.dataVencimento || a.dataLancamento || "").localeCompare(String(b.dataVencimento || b.dataLancamento || "")),
    );
  const proximasContasAReceber = ordenarPorVencimento(contasAReceber).slice(0, 4);
  const proximasContasAPagar = ordenarPorVencimento(contasAPagar).slice(0, 4);
  const pedidoIdsComFinanceiro = new Set(
    branchScopedMovimentacoes
      .filter((item) => item.tipo === "RECEITA" && item.status === "APROVADO" && item.pedidoId)
      .map((item) => String(item.pedidoId)),
  );
  const pedidosHydratedPorId = useMemo(
    () => new Map(hydratedPedidos.map((pedido) => [String(pedido.id), pedido])),
    [hydratedPedidos],
  );
  const pedidosPorId = useMemo(() => {
    const mapa = new Map(pedidos.map((pedido) => [String(pedido.id), pedido]));
    hydratedPedidos.forEach((pedido) => mapa.set(String(pedido.id), pedido));
    return mapa;
  }, [pedidos, hydratedPedidos]);
  const contasAReceberVencidasDetalhadas = contasAReceberVencidas
    .map((item) => {
      const pedido = item.pedidoId ? pedidosPorId.get(String(item.pedidoId)) : null;
      const vencimento = item.dataVencimento || item.dataLancamento;
      const diasAtraso = getDaysOverdue(vencimento);
      return {
        ...item,
        cliente: pedido?.cliente || "Cliente nao identificado",
        clienteId: pedido?.clienteId || null,
        pedidoNumero: pedido?.numero || pedido?.id || item.pedidoId || "-",
        vencimento,
        diasAtraso,
        faixa: getAgingBucket(diasAtraso),
      };
    })
    .sort((a, b) => b.diasAtraso - a.diasAtraso || Number(b.valor || 0) - Number(a.valor || 0));
  const agingBuckets = ["1-7 dias", "8-30 dias", "31-60 dias", "60+ dias"].map((faixa) => {
    const items = contasAReceberVencidasDetalhadas.filter((item) => item.faixa === faixa);
    return {
      faixa,
      quantidade: items.length,
      valor: items.reduce((total, item) => total + Number(item.valor || 0), 0),
    };
  });
  const maiorAtrasoDias = contasAReceberVencidasDetalhadas.reduce((maior, item) => Math.max(maior, item.diasAtraso), 0);
  const inadimplenciaRows = contasAReceberVencidasDetalhadas.map((item) => ({
    Cliente: item.cliente,
    Filial: item.filial || "Empresa / sem filial",
    Lancamento: item.descricao || item.id || "Receita vencida",
    Pedido: item.pedidoNumero,
    Vencimento: formatDate(item.vencimento),
    "Dias em atraso": formatNumber(item.diasAtraso),
    Faixa: item.faixa,
    Categoria: item.categoria || "-",
    Pagamento: item.metodoPagamentoDescricao || item.metodoPagamento || "-",
    Valor: formatCurrency(item.valor),
    Observacao: item.observacao || "-",
  }));
  const cobrancaPorCliente = Array.from(
    contasAReceberVencidasDetalhadas.reduce((map, item) => {
      const key = item.clienteId || item.cliente;
      const current = map.get(key) || {
        cliente: item.cliente,
        filiais: new Set(),
        titulos: 0,
        total: 0,
        maiorAtraso: 0,
        ultimoVencimento: item.vencimento,
        observacoes: [],
        titulosDetalhados: [],
      };

      current.titulos += 1;
      current.total += Number(item.valor || 0);
      current.filiais.add(item.filial || "Empresa / sem filial");
      current.maiorAtraso = Math.max(current.maiorAtraso, item.diasAtraso);
      current.titulosDetalhados.push(item);
      if (String(item.vencimento || "") > String(current.ultimoVencimento || "")) {
        current.ultimoVencimento = item.vencimento;
      }
      if (item.observacao) {
        current.observacoes.push(item.observacao);
      }
      map.set(key, current);
      return map;
    }, new Map()).values(),
  ).sort((a, b) => b.total - a.total);
  const cobrancaRows = cobrancaPorCliente.map((item) => ({
    Cliente: item.cliente,
    Filiais: Array.from(item.filiais).join(" | ") || "Empresa / sem filial",
    Titulos: formatNumber(item.titulos),
    "Total vencido": formatCurrency(item.total),
    "Maior atraso": `${formatNumber(item.maiorAtraso)} dia(s)`,
    "Ultimo vencimento": formatDate(item.ultimoVencimento),
    "Historico/observacoes": item.observacoes.slice(-3).join(" | ") || "Sem contato registrado",
  }));
  const followUpRows = branchScopedFollowUps.map((item) => ({
    Cliente: item.clienteNome || "Cliente nao identificado",
    Lancamento: item.financeiroDescricao || item.financeiroId || "-",
    Valor: formatCurrency(item.valor),
    Vencimento: item.vencimento ? formatDate(item.vencimento) : "-",
    Canal: item.canal || "-",
    "Proxima acao": item.proximaAcao ? formatDate(item.proximaAcao) : "-",
    Status: item.status || "-",
    "Notificacao externa": item.notificacaoExternaEm ? formatDateTime(item.notificacaoExternaEm) : "-",
    Usuario: item.usuarioNome || "-",
    Filial: item.filial || "Empresa",
    Observacao: item.observacao || "-",
  }));
  const pendingFollowUps = branchScopedFollowUps.filter((item) => item.status === "PENDENTE");
  const dueFollowUps = pendingFollowUps.filter((item) =>
    isDateBeforeToday(item.proximaAcao) || getLocalDateKey(item.proximaAcao) === getLocalDateKey(),
  );
  const upcomingFollowUps = pendingFollowUps.filter((item) =>
    !dueFollowUps.some((due) => String(due.id) === String(item.id)) && isDateWithinNextDays(item.proximaAcao, 7),
  );
  const reminderFollowUps = [...dueFollowUps].sort((a, b) =>
    String(a.proximaAcao || "").localeCompare(String(b.proximaAcao || "")),
  );
  const vendasSemFinanceiroRaw = vendasRecebidas
    .filter((pedido) => !pedidoIdsComFinanceiro.has(String(pedido.id)))
    .map((pedido) => pedidosPorId.get(String(pedido.id)) || pedido);
  const pedidosSemItens = vendasSemFinanceiroRaw.filter((pedido) => asList(pedido.itens).length === 0);
  const vendasSemFinanceiro = vendasSemFinanceiroRaw.filter((pedido) => asList(pedido.itens).length > 0);
  const orphanPreview = pedidosSemItens.slice(0, 6);
  const orphanReportRows = pedidosSemItens.map((pedido) => ({
    Pedido: pedido.numero || pedido.id,
    "Data e hora": formatDateTime(pedido.data),
    Usuario: pedido.usuario || "Nao identificado",
    Empresa: pedido.empresa || session?.empresa || "Nao identificada",
    Valor: formatCurrency(pedido.valor),
    Status: pedido.status || "-",
    Observacao: "Pedido sem itens cadastrados",
  }));
  const financeiroSemPedido = branchScopedMovimentacoes.filter(
    (item) => item.tipo === "RECEITA" && item.status === "APROVADO" && !item.pedidoId,
  );
  const caixasComDivergencia = caixas.filter((caixa) => Number(caixa.divergencia || 0) !== 0);
  const orphanCancellationEvents = auditoria
    .filter((evento) => evento.acao === "PEDIDO_INCONSISTENTE_CANCELADO")
    .map((evento) => {
      const pedido = pedidosPorId.get(String(evento.registroId)) || {};
      return {
        id: `${evento.id || evento.registroId || evento.dataEvento}`,
        pedidoNumero: pedido.numero || evento.registroId || "-",
        usuarioOrigem: pedido.usuario || "Nao identificado",
        empresaOrigem: pedido.empresa || session?.empresa || "Nao identificada",
        valor: formatCurrency(pedido.valor),
        status: pedido.status || "CANCELADO",
        canceladoPor: evento.usuarioLogin || "-",
        canceladoEmRaw: evento.dataEvento || null,
        canceladoEm: formatDateTime(evento.dataEvento),
        descricao: evento.descricao || "Pedido sem itens cancelado administrativamente.",
      };
    });
  const filteredOrphanCancellationEvents = orphanCancellationEvents.filter((evento) => {
    const eventKey = getLocalDateKey(evento.canceladoEmRaw);
    const text = [
      evento.pedidoNumero,
      evento.canceladoPor,
      evento.usuarioOrigem,
      evento.empresaOrigem,
      evento.descricao,
    ].join(" ").toLowerCase();

    if (orphanHistoryFilter.busca && !text.includes(orphanHistoryFilter.busca.toLowerCase())) return false;
    if (orphanHistoryFilter.inicio && eventKey < orphanHistoryFilter.inicio) return false;
    if (orphanHistoryFilter.fim && eventKey > orphanHistoryFilter.fim) return false;
    return true;
  });
  const orphanCancellationRows = filteredOrphanCancellationEvents.map((evento) => ({
    Pedido: evento.pedidoNumero,
    "Cancelado em": evento.canceladoEm,
    "Cancelado por": evento.canceladoPor,
    Usuario: evento.usuarioOrigem,
    Empresa: evento.empresaOrigem,
    Valor: evento.valor,
    Status: evento.status,
    Descricao: evento.descricao,
  }));
  const vendasSemFinanceiroRows = vendasSemFinanceiro.map((pedido) => ({
    Categoria: "Vendas sem financeiro",
    Pedido: pedido.numero || pedido.id,
    "Data e hora": formatDateTime(pedido.data),
    Usuario: pedido.usuario || "Nao identificado",
    Empresa: pedido.empresa || session?.empresa || "Nao identificada",
    Valor: formatCurrency(pedido.valor),
    Status: pedido.status || "-",
    Detalhe: asList(pedido.itens).length > 0
      ? asList(pedido.itens)
        .map((item) => {
          const codigo = item.codigoBarras || item.sku || item.produtoId || "sem codigo";
          return `${item.produto || "Produto sem nome"} - ${codigo} (${formatNumber(item.quantidade)} un.)`;
        })
        .join(" | ")
      : "Pedido sem itens cadastrados",
  }));
  const pedidosSemItensRows = pedidosSemItens.map((pedido) => ({
    Categoria: "Pedidos sem itens",
    Pedido: pedido.numero || pedido.id,
    "Data e hora": formatDateTime(pedido.data),
    Usuario: pedido.usuario || "Nao identificado",
    Empresa: pedido.empresa || session?.empresa || "Nao identificada",
    Valor: formatCurrency(pedido.valor),
    Status: pedido.status || "-",
    Detalhe: "Pedido sem itens cadastrados",
  }));
  const canceladosAdministrativamenteRows = orphanCancellationRows.map((row) => ({
    Categoria: "Pedidos sem itens cancelados",
    ...row,
  }));
  const receitasSemPedidoRows = financeiroSemPedido.map((item) => ({
    Categoria: "Receitas sem pedido",
    Lancamento: item.descricao || item.id || "Sem descricao",
    "Data e hora": formatDateTime(item.dataLancamento),
    Usuario: item.usuario || "-",
    Empresa: session?.empresa || "Nexus One",
    Valor: formatCurrency(item.valor),
    Status: item.status || "-",
    Detalhe: item.metodoPagamento || item.categoria || "Sem vinculo",
  }));
  const caixasComDivergenciaRows = caixasComDivergencia.map((caixa) => ({
    Categoria: "Caixas com divergencia",
    Caixa: caixa.id || "-",
    Operador: caixa.usuarioNome || caixa.usuario || "-",
    Empresa: caixa.empresaNome || session?.empresa || "Nexus One",
    Abertura: formatDateTime(caixa.dataAbertura),
    Fechamento: formatDateTime(caixa.dataFechamento),
    Divergencia: formatCurrency(caixa.divergencia),
    Status: caixa.status || "-",
  }));
  const inconsistencyCards = [
    {
      key: "vendas-sem-financeiro",
      icon: ReceiptText,
      title: "Vendas sem financeiro",
      detail: "Pedidos recebidos que ainda nao geraram receita aprovada.",
      count: vendasSemFinanceiro.length,
      status: vendasSemFinanceiro.length > 0 ? "Acao necessaria" : "Sem ocorrencias",
      severity: vendasSemFinanceiro.length > 0 ? "medium" : "neutral",
      rows: vendasSemFinanceiroRows,
      anchor: salesWithoutFinanceRef,
    },
    {
      key: "pedidos-sem-itens",
      icon: AlertTriangle,
      title: "Pedidos sem itens",
      detail: "Pedidos inconsistentes ja separados da conciliacao principal.",
      count: pedidosSemItens.length,
      status: pedidosSemItens.length > 0 ? "Acao necessaria" : "Sem ocorrencias",
      severity: pedidosSemItens.length > 0 ? "high" : "neutral",
      rows: pedidosSemItensRows,
      anchor: orphanOrdersRef,
    },
    {
      key: "pedidos-sem-itens-cancelados",
      icon: CheckCircle2,
      title: "Cancelados administrativamente",
      detail: "Pedidos sem itens que ja foram tratados pelo admin.",
      count: filteredOrphanCancellationEvents.length,
      status: filteredOrphanCancellationEvents.length > 0 ? "Historico disponivel" : "Sem historico",
      severity: filteredOrphanCancellationEvents.length > 0 ? "resolved" : "neutral",
      rows: canceladosAdministrativamenteRows,
      anchor: orphanHistoryRef,
    },
    {
      key: "caixas-com-divergencia",
      icon: CreditCard,
      title: "Caixas com divergencia",
      detail: "Fechamentos onde saldo contado e calculado nao bateram.",
      count: caixasComDivergencia.length,
      status: caixasComDivergencia.length > 0 ? "Conferir fechamento" : "Sem ocorrencias",
      severity: caixasComDivergencia.length > 0 ? "high" : "neutral",
      rows: caixasComDivergenciaRows,
      anchor: cashDivergenceRef,
    },
    {
      key: "receitas-sem-pedido",
      icon: CircleDollarSign,
      title: "Receitas sem pedido",
      detail: "Lancamentos aprovados sem pedido vinculado.",
      count: financeiroSemPedido.length,
      status: financeiroSemPedido.length > 0 ? "Revisar vinculo" : "Sem ocorrencias",
      severity: financeiroSemPedido.length > 0 ? "medium" : "neutral",
      rows: receitasSemPedidoRows,
      anchor: orphanlessRevenueRef,
    },
  ];
  const inconsistencyRows = inconsistencyCards.flatMap((card) => card.rows);
  const criticalInconsistencyCount = inconsistencyCards
    .filter((card) => card.severity === "high")
    .reduce((total, card) => total + Number(card.count || 0), 0);
  const mediumInconsistencyCount = inconsistencyCards
    .filter((card) => card.severity === "medium")
    .reduce((total, card) => total + Number(card.count || 0), 0);
  const orphanHistoryPageSize = 10;
  const orphanHistoryTotalPages = Math.max(
    Math.ceil(filteredOrphanCancellationEvents.length / orphanHistoryPageSize),
    1,
  );
  const currentOrphanHistoryPage = Math.min(orphanHistoryPage, orphanHistoryTotalPages - 1);
  const pagedOrphanCancellationEvents = filteredOrphanCancellationEvents.slice(
    currentOrphanHistoryPage * orphanHistoryPageSize,
    currentOrphanHistoryPage * orphanHistoryPageSize + orphanHistoryPageSize,
  );
  const missingPedidoIds = useMemo(
    () =>
      vendasSemFinanceiroRaw
        .filter((pedido) => {
          const id = String(pedido.id || "");
          return id && asList(pedido.itens).length === 0 && !pedidosHydratedPorId.has(id);
        })
        .map((pedido) => String(pedido.id)),
    [pedidosHydratedPorId, vendasSemFinanceiroRaw],
  );

  useEffect(() => {
    if (missingPedidoIds.length === 0) return undefined;

    let active = true;

    Promise.allSettled(
      missingPedidoIds.map(async (id) => {
        const pedido = await endpoints.pedidos.obter(id);
        if (asList(pedido.itens).length > 0) return pedido;

        const itens = await endpoints.pedidos.itens(id);
        return { ...pedido, itens: asList(itens) };
      }),
    )
      .then((results) => {
        if (!active) return;

        const loadedPedidos = results
          .filter((result) => result.status === "fulfilled" && result.value?.id)
          .map((result) => result.value);

        if (loadedPedidos.length === 0) return;

        setHydratedPedidos((current) => {
          const mapa = new Map(current.map((pedido) => [String(pedido.id), pedido]));
          loadedPedidos.forEach((pedido) => mapa.set(String(pedido.id), pedido));
          return Array.from(mapa.values());
        });
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [missingPedidoIds]);

  useEffect(() => {
    const validIds = new Set(pedidosSemItens.map((pedido) => String(pedido.id)));
    setSelectedOrphanIds((current) => current.filter((id) => validIds.has(String(id))));
  }, [pedidosSemItens]);

  useEffect(() => {
    setOrphanHistoryPage(0);
  }, [orphanHistoryFilter]);

  function applyOrphanHistoryPreset(preset) {
    const now = new Date();
    const today = getLocalDateKey(now);
    let inicio = "";
    let fim = today;

    if (preset === "HOJE") {
      inicio = today;
    } else if (preset === "SEMANA") {
      const start = new Date(now);
      const day = start.getDay();
      const diff = day === 0 ? 6 : day - 1;
      start.setDate(start.getDate() - diff);
      inicio = getLocalDateKey(start);
    } else if (preset === "MES") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      inicio = getLocalDateKey(start);
    } else {
      fim = "";
    }

    setOrphanHistoryFilter((current) => ({
      ...current,
      preset,
      inicio,
      fim,
    }));
  }

  function focusInconsistencyCard(cardKey) {
    const card = inconsistencyCards.find((item) => item.key === cardKey);
    if (!card?.anchor?.current) return;

    if (cardKey === "pedidos-sem-itens-cancelados" && orphanHistoryFilter.preset !== "TODOS") {
      setOrphanHistoryFilter((current) => ({ ...current, preset: "TODOS", inicio: "", fim: "" }));
    }

    window.requestAnimationFrame(() => {
      card.anchor.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function focusInconsistencyPanel() {
    inconsistencyPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const getPedidoItemSummary = (pedido) => {
    const itens = asList(pedido.itens);
    if (itens.length === 0) return "Pedido sem itens cadastrados";

    return itens
      .map((item) => {
        const codigo = item.codigoBarras || item.sku || item.produtoId || "sem codigo";
        return `${item.produto || "Produto sem nome"} - ${codigo} (${formatNumber(item.quantidade)} un.)`;
      })
      .join(" | ");
  };
  const getFinanceItemSummary = (item) => {
    if (!item.pedidoId) return item.categoria || "Sem pedido vinculado";
    return getPedidoItemSummary(pedidosPorId.get(String(item.pedidoId)) || {});
  };
  const reconciliationRows = [
    { indicador: "Vendas recebidas", valor: formatCurrency(totalVendasRecebidas), detalhe: `${formatNumber(vendasRecebidas.length)} pedidos` },
    { indicador: "Vendas no caixa", valor: formatCurrency(totalCaixaVendas), detalhe: `${formatNumber(caixas.length)} caixas` },
    { indicador: "Receitas financeiras", valor: formatCurrency(totalFinanceiroReceitas), detalhe: `${formatNumber(movimentacoes.length)} lancamentos` },
    { indicador: "Diferenca vendas x caixa", valor: formatCurrency(totalVendasRecebidas - totalCaixaVendas), detalhe: "Pedidos finalizados comparados ao caixa" },
    { indicador: "Diferenca caixa x financeiro", valor: formatCurrency(totalCaixaVendas - totalFinanceiroReceitas), detalhe: "Caixa comparado ao financeiro" },
    { indicador: "Vendas sem financeiro", valor: formatNumber(vendasSemFinanceiro.length), detalhe: "Pedidos recebidos sem lancamento vinculado" },
    { indicador: "Pedidos sem itens", valor: formatNumber(pedidosSemItens.length), detalhe: "Pedidos antigos ou inconsistentes fora da conciliacao" },
    { indicador: "Pedidos sem itens cancelados", valor: formatNumber(filteredOrphanCancellationEvents.length), detalhe: "Historico administrativo da limpeza" },
    { indicador: "Receitas sem pedido", valor: formatNumber(financeiroSemPedido.length), detalhe: "Lancamentos manuais ou sem vinculo" },
    { indicador: "Caixas com divergencia", valor: formatNumber(caixasComDivergencia.length), detalhe: "Fechamentos com diferenca" },
  ];

  async function handleSubmit(event) {
    event.preventDefault();
    const installmentCount = Math.max(1, Number(form.parcelas || 1));
    const intervalMonths = Math.max(1, Number(form.intervaloMeses || 1));
    const isInstallment = form.modoLancamento === "PARCELADO";
    const isRecurring = form.modoLancamento === "RECORRENTE";

    if (!form.descricao.trim()) {
      setMessage({ type: "error", text: "Informe a descricao do lancamento." });
      return;
    }

    if (Number(form.valor) <= 0) {
      setMessage({ type: "error", text: "Informe um valor maior que zero." });
      return;
    }

    if ((isInstallment || isRecurring) && installmentCount <= 1) {
      setMessage({ type: "error", text: "Informe ao menos 2 parcelas ou recorrencias." });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const totalValue = Number(form.valor);
      if (isRecurring) {
        await endpoints.financeiro.criarRecorrencia({
          descricao: form.descricao.trim(),
          tipo: form.tipo,
          categoria: form.categoria,
          valor: totalValue,
          metodoPagamento: form.metodoPagamento,
          statusLancamento: form.status,
          dataInicio: form.dataVencimento || getLocalDateKey(),
          intervaloMeses: intervalMonths,
          totalGeracoes: installmentCount,
          gerarPrimeiroLancamento: true,
          usuarioId: session.usuarioId,
          filialId: form.filialId || session.filialId || null,
          observacao: form.observacao,
        });

        setForm(initialFinanceForm);
        setMessage({ type: "success", text: "Regra de recorrencia criada e primeiro lancamento gerado." });
        await onRefresh();
        return;
      }

      const launches = isInstallment
        ? Array.from({ length: installmentCount }, (_, index) => {
            const dueDate = addMonthsToDateKey(form.dataVencimento || getLocalDateKey(), index * intervalMonths);
            const suffix = `Parcela ${index + 1}/${installmentCount}`;
            return {
              descricao: `${form.descricao.trim()} - ${suffix}`,
              tipo: form.tipo,
              categoria: form.categoria,
              valor: isInstallment ? Number((totalValue / installmentCount).toFixed(2)) : totalValue,
              metodoPagamento: form.metodoPagamento,
              status: form.status,
              dataVencimento: dueDate || null,
              usuarioId: session.usuarioId,
              filialId: form.filialId || session.filialId || null,
              observacao: [form.observacao, suffix].filter(Boolean).join(" | "),
            };
          })
        : [{
            descricao: form.descricao.trim(),
            tipo: form.tipo,
            categoria: form.categoria,
            valor: totalValue,
            metodoPagamento: form.metodoPagamento,
            status: form.status,
            dataVencimento: form.dataVencimento || null,
            usuarioId: session.usuarioId,
            filialId: form.filialId || session.filialId || null,
            observacao: form.observacao,
          }];

      await Promise.all(launches.map((payload) => endpoints.financeiro.criar(payload)));

      setForm(initialFinanceForm);
      setMessage({
        type: "success",
        text: launches.length === 1
          ? "Lancamento financeiro registrado."
          : `${formatNumber(launches.length)} lancamentos financeiros gerados automaticamente.`,
      });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateFinanceCategory(event) {
    event.preventDefault();

    if (!categoryForm.nome.trim()) {
      setMessage({ type: "error", text: "Informe o nome da categoria financeira." });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const categoria = await endpoints.categorias.criar({
        nome: categoryForm.nome.trim(),
        descricao: categoryForm.descricao.trim(),
        tipo: "FINANCEIRO",
        centroCusto: Boolean(categoryForm.centroCusto),
        ativo: true,
      });

      setForm((prev) => ({ ...prev, categoria: categoria.nome || categoryForm.nome.trim() }));
      setFinanceCategoryFilter(categoria.nome || categoryForm.nome.trim());
      setCategoryForm(initialFinanceCategoryForm);
      setShowCategoryForm(false);
      setMessage({ type: "success", text: "Categoria financeira cadastrada." });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusAction(id, action) {
    if (!id) return;

    setSaving(true);
    setMessage(null);

    try {
      if (action === "estornar") {
        await endpoints.financeiro.estornar(id);
        setMessage({ type: "success", text: "Lancamento estornado com auditoria." });
      } else if (action === "baixar") {
        await endpoints.financeiro.baixar(id);
        setMessage({ type: "success", text: "Lancamento baixado como aprovado." });
      } else {
        await endpoints.financeiro.cancelar(id);
        setMessage({ type: "success", text: "Lancamento cancelado com historico." });
      }

      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerateCharge(item) {
    if (!item?.id) return;

    setSaving(true);
    setMessage(null);

    try {
      const cobranca = await endpoints.financeiro.gerarCobranca(item.id);
      setSelectedCharge(cobranca);
      setMessage({ type: "success", text: "Cobranca gerada para envio ao cliente." });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function copyChargeText(text, label) {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setMessage({ type: "success", text: `${label} copiado.` });
    } catch (err) {
      setMessage({ type: "error", text: "Nao foi possivel copiar automaticamente." });
    }
  }

  function startCollectionFollowUp(item) {
    const titulo = asList(item?.titulosDetalhados)[0];
    if (!titulo?.id) {
      setMessage({ type: "error", text: "Titulo financeiro nao encontrado para agendar follow-up." });
      return;
    }

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 1);
    setCollectionFollowUpForm({
      financeiroId: titulo.id,
      cliente: item.cliente || titulo.cliente || "Cliente nao identificado",
      canal: "WhatsApp",
      proximaAcao: getLocalDateKey(nextDate),
      observacao: `Cobranca de ${formatCurrency(titulo.valor)} vencida em ${formatDate(titulo.vencimento)}.`,
    });
    setMessage(null);
  }

  async function handleCreateCollectionFollowUp(event) {
    event.preventDefault();

    if (!collectionFollowUpForm.financeiroId) {
      setMessage({ type: "error", text: "Selecione uma cobranca vencida para agendar." });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      await endpoints.financeiro.criarFollowUp({
        financeiroId: collectionFollowUpForm.financeiroId,
        canal: collectionFollowUpForm.canal,
        proximaAcao: collectionFollowUpForm.proximaAcao || null,
        observacao: collectionFollowUpForm.observacao,
      });
      setCollectionFollowUpForm(initialCollectionFollowUpForm);
      setMessage({ type: "success", text: "Follow-up de cobranca agendado." });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleFollowUpStatus(id, action) {
    if (!id) return;

    setSaving(true);
    setMessage(null);

    try {
      if (action === "concluir") {
        await endpoints.financeiro.concluirFollowUp(id);
        setMessage({ type: "success", text: "Follow-up concluido." });
      } else {
        await endpoints.financeiro.cancelarFollowUp(id);
        setMessage({ type: "success", text: "Follow-up cancelado." });
      }
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleSendFollowUpNotifications() {
    setSaving(true);
    setMessage(null);

    try {
      const result = await endpoints.notificacoes.enviarFollowUps();
      if (!result?.ativo) {
        setMessage({ type: "error", text: "Notificacoes externas estao desativadas ou sem webhook configurado." });
      } else if (Number(result.totalEnviado || 0) === 0) {
        setMessage({ type: "success", text: "Nenhum follow-up vencido ou de hoje aguardava notificacao." });
      } else {
        setMessage({
          type: "success",
          text: `${formatNumber(result.totalEnviado)} notificacao(oes) enviada(s): ${formatNumber(result.cobrancasEnviadas)} cobranca(s) e ${formatNumber(result.comerciaisEnviadas)} comercial(is).`,
        });
      }
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Nao foi possivel enviar notificacoes externas." });
    } finally {
      setSaving(false);
    }
  }

  function scrollToCollectionAgenda() {
    collectionAgendaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleCancelOrphanOrder(id) {
    await handleCancelOrphanOrders([id], "este pedido");
  }

  async function handleBulkBaixarFinanceiro(items, label) {
    const ids = asList(items).map((item) => item.id).filter(Boolean);
    if (ids.length === 0) return;
    if (!window.confirm(`Baixar ${formatNumber(ids.length)} lancamentos ${label}?`)) return;

    setSaving(true);
    setMessage(null);

    try {
      await Promise.all(ids.map((id) => endpoints.financeiro.baixar(id)));
      setMessage({ type: "success", text: `${formatNumber(ids.length)} lancamentos baixados.` });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleRecurrence(item) {
    if (!item?.id) return;

    setSaving(true);
    setMessage(null);

    try {
      await endpoints.financeiro.alterarRecorrenciaStatus(item.id, !item.ativo);
      setMessage({ type: "success", text: item.ativo ? "Recorrencia pausada." : "Recorrencia ativada." });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerateRecurrence(id, quantidade = 1) {
    if (!id) return;

    setSaving(true);
    setMessage(null);

    try {
      const gerados = await endpoints.financeiro.gerarRecorrencia(id, quantidade);
      setMessage({ type: "success", text: `${formatNumber(asList(gerados).length)} lancamento(s) gerado(s).` });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  function handleToggleOrphanSelection(id) {
    const normalizedId = String(id || "");
    if (!normalizedId) return;

    setSelectedOrphanIds((current) =>
      current.includes(normalizedId)
        ? current.filter((item) => item !== normalizedId)
        : [...current, normalizedId],
    );
  }

  function handleToggleVisibleOrphans() {
    const visibleIds = orphanPreview.map((pedido) => String(pedido.id));
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedOrphanIds.includes(id));

    setSelectedOrphanIds((current) => {
      if (allSelected) {
        return current.filter((id) => !visibleIds.includes(id));
      }

      return Array.from(new Set([...current, ...visibleIds]));
    });
  }

  async function handleCancelOrphanOrders(ids, scopeLabel) {
    const uniqueIds = Array.from(new Set(asList(ids).map((id) => String(id || "")).filter(Boolean)));
    if (uniqueIds.length === 0) return;

    const confirmationLabel = scopeLabel || `${formatNumber(uniqueIds.length)} pedidos`;
    if (!window.confirm(`Cancelar ${confirmationLabel} sem itens cadastrados?`)) return;

    setSaving(true);
    setMessage(null);

    try {
      const response = uniqueIds.length === 1
        ? await endpoints.pedidos.cancelarInconsistente(uniqueIds[0]).then(() => ({ cancelados: 1 }))
        : await endpoints.pedidos.cancelarInconsistentes(uniqueIds);
      const totalCancelados = Number(response?.cancelados || uniqueIds.length);
      setSelectedOrphanIds((current) => current.filter((id) => !uniqueIds.includes(id)));
      setMessage({
        type: "success",
        text: totalCancelados === 1
          ? "Pedido sem itens cancelado com auditoria."
          : `${formatNumber(totalCancelados)} pedidos sem itens cancelados com auditoria.`,
      });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  const visibleOrphanIds = orphanPreview.map((pedido) => String(pedido.id));
  const allVisibleOrphansSelected = visibleOrphanIds.length > 0
    && visibleOrphanIds.every((id) => selectedOrphanIds.includes(id));

  return (
    <div className="dashboard-view">
      <section className="kpi-grid">
        <KpiCard
          icon={CircleDollarSign}
          label="Receita"
          value={formatCurrency(receitaAprovadaFiltrada)}
          detail={`Entradas aprovadas / ${selectedFinanceBranchLabel}`}
          tone="green"
        />
        <KpiCard
          icon={WalletCards}
          label="Despesas"
          value={formatCurrency(despesaAprovadaFiltrada)}
          detail={`Saidas aprovadas / ${selectedFinanceBranchLabel}`}
          tone="amber"
        />
        <KpiCard
          icon={ArrowUpRight}
          label="Lucro"
          value={canSeeProfit ? formatCurrency(lucroFiltrado) : "Restrito"}
          detail={canSeeProfit ? "Receita menos despesas" : "Visivel para perfis autorizados"}
          tone="dark"
        />
        <KpiCard
          icon={ReceiptText}
          label="A receber"
          value={formatCurrency(totalAReceber)}
          detail={`${formatNumber(contasAReceber.length)} pendentes / ${formatNumber(contasAReceberVencidas.length)} vencidos`}
          tone="blue"
        />
        <KpiCard
          icon={ClipboardList}
          label="Categorias"
          value={formatNumber(financeCategoryOptions.length)}
          detail={`${formatNumber(financeCategories.filter((categoria) => categoria.centroCusto).length)} centros de custo formais`}
          tone="green"
        />
        <KpiCard
          icon={Phone}
          label="Follow-ups"
          value={formatNumber(pendingFollowUps.length)}
          detail={`${formatNumber(dueFollowUps.length)} hoje/vencidos / ${formatNumber(upcomingFollowUps.length)} em 7 dias`}
          tone="amber"
        />
      </section>

      {reminderFollowUps.length > 0 && (
        <section className="panel followup-reminder-panel">
          <div className="panel-title compact">
            <div>
              <h2>Lembretes de cobranca</h2>
              <p>Follow-ups pendentes para hoje ou ja vencidos.</p>
            </div>
            <div className="account-plan-actions">
              <button onClick={scrollToCollectionAgenda} type="button">
                <ClipboardList size={15} />
                Ver agenda
              </button>
            </div>
          </div>

          <div className="followup-reminder-grid">
            {reminderFollowUps.slice(0, 4).map((item) => (
              <div className={isDateBeforeToday(item.proximaAcao) ? "followup-reminder-card overdue" : "followup-reminder-card"} key={item.id}>
                <span>{item.proximaAcao ? formatDate(item.proximaAcao) : "Sem data"}</span>
                <strong>{item.clienteNome || "Cliente nao identificado"}</strong>
                <small>{item.canal || "Contato"} / {formatCurrency(item.valor)} / {item.filial || "Empresa"}</small>
                <small>{item.observacao || item.financeiroDescricao || "Retomar contato de cobranca"}</small>
                {canMutateFinance && (
                  <div className="table-actions">
                    <button disabled={saving} onClick={() => handleFollowUpStatus(item.id, "concluir")} type="button">
                      Concluir
                    </button>
                    <button disabled={saving} onClick={() => handleFollowUpStatus(item.id, "cancelar")} type="button">
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="panel account-plan-summary">
        <div className="account-plan-head">
          <div>
            <h3>Analise por filial</h3>
            <p>Filtre o financeiro e exporte um consolidado por loja.</p>
          </div>
          <div className="account-plan-actions">
            <label className="commission-config-control">
              Filial
              <select
                value={financeBranchFilter}
                onChange={(event) => {
                  setFinanceBranchFilter(event.target.value);
                  setFinanceCategoryFilter("");
                  setFinancePage(0);
                }}
              >
                <option value="TODAS">Todas</option>
                <option value="EMPRESA">Empresa</option>
                {filiais.map((filial) => (
                  <option key={filial.id} value={filial.id}>
                    {filial.matriz ? "Matriz" : "Filial"} - {filial.nome}
                  </option>
                ))}
              </select>
            </label>
            <button
              disabled={financeBranchRows.length === 0}
              onClick={() => downloadCsv(`nexus-one-financeiro-filiais-${getLocalDateKey()}.csv`, financeBranchRows)}
              type="button"
            >
              <Download size={15} />
              CSV
            </button>
            <button
              disabled={financeBranchRows.length === 0}
              onClick={() => printRowsDocument("Financeiro por filial", financeBranchRows, session?.empresa || "Nexus One")}
              type="button"
            >
              <Printer size={15} />
              PDF
            </button>
          </div>
        </div>

        <div className="account-plan-grid">
          {financeBranchSummary.length === 0 ? (
            <div className="empty-selection compact">Nenhuma movimentacao encontrada para filial.</div>
          ) : (
            financeBranchSummary.slice(0, 8).map((item) => (
              <button
                className={financeBranchFilter === String(item.id) ? "account-plan-item active" : "account-plan-item"}
                key={item.id}
                onClick={() => {
                  setFinanceBranchFilter(String(item.id));
                  setFinanceCategoryFilter("");
                  setFinancePage(0);
                }}
                type="button"
              >
                <span>{item.filial}</span>
                <strong>{formatCurrency(item.receitas - item.despesas)}</strong>
                <small>
                  {formatNumber(item.registros)} registros / pendente {formatCurrency(item.pendentes)}
                </small>
              </button>
            ))
          )}
        </div>
      </section>

      <section className="panel account-plan-summary">
        <div className="account-plan-head">
          <div>
            <h3>Plano financeiro</h3>
            <p>Categorias formais e centros de custo usados nos lancamentos.</p>
          </div>
          <div className="account-plan-actions">
            <button
              disabled={financeCategoryRows.length === 0}
              onClick={() => downloadCsv(`nexus-one-plano-financeiro-${getLocalDateKey()}.csv`, financeCategoryRows)}
              type="button"
            >
              <Download size={15} />
              CSV
            </button>
            <button
              disabled={financeCategoryRows.length === 0}
              onClick={() => printRowsDocument("Plano financeiro", financeCategoryRows, session?.empresa || "Nexus One")}
              type="button"
            >
              <Printer size={15} />
              PDF
            </button>
            {canMutateFinance && (
              <button onClick={() => setShowCategoryForm((current) => !current)} type="button">
                <Plus size={15} />
                Categoria
              </button>
            )}
          </div>
        </div>

        {showCategoryForm && (
          <form className="compact-form product-form" onSubmit={handleCreateFinanceCategory}>
            <div className="finance-form-row">
              <label className="form-control">
                <span>Nome</span>
                <input
                  value={categoryForm.nome}
                  onChange={(event) => setCategoryForm((prev) => ({ ...prev, nome: event.target.value }))}
                  placeholder="Ex: Marketing, Compras, Administrativo"
                />
              </label>
              <label className="form-control checkbox-control">
                <input
                  checked={categoryForm.centroCusto}
                  onChange={(event) => setCategoryForm((prev) => ({ ...prev, centroCusto: event.target.checked }))}
                  type="checkbox"
                />
                <span>Centro de custo</span>
              </label>
            </div>
            <label className="form-control">
              <span>Descricao</span>
              <textarea
                value={categoryForm.descricao}
                onChange={(event) => setCategoryForm((prev) => ({ ...prev, descricao: event.target.value }))}
                placeholder="Uso interno da categoria"
              />
            </label>
            <button className="checkout-button" disabled={saving} type="submit">
              {saving ? <Loader2 className="spin" size={17} /> : <Plus size={17} />}
              {saving ? "Salvando..." : "Salvar categoria"}
            </button>
          </form>
        )}

        <div className="account-plan-grid">
          {financeCategorySummary.length === 0 ? (
            <div className="empty-selection compact">Nenhuma categoria movimentada no periodo.</div>
          ) : (
            financeCategorySummary.slice(0, 8).map((item) => {
              const formal = financeCategories.find((categoria) => categoria.nome === item.categoria);
              return (
                <button
                  className={financeCategoryFilter === item.categoria ? "account-plan-item active" : "account-plan-item"}
                  key={item.categoria}
                  onClick={() => {
                    setFinanceCategoryFilter(financeCategoryFilter === item.categoria ? "" : item.categoria);
                    setFinancePage(0);
                  }}
                  type="button"
                >
                  <span>{item.categoria}</span>
                  <strong>{formatCurrency(item.total)}</strong>
                  <small>
                    {formatNumber(item.registros)} registros
                    {formal?.centroCusto ? " / centro de custo" : ""}
                  </small>
                </button>
              );
            })
          )}
        </div>
      </section>

      <section className="panel account-plan-summary">
        <div className="account-plan-head">
          <div>
            <h3>Recorrencias financeiras</h3>
            <p>Regras persistidas para gerar contas futuras automaticamente.</p>
          </div>
          <div className="account-plan-actions">
            <button
              disabled={recurringFinanceRows.length === 0}
              onClick={() => downloadCsv(`nexus-one-recorrencias-financeiras-${getLocalDateKey()}.csv`, recurringFinanceRows)}
              type="button"
            >
              <Download size={15} />
              CSV
            </button>
            <button
              disabled={recurringFinanceRows.length === 0}
              onClick={() => printRowsDocument("Recorrencias financeiras", recurringFinanceRows, session?.empresa || "Nexus One")}
              type="button"
            >
              <Printer size={15} />
              PDF
            </button>
          </div>
        </div>

        <div className="recurrence-summary">
          <div>
            <span>Ativas</span>
            <strong>{formatNumber(activeRecurrences.length)}</strong>
          </div>
          <div>
            <span>Total</span>
            <strong>{formatNumber(branchScopedRecorrencias.length)}</strong>
          </div>
          <div>
            <span>Proxima</span>
            <strong>{nextRecurrences[0]?.proximaGeracao ? formatDate(nextRecurrences[0].proximaGeracao) : "-"}</strong>
          </div>
        </div>

        <div className="account-plan-grid recurrence-grid">
          {branchScopedRecorrencias.length === 0 ? (
            <div className="empty-selection compact">Nenhuma regra recorrente cadastrada.</div>
          ) : (
            branchScopedRecorrencias.slice(0, 8).map((item) => (
              <div className="account-plan-item recurrence-card" key={item.id}>
                <span>{item.descricao}</span>
                <strong>{formatCurrency(item.valor)}</strong>
                <small>
                  {item.tipo} / {item.filial || "Empresa"} / proxima {item.proximaGeracao ? formatDate(item.proximaGeracao) : "-"}
                </small>
                <div className="table-actions">
                  {canMutateFinance && item.ativo && (
                    <button disabled={saving} onClick={() => handleGenerateRecurrence(item.id, 1)} type="button">
                      Gerar
                    </button>
                  )}
                  {canMutateFinance && (
                    <button disabled={saving} onClick={() => handleToggleRecurrence(item)} type="button">
                      {item.ativo ? "Pausar" : "Ativar"}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {totalContasVencidas > 0 && (
        <div className="warning-box finance-warning-box overdue-warning-box">
          <div className="finance-warning-copy">
            <strong>{formatNumber(totalContasVencidas)} contas vencidas exigem acao.</strong>
            <small>
              A receber: {formatCurrency(totalAReceberVencido)} / A pagar: {formatCurrency(totalAPagarVencido)}
            </small>
          </div>
          {canMutateFinance && (
            <div className="warning-actions">
              {contasAReceberVencidas.length > 0 && (
                <button disabled={saving} onClick={() => handleBulkBaixarFinanceiro(contasAReceberVencidas, "a receber vencidos")} type="button">
                  Baixar recebidas
                </button>
              )}
              {contasAPagarVencidas.length > 0 && (
                <button disabled={saving} onClick={() => handleBulkBaixarFinanceiro(contasAPagarVencidas, "a pagar vencidos")} type="button">
                  Baixar pagas
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {totalContasAVencer > 0 && (
        <div className="warning-box finance-warning-box upcoming-warning-box">
          <div className="finance-warning-copy">
            <strong>{formatNumber(totalContasAVencer)} contas vencem nos proximos 7 dias.</strong>
            <small>
              A receber: {formatCurrency(totalAReceberAVencer)} / A pagar: {formatCurrency(totalAPagarAVencer)}
            </small>
          </div>
          <div className="warning-actions">
            {contasAReceberAVencer.length > 0 && (
              <button
                onClick={() => {
                  setFinanceFilter("A_RECEBER_VENCER");
                  setFinanceCategoryFilter("");
                  setFinancePage(0);
                }}
                type="button"
              >
                Ver recebimentos
              </button>
            )}
            {contasAPagarAVencer.length > 0 && (
              <button
                onClick={() => {
                  setFinanceFilter("A_PAGAR_VENCER");
                  setFinanceCategoryFilter("");
                  setFinancePage(0);
                }}
                type="button"
              >
                Ver pagamentos
              </button>
            )}
          </div>
        </div>
      )}

      <section className="panel cash-flow-panel">
        <div className="panel-title compact">
          <div>
            <h2>Fluxo de caixa 14 dias</h2>
            <p>Entradas, saidas e pendencias por data prevista.</p>
          </div>
          <div className="account-plan-actions">
            <button
              disabled={cashFlowRows.length === 0}
              onClick={() => downloadCsv(`nexus-one-fluxo-caixa-${getLocalDateKey()}.csv`, cashFlowRows)}
              type="button"
            >
              <Download size={15} />
              CSV
            </button>
            <button
              disabled={cashFlowRows.length === 0}
              onClick={() => printRowsDocument("Fluxo de caixa 14 dias", cashFlowRows, session?.empresa || "Nexus One")}
              type="button"
            >
              <Printer size={15} />
              PDF
            </button>
          </div>
        </div>
        <div className="cash-flow-summary">
          <div>
            <span>Entradas</span>
            <strong>{formatCurrency(cashFlowTotalEntradas)}</strong>
          </div>
          <div>
            <span>Saidas</span>
            <strong>{formatCurrency(cashFlowTotalSaidas)}</strong>
          </div>
          <div>
            <span>Saldo previsto</span>
            <strong>{formatCurrency(cashFlowSaldo)}</strong>
          </div>
        </div>
        <div className="cash-flow-grid">
          {cashFlowDays.map((item) => (
            <div className={item.saldo < 0 ? "cash-flow-day negative" : "cash-flow-day"} key={item.key}>
              <span>{item.label}</span>
              <strong>{formatCurrency(item.saldo)}</strong>
              <small>Entrada {formatCurrency(item.entradas)} / Saida {formatCurrency(item.saidas)}</small>
              <em>{formatNumber(item.registros)} registros</em>
            </div>
          ))}
        </div>
      </section>

      <section className="panel delinquency-panel" ref={collectionAgendaRef}>
        <div className="panel-title compact">
          <div>
            <h2>Inadimplencia</h2>
            <p>Receitas pendentes vencidas para acao de cobranca.</p>
          </div>
          <div className="account-plan-actions">
            <button
              disabled={inadimplenciaRows.length === 0}
              onClick={() => downloadCsv(`nexus-one-inadimplencia-${getLocalDateKey()}.csv`, inadimplenciaRows)}
              type="button"
            >
              <Download size={15} />
              CSV
            </button>
            <button
              disabled={inadimplenciaRows.length === 0}
              onClick={() => printRowsDocument("Inadimplencia", inadimplenciaRows, session?.empresa || "Nexus One")}
              type="button"
            >
              <Printer size={15} />
              PDF
            </button>
          </div>
        </div>
        <div className="delinquency-summary">
          <div>
            <span>Vencidas</span>
            <strong>{formatNumber(contasAReceberVencidas.length)}</strong>
          </div>
          <div>
            <span>Valor em atraso</span>
            <strong>{formatCurrency(totalAReceberVencido)}</strong>
          </div>
          <div>
            <span>Maior atraso</span>
            <strong>{formatNumber(maiorAtrasoDias)} dia(s)</strong>
          </div>
        </div>
        <div className="aging-grid">
          {agingBuckets.map((bucket) => (
            <div className={bucket.quantidade > 0 ? "aging-card active" : "aging-card"} key={bucket.faixa}>
              <span>{bucket.faixa}</span>
              <strong>{formatCurrency(bucket.valor)}</strong>
              <small>{formatNumber(bucket.quantidade)} titulo(s)</small>
            </div>
          ))}
        </div>
        <div className="table-wrap compact-table">
          <table>
            <tbody>
              {contasAReceberVencidasDetalhadas.length === 0 ? (
                <tr>
                  <td className="empty-cell" colSpan="4">Nenhuma receita vencida em aberto.</td>
                </tr>
              ) : (
                contasAReceberVencidasDetalhadas.slice(0, 6).map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.descricao || "Receita vencida"}</strong>
                      <small>{item.cliente} / pedido {item.pedidoNumero}</small>
                      <small>Venceu em {formatDate(item.vencimento)} / {formatNumber(item.diasAtraso)} dia(s) / {item.faixa}</small>
                    </td>
                    <td>{item.metodoPagamentoDescricao || item.metodoPagamento || "-"}</td>
                    <td>{formatCurrency(item.valor)}</td>
                    <td>
                      {canMutateFinance ? (
                        <button className="mini-action-button" disabled={saving} onClick={() => handleStatusAction(item.id, "baixar")} type="button">
                          Baixar
                        </button>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel delinquency-panel">
        <div className="panel-title compact">
          <div>
            <h2>Cobranca por cliente</h2>
            <p>Carteira inadimplente agrupada para priorizar contato.</p>
          </div>
          <div className="account-plan-actions">
            <button
              disabled={cobrancaRows.length === 0}
              onClick={() => downloadCsv(`nexus-one-cobranca-clientes-${getLocalDateKey()}.csv`, cobrancaRows)}
              type="button"
            >
              <Download size={15} />
              CSV
            </button>
            <button
              disabled={cobrancaRows.length === 0}
              onClick={() => printRowsDocument("Cobranca por cliente", cobrancaRows, session?.empresa || "Nexus One")}
              type="button"
            >
              <Printer size={15} />
              PDF
            </button>
          </div>
        </div>

        <div className="account-plan-grid collection-grid">
          {cobrancaPorCliente.length === 0 ? (
            <div className="empty-selection compact">Nenhum cliente com cobranca vencida.</div>
          ) : (
            cobrancaPorCliente.slice(0, 8).map((item) => (
              <div className="account-plan-item collection-card" key={item.cliente}>
                <span>{item.cliente}</span>
                <strong>{formatCurrency(item.total)}</strong>
                <small>{formatNumber(item.titulos)} titulo(s) / maior atraso {formatNumber(item.maiorAtraso)} dia(s)</small>
                <small>Ultimo vencimento {formatDate(item.ultimoVencimento)}</small>
                <small>{item.observacoes.slice(-1)[0] || "Sem contato registrado"}</small>
                {canMutateFinance && (
                  <button className="mini-action-button" onClick={() => startCollectionFollowUp(item)} type="button">
                    <Phone size={15} />
                    Agendar
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      <section className="panel delinquency-panel">
        <div className="panel-title compact">
          <div>
            <h2>Agenda de cobranca</h2>
            <p>Follow-ups persistidos para retomada de contato.</p>
          </div>
          <div className="account-plan-actions">
            {canManageNotifications && (
              <button
                disabled={saving || reminderFollowUps.length === 0}
                onClick={handleSendFollowUpNotifications}
                type="button"
              >
                {saving ? <Loader2 className="spin" size={15} /> : <Mail size={15} />}
                Notificar
              </button>
            )}
            <button
              disabled={followUpRows.length === 0}
              onClick={() => downloadCsv(`nexus-one-follow-ups-cobranca-${getLocalDateKey()}.csv`, followUpRows)}
              type="button"
            >
              <Download size={15} />
              CSV
            </button>
            <button
              disabled={followUpRows.length === 0}
              onClick={() => printRowsDocument("Agenda de cobranca", followUpRows, session?.empresa || "Nexus One")}
              type="button"
            >
              <Printer size={15} />
              PDF
            </button>
          </div>
        </div>

        {collectionFollowUpForm.financeiroId && (
          <form className="compact-form product-form collection-followup-form" onSubmit={handleCreateCollectionFollowUp}>
            <div className="finance-form-row">
              <label className="form-control">
                <span>Cliente</span>
                <input readOnly value={collectionFollowUpForm.cliente} />
              </label>
              <label className="form-control">
                <span>Canal</span>
                <select
                  value={collectionFollowUpForm.canal}
                  onChange={(event) => setCollectionFollowUpForm((prev) => ({ ...prev, canal: event.target.value }))}
                >
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Telefone">Telefone</option>
                  <option value="Email">Email</option>
                  <option value="Presencial">Presencial</option>
                </select>
              </label>
              <label className="form-control">
                <span>Proxima acao</span>
                <input
                  type="date"
                  value={collectionFollowUpForm.proximaAcao}
                  onChange={(event) => setCollectionFollowUpForm((prev) => ({ ...prev, proximaAcao: event.target.value }))}
                />
              </label>
            </div>
            <label className="form-control">
              <span>Observacao</span>
              <textarea
                value={collectionFollowUpForm.observacao}
                onChange={(event) => setCollectionFollowUpForm((prev) => ({ ...prev, observacao: event.target.value }))}
              />
            </label>
            <div className="cash-action-buttons compact-bulk-actions">
              <button className="checkout-button" disabled={saving} type="submit">
                {saving ? <Loader2 className="spin" size={17} /> : <Plus size={17} />}
                Agendar follow-up
              </button>
              <button className="report-export secondary" onClick={() => setCollectionFollowUpForm(initialCollectionFollowUpForm)} type="button">
                <X size={17} />
                Cancelar
              </button>
            </div>
          </form>
        )}

        <div className="table-wrap compact-table">
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Proxima acao</th>
                <th>Status</th>
                <th>Valor</th>
                <th>Acao</th>
              </tr>
            </thead>
            <tbody>
              {branchScopedFollowUps.length === 0 ? (
                <tr>
                  <td className="empty-cell" colSpan="5">Nenhum follow-up de cobranca agendado.</td>
                </tr>
              ) : (
                branchScopedFollowUps.slice(0, 8).map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.clienteNome || "Cliente nao identificado"}</strong>
                      <small>{item.financeiroDescricao || "Lancamento financeiro"} / {item.canal || "-"}</small>
                      <small>Filial: {item.filial || "Empresa"}</small>
                      {item.notificacaoExternaEm && (
                        <small>Notificado em {formatDateTime(item.notificacaoExternaEm)}</small>
                      )}
                      <small>{item.observacao || "Sem observacao"}</small>
                    </td>
                    <td>{item.proximaAcao ? formatDate(item.proximaAcao) : "-"}</td>
                    <td>
                      <span className={`pill ${String(item.status || "").toLowerCase()}`}>{item.status}</span>
                    </td>
                    <td>{formatCurrency(item.valor)}</td>
                    <td>
                      <div className="table-actions">
                        {canMutateFinance && item.status === "PENDENTE" ? (
                          <>
                            <button disabled={saving} onClick={() => handleFollowUpStatus(item.id, "concluir")} type="button">
                              Concluir
                            </button>
                            <button disabled={saving} onClick={() => handleFollowUpStatus(item.id, "cancelar")} type="button">
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <span>-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="dashboard-grid finance-grid">
        <article className="panel soft-panel">
          <div className="panel-title compact">
            <div>
              <h2>Contas a receber</h2>
              <p>Receitas pendentes separadas por vencimento.</p>
            </div>
            <span>{formatCurrency(totalAReceber)}</span>
          </div>
          <div className="reconciliation-grid compact-metrics-grid">
            <div>
              <span>Pendentes</span>
              <strong>{formatNumber(contasAReceber.length)}</strong>
              <small>{formatCurrency(totalAReceber)}</small>
            </div>
            <div>
              <span>Vencidas</span>
              <strong>{formatNumber(contasAReceberVencidas.length)}</strong>
              <small>Precisa cobrar</small>
            </div>
          </div>
          <div className="due-account-list">
            {proximasContasAReceber.length === 0 ? (
              <div className="empty-selection compact">Nenhuma conta a receber pendente.</div>
            ) : (
              proximasContasAReceber.map((item) => (
                <div className={isDateBeforeToday(item.dataVencimento || item.dataLancamento) ? "due-account overdue" : "due-account"} key={item.id}>
                  <div>
                    <strong>{item.descricao || "Receita pendente"}</strong>
                    <small>Vence em {formatDate(item.dataVencimento || item.dataLancamento)} / {item.metodoPagamentoDescricao || item.metodoPagamento || "-"}</small>
                  </div>
                  <span>{formatCurrency(item.valor)}</span>
                  {canMutateFinance && (
                    <button disabled={saving} onClick={() => handleStatusAction(item.id, "baixar")} type="button">
                      Baixar
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </article>

        <article className="panel soft-panel">
          <div className="panel-title compact">
            <div>
              <h2>Contas a pagar</h2>
              <p>Despesas pendentes para controle do caixa futuro.</p>
            </div>
            <span>{formatCurrency(totalAPagar)}</span>
          </div>
          <div className="reconciliation-grid compact-metrics-grid">
            <div>
              <span>Pendentes</span>
              <strong>{formatNumber(contasAPagar.length)}</strong>
              <small>{formatCurrency(totalAPagar)}</small>
            </div>
            <div>
              <span>Vencidas</span>
              <strong>{formatNumber(contasAPagarVencidas.length)}</strong>
              <small>Precisa pagar</small>
            </div>
          </div>
          <div className="due-account-list">
            {proximasContasAPagar.length === 0 ? (
              <div className="empty-selection compact">Nenhuma conta a pagar pendente.</div>
            ) : (
              proximasContasAPagar.map((item) => (
                <div className={isDateBeforeToday(item.dataVencimento || item.dataLancamento) ? "due-account overdue" : "due-account"} key={item.id}>
                  <div>
                    <strong>{item.descricao || "Despesa pendente"}</strong>
                    <small>Vence em {formatDate(item.dataVencimento || item.dataLancamento)} / {item.metodoPagamentoDescricao || item.metodoPagamento || "-"}</small>
                  </div>
                  <span>{formatCurrency(item.valor)}</span>
                  {canMutateFinance && (
                    <button disabled={saving} onClick={() => handleStatusAction(item.id, "baixar")} type="button">
                      Baixar
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      {criticalInconsistencyCount > 0 && (
        <div className="warning-box finance-warning-box">
          <div className="finance-warning-copy">
            <strong>{formatNumber(criticalInconsistencyCount)} inconsistencias de alto risco exigem acao.</strong>
            <small>
              {mediumInconsistencyCount > 0
                ? `${formatNumber(mediumInconsistencyCount)} pendencias adicionais aguardam revisao.`
                : "Abra o painel abaixo para tratar os pontos mais urgentes."}
            </small>
          </div>
          <button className="mini-action-button" onClick={focusInconsistencyPanel} type="button">
            <AlertTriangle size={16} />
            Ir para painel
          </button>
        </div>
      )}

      <section className="panel finance-reconciliation">
        <div className="panel-title">
          <div>
            <h2>Conciliacao financeira</h2>
            <p>Compare vendas finalizadas, caixa e receitas aprovadas.</p>
          </div>
          <div className="report-actions">
            <button
              className="report-export"
              disabled={reconciliationRows.length === 0}
              onClick={() => downloadCsv(`nexus-one-conciliacao-${getLocalDateKey()}.csv`, reconciliationRows)}
              type="button"
            >
              <Download size={17} />
              CSV
            </button>
            <button
              className="report-export secondary"
              disabled={reconciliationRows.length === 0}
              onClick={() => printRowsDocument("Conciliacao financeira", reconciliationRows, session?.empresa || "Nexus One")}
              type="button"
            >
              <Printer size={17} />
              PDF
            </button>
          </div>
        </div>

        <div className="reconciliation-grid">
          {reconciliationRows.map((row) => (
            <div key={row.indicador}>
              <span>{row.indicador}</span>
              <strong>{row.valor}</strong>
              <small>{row.detalhe}</small>
            </div>
          ))}
        </div>

        <article className="panel soft-panel" ref={inconsistencyPanelRef}>
          <div className="panel-title compact">
            <div>
              <h2>Painel de inconsistencias</h2>
              <p>Resumo unico das pendencias e tratamentos administrativos do financeiro.</p>
            </div>
            <div className="report-actions compact-report-actions">
              <button
                className="report-export"
                disabled={inconsistencyRows.length === 0}
                onClick={() => downloadCsv(`nexus-one-inconsistencias-${getLocalDateKey()}.csv`, inconsistencyRows)}
                type="button"
              >
                <Download size={17} />
                CSV
              </button>
              <button
                className="report-export secondary"
                disabled={inconsistencyRows.length === 0}
                onClick={() => printRowsDocument("Painel de inconsistencias", inconsistencyRows, session?.empresa || "Nexus One")}
                type="button"
              >
                <Printer size={17} />
                PDF
              </button>
            </div>
          </div>
          <div className="reports-grid">
            {inconsistencyCards.map((card) => {
              const Icon = card.icon;
              return (
                <article className={`report-card severity-${card.severity}`} key={card.key}>
                  <div className="report-card-head">
                    <div className="preview-icon">
                      <Icon size={22} />
                    </div>
                    <div>
                      <h2>{card.title}</h2>
                      <p>{card.detail}</p>
                    </div>
                  </div>
                  <div className={`report-card-stat severity-${card.severity}`}>
                    <span>Registros</span>
                    <strong>{formatNumber(card.count)}</strong>
                    <small>{card.status}</small>
                  </div>
                  <button
                    className="mini-action-button"
                    onClick={() => focusInconsistencyCard(card.key)}
                    type="button"
                  >
                    Ver lista
                  </button>
                </article>
              );
            })}
          </div>
        </article>

        <div className="dashboard-grid reconciliation-detail-grid">
          <article className="panel soft-panel" ref={salesWithoutFinanceRef}>
            <div className="panel-title compact">
              <div>
                <h2>Vendas sem financeiro</h2>
                <p>Pedidos recebidos sem receita aprovada vinculada.</p>
              </div>
              <span>{formatNumber(vendasSemFinanceiro.length)}</span>
            </div>
            <div className="table-wrap compact-table">
              <table>
                <tbody>
                  {vendasSemFinanceiro.slice(0, 6).map((pedido) => (
                    <tr key={pedido.id}>
                      <td>
                        <strong>{getPedidoItemSummary(pedido)}</strong>
                        <small>{pedido.numero || pedido.id}</small>
                      </td>
                      <td>{formatCurrency(pedido.valor)}</td>
                    </tr>
                  ))}
                  {vendasSemFinanceiro.length === 0 && (
                    <tr>
                      <td className="empty-cell" colSpan="2">Nenhuma venda pendente de financeiro.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>

          <article className="panel soft-panel" ref={orphanOrdersRef}>
            <div className="panel-title compact">
              <div>
                <h2>Pedidos sem itens</h2>
                <p>Pedidos antigos ou inconsistentes removidos da conciliacao principal.</p>
              </div>
              <span>{formatNumber(pedidosSemItens.length)}</span>
            </div>
            <div className="compact-toolbar">
              <div className="report-actions compact-report-actions">
                <button
                  className="report-export"
                  disabled={orphanReportRows.length === 0}
                  onClick={() => downloadCsv(`nexus-one-pedidos-sem-itens-${getLocalDateKey()}.csv`, orphanReportRows)}
                  type="button"
                >
                  <Download size={17} />
                  CSV
                </button>
                <button
                  className="report-export secondary"
                  disabled={orphanReportRows.length === 0}
                  onClick={() => printRowsDocument("Pedidos sem itens", orphanReportRows, session?.empresa || "Nexus One")}
                  type="button"
                >
                  <Printer size={17} />
                  PDF
                </button>
              </div>
              {isAdmin && (
                <div className="compact-bulk-actions">
                  <label className="bulk-select-toggle">
                    <input
                      checked={allVisibleOrphansSelected}
                      disabled={orphanPreview.length === 0 || saving}
                      onChange={handleToggleVisibleOrphans}
                      type="checkbox"
                    />
                    Selecionar visiveis
                  </label>
                  <div className="table-actions">
                    <button
                      disabled={selectedOrphanIds.length === 0 || saving}
                      onClick={() => handleCancelOrphanOrders(selectedOrphanIds, `${formatNumber(selectedOrphanIds.length)} pedidos selecionados`)}
                      type="button"
                    >
                      Cancelar selecionados
                    </button>
                    <button
                      disabled={pedidosSemItens.length === 0 || saving}
                      onClick={() => handleCancelOrphanOrders(pedidosSemItens.map((pedido) => pedido.id), "todos os pedidos listados")}
                      type="button"
                    >
                      Cancelar todos
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="table-wrap compact-table">
              <table>
                <tbody>
                  {orphanPreview.map((pedido) => (
                    <tr key={pedido.id}>
                      <td>
                        <div className="orphan-order-cell">
                          {isAdmin && (
                            <input
                              checked={selectedOrphanIds.includes(String(pedido.id))}
                              disabled={saving}
                              onChange={() => handleToggleOrphanSelection(pedido.id)}
                              type="checkbox"
                            />
                          )}
                          <div>
                            <strong>{pedido.numero || pedido.id}</strong>
                            <small>{formatDateTime(pedido.data)} / {pedido.usuario || "Usuario nao identificado"}</small>
                            <small>{pedido.empresa || session?.empresa || "Empresa nao identificada"} / sem itens cadastrados</small>
                          </div>
                        </div>
                      </td>
                      <td>{formatCurrency(pedido.valor)}</td>
                      <td>
                        {isAdmin ? (
                          <div className="table-actions">
                            <button
                              disabled={saving}
                              onClick={() => handleCancelOrphanOrder(pedido.id)}
                              type="button"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : "-"}
                      </td>
                    </tr>
                  ))}
                  {pedidosSemItens.length === 0 && (
                    <tr>
                      <td className="empty-cell" colSpan="3">Nenhum pedido inconsistente encontrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>

          {isAdmin && (
            <article className="panel soft-panel" ref={orphanHistoryRef}>
              <div className="panel-title compact">
                <div>
                  <h2>Historico dos cancelados</h2>
                  <p>Pedidos sem itens cancelados administrativamente com rastreio de responsavel.</p>
                </div>
                <div className="panel-actions">
                  <span>{formatNumber(filteredOrphanCancellationEvents.length)}</span>
                  <div className="report-actions compact-report-actions">
                    <button
                      className="report-export"
                      disabled={orphanCancellationRows.length === 0}
                      onClick={() => downloadCsv(`nexus-one-pedidos-sem-itens-cancelados-${getLocalDateKey()}.csv`, orphanCancellationRows)}
                      type="button"
                    >
                      <Download size={17} />
                      CSV
                    </button>
                    <button
                      className="report-export secondary"
                      disabled={orphanCancellationRows.length === 0}
                      onClick={() => printRowsDocument("Historico de pedidos sem itens cancelados", orphanCancellationRows, session?.empresa || "Nexus One")}
                      type="button"
                    >
                      <Printer size={17} />
                      PDF
                    </button>
                  </div>
                </div>
              </div>
              <div className="chart-tabs compact-tabs" aria-label="Periodo do historico de pedidos sem itens cancelados">
                {[
                  ["TODOS", "Todos"],
                  ["HOJE", "Hoje"],
                  ["SEMANA", "Semana"],
                  ["MES", "Mes"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    className={orphanHistoryFilter.preset === value ? "active" : ""}
                    onClick={() => applyOrphanHistoryPreset(value)}
                    type="button"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="audit-filters">
                <label>
                  <span>Busca</span>
                  <input
                    value={orphanHistoryFilter.busca}
                    onChange={(event) => setOrphanHistoryFilter((current) => ({ ...current, busca: event.target.value }))}
                    placeholder="Pedido, usuario ou responsavel"
                  />
                </label>
                <label>
                  <span>Inicio</span>
                  <input
                    type="date"
                    value={orphanHistoryFilter.inicio}
                    onChange={(event) =>
                      setOrphanHistoryFilter((current) => ({
                        ...current,
                        inicio: event.target.value,
                        preset: "PERSONALIZADO",
                      }))
                    }
                  />
                </label>
                <label>
                  <span>Fim</span>
                  <input
                    type="date"
                    value={orphanHistoryFilter.fim}
                    onChange={(event) =>
                      setOrphanHistoryFilter((current) => ({
                        ...current,
                        fim: event.target.value,
                        preset: "PERSONALIZADO",
                      }))
                    }
                  />
                </label>
                <button
                  disabled={
                    !orphanHistoryFilter.busca &&
                    !orphanHistoryFilter.inicio &&
                    !orphanHistoryFilter.fim &&
                    orphanHistoryFilter.preset === "TODOS"
                  }
                  onClick={() => setOrphanHistoryFilter({ busca: "", inicio: "", fim: "", preset: "TODOS" })}
                  type="button"
                >
                  Limpar
                </button>
              </div>
              <div className="table-wrap compact-table">
                <table>
                  <tbody>
                    {pagedOrphanCancellationEvents.map((evento) => (
                      <tr key={evento.id}>
                        <td>
                          <strong>{evento.pedidoNumero}</strong>
                          <small>{evento.canceladoEm} / {evento.canceladoPor}</small>
                          <small>{evento.usuarioOrigem} / {evento.empresaOrigem}</small>
                        </td>
                        <td>{evento.valor}</td>
                        <td>
                          <span className="pill cancelado">{evento.status}</span>
                        </td>
                      </tr>
                    ))}
                    {filteredOrphanCancellationEvents.length === 0 && (
                      <tr>
                        <td className="empty-cell" colSpan="3">Nenhum pedido sem itens cancelado administrativamente.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="table-pagination">
                <button
                  disabled={currentOrphanHistoryPage === 0}
                  onClick={() => setOrphanHistoryPage((page) => Math.max(page - 1, 0))}
                  type="button"
                >
                  Anterior
                </button>
                <span>
                  Pagina {formatNumber(currentOrphanHistoryPage + 1)} de {formatNumber(orphanHistoryTotalPages)}
                </span>
                <button
                  disabled={currentOrphanHistoryPage >= orphanHistoryTotalPages - 1}
                  onClick={() => setOrphanHistoryPage((page) => Math.min(page + 1, orphanHistoryTotalPages - 1))}
                  type="button"
                >
                  Proximo
                </button>
              </div>
            </article>
          )}

          <article className="panel soft-panel" ref={cashDivergenceRef}>
            <div className="panel-title compact">
              <div>
                <h2>Caixas com divergencia</h2>
                <p>Fechamentos onde contado e calculado nao batem.</p>
              </div>
              <span>{formatNumber(caixasComDivergencia.length)}</span>
            </div>
            <div className="table-wrap compact-table">
              <table>
                <tbody>
                  {caixasComDivergencia.slice(0, 6).map((caixa) => (
                    <tr key={caixa.id}>
                      <td>
                        <strong>{caixa.usuarioNome || caixa.usuarioLogin || "Operador"}</strong>
                        <small>{formatDate(caixa.dataAbertura)} / {caixa.status}</small>
                      </td>
                      <td>{formatCurrency(caixa.divergencia)}</td>
                    </tr>
                  ))}
                  {caixasComDivergencia.length === 0 && (
                    <tr>
                      <td className="empty-cell" colSpan="2">Nenhuma divergencia encontrada.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>

          <article className="panel soft-panel" ref={orphanlessRevenueRef}>
            <div className="panel-title compact">
              <div>
                <h2>Receitas sem pedido</h2>
                <p>Lancamentos aprovados sem pedido vinculado para revisao manual.</p>
              </div>
              <span>{formatNumber(financeiroSemPedido.length)}</span>
            </div>
            <div className="table-wrap compact-table">
              <table>
                <tbody>
                  {financeiroSemPedido.slice(0, 6).map((item) => (
                    <tr key={item.id || item.descricao}>
                      <td>
                        <strong>{item.descricao || "Lancamento sem descricao"}</strong>
                        <small>{formatDateTime(item.dataLancamento)} / {item.usuario || "Usuario nao identificado"}</small>
                      </td>
                      <td>{item.metodoPagamento || item.categoria || "-"}</td>
                      <td>{formatCurrency(item.valor)}</td>
                    </tr>
                  ))}
                  {financeiroSemPedido.length === 0 && (
                    <tr>
                      <td className="empty-cell" colSpan="3">Nenhum lancamento aprovado sem pedido vinculado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </div>
      </section>

      <section className={`dashboard-grid finance-grid ${showFinanceForm ? "" : "single-panel-grid"}`}>
        <article className="panel orders-panel">
          <div className="panel-title">
            <div>
              <h2>Movimentacoes financeiras</h2>
              <p>Receitas, despesas, pagamentos, cancelamentos e estornos.</p>
            </div>
            <div className="panel-actions">
              <span>{formatNumber(filteredMovimentacoes.length)} de {formatNumber(branchScopedMovimentacoes.length)} registros / {selectedFinanceBranchLabel}</span>
              <button
                className="panel-action-button secondary"
                disabled={financeMovementRows.length === 0}
                onClick={() => downloadCsv(`nexus-one-financeiro-${financeFilter.toLowerCase()}-${selectedFinanceBranchLabel.toLowerCase().replaceAll(" ", "-")}-${getLocalDateKey()}.csv`, financeMovementRows)}
                type="button"
              >
                <Download size={16} />
                CSV
              </button>
              <button
                className="panel-action-button secondary"
                disabled={financeMovementRows.length === 0}
                onClick={() => printRowsDocument(`Movimentacoes financeiras - ${financeFilterLabel} - ${selectedFinanceBranchLabel}`, financeMovementRows, session?.empresa || "Nexus One")}
                type="button"
              >
                <Printer size={16} />
                PDF
              </button>
              {canMutateFinance && (
                <button
                  className="panel-action-button"
                  onClick={() => {
                    setShowFinanceForm(true);
                    setMessage(null);
                  }}
                  type="button"
                >
                  <Plus size={16} />
                  Novo lancamento
                </button>
              )}
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Descricao</th>
                  <th>Tipo</th>
                  <th>Status</th>
                  <th>Pagamento</th>
                  <th>Valor</th>
                  <th>Acao</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovimentacoes.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-cell">
                      Nenhuma movimentacao financeira encontrada para este filtro.
                    </td>
                  </tr>
                ) : (
                  pagedMovimentacoes.map((item) => {
                    const mixedPaymentObservation = getMixedPaymentObservation(item.observacao);
                    return (
                      <tr key={item.id}>
                        <td>
                          <strong>{getFinanceItemSummary(item)}</strong>
                          <small>{formatDate(item.dataLancamento)} / {item.descricao || "Lancamento sem descricao"}</small>
                          <small className="payment-detail-line">Filial: {item.filial || "Empresa"}</small>
                          {item.dataVencimento && (
                            <small className={isDateBeforeToday(item.dataVencimento) && item.status === "PENDENTE" ? "payment-detail-line overdue" : "payment-detail-line"}>
                              Vencimento: {formatDate(item.dataVencimento)}
                            </small>
                          )}
                          {mixedPaymentObservation && (
                            <small className="payment-detail-line">Pagamento misto: {mixedPaymentObservation}</small>
                          )}
                        </td>
                        <td>
                          <span className={`pill ${String(item.tipo || "").toLowerCase()}`}>
                            {item.tipo}
                          </span>
                        </td>
                        <td>
                          <span className={`pill ${String(item.status || "").toLowerCase()}`}>
                            {item.status}
                          </span>
                        </td>
                        <td>{item.metodoPagamentoDescricao || item.metodoPagamento || "-"}</td>
                        <td>{formatCurrency(item.valor)}</td>
                        <td>
                          <div className="table-actions">
                            {canMutateFinance && item.status === "PENDENTE" ? (
                              <>
                                <button
                                  disabled={saving}
                                  onClick={() => handleStatusAction(item.id, "baixar")}
                                  type="button"
                                >
                                  Baixar
                                </button>
                                <button
                                  disabled={saving}
                                  onClick={() => handleStatusAction(item.id, "cancelar")}
                                  type="button"
                                >
                                  Cancelar
                                </button>
                                {item.tipo === "RECEITA" && ["PIX", "BOLETO"].includes(item.metodoPagamento) && (
                                  <button
                                    disabled={saving}
                                    onClick={() =>
                                      item.codigoCobranca ? setSelectedCharge(item) : handleGenerateCharge(item)
                                    }
                                    type="button"
                                  >
                                    Cobranca
                                  </button>
                                )}
                              </>
                            ) : canReverseFinance && item.status === "APROVADO" ? (
                              <button
                                disabled={saving}
                                onClick={() => handleStatusAction(item.id, "estornar")}
                                type="button"
                              >
                                Estornar
                              </button>
                            ) : canMutateFinance ? (
                              <button
                                disabled={saving || item.status === "CANCELADO" || item.status === "ESTORNADO"}
                                onClick={() => handleStatusAction(item.id, "cancelar")}
                                type="button"
                              >
                                Cancelar
                              </button>
                            ) : (
                              <span>-</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {filteredMovimentacoes.length > financePageSize && (
            <div className="table-pagination">
              <button
                disabled={currentFinancePage <= 0}
                onClick={() => setFinancePage((page) => Math.max(page - 1, 0))}
                type="button"
              >
                Anterior
              </button>
              <span>
                {formatNumber(currentFinancePage + 1)} / {formatNumber(financeTotalPages)}
              </span>
              <button
                disabled={currentFinancePage >= financeTotalPages - 1}
                onClick={() => setFinancePage((page) => Math.min(page + 1, financeTotalPages - 1))}
                type="button"
              >
                Proximo
              </button>
            </div>
          )}
        </article>

        {showFinanceForm && canMutateFinance && (
          <aside className="panel side-panel">
            <div className="panel-title compact">
              <div>
                <h2>Novo lancamento</h2>
                <p>Entrada manual para ajustes financeiros.</p>
              </div>
              <button
                className="modal-close"
                onClick={() => {
                  setShowFinanceForm(false);
                  setMessage(null);
                }}
                title="Fechar"
                type="button"
              >
                <X size={17} />
              </button>
            </div>

            <form className="finance-form" onSubmit={handleSubmit}>
              <label className="form-control">
                <span>Descricao</span>
                <input
                  value={form.descricao}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, descricao: event.target.value }))
                  }
                  placeholder="Ex: Receita balcao"
                />
              </label>

              <div className="finance-form-row">
                <label className="form-control">
                  <span>Tipo</span>
                  <select
                    value={form.tipo}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, tipo: event.target.value }))
                    }
                  >
                    <option value="RECEITA">Receita</option>
                    <option value="DESPESA">Despesa</option>
                  </select>
                </label>

                <label className="form-control">
                  <span>Status</span>
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, status: event.target.value }))
                    }
                  >
                    <option value="APROVADO">Aprovado</option>
                    <option value="PENDENTE">Pendente</option>
                    <option value="RECUSADO">Recusado</option>
                  </select>
                </label>
              </div>

              <label className="form-control">
                <span>Categoria</span>
                <select
                  value={form.categoria}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, categoria: event.target.value }))
                  }
                >
                  {financeCategoryOptions.map((categoria) => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </select>
              </label>

              <div className="finance-form-row">
                <label className="form-control">
                  <span>Valor</span>
                  <input
                    min="0.01"
                    step="0.01"
                    type="number"
                    value={form.valor}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, valor: event.target.value }))
                    }
                    placeholder="0,00"
                  />
                </label>

                <label className="form-control">
                  <span>Pagamento</span>
                  <select
                    value={form.metodoPagamento}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, metodoPagamento: event.target.value }))
                    }
                  >
                    <option value="PIX">Pix</option>
                    <option value="DINHEIRO">Dinheiro</option>
                    <option value="CARTAO_CREDITO">Cartao credito</option>
                    <option value="CARTAO_DEBITO">Cartao debito</option>
                    <option value="BOLETO">Boleto</option>
                    <option value="MISTO">Misto</option>
                  </select>
                </label>
              </div>

              <label className="form-control">
                <span>Vencimento</span>
                <input
                  type="date"
                  value={form.dataVencimento}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, dataVencimento: event.target.value }))
                  }
                />
              </label>

              <label className="form-control">
                <span>Filial</span>
                <select
                  value={form.filialId}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, filialId: event.target.value }))
                  }
                >
                  <option value="">Empresa / usuario atual</option>
                  {filiais.map((filial) => (
                    <option key={filial.id} value={filial.id}>
                      {filial.matriz ? "Matriz" : "Filial"} - {filial.nome}
                    </option>
                  ))}
                </select>
              </label>

              <div className="finance-form-row">
                <label className="form-control">
                  <span>Modo</span>
                  <select
                    value={form.modoLancamento}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, modoLancamento: event.target.value }))
                    }
                  >
                    <option value="UNICO">Unico</option>
                    <option value="PARCELADO">Parcelado</option>
                    <option value="RECORRENTE">Recorrente</option>
                  </select>
                </label>

                <label className="form-control">
                  <span>{form.modoLancamento === "RECORRENTE" ? "Recorrencias" : "Parcelas"}</span>
                  <input
                    disabled={form.modoLancamento === "UNICO"}
                    min="1"
                    max="60"
                    type="number"
                    value={form.parcelas}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, parcelas: event.target.value }))
                    }
                  />
                </label>
              </div>

              {form.modoLancamento !== "UNICO" && (
                <div className="finance-form-row">
                  <label className="form-control">
                    <span>Intervalo</span>
                    <input
                      min="1"
                      max="12"
                      type="number"
                      value={form.intervaloMeses}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, intervaloMeses: event.target.value }))
                      }
                    />
                  </label>
                  <div className="form-control">
                    <span>Previsao</span>
                    <strong className="stock-current">
                      {form.modoLancamento === "PARCELADO"
                        ? `${formatCurrency(Number(form.valor || 0) / Math.max(1, Number(form.parcelas || 1)))} por parcela`
                        : `${formatCurrency(form.valor)} por recorrencia`}
                    </strong>
                  </div>
                </div>
              )}

              <label className="form-control">
                <span>Observacao</span>
                <textarea
                  value={form.observacao}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, observacao: event.target.value }))
                  }
                  placeholder="Detalhes internos"
                />
              </label>

              {message && <p className={`form-message ${message.type}`}>{message.text}</p>}

              <button className="checkout-button" disabled={saving} type="submit">
                {saving ? <Loader2 className="spin" size={17} /> : <CheckCircle2 size={17} />}
                {saving ? "Salvando..." : "Salvar lancamento"}
              </button>
            </form>
          </aside>
        )}

        {selectedCharge && (
          <aside className="panel side-panel">
            <div className="panel-title compact">
              <div>
                <h2>Cobranca</h2>
                <p>{selectedCharge.descricao || "Lancamento financeiro"}</p>
              </div>
              <button
                className="modal-close"
                onClick={() => setSelectedCharge(null)}
                title="Fechar"
                type="button"
              >
                <X size={17} />
              </button>
            </div>

            <div className="charge-summary">
              <div>
                <span>Codigo</span>
                <strong>{selectedCharge.codigoCobranca || "-"}</strong>
              </div>
              <div>
                <span>Valor</span>
                <strong>{formatCurrency(selectedCharge.valor)}</strong>
              </div>
              <div>
                <span>Vencimento</span>
                <strong>{selectedCharge.dataVencimento ? formatDate(selectedCharge.dataVencimento) : "-"}</strong>
              </div>
              <div>
                <span>Provedor</span>
                <strong>{selectedCharge.cobrancaProvedor || "DEMO"}</strong>
              </div>
            </div>
            {selectedCharge.cobrancaUrl && (
              <a className="charge-link" href={selectedCharge.cobrancaUrl} rel="noreferrer" target="_blank">
                <ArrowUpRight size={16} />
                Abrir cobranca
              </a>
            )}

            {selectedCharge.pixCopiaCola && (
              <div className="charge-box">
                {selectedCharge.pixQrCodeUrl && (
                  <img
                    alt="QR Code Pix"
                    className="charge-qr"
                    src={selectedCharge.pixQrCodeUrl}
                  />
                )}
                <label className="form-control">
                  <span>Pix copia e cola</span>
                  <textarea readOnly value={selectedCharge.pixCopiaCola} />
                </label>
                <button
                  className="checkout-button"
                  onClick={() => copyChargeText(selectedCharge.pixCopiaCola, "Pix copia e cola")}
                  type="button"
                >
                  <Copy size={17} />
                  Copiar Pix
                </button>
              </div>
            )}

            {selectedCharge.boletoLinhaDigitavel && (
              <div className="charge-box">
                <label className="form-control">
                  <span>Linha digitavel</span>
                  <textarea readOnly value={selectedCharge.boletoLinhaDigitavel} />
                </label>
                <div className="charge-summary compact">
                  <div>
                    <span>Documento</span>
                    <strong>{selectedCharge.boletoNumeroDocumento || "-"}</strong>
                  </div>
                  <div>
                    <span>Nosso numero</span>
                    <strong>{selectedCharge.boletoNossoNumero || "-"}</strong>
                  </div>
                </div>
                <button
                  className="checkout-button"
                  onClick={() => copyChargeText(selectedCharge.boletoLinhaDigitavel, "Linha digitavel")}
                  type="button"
                >
                  <Copy size={17} />
                  Copiar boleto
                </button>
              </div>
            )}
          </aside>
        )}
      </section>
    </div>
  );
}

function getRouteDriverName(rota) {
  return rota?.entregador?.nome || "Sem entregador";
}

function getRouteVehicleLabel(rota) {
  if (!rota?.veiculo) return "Sem veiculo";
  return [rota.veiculo.placa, rota.veiculo.modelo].filter(Boolean).join(" / ");
}

function getRouteStatus(rota) {
  return String(rota?.status || "ABERTA").toUpperCase();
}

function getRouteDeliveryCount(rota) {
  return Number(rota?.quantidadeEntregas || 0);
}

function getDeliveryCustomer(entrega) {
  return entrega?.clienteNome || entrega?.nomeCliente || entrega?.cliente || entrega?.pedido?.cliente || "Cliente nao informado";
}

function getDeliveryOrderNumber(entrega) {
  return entrega?.numeroPedido || entrega?.pedidoNumero || entrega?.pedidoId || "Pedido sem numero";
}

function getDeliveryAddress(entrega) {
  return entrega?.enderecoEntrega || entrega?.endereco || entrega?.pedido?.enderecoEntrega || entrega?.pedido?.clienteEndereco || "Sem endereco";
}

function getDeliveryBranchLabel(entrega) {
  return entrega?.filial || entrega?.pedido?.filial || "Empresa / sem filial";
}

function getRoutePaymentLabel(rota) {
  if (rota?.pagamentoEntrega === "PAGAR_NA_ENTREGA") return "Receber na entrega";
  if (rota?.pagamentoEntrega === "RECEBER_RETORNO") return "Receber no retorno";
  return "Ja pago";
}

function printRouteManifest(rota, companyName = "Nexus One") {
  if (!rota) return;

  const routeDeliveries = asList(rota.entregas);
  const deliveryCount = Math.max(1, routeDeliveries.length || getRouteDeliveryCount(rota));
  const branchLabels = Array.from(new Set(routeDeliveries.map(getDeliveryBranchLabel).filter(Boolean)));
  const branchLabel = branchLabels.length === 0
    ? "Nao informado"
    : branchLabels.length === 1
      ? branchLabels[0]
      : `${branchLabels.length} filiais`;
  const deliveryRows = (routeDeliveries.length > 0 ? routeDeliveries : Array.from({ length: deliveryCount }))
    .map((entrega, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${escapeHtml(entrega ? getDeliveryCustomer(entrega) : "")}</td>
      <td>${escapeHtml(entrega ? getDeliveryBranchLabel(entrega) : "")}</td>
      <td>${escapeHtml(entrega ? getDeliveryAddress(entrega) : "")}</td>
      <td>${escapeHtml(entrega ? `${getDeliveryOrderNumber(entrega)} ${entrega.observacao || ""}`.trim() : "")}</td>
      <td class="check-cell"></td>
      <td class="check-cell"></td>
    </tr>
  `).join("");

  printHtmlDocument(
    `Romaneio ${rota.nome || ""}`.trim(),
    `
      <header>
        <h1>${escapeHtml(companyName)}</h1>
        <p>Romaneio de entrega / conferência de rota</p>
        <p><strong>Rota:</strong> ${escapeHtml(rota.nome || "-")} |
          <strong>Gerado em:</strong> ${escapeHtml(new Date().toLocaleString("pt-BR"))}</p>
      </header>

      <section class="meta-grid">
        <div><span>Data da rota</span><strong>${escapeHtml(formatDate(rota.dataRota))}</strong></div>
        <div><span>Filial</span><strong>${escapeHtml(branchLabel)}</strong></div>
        <div><span>Status</span><strong>${escapeHtml(getRouteStatus(rota))}</strong></div>
        <div><span>Motorista</span><strong>${escapeHtml(getRouteDriverName(rota))}</strong></div>
        <div><span>Telefone</span><strong>${escapeHtml(rota.entregador?.telefone || "-")}</strong></div>
        <div><span>Veiculo</span><strong>${escapeHtml(getRouteVehicleLabel(rota))}</strong></div>
        <div><span>Pagamento</span><strong>${escapeHtml(getRoutePaymentLabel(rota))}</strong></div>
        <div><span>Entregas previstas</span><strong>${escapeHtml(formatNumber(getRouteDeliveryCount(rota)))}</strong></div>
        <div><span>Custo estimado</span><strong>${escapeHtml(formatCurrency(rota.custoEstimado || 0))}</strong></div>
      </section>

      <section>
        <h2>Checklist de entregas</h2>
        <table>
          <thead>
            <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Filial</th>
                <th>Destino</th>
                <th>Observacao</th>
              <th>Entregue</th>
              <th>Recebido</th>
            </tr>
          </thead>
          <tbody>${deliveryRows}</tbody>
        </table>
      </section>

      <section>
        <h2>Observacoes da rota</h2>
        <p>${escapeHtml(rota.observacao || "Sem observacoes.")}</p>
      </section>

      <section class="signature-grid">
        <div class="signature-line">Assinatura do entregador</div>
        <div class="signature-line">Conferencia no retorno</div>
      </section>
    `,
  );
}

function sortRoutesByDate(routes) {
  return [...routes].sort((a, b) => {
    const dateA = new Date(a?.dataRota || a?.dataCadastro || 0).getTime();
    const dateB = new Date(b?.dataRota || b?.dataCadastro || 0).getTime();
    return dateB - dateA;
  });
}

function LogisticsDashboard({ data, session, onRefresh }) {
  const [savingRoute, setSavingRoute] = useState(null);
  const [savingForm, setSavingForm] = useState("");
  const [message, setMessage] = useState(null);
  const [routeFilter, setRouteFilter] = useState("todas");
  const [routeStatusPages, setRouteStatusPages] = useState({});
  const [showRouteStatusPanel, setShowRouteStatusPanel] = useState(false);
  const [activeLogisticsForm, setActiveLogisticsForm] = useState("rota");
  const [editingRoute, setEditingRoute] = useState(null);
  const [vehicleForm, setVehicleForm] = useState({
    placa: "",
    modelo: "",
    marca: "",
    tipo: "UTILITARIO",
    capacidadeKg: "",
  });
  const [driverForm, setDriverForm] = useState({
    nome: "",
    telefone: "",
    cpf: "",
    email: "",
  });
  const [carrierForm, setCarrierForm] = useState({
    nome: "",
    documento: "",
    telefone: "",
    email: "",
    site: "",
    observacao: "",
  });
  const [routeForm, setRouteForm] = useState({
    nome: "",
    dataRota: new Date().toISOString().slice(0, 10),
    entregadorId: "",
    veiculoId: "",
    quantidadeEntregas: 0,
    distanciaKm: "",
    custoEstimado: "",
    pagamentoEntrega: "JA_PAGO",
    observacao: "",
    entregaIds: [],
  });
  const [relationForm, setRelationForm] = useState({
    rotaId: "",
    entregadorId: "",
    veiculoId: "",
  });
  const rotas = asList(data?.rotas);
  const entregas = asList(data?.entregas);
  const veiculos = asList(data?.veiculos);
  const entregadores = asList(data?.entregadores);
  const transportadoras = asList(data?.transportadoras);
  const filiais = asList(data?.filiais);
  const [logisticsBranchFilter, setLogisticsBranchFilter] = useState("TODAS");
  const routeStatusPageSize = 3;
  const canEditRoute = canPerform(session, "editRoute");
  const canPrintRoute = canPerform(session, "printRoute");

  const selectedLogisticsBranchLabel = logisticsBranchFilter === "TODAS"
    ? "Todas as filiais"
    : logisticsBranchFilter === "EMPRESA"
      ? "Empresa / sem filial"
      : filiais.find((filial) => String(filial.id) === logisticsBranchFilter)?.nome || "Filial";
  function matchesLogisticsBranch(item) {
    if (logisticsBranchFilter === "TODAS") return true;
    if (logisticsBranchFilter === "EMPRESA") return !item?.filialId;
    return String(item?.filialId || "") === logisticsBranchFilter;
  }
  const branchScopedDeliveries = entregas.filter(matchesLogisticsBranch);
  const entregasDaRota = (rota) => branchScopedDeliveries.filter((entrega) => String(entrega.rotaId) === String(rota.id));
  const branchScopedRoutes = rotas.filter((rota) => {
    if (logisticsBranchFilter === "TODAS") return true;
    return entregasDaRota(rota).length > 0;
  });
  function getScopedRouteDeliveryCount(rota) {
    const scopedDeliveries = entregasDaRota(rota);
    return scopedDeliveries.length > 0 ? scopedDeliveries.length : getRouteDeliveryCount(rota);
  }
  function getRouteBranchLabel(rota) {
    const routeBranches = Array.from(new Set(entregasDaRota(rota).map((entrega) => entrega.filial || "Empresa")));
    if (routeBranches.length === 0) return "Sem entregas";
    if (routeBranches.length === 1) return routeBranches[0];
    return `${formatNumber(routeBranches.length)} filiais`;
  }

  const rotasFila = sortRoutesByDate(branchScopedRoutes.filter((rota) => getRouteStatus(rota) === "ABERTA"));
  const rotasEmRota = sortRoutesByDate(
    branchScopedRoutes.filter((rota) => ["EM_ANDAMENTO", "EM_ROTA"].includes(getRouteStatus(rota))),
  );
  const rotasFinalizadas = sortRoutesByDate(
    branchScopedRoutes.filter((rota) => ["FINALIZADA", "FINALIZADO"].includes(getRouteStatus(rota))),
  );
  const rotasAtivas = rotasFila.length + rotasEmRota.length;
  const entregasPlanejadas = branchScopedRoutes.reduce(
    (total, rota) => total + getScopedRouteDeliveryCount(rota),
    0,
  );
  const custoEstimado = branchScopedRoutes.reduce(
    (total, rota) => total + Number(rota.custoEstimado || 0),
    0,
  );
  const todasRotas = sortRoutesByDate(branchScopedRoutes);
  const routeGroups = [
    { title: "Fila", detail: "Rotas abertas para despacho.", items: rotasFila },
    { title: "Em rota", detail: "Rotas em andamento agora.", items: rotasEmRota },
    { title: "Finalizadas", detail: "Historico recente concluido.", items: rotasFinalizadas },
  ];
  const routeFilterOptions = [
    { value: "todas", label: "Todas", items: todasRotas, empty: "Nenhuma rota cadastrada." },
    { value: "abertas", label: "Abertas", items: rotasFila, empty: "Nenhuma rota aberta." },
    { value: "em_rota", label: "Em rota", items: rotasEmRota, empty: "Nenhuma rota em andamento." },
    {
      value: "finalizadas",
      label: "Finalizadas",
      items: rotasFinalizadas,
      empty: "Nenhuma rota finalizada.",
    },
  ];
  const selectedRouteFilter =
    routeFilterOptions.find((option) => option.value === routeFilter) || routeFilterOptions[0];
  const rotasFiltradas = selectedRouteFilter.items;
  const logisticsExportRows = [
    ...branchScopedDeliveries.map((entrega) => ({
      Tipo: "Entrega",
      Filial: entrega.filial || "Empresa / sem filial",
      Codigo: getDeliveryOrderNumber(entrega),
      Cliente: getDeliveryCustomer(entrega),
      Status: entrega.status || "-",
      Prioridade: entrega.prioridade || "-",
      Rota: entrega.rotaNome || "-",
      Endereco: getDeliveryAddress(entrega),
      Valor: formatCurrency(entrega.totalPedido || 0),
    })),
    ...branchScopedRoutes.map((rota) => ({
      Tipo: "Rota",
      Filial: getRouteBranchLabel(rota),
      Codigo: rota.nome || rota.id,
      Cliente: getRouteDriverName(rota),
      Status: getRouteStatus(rota),
      Prioridade: formatDate(rota.dataRota),
      Rota: rota.nome || "-",
      Endereco: getRouteVehicleLabel(rota),
      Valor: formatCurrency(rota.custoEstimado || 0),
    })),
  ];
  const routeDeliveryIds = new Set(routeForm.entregaIds);
  const entregasDisponiveis = branchScopedDeliveries.filter((entrega) => {
    const status = String(entrega.status || "PENDENTE").toUpperCase();
    const podePlanejar = !["ENTREGUE", "CANCELADO"].includes(status);
    return podePlanejar && (!entrega.rotaId || routeDeliveryIds.has(entrega.id));
  });
  const logisticsFormOptions = [
    { value: "veiculo", label: "Veiculo", icon: Truck },
    { value: "entregador", label: "Entregador", icon: UserRound },
    { value: "transportadora", label: "Transportadora", icon: PackageCheck },
    { value: "rota", label: "Rota", icon: MapPinned },
    { value: "relacao", label: "Relacionar", icon: Route },
  ];

  async function handleRouteStatus(rotaId, status) {
    setSavingRoute(rotaId);
    setMessage(null);

    try {
      await endpoints.logistica.atualizarStatusRota(rotaId, status);
      setMessage({ type: "success", text: "Status da rota atualizado." });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSavingRoute(null);
    }
  }

  async function handleCreateVehicle(event) {
    event.preventDefault();

    if (!vehicleForm.placa.trim()) {
      setMessage({ type: "error", text: "Informe a placa do veiculo." });
      return;
    }

    setSavingForm("veiculo");
    setMessage(null);

    try {
      await endpoints.logistica.criarVeiculo({
        ...vehicleForm,
        placa: vehicleForm.placa.trim().toUpperCase(),
        capacidadeKg: vehicleForm.capacidadeKg ? Number(vehicleForm.capacidadeKg) : null,
        ativo: true,
      });
      setVehicleForm({
        placa: "",
        modelo: "",
        marca: "",
        tipo: "UTILITARIO",
        capacidadeKg: "",
      });
      setMessage({ type: "success", text: "Veiculo cadastrado." });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSavingForm("");
    }
  }

  async function handleCreateDriver(event) {
    event.preventDefault();

    if (!driverForm.nome.trim()) {
      setMessage({ type: "error", text: "Informe o nome do entregador." });
      return;
    }

    setSavingForm("entregador");
    setMessage(null);

    try {
      await endpoints.logistica.criarEntregador({
        ...driverForm,
        nome: driverForm.nome.trim(),
        ativo: true,
      });
      setDriverForm({ nome: "", telefone: "", cpf: "", email: "" });
      setMessage({ type: "success", text: "Entregador cadastrado." });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSavingForm("");
    }
  }

  async function handleCreateCarrier(event) {
    event.preventDefault();

    if (!carrierForm.nome.trim()) {
      setMessage({ type: "error", text: "Informe o nome da transportadora." });
      return;
    }

    setSavingForm("transportadora");
    setMessage(null);

    try {
      await endpoints.logistica.criarTransportadora({
        ...carrierForm,
        nome: carrierForm.nome.trim(),
        documento: carrierForm.documento.replace(/\D/g, ""),
        ativo: true,
      });
      setCarrierForm({
        nome: "",
        documento: "",
        telefone: "",
        email: "",
        site: "",
        observacao: "",
      });
      setMessage({ type: "success", text: "Transportadora cadastrada." });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSavingForm("");
    }
  }

  async function handleCreateRoute(event) {
    event.preventDefault();
    const isEditing = Boolean(editingRoute?.id);

    if (!routeForm.nome.trim()) {
      setMessage({ type: "error", text: "Informe o nome da rota." });
      return;
    }

    if (!routeForm.dataRota) {
      setMessage({ type: "error", text: "Informe a data da rota." });
      return;
    }

    setSavingForm("rota");
    setMessage(null);

    try {
      const routePayload = {
        nome: routeForm.nome,
        dataRota: routeForm.dataRota,
        status: editingRoute?.status || "ABERTA",
        horarioSaida: editingRoute?.horarioSaida || null,
        horarioRetorno: editingRoute?.horarioRetorno || null,
        quantidadeEntregas: routeForm.entregaIds.length,
        distanciaKm: routeForm.distanciaKm ? Number(routeForm.distanciaKm) : null,
        custoEstimado: routeForm.custoEstimado ? Number(routeForm.custoEstimado) : 0,
        pagamentoEntrega: routeForm.pagamentoEntrega,
        observacao: routeForm.observacao,
        entregador: editingRoute?.entregador || null,
        veiculo: editingRoute?.veiculo || null,
      };

      const rotaSalva = isEditing
        ? await endpoints.logistica.atualizarRota(editingRoute.id, routePayload)
        : await endpoints.logistica.criarRota(routePayload);

      if (rotaSalva?.id && routeForm.entregadorId) {
        await endpoints.logistica.vincularEntregadorRota(rotaSalva.id, routeForm.entregadorId);
      }

      if (rotaSalva?.id && routeForm.veiculoId) {
        await endpoints.logistica.vincularVeiculoRota(rotaSalva.id, routeForm.veiculoId);
      }

      if (rotaSalva?.id) {
        await endpoints.logistica.vincularEntregasRota(rotaSalva.id, routeForm.entregaIds);
      }

      setEditingRoute(null);
      setRouteForm({
        nome: "",
        dataRota: new Date().toISOString().slice(0, 10),
        entregadorId: "",
        veiculoId: "",
        quantidadeEntregas: 0,
        distanciaKm: "",
        custoEstimado: "",
        pagamentoEntrega: "JA_PAGO",
        observacao: "",
        entregaIds: [],
      });
      setMessage({ type: "success", text: isEditing ? "Rota atualizada." : "Rota cadastrada." });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSavingForm("");
    }
  }

  function handleEditRoute(rota) {
    setEditingRoute(rota);
    setActiveLogisticsForm("rota");
    setMessage(null);
    setRouteForm({
      nome: rota.nome || "",
      dataRota: rota.dataRota || new Date().toISOString().slice(0, 10),
      entregadorId: rota.entregador?.id || "",
      veiculoId: rota.veiculo?.id || "",
      quantidadeEntregas: rota.quantidadeEntregas ?? 0,
      distanciaKm: rota.distanciaKm ?? "",
      custoEstimado: rota.custoEstimado ?? "",
      pagamentoEntrega: rota.pagamentoEntrega || "JA_PAGO",
      observacao: rota.observacao || "",
      entregaIds: entregasDaRota(rota).map((entrega) => entrega.id),
    });
  }

  function cancelRouteEdit() {
    setEditingRoute(null);
    setRouteForm({
      nome: "",
      dataRota: new Date().toISOString().slice(0, 10),
      entregadorId: "",
      veiculoId: "",
      quantidadeEntregas: 0,
      distanciaKm: "",
      custoEstimado: "",
      pagamentoEntrega: "JA_PAGO",
      observacao: "",
      entregaIds: [],
    });
  }

  async function handleLinkRouteAssets(event) {
    event.preventDefault();

    if (!relationForm.rotaId) {
      setMessage({ type: "error", text: "Selecione uma rota para relacionar." });
      return;
    }

    if (!relationForm.entregadorId && !relationForm.veiculoId) {
      setMessage({ type: "error", text: "Selecione motorista ou veiculo para vincular." });
      return;
    }

    setSavingForm("relacao");
    setMessage(null);

    try {
      if (relationForm.entregadorId) {
        await endpoints.logistica.vincularEntregadorRota(
          relationForm.rotaId,
          relationForm.entregadorId,
        );
      }

      if (relationForm.veiculoId) {
        await endpoints.logistica.vincularVeiculoRota(relationForm.rotaId, relationForm.veiculoId);
      }

      setRelationForm({ rotaId: "", entregadorId: "", veiculoId: "" });
      setMessage({ type: "success", text: "Motorista e veiculo relacionados a rota." });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSavingForm("");
    }
  }

  return (
    <div className="dashboard-view logistics-view">
      <section className="kpi-grid">
        <KpiCard
          icon={PackageCheck}
          label="Fila"
          value={formatNumber(rotasFila.length)}
          detail={`${formatNumber(entregasPlanejadas)} entregas planejadas / ${selectedLogisticsBranchLabel}`}
          tone="blue"
        />
        <KpiCard
          icon={Navigation}
          label="Em rota"
          value={formatNumber(rotasEmRota.length)}
          detail={`${formatNumber(rotasAtivas)} rotas ativas`}
          tone="amber"
        />
        <KpiCard
          icon={MapPinned}
          label="Finalizadas"
          value={formatNumber(rotasFinalizadas.length)}
          detail={`Custo previsto ${formatCurrency(custoEstimado)}`}
          tone="dark"
        />
        <KpiCard
          icon={Truck}
          label="Frota ativa"
          value={formatNumber(veiculos.length)}
          detail={`${formatNumber(entregadores.length)} entregadores / ${formatNumber(transportadoras.length)} transportadoras`}
          tone="green"
        />
      </section>

      <section className="panel account-plan-summary">
        <div className="account-plan-head">
          <div>
            <h3>Filtro operacional</h3>
            <p>Filtre rotas, entregas disponiveis e romaneios por filial.</p>
          </div>
          <div className="account-plan-actions">
            {canManageNotifications && (
              <button
                disabled={savingOrderAction === "commercial-notifications" || dueCommercialFollowUps.length === 0}
                onClick={handleSendCommercialNotifications}
                type="button"
              >
                {savingOrderAction === "commercial-notifications" ? <Loader2 className="spin" size={15} /> : <Mail size={15} />}
                Notificar
              </button>
            )}
            <label className="commission-config-control">
              <span>Filial</span>
              <select value={logisticsBranchFilter} onChange={(event) => setLogisticsBranchFilter(event.target.value)}>
                <option value="TODAS">Todas as filiais</option>
                <option value="EMPRESA">Empresa / sem filial</option>
                {filiais.map((filial) => (
                  <option key={filial.id} value={filial.id}>
                    {filial.matriz ? "Matriz" : "Filial"} - {filial.nome}
                  </option>
                ))}
              </select>
            </label>
            <button
              disabled={logisticsExportRows.length === 0}
              onClick={() => downloadCsv(`nexus-one-logistica-${getLocalDateKey()}.csv`, logisticsExportRows)}
              type="button"
            >
              <Download size={15} />
              CSV
            </button>
            <button
              disabled={logisticsExportRows.length === 0}
              onClick={() => printRowsDocument("Logistica por filial", logisticsExportRows, session?.empresa || "Nexus One")}
              type="button"
            >
              <Printer size={15} />
              PDF
            </button>
          </div>
        </div>
      </section>

      <section className={`dashboard-grid logistics-grid ${showRouteStatusPanel ? "status-open" : "status-closed"}`}>
        <article className="panel orders-panel">
          <div className="panel-title">
            <div>
              <h2>Rotas logisticas</h2>
              <p>Filtre abertas, em rota e finalizadas vindas do Spring Boot.</p>
            </div>
            <div className="panel-actions">
              <span>{rotasFiltradas.length} rotas</span>
              <button
                className="panel-action-button light"
                onClick={() => setShowRouteStatusPanel((prev) => !prev)}
                type="button"
              >
                <Route size={15} />
                {showRouteStatusPanel ? "Ocultar status" : "Rotas por status"}
              </button>
            </div>
          </div>

          <div className="route-filter-bar" aria-label="Filtrar rotas por status">
            {routeFilterOptions.map((option) => (
              <button
                className={routeFilter === option.value ? "active" : ""}
                key={option.value}
                onClick={() => setRouteFilter(option.value)}
                type="button"
              >
                <span>{option.label}</span>
                <strong>{formatNumber(option.items.length)}</strong>
              </button>
            ))}
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Rota</th>
                  <th>Filial</th>
                  <th>Status</th>
                  <th>Motorista</th>
                  <th>Veiculo</th>
                  <th>Data</th>
                  <th>Pagamento</th>
                  <th>Entregas</th>
                  <th>Acao</th>
                </tr>
              </thead>
              <tbody>
                {rotasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="empty-cell">
                      {selectedRouteFilter.empty}
                    </td>
                  </tr>
                ) : (
                  rotasFiltradas.map((rota) => (
                    <tr key={rota.id}>
                      <td>
                        <strong>{rota.nome || "Rota sem nome"}</strong>
                        <small>{rota.id}</small>
                      </td>
                      <td>{getRouteBranchLabel(rota)}</td>
                      <td>
                        <span className={`pill ${getRouteStatus(rota).toLowerCase()}`}>
                          {getRouteStatus(rota)}
                        </span>
                      </td>
                      <td>
                        <strong>{getRouteDriverName(rota)}</strong>
                        <small>{rota.entregador?.telefone || "Sem telefone"}</small>
                      </td>
                      <td>{getRouteVehicleLabel(rota)}</td>
                      <td>{formatDate(rota.dataRota)}</td>
                      <td>
                        <span className={`pill ${["PAGAR_NA_ENTREGA", "RECEBER_RETORNO"].includes(rota.pagamentoEntrega) ? "pendente" : "aprovado"}`}>
                          {getRoutePaymentLabel(rota)}
                        </span>
                      </td>
                      <td>
                        <strong>{formatNumber(getScopedRouteDeliveryCount(rota))}</strong>
                        {entregasDaRota(rota).slice(0, 2).map((entrega) => (
                          <small key={entrega.id}>
                            {getDeliveryOrderNumber(entrega)} - {getDeliveryCustomer(entrega)}
                          </small>
                        ))}
                      </td>
                      <td>
                        <div className="table-actions compact-actions">
                          {canEditRoute && (
                            <button
                              className="table-icon-button"
                              onClick={() => handleEditRoute(rota)}
                              title="Editar rota"
                              type="button"
                            >
                              <Pencil size={15} />
                            </button>
                          )}
                          {canPrintRoute && (
                            <button
                              className="table-icon-button"
                              onClick={() =>
                                printRouteManifest(
                                  { ...rota, entregas: entregasDaRota(rota) },
                                  session?.empresa || "Nexus One",
                                )
                              }
                              title="Imprimir romaneio"
                              type="button"
                            >
                              <Printer size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>

        {showRouteStatusPanel && (
        <aside className="panel side-panel">
          <div className="panel-title compact">
            <div>
              <h2>Rotas por status</h2>
              <p>Fila, em rota e finalizadas no mesmo painel.</p>
            </div>
          </div>

          {message && <p className={`form-message ${message.type}`}>{message.text}</p>}

          <div className="route-list">
            {branchScopedRoutes.length === 0 ? (
              <div className="empty-selection">Nenhuma rota cadastrada.</div>
            ) : (
              routeGroups.map((group) => {
                const totalPages = Math.max(Math.ceil(group.items.length / routeStatusPageSize), 1);
                const currentPage = Math.min(routeStatusPages[group.title] || 0, totalPages - 1);
                const pageStart = currentPage * routeStatusPageSize;
                const visibleRoutes = group.items.slice(pageStart, pageStart + routeStatusPageSize);

                return (
                  <section className="route-section" key={group.title}>
                    <div className="route-section-title">
                      <strong>{group.title}</strong>
                      <span>{formatNumber(group.items.length)}</span>
                    </div>
                    <p>{group.detail}</p>

                    {group.items.length === 0 ? (
                      <div className="empty-selection compact">Nenhuma rota neste status.</div>
                    ) : (
                      <>
                        {visibleRoutes.map((rota) => {
                          const status = getRouteStatus(rota);
                          return (
                            <div className="route-card" key={rota.id}>
                              <div>
                                <strong>{rota.nome}</strong>
                                <small>
                                  {formatDate(rota.dataRota)} / {formatNumber(getScopedRouteDeliveryCount(rota))} entregas / {getRoutePaymentLabel(rota)}
                                </small>
                                <small>{getRouteBranchLabel(rota)}</small>
                              </div>
                              <span className={`pill ${status.toLowerCase()}`}>
                                {status}
                              </span>
                              <div className="route-meta">
                                <span>
                                  <UserRound size={14} />
                                  {getRouteDriverName(rota)}
                                </span>
                                <span>
                                  <Truck size={14} />
                                  {getRouteVehicleLabel(rota)}
                                </span>
                              </div>
                              <div className="table-actions route-actions">
                                {canPrintRoute && (
                                  <button
                                    onClick={() =>
                                      printRouteManifest(
                                        { ...rota, entregas: entregasDaRota(rota) },
                                        session?.empresa || "Nexus One",
                                      )
                                    }
                                    type="button"
                                  >
                                    Imprimir
                                  </button>
                                )}
                                <button
                                  disabled={savingRoute === rota.id || status === "EM_ANDAMENTO" || status === "FINALIZADA"}
                                  onClick={() => handleRouteStatus(rota.id, "EM_ANDAMENTO")}
                                  type="button"
                                >
                                  Iniciar
                                </button>
                                <button
                                  disabled={savingRoute === rota.id || status === "FINALIZADA"}
                                  onClick={() => handleRouteStatus(rota.id, "FINALIZADA")}
                                  type="button"
                                >
                                  Finalizar
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        {totalPages > 1 && (
                          <div className="route-pagination">
                            <button
                              disabled={currentPage === 0}
                              onClick={() =>
                                setRouteStatusPages((prev) => ({
                                  ...prev,
                                  [group.title]: Math.max(currentPage - 1, 0),
                                }))
                              }
                              type="button"
                            >
                              Anterior
                            </button>
                            <span>
                              {formatNumber(currentPage + 1)} / {formatNumber(totalPages)}
                            </span>
                            <button
                              disabled={currentPage >= totalPages - 1}
                              onClick={() =>
                                setRouteStatusPages((prev) => ({
                                  ...prev,
                                  [group.title]: Math.min(currentPage + 1, totalPages - 1),
                                }))
                              }
                              type="button"
                            >
                              Proxima
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </section>
                );
              })
            )}
          </div>

          <div className="fleet-strip">
            <div>
              <span>Veiculos ativos</span>
              <strong>{formatNumber(veiculos.length)}</strong>
            </div>
            <div>
              <span>Equipe ativa</span>
              <strong>{formatNumber(entregadores.length)}</strong>
            </div>
          </div>
        </aside>
        )}
      </section>

      <section className="panel logistics-workbench">
        <div className="panel-title">
          <div>
            <h2>Operacoes logisticas</h2>
            <p>Cadastros e vinculos em uma tela compacta.</p>
          </div>
        </div>

        <div className="logistics-action-tabs" aria-label="Selecionar operacao logistica">
          {logisticsFormOptions.map(({ value, label, icon: Icon }) => (
            <button
              className={activeLogisticsForm === value ? "active" : ""}
              key={value}
              onClick={() => {
                setMessage(null);
                setActiveLogisticsForm(value);
              }}
              type="button"
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </div>

        <div className="logistics-form-shell">
        {activeLogisticsForm === "veiculo" && (
        <article className="inline-form-panel">
          <div className="panel-title compact">
            <div>
              <h2>Novo veiculo</h2>
              <p>Cadastre frota ativa para rotas.</p>
            </div>
          </div>

          <form className="compact-form" onSubmit={handleCreateVehicle}>
            <label className="form-control">
              <span>Placa</span>
              <input
                value={vehicleForm.placa}
                onChange={(event) =>
                  setVehicleForm((prev) => ({ ...prev, placa: event.target.value }))
                }
                placeholder="ABC1D23"
              />
            </label>
            <div className="finance-form-row">
              <label className="form-control">
                <span>Modelo</span>
                <input
                  value={vehicleForm.modelo}
                  onChange={(event) =>
                    setVehicleForm((prev) => ({ ...prev, modelo: event.target.value }))
                  }
                  placeholder="Fiorino"
                />
              </label>
              <label className="form-control">
                <span>Marca</span>
                <input
                  value={vehicleForm.marca}
                  onChange={(event) =>
                    setVehicleForm((prev) => ({ ...prev, marca: event.target.value }))
                  }
                  placeholder="Fiat"
                />
              </label>
            </div>
            <div className="finance-form-row">
              <label className="form-control">
                <span>Tipo</span>
                <input
                  value={vehicleForm.tipo}
                  onChange={(event) =>
                    setVehicleForm((prev) => ({ ...prev, tipo: event.target.value }))
                  }
                />
              </label>
              <label className="form-control">
                <span>Capacidade kg</span>
                <input
                  min="0"
                  type="number"
                  value={vehicleForm.capacidadeKg}
                  onChange={(event) =>
                    setVehicleForm((prev) => ({ ...prev, capacidadeKg: event.target.value }))
                  }
                />
              </label>
            </div>
            <button className="checkout-button" disabled={savingForm === "veiculo"} type="submit">
              {savingForm === "veiculo" ? <Loader2 className="spin" size={17} /> : <Truck size={17} />}
              Salvar veiculo
            </button>
          </form>
        </article>
        )}

        {activeLogisticsForm === "entregador" && (
        <article className="inline-form-panel">
          <div className="panel-title compact">
            <div>
              <h2>Novo entregador</h2>
              <p>Equipe ativa para operacao.</p>
            </div>
          </div>

          <form className="compact-form" onSubmit={handleCreateDriver}>
            <label className="form-control">
              <span>Nome</span>
              <input
                value={driverForm.nome}
                onChange={(event) =>
                  setDriverForm((prev) => ({ ...prev, nome: event.target.value }))
                }
                placeholder="Nome completo"
              />
            </label>
            <div className="finance-form-row">
              <label className="form-control">
                <span>Telefone</span>
                <input
                  value={driverForm.telefone}
                  onChange={(event) =>
                    setDriverForm((prev) => ({ ...prev, telefone: event.target.value }))
                  }
                />
              </label>
              <label className="form-control">
                <span>CPF</span>
                <input
                  value={driverForm.cpf}
                  onChange={(event) =>
                    setDriverForm((prev) => ({ ...prev, cpf: event.target.value }))
                  }
                />
              </label>
            </div>
            <label className="form-control">
              <span>Email</span>
              <input
                value={driverForm.email}
                onChange={(event) =>
                  setDriverForm((prev) => ({ ...prev, email: event.target.value }))
                }
                placeholder="email@empresa.com"
              />
            </label>
            <button className="checkout-button" disabled={savingForm === "entregador"} type="submit">
              {savingForm === "entregador" ? <Loader2 className="spin" size={17} /> : <UserRound size={17} />}
              Salvar entregador
            </button>
          </form>
        </article>
        )}

        {activeLogisticsForm === "transportadora" && (
        <article className="inline-form-panel">
          <div className="panel-title compact">
            <div>
              <h2>Nova transportadora</h2>
              <p>Cadastro para entrega terceirizada e rastreio.</p>
            </div>
          </div>

          <form className="compact-form" onSubmit={handleCreateCarrier}>
            <label className="form-control">
              <span>Nome</span>
              <input
                value={carrierForm.nome}
                onChange={(event) =>
                  setCarrierForm((prev) => ({ ...prev, nome: event.target.value }))
                }
                placeholder="Transportadora"
              />
            </label>
            <div className="finance-form-row">
              <label className="form-control">
                <span>Documento</span>
                <input
                  value={carrierForm.documento}
                  onChange={(event) =>
                    setCarrierForm((prev) => ({ ...prev, documento: event.target.value }))
                  }
                  placeholder="CNPJ ou CPF"
                />
              </label>
              <label className="form-control">
                <span>Telefone</span>
                <input
                  value={carrierForm.telefone}
                  onChange={(event) =>
                    setCarrierForm((prev) => ({ ...prev, telefone: event.target.value }))
                  }
                />
              </label>
            </div>
            <div className="finance-form-row">
              <label className="form-control">
                <span>Email</span>
                <input
                  value={carrierForm.email}
                  onChange={(event) =>
                    setCarrierForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  placeholder="contato@transportadora.com"
                />
              </label>
              <label className="form-control">
                <span>Site</span>
                <input
                  value={carrierForm.site}
                  onChange={(event) =>
                    setCarrierForm((prev) => ({ ...prev, site: event.target.value }))
                  }
                  placeholder="https://"
                />
              </label>
            </div>
            <label className="form-control">
              <span>Observacao</span>
              <textarea
                value={carrierForm.observacao}
                onChange={(event) =>
                  setCarrierForm((prev) => ({ ...prev, observacao: event.target.value }))
                }
                placeholder="Prazo, regioes atendidas ou contrato"
              />
            </label>
            <button className="checkout-button" disabled={savingForm === "transportadora"} type="submit">
              {savingForm === "transportadora" ? <Loader2 className="spin" size={17} /> : <PackageCheck size={17} />}
              Salvar transportadora
            </button>
          </form>

          <div className="account-plan-grid compact-catalog-grid">
            {transportadoras.length === 0 ? (
              <div className="empty-selection compact">Nenhuma transportadora cadastrada.</div>
            ) : (
              transportadoras.slice(0, 6).map((transportadora) => (
                <div className="account-plan-item" key={transportadora.id}>
                  <span>{transportadora.nome}</span>
                  <strong>{transportadora.telefone || transportadora.documento || "-"}</strong>
                  <small>{transportadora.email || transportadora.site || "Sem contato"}</small>
                </div>
              ))
            )}
          </div>
        </article>
        )}

        {activeLogisticsForm === "rota" && (
        <article className="inline-form-panel">
          <div className="panel-title compact">
            <div>
              <h2>Nova rota</h2>
              <p>{editingRoute ? "Atualize planejamento, cobranca e recursos." : "Planejamento operacional."}</p>
            </div>
            {editingRoute && (
              <button className="panel-action-button light" onClick={cancelRouteEdit} type="button">
                Cancelar edicao
              </button>
            )}
          </div>

          <form className="compact-form" onSubmit={handleCreateRoute}>
            <label className="form-control">
              <span>Nome da rota</span>
              <input
                value={routeForm.nome}
                onChange={(event) =>
                  setRouteForm((prev) => ({ ...prev, nome: event.target.value }))
                }
                placeholder="Rota Centro"
              />
            </label>
            <div className="finance-form-row">
              <label className="form-control">
                <span>Data</span>
                <input
                  type="date"
                  value={routeForm.dataRota}
                  onChange={(event) =>
                    setRouteForm((prev) => ({ ...prev, dataRota: event.target.value }))
                  }
                />
              </label>
              <label className="form-control">
                <span>Entregas</span>
                <input
                  readOnly
                  value={routeForm.entregaIds.length}
                />
              </label>
            </div>
            <div className="delivery-picker">
              <div className="delivery-picker-title">
                <strong>Pedidos para esta rota</strong>
                <span>{formatNumber(routeForm.entregaIds.length)} selecionado(s)</span>
              </div>
              {entregasDisponiveis.length === 0 ? (
                <div className="empty-selection compact">Nenhuma entrega disponivel. Receba pedidos de entrega no caixa primeiro.</div>
              ) : (
                entregasDisponiveis.map((entrega) => {
                  const checked = routeForm.entregaIds.includes(entrega.id);
                  return (
                    <label className="delivery-option" key={entrega.id}>
                      <input
                        checked={checked}
                        type="checkbox"
                        onChange={(event) =>
                          setRouteForm((prev) => ({
                            ...prev,
                            entregaIds: event.target.checked
                              ? [...prev.entregaIds, entrega.id]
                              : prev.entregaIds.filter((id) => id !== entrega.id),
                          }))
                        }
                      />
                      <span>
                        <strong>{getDeliveryCustomer(entrega)}</strong>
                        <small>{getDeliveryOrderNumber(entrega)} / {entrega.filial || "Empresa"} / {getDeliveryAddress(entrega)}</small>
                      </span>
                      <em>{entrega.rotaNome || "Sem rota"}</em>
                    </label>
                  );
                })
              )}
            </div>
            <div className="finance-form-row">
              <label className="form-control">
                <span>Motorista</span>
                <select
                  value={routeForm.entregadorId}
                  onChange={(event) =>
                    setRouteForm((prev) => ({ ...prev, entregadorId: event.target.value }))
                  }
                >
                  <option value="">Sem motorista</option>
                  {entregadores.map((entregador) => (
                    <option key={entregador.id} value={entregador.id}>
                      {entregador.nome}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-control">
                <span>Veiculo</span>
                <select
                  value={routeForm.veiculoId}
                  onChange={(event) =>
                    setRouteForm((prev) => ({ ...prev, veiculoId: event.target.value }))
                  }
                >
                  <option value="">Sem veiculo</option>
                  {veiculos.map((veiculo) => (
                    <option key={veiculo.id} value={veiculo.id}>
                      {[veiculo.placa, veiculo.modelo].filter(Boolean).join(" / ")}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="finance-form-row">
              <label className="form-control">
                <span>Distancia km</span>
                <input
                  min="0"
                  step="0.1"
                  type="number"
                  value={routeForm.distanciaKm}
                  onChange={(event) =>
                    setRouteForm((prev) => ({ ...prev, distanciaKm: event.target.value }))
                  }
                />
              </label>
              <label className="form-control">
                <span>Custo estimado</span>
                <input
                  min="0"
                  step="0.01"
                  type="number"
                  value={routeForm.custoEstimado}
                  onChange={(event) =>
                    setRouteForm((prev) => ({ ...prev, custoEstimado: event.target.value }))
                  }
                />
              </label>
            </div>
            <label className="form-control">
              <span>Pagamento</span>
              <select
                value={routeForm.pagamentoEntrega}
                onChange={(event) =>
                  setRouteForm((prev) => ({ ...prev, pagamentoEntrega: event.target.value }))
                }
              >
                <option value="JA_PAGO">Ja esta pago</option>
                <option value="PAGAR_NA_ENTREGA">Receber na entrega</option>
                <option value="RECEBER_RETORNO">Receber no retorno</option>
              </select>
            </label>
            <label className="form-control">
              <span>Observacao</span>
              <textarea
                value={routeForm.observacao}
                onChange={(event) =>
                  setRouteForm((prev) => ({ ...prev, observacao: event.target.value }))
                }
              />
            </label>
            <button className="checkout-button" disabled={savingForm === "rota"} type="submit">
              {savingForm === "rota" ? <Loader2 className="spin" size={17} /> : <MapPinned size={17} />}
              {editingRoute ? "Atualizar rota" : "Salvar rota"}
            </button>
          </form>
        </article>
        )}

        {activeLogisticsForm === "relacao" && (
        <article className="inline-form-panel">
          <div className="panel-title compact">
            <div>
              <h2>Relacionar frota</h2>
              <p>Vincule motorista e veiculo a uma rota existente.</p>
            </div>
          </div>

          <form className="compact-form" onSubmit={handleLinkRouteAssets}>
            <label className="form-control">
              <span>Rota</span>
              <select
                value={relationForm.rotaId}
                onChange={(event) =>
                  setRelationForm((prev) => ({ ...prev, rotaId: event.target.value }))
                }
              >
                <option value="">Selecione</option>
                {branchScopedRoutes.map((rota) => (
                  <option key={rota.id} value={rota.id}>
                    {rota.nome} - {getRouteBranchLabel(rota)} - {formatDate(rota.dataRota)}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-control">
              <span>Motorista</span>
              <select
                value={relationForm.entregadorId}
                onChange={(event) =>
                  setRelationForm((prev) => ({ ...prev, entregadorId: event.target.value }))
                }
              >
                <option value="">Manter atual</option>
                {entregadores.map((entregador) => (
                  <option key={entregador.id} value={entregador.id}>
                    {entregador.nome}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-control">
              <span>Veiculo</span>
              <select
                value={relationForm.veiculoId}
                onChange={(event) =>
                  setRelationForm((prev) => ({ ...prev, veiculoId: event.target.value }))
                }
              >
                <option value="">Manter atual</option>
                {veiculos.map((veiculo) => (
                  <option key={veiculo.id} value={veiculo.id}>
                    {[veiculo.placa, veiculo.modelo].filter(Boolean).join(" / ")}
                  </option>
                ))}
              </select>
            </label>
            <button className="checkout-button" disabled={savingForm === "relacao"} type="submit">
              {savingForm === "relacao" ? <Loader2 className="spin" size={17} /> : <Truck size={17} />}
              Relacionar
            </button>
          </form>
        </article>
        )}
        </div>
      </section>
    </div>
  );
}

const initialUserForm = {
  nome: "",
  login: "",
  senha: "",
  perfil: "VENDEDOR",
  filialId: "",
  cargo: "",
  departamento: "",
  salario: "",
  metaVendas: "",
  dataInicio: "",
  telefone: "",
  email: "",
  documento: "",
};

const editableProfiles = ["GERENTE", "VENDEDOR", "OPERADOR_CAIXA", "ESTOQUISTA", "FINANCEIRO"];

const initialCompanyForm = {
  nome: "",
  razaoSocial: "",
  cnpj: "",
  telefone: "",
  email: "",
  endereco: "",
  cidade: "",
  uf: "",
  estoqueMinimoPadrao: 5,
};

const initialBranchForm = {
  nome: "",
  codigo: "",
  cnpj: "",
  telefone: "",
  email: "",
  endereco: "",
  cidade: "",
  uf: "",
  matriz: false,
  ativo: true,
};

const initialContractForm = {
  nome: "",
  numero: "",
  tipo: "Servico",
  status: "ATIVO",
  dataInicio: "",
  dataFim: "",
  valorMensal: "",
  filialId: "",
  observacao: "",
};

const userPermissionModules = modules.filter((module) => module.value !== "usuarios");
const userPermissionActions = [
  { key: "operateCash", label: "Operar caixa" },
  { key: "mutateFinance", label: "Movimentar financeiro" },
  { key: "reverseFinance", label: "Estornar financeiro" },
  { key: "seeProfit", label: "Ver lucro" },
  { key: "editRoute", label: "Editar rotas" },
  { key: "printRoute", label: "Imprimir rotas" },
];

function buildPermissionDraft(usuario) {
  const extras = new Set(asList(usuario?.permissoesExtras));
  const blocked = new Set(asList(usuario?.permissoesBloqueadas));
  const draft = {};

  userPermissionModules.forEach((module) => {
    const key = modulePermissionKey(module.value);
    draft[key] = extras.has(key) ? "LIBERAR" : blocked.has(key) ? "BLOQUEAR" : "PADRAO";
  });

  userPermissionActions.forEach((action) => {
    const key = actionPermissionKey(action.key);
    draft[key] = extras.has(key) ? "LIBERAR" : blocked.has(key) ? "BLOQUEAR" : "PADRAO";
  });

  return draft;
}

function UserAdminDashboard({ data, session, onRefresh }) {
  const [form, setForm] = useState(initialUserForm);
  const [companyForm, setCompanyForm] = useState(initialCompanyForm);
  const [branchForm, setBranchForm] = useState(initialBranchForm);
  const [contractForm, setContractForm] = useState(initialContractForm);
  const [saving, setSaving] = useState(false);
  const [savingCompany, setSavingCompany] = useState(false);
  const [savingBranch, setSavingBranch] = useState(false);
  const [savingContract, setSavingContract] = useState(false);
  const [savingProfileId, setSavingProfileId] = useState(null);
  const [savingAccessId, setSavingAccessId] = useState(null);
  const [savingPermissionId, setSavingPermissionId] = useState(null);
  const [message, setMessage] = useState(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedPermissionUser, setSelectedPermissionUser] = useState(null);
  const [permissionDraft, setPermissionDraft] = useState({});
  const [userBranchFilter, setUserBranchFilter] = useState("TODAS");
  const [userProfileFilter, setUserProfileFilter] = useState("TODOS");
  const [auditFilter, setAuditFilter] = useState({
    busca: "",
    modulo: "TODOS",
    acao: "TODOS",
    inicio: "",
    fim: "",
  });
  const [auditPage, setAuditPage] = useState(0);

  const usuarios = asList(data?.usuarios || data);
  const auditoria = asList(data?.auditoria);
  const empresa = data?.empresa || {};
  const filiais = asList(data?.filiais);
  const contratos = asList(data?.contratos);
  const ativos = usuarios.filter((usuario) => usuario.ativo !== false).length;
  const admins = usuarios.filter((usuario) => usuario.perfil === "ADMIN").length;
  const bloqueados = usuarios.filter((usuario) => usuario.bloqueado).length;
  const usuariosSemFilial = usuarios.filter((usuario) => usuario.perfil !== "ADMIN" && !usuario.filialId).length;
  const selectedUserBranchLabel = userBranchFilter === "TODAS"
    ? "Todas as filiais"
    : userBranchFilter === "EMPRESA"
      ? "Empresa / sem filial"
      : filiais.find((filial) => String(filial.id) === userBranchFilter)?.nome || "Filial";
  const filteredUsers = usuarios.filter((usuario) => {
    const matchesProfile = userProfileFilter === "TODOS" || usuario.perfil === userProfileFilter;
    const matchesBranch = userBranchFilter === "TODAS"
      || (userBranchFilter === "EMPRESA" ? !usuario.filialId : String(usuario.filialId || "") === userBranchFilter);
    return matchesProfile && matchesBranch;
  });
  const userBranchRows = [
    {
      id: "EMPRESA",
      nome: "Empresa / sem filial",
      total: usuarios.filter((usuario) => !usuario.filialId).length,
      ativos: usuarios.filter((usuario) => !usuario.filialId && usuario.ativo !== false && !usuario.bloqueado).length,
    },
    ...filiais.map((filial) => ({
      id: filial.id,
      nome: filial.nome,
      total: usuarios.filter((usuario) => String(usuario.filialId || "") === String(filial.id)).length,
      ativos: usuarios.filter((usuario) => String(usuario.filialId || "") === String(filial.id) && usuario.ativo !== false && !usuario.bloqueado).length,
    })),
  ];
  const permissionProfiles = ["ADMIN", "GERENTE", "VENDEDOR", "OPERADOR_CAIXA", "ESTOQUISTA", "FINANCEIRO"];
  const modulePermissionRows = permissionProfiles.map((perfil) => ({
    perfil,
    modules: modules.map((module) => ({
      key: module.value,
      label: module.label,
      allowed: canAccessModule(perfil, module.value),
    })),
  }));
  const criticalPermissions = [
    { label: "Vender", profiles: ["ADMIN", "GERENTE", "VENDEDOR"] },
    { label: "Abrir/fechar caixa", profiles: ["ADMIN", "GERENTE", "VENDEDOR", "OPERADOR_CAIXA"] },
    { label: "Movimentar financeiro", profiles: ["ADMIN", "GERENTE", "FINANCEIRO"] },
    { label: "Estornar financeiro", profiles: ["ADMIN"] },
    { label: "Ver lucro", profiles: ["ADMIN", "GERENTE", "FINANCEIRO"] },
    { label: "Editar rotas", profiles: ["ADMIN", "GERENTE"] },
    { label: "Administrar usuarios", profiles: ["ADMIN"] },
  ];
  const auditModules = ["TODOS", ...Array.from(new Set(auditoria.map((evento) => evento.modulo).filter(Boolean)))];
  const auditActions = ["TODOS", ...Array.from(new Set(auditoria.map((evento) => evento.acao).filter(Boolean)))];
  const usersByLogin = new Map(
    usuarios
      .filter((usuario) => usuario.login)
      .map((usuario) => [String(usuario.login).toLowerCase(), usuario]),
  );
  function getAuditUserBranch(evento) {
    const usuario = evento?.usuarioLogin ? usersByLogin.get(String(evento.usuarioLogin).toLowerCase()) : null;
    return usuario?.filial || "Empresa / sem filial";
  }
  const filteredAudit = auditoria.filter((evento) => {
    const eventKey = getLocalDateKey(evento.dataEvento);
    const text = [
      evento.usuarioLogin,
      evento.perfil,
      evento.modulo,
      evento.acao,
      evento.descricao,
      evento.registroId,
      getAuditUserBranch(evento),
    ].join(" ").toLowerCase();

    if (auditFilter.busca && !text.includes(auditFilter.busca.toLowerCase())) return false;
    if (auditFilter.modulo !== "TODOS" && evento.modulo !== auditFilter.modulo) return false;
    if (auditFilter.acao !== "TODOS" && evento.acao !== auditFilter.acao) return false;
    if (auditFilter.inicio && eventKey < auditFilter.inicio) return false;
    if (auditFilter.fim && eventKey > auditFilter.fim) return false;
    return true;
  });
  const auditPageSize = 10;
  const auditTotalPages = Math.max(Math.ceil(filteredAudit.length / auditPageSize), 1);
  const currentAuditPage = Math.min(auditPage, auditTotalPages - 1);
  const pagedAudit = filteredAudit.slice(
    currentAuditPage * auditPageSize,
    currentAuditPage * auditPageSize + auditPageSize,
  );
  const auditRows = filteredAudit.map((evento) => ({
    data: evento.dataEvento ? new Date(evento.dataEvento).toLocaleString("pt-BR") : "-",
    usuario: evento.usuarioLogin || "-",
    perfil: evento.perfil || "-",
    filial: getAuditUserBranch(evento),
    modulo: evento.modulo || "-",
    acao: evento.acao || "-",
    descricao: evento.descricao || "-",
    registroId: evento.registroId || "-",
  }));
  const branchRows = filiais.map((filial) => ({
    Nome: filial.nome,
    Codigo: filial.codigo || "-",
    CNPJ: filial.cnpj || "-",
    Cidade: [filial.cidade, filial.uf].filter(Boolean).join("/") || "-",
    Tipo: filial.matriz ? "Matriz" : "Filial",
    Status: filial.ativo ? "Ativa" : "Inativa",
  }));
  const contractRows = contratos.map((contrato) => ({
    Contrato: contrato.nome,
    Numero: contrato.numero || "-",
    Tipo: contrato.tipo || "-",
    Status: contrato.status || "-",
    Filial: contrato.filial || "Empresa",
    Inicio: contrato.dataInicio ? formatDate(contrato.dataInicio) : "-",
    Fim: contrato.dataFim ? formatDate(contrato.dataFim) : "-",
    Mensalidade: formatCurrency(contrato.valorMensal || 0),
  }));
  const fiscalUnits = [
    {
      id: "EMPRESA",
      nome: empresa.nome || "Empresa",
      tipo: "Empresa",
      cnpj: empresa.cnpj,
      razaoSocial: empresa.razaoSocial || empresa.nome,
      endereco: empresa.endereco,
      cidade: empresa.cidade,
      uf: empresa.uf,
    },
    ...filiais.map((filial) => ({
      id: filial.id,
      nome: filial.nome,
      tipo: filial.matriz ? "Matriz" : "Filial",
      cnpj: filial.cnpj,
      razaoSocial: filial.razaoSocial || filial.nome,
      endereco: filial.endereco,
      cidade: filial.cidade,
      uf: filial.uf,
    })),
  ];
  const fiscalReadinessRows = fiscalUnits.map((unit) => {
    const missing = [
      !String(unit.razaoSocial || "").trim() && "razao social",
      String(unit.cnpj || "").replace(/\D/g, "").length !== 14 && "CNPJ valido",
      !String(unit.endereco || "").trim() && "endereco",
      !String(unit.cidade || "").trim() && "cidade",
      !String(unit.uf || "").trim() && "UF",
    ].filter(Boolean);
    const activeContracts = contratos.filter((contrato) => {
      const sameBranch = unit.id === "EMPRESA"
        ? !contrato.filialId
        : String(contrato.filialId || "") === String(unit.id);
      return sameBranch && String(contrato.status || "").toUpperCase() === "ATIVO";
    }).length;

    return {
      Unidade: unit.nome,
      Tipo: unit.tipo,
      CNPJ: unit.cnpj || "-",
      Cidade: [unit.cidade, unit.uf].filter(Boolean).join("/") || "-",
      Contratos: formatNumber(activeContracts),
      Status: missing.length === 0 ? "Pronta para homologacao" : "Pendencias cadastrais",
      Pendencias: missing.length === 0 ? "-" : missing.join(", "),
    };
  });
  const fiscalReadyCount = fiscalReadinessRows.filter((row) => row.Status === "Pronta para homologacao").length;
  const fiscalPendingCount = fiscalReadinessRows.length - fiscalReadyCount;

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  useEffect(() => {
    setCompanyForm({
      nome: empresa.nome || "",
      razaoSocial: empresa.razaoSocial || "",
      cnpj: empresa.cnpj || "",
      telefone: empresa.telefone || "",
      email: empresa.email || "",
      endereco: empresa.endereco || "",
      cidade: empresa.cidade || "",
      uf: empresa.uf || "",
      estoqueMinimoPadrao: empresa.estoqueMinimoPadrao || 5,
    });
  }, [empresa.id]);

  useEffect(() => {
    setAuditPage(0);
  }, [auditFilter]);

  function updateCompanyForm(field, value) {
    setCompanyForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateBranchForm(field, value) {
    setBranchForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateContractForm(field, value) {
    setContractForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCompanySubmit(event) {
    event.preventDefault();

    if (!companyForm.nome.trim()) {
      setMessage({ type: "error", text: "Informe o nome fantasia da empresa." });
      return;
    }

    setSavingCompany(true);
    setMessage(null);

    try {
      await endpoints.empresa.atualizarMinha({
        ...companyForm,
        nome: companyForm.nome.trim(),
        estoqueMinimoPadrao: Number(companyForm.estoqueMinimoPadrao || 5),
      });
      setMessage({ type: "success", text: "Dados da empresa atualizados." });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSavingCompany(false);
    }
  }

  async function handleBranchSubmit(event) {
    event.preventDefault();

    if (!branchForm.nome.trim()) {
      setMessage({ type: "error", text: "Informe o nome da filial." });
      return;
    }

    setSavingBranch(true);
    setMessage(null);

    try {
      await endpoints.empresa.criarFilial({
        ...branchForm,
        nome: branchForm.nome.trim(),
        uf: branchForm.uf.trim().toUpperCase(),
      });
      setBranchForm(initialBranchForm);
      setMessage({ type: "success", text: "Filial cadastrada." });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSavingBranch(false);
    }
  }

  async function handleContractSubmit(event) {
    event.preventDefault();

    if (!contractForm.nome.trim()) {
      setMessage({ type: "error", text: "Informe o nome do contrato." });
      return;
    }

    setSavingContract(true);
    setMessage(null);

    try {
      await endpoints.empresa.criarContrato({
        ...contractForm,
        nome: contractForm.nome.trim(),
        valorMensal: contractForm.valorMensal ? Number(contractForm.valorMensal) : null,
        filialId: contractForm.filialId || null,
        dataInicio: contractForm.dataInicio || null,
        dataFim: contractForm.dataFim || null,
      });
      setContractForm(initialContractForm);
      setMessage({ type: "success", text: "Contrato cadastrado." });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSavingContract(false);
    }
  }

  function openCreateUserForm() {
    setForm(initialUserForm);
    setEditingUser(null);
    setMessage(null);
    setShowUserForm(true);
  }

  function openEditUserForm(usuario) {
    setForm({
      nome: usuario.nome || "",
      login: usuario.login || "",
      senha: "",
      perfil: usuario.perfil || "VENDEDOR",
      filialId: usuario.filialId || "",
      cargo: usuario.cargo || "",
      departamento: usuario.departamento || "",
      salario: usuario.salario ?? "",
      metaVendas: usuario.metaVendas ?? "",
      dataInicio: usuario.dataInicio || "",
      telefone: usuario.telefone || "",
      email: usuario.email || "",
      documento: usuario.documento || "",
    });
    setEditingUser(usuario);
    setMessage(null);
    setShowUserForm(true);
  }

  function closeUserForm() {
    setShowUserForm(false);
    setEditingUser(null);
    setForm(initialUserForm);
  }

  function openPermissionEditor(usuario) {
    setSelectedPermissionUser(usuario);
    setPermissionDraft(buildPermissionDraft(usuario));
    setMessage(null);
  }

  function closePermissionEditor() {
    setSelectedPermissionUser(null);
    setPermissionDraft({});
  }

  function updatePermissionDraft(permissionKey, value) {
    setPermissionDraft((current) => ({ ...current, [permissionKey]: value }));
  }

  function buildUserPayload(includePassword) {
    return {
      nome: form.nome.trim(),
      login: form.login.trim(),
      senha: includePassword ? form.senha : form.senha ? form.senha : null,
      perfil: form.perfil,
      filialId: form.filialId || null,
      cargo: form.cargo.trim() || null,
      departamento: form.departamento.trim() || null,
      salario: form.salario ? Number(form.salario) : null,
      metaVendas: form.metaVendas ? Number(form.metaVendas) : null,
      dataInicio: form.dataInicio || null,
      telefone: form.telefone.trim() || null,
      email: form.email.trim() || null,
      documento: form.documento.trim() || null,
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const isEditing = Boolean(editingUser?.id);

    if (!form.nome.trim()) {
      setMessage({ type: "error", text: "Informe o nome do usuario." });
      return;
    }

    if (!form.login.trim()) {
      setMessage({ type: "error", text: "Informe o login do usuario." });
      return;
    }

    if (!isEditing && form.senha.length < 6) {
      setMessage({ type: "error", text: "Senha precisa ter no minimo 6 caracteres." });
      return;
    }

    if (isEditing && form.senha && form.senha.length < 6) {
      setMessage({ type: "error", text: "Nova senha precisa ter no minimo 6 caracteres." });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      if (isEditing) {
        await endpoints.usuarios.atualizar(editingUser.id, buildUserPayload(false));
      } else {
        await endpoints.usuarios.criar(buildUserPayload(true));
      }

      setForm(initialUserForm);
      setEditingUser(null);
      setShowUserForm(false);
      setMessage({
        type: "success",
        text: isEditing ? "Colaborador atualizado com sucesso." : "Colaborador cadastrado na empresa atual.",
      });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleProfileChange(usuario, perfil) {
    if (!usuario?.id || !perfil || perfil === usuario.perfil) {
      return;
    }

    setSavingProfileId(usuario.id);
    setMessage(null);

    try {
      await endpoints.usuarios.alterarPerfil(usuario.id, perfil);
      setMessage({ type: "success", text: `Perfil de ${usuario.nome || usuario.login} atualizado.` });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSavingProfileId(null);
    }
  }

  async function handleAccessChange(usuario, ativo) {
    setSavingAccessId(usuario.id);
    setMessage(null);

    try {
      await endpoints.usuarios.alterarAcesso(usuario.id, ativo);
      setMessage({
        type: "success",
        text: ativo ? "Acesso concedido ao usuario." : "Acesso revogado do usuario.",
      });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSavingAccessId(null);
    }
  }

  async function handlePermissionSave() {
    if (!selectedPermissionUser?.id) return;

    const permissoesExtras = Object.entries(permissionDraft)
      .filter(([, value]) => value === "LIBERAR")
      .map(([key]) => key);
    const permissoesBloqueadas = Object.entries(permissionDraft)
      .filter(([, value]) => value === "BLOQUEAR")
      .map(([key]) => key);

    setSavingPermissionId(selectedPermissionUser.id);
    setMessage(null);

    try {
      await endpoints.usuarios.alterarPermissoes(selectedPermissionUser.id, {
        permissoesExtras,
        permissoesBloqueadas,
      });
      setMessage({
        type: "success",
        text: "Permissoes manuais atualizadas. O usuario passa a usar as novas regras no proximo login.",
      });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSavingPermissionId(null);
    }
  }

  if (data?.restricted || session.perfil !== "ADMIN") {
    return (
      <div className="restricted-state">
        <div className="preview-icon">
          <LockKeyhole size={26} />
        </div>
        <h2>Acesso restrito</h2>
        <p>
          Este modulo fica disponivel apenas para perfil ADMIN. Usuarios comuns
          continuam operando vendas, estoque, financeiro e logistica conforme permissao.
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-view">
      <section className="kpi-grid">
        <KpiCard
          icon={UserRound}
          label="Usuarios"
          value={formatNumber(filteredUsers.length)}
          detail={`Filtro: ${selectedUserBranchLabel}`}
          tone="blue"
        />
        <KpiCard
          icon={CheckCircle2}
          label="Ativos"
          value={formatNumber(ativos)}
          detail="Contas liberadas"
          tone="green"
        />
        <KpiCard
          icon={ShieldCheck}
          label="Admins"
          value={formatNumber(admins)}
          detail="Perfis administrativos"
          tone="dark"
        />
        <KpiCard
          icon={MapPin}
          label="Sem filial"
          value={formatNumber(usuariosSemFilial)}
          detail="Colaboradores operacionais sem loja"
          tone="amber"
        />
        <KpiCard
          icon={FileText}
          label="Contratos"
          value={formatNumber(contratos.length)}
          detail={`${formatNumber(bloqueados)} acessos bloqueados`}
          tone="blue"
        />
        <KpiCard
          icon={ReceiptText}
          label="Pre-fiscal"
          value={`${formatNumber(fiscalReadyCount)}/${formatNumber(fiscalReadinessRows.length)}`}
          detail={`${formatNumber(fiscalPendingCount)} unidade(s) com pendencia`}
          tone="green"
        />
      </section>

      <section className="panel account-plan-summary">
        <div className="account-plan-head">
          <div>
            <h3>Filtro operacional</h3>
            <p>Filtre colaboradores por filial e perfil para conferir acessos por loja.</p>
          </div>
          <div className="account-plan-actions">
            <label className="commission-config-control">
              <span>Filial</span>
              <select value={userBranchFilter} onChange={(event) => setUserBranchFilter(event.target.value)}>
                <option value="TODAS">Todas as filiais</option>
                <option value="EMPRESA">Empresa / sem filial</option>
                {filiais.map((filial) => (
                  <option key={filial.id} value={filial.id}>
                    {filial.matriz ? "Matriz" : "Filial"} - {filial.nome}
                  </option>
                ))}
              </select>
            </label>
            <label className="commission-config-control">
              <span>Perfil</span>
              <select value={userProfileFilter} onChange={(event) => setUserProfileFilter(event.target.value)}>
                <option value="TODOS">Todos</option>
                {permissionProfiles.map((perfil) => (
                  <option key={perfil} value={perfil}>
                    {perfil}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <div className="account-plan-grid compact-catalog-grid">
          {userBranchRows.slice(0, 8).map((row) => (
            <button
              className={userBranchFilter === row.id ? "account-plan-item active" : "account-plan-item"}
              key={row.id}
              onClick={() => setUserBranchFilter(row.id)}
              type="button"
            >
              <span>{row.nome}</span>
              <strong>{formatNumber(row.total)} usuario(s)</strong>
              <small>{formatNumber(row.ativos)} ativos</small>
            </button>
          ))}
        </div>
      </section>

      <section className="content-grid single">
        <article className="panel">
          <div className="panel-title">
            <div>
              <h2>Empresa</h2>
              <p>Dados usados em documentos, relatorios e identificacao do sistema.</p>
            </div>
            <span>{empresa.nome || session.empresa || "Empresa"}</span>
          </div>

          <form className="compact-form company-form" onSubmit={handleCompanySubmit}>
            <div className="finance-form-row">
              <label className="form-control">
                <span>Nome fantasia</span>
                <input
                  value={companyForm.nome}
                  onChange={(event) => updateCompanyForm("nome", event.target.value)}
                  placeholder="Nome da empresa"
                />
              </label>
              <label className="form-control">
                <span>Razao social</span>
                <input
                  value={companyForm.razaoSocial}
                  onChange={(event) => updateCompanyForm("razaoSocial", event.target.value)}
                  placeholder="Razao social"
                />
              </label>
            </div>

            <div className="finance-form-row">
              <label className="form-control">
                <span>CNPJ</span>
                <input
                  value={companyForm.cnpj}
                  onChange={(event) => updateCompanyForm("cnpj", event.target.value)}
                  placeholder="00.000.000/0000-00"
                />
              </label>
              <label className="form-control">
                <span>Telefone</span>
                <input
                  value={companyForm.telefone}
                  onChange={(event) => updateCompanyForm("telefone", event.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </label>
            </div>

            <div className="finance-form-row">
              <label className="form-control">
                <span>Email</span>
                <input
                  value={companyForm.email}
                  onChange={(event) => updateCompanyForm("email", event.target.value)}
                  placeholder="contato@empresa.com"
                />
              </label>
              <label className="form-control">
                <span>Estoque minimo padrao</span>
                <input
                  min="0"
                  type="number"
                  value={companyForm.estoqueMinimoPadrao}
                  onChange={(event) => updateCompanyForm("estoqueMinimoPadrao", event.target.value)}
                />
              </label>
            </div>

            <label className="form-control">
              <span>Endereco</span>
              <input
                value={companyForm.endereco}
                onChange={(event) => updateCompanyForm("endereco", event.target.value)}
                placeholder="Rua, numero, bairro"
              />
            </label>

            <div className="finance-form-row">
              <label className="form-control">
                <span>Cidade</span>
                <input
                  value={companyForm.cidade}
                  onChange={(event) => updateCompanyForm("cidade", event.target.value)}
                  placeholder="Cidade"
                />
              </label>
              <label className="form-control">
                <span>UF</span>
                <input
                  maxLength="2"
                  value={companyForm.uf}
                  onChange={(event) => updateCompanyForm("uf", event.target.value.toUpperCase())}
                  placeholder="SP"
                />
              </label>
            </div>

            <button className="checkout-button" disabled={savingCompany} type="submit">
              {savingCompany ? <Loader2 className="spin" size={17} /> : <ShieldCheck size={17} />}
              {savingCompany ? "Salvando..." : "Salvar dados da empresa"}
            </button>
          </form>
        </article>
      </section>

      <section className="content-grid single">
        <article className="panel">
          <div className="panel-title">
            <div>
              <h2>Prontidao fiscal</h2>
              <p>Checklist cadastral por unidade antes de NF-e/NFC-e real.</p>
            </div>
            <div className="account-plan-actions">
              <button
                disabled={fiscalReadinessRows.length === 0}
                onClick={() => downloadCsv(`nexus-one-prontidao-fiscal-${getLocalDateKey()}.csv`, fiscalReadinessRows)}
                type="button"
              >
                <Download size={15} />
                CSV
              </button>
              <button
                disabled={fiscalReadinessRows.length === 0}
                onClick={() => printRowsDocument("Prontidao fiscal", fiscalReadinessRows, empresa.nome || session.empresa || "Nexus One")}
                type="button"
              >
                <Printer size={15} />
                PDF
              </button>
            </div>
          </div>
          <div className="account-plan-grid compact-catalog-grid">
            {fiscalReadinessRows.map((row) => (
              <div className={row.Status === "Pronta para homologacao" ? "account-plan-item fiscal-ready-card ready" : "account-plan-item fiscal-ready-card pending"} key={`${row.Tipo}-${row.Unidade}`}>
                <span>{row.Tipo} / {row.CNPJ}</span>
                <strong>{row.Unidade}</strong>
                <small>{row.Status}</small>
                <small>{row.Pendencias === "-" ? `${row.Contratos} contrato(s) ativo(s)` : `Pendencias: ${row.Pendencias}`}</small>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="content-grid single">
        <article className="panel">
          <div className="panel-title">
            <div>
              <h2>Lojas e filiais</h2>
              <p>Cadastre unidades operacionais da empresa.</p>
            </div>
            <div className="account-plan-actions">
              <button
                disabled={branchRows.length === 0}
                onClick={() => downloadCsv(`nexus-one-filiais-${getLocalDateKey()}.csv`, branchRows)}
                type="button"
              >
                <Download size={15} />
                CSV
              </button>
              <button
                disabled={branchRows.length === 0}
                onClick={() => printRowsDocument("Lojas e filiais", branchRows, empresa.nome || session.empresa || "Nexus One")}
                type="button"
              >
                <Printer size={15} />
                PDF
              </button>
            </div>
          </div>

          <form className="compact-form company-form" onSubmit={handleBranchSubmit}>
            <div className="finance-form-row">
              <label className="form-control">
                <span>Nome</span>
                <input
                  value={branchForm.nome}
                  onChange={(event) => updateBranchForm("nome", event.target.value)}
                  placeholder="Filial Centro"
                />
              </label>
              <label className="form-control">
                <span>Codigo</span>
                <input
                  value={branchForm.codigo}
                  onChange={(event) => updateBranchForm("codigo", event.target.value)}
                  placeholder="FIL-001"
                />
              </label>
            </div>
            <div className="finance-form-row">
              <label className="form-control">
                <span>CNPJ</span>
                <input
                  value={branchForm.cnpj}
                  onChange={(event) => updateBranchForm("cnpj", event.target.value)}
                  placeholder="00.000.000/0000-00"
                />
              </label>
              <label className="form-control">
                <span>Telefone</span>
                <input
                  value={branchForm.telefone}
                  onChange={(event) => updateBranchForm("telefone", event.target.value)}
                />
              </label>
            </div>
            <label className="form-control">
              <span>Endereco</span>
              <input
                value={branchForm.endereco}
                onChange={(event) => updateBranchForm("endereco", event.target.value)}
                placeholder="Rua, numero, bairro"
              />
            </label>
            <div className="finance-form-row">
              <label className="form-control">
                <span>Cidade</span>
                <input
                  value={branchForm.cidade}
                  onChange={(event) => updateBranchForm("cidade", event.target.value)}
                />
              </label>
              <label className="form-control">
                <span>UF</span>
                <input
                  maxLength="2"
                  value={branchForm.uf}
                  onChange={(event) => updateBranchForm("uf", event.target.value.toUpperCase())}
                />
              </label>
            </div>
            <label className="bulk-select-toggle">
              <input
                checked={branchForm.matriz}
                type="checkbox"
                onChange={(event) => updateBranchForm("matriz", event.target.checked)}
              />
              Unidade matriz
            </label>
            <button className="checkout-button" disabled={savingBranch} type="submit">
              {savingBranch ? <Loader2 className="spin" size={17} /> : <MapPin size={17} />}
              {savingBranch ? "Salvando..." : "Salvar filial"}
            </button>
          </form>

          <div className="account-plan-grid compact-catalog-grid">
            {filiais.length === 0 ? (
              <div className="empty-selection compact">Nenhuma filial cadastrada.</div>
            ) : (
              filiais.slice(0, 8).map((filial) => (
                <div className="account-plan-item" key={filial.id}>
                  <span>{filial.matriz ? "Matriz" : "Filial"} / {filial.codigo || "-"}</span>
                  <strong>{filial.nome}</strong>
                  <small>{[filial.cidade, filial.uf].filter(Boolean).join("/") || filial.endereco || "Sem endereco"}</small>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="content-grid single">
        <article className="panel">
          <div className="panel-title">
            <div>
              <h2>Contratos</h2>
              <p>Controle contratos operacionais, locacao, SaaS e fornecedores criticos.</p>
            </div>
            <div className="account-plan-actions">
              <button
                disabled={contractRows.length === 0}
                onClick={() => downloadCsv(`nexus-one-contratos-${getLocalDateKey()}.csv`, contractRows)}
                type="button"
              >
                <Download size={15} />
                CSV
              </button>
              <button
                disabled={contractRows.length === 0}
                onClick={() => printRowsDocument("Contratos", contractRows, empresa.nome || session.empresa || "Nexus One")}
                type="button"
              >
                <Printer size={15} />
                PDF
              </button>
            </div>
          </div>

          <form className="compact-form company-form" onSubmit={handleContractSubmit}>
            <div className="finance-form-row">
              <label className="form-control">
                <span>Contrato</span>
                <input
                  value={contractForm.nome}
                  onChange={(event) => updateContractForm("nome", event.target.value)}
                  placeholder="Locacao loja centro"
                />
              </label>
              <label className="form-control">
                <span>Numero</span>
                <input
                  value={contractForm.numero}
                  onChange={(event) => updateContractForm("numero", event.target.value)}
                />
              </label>
            </div>
            <div className="finance-form-row">
              <label className="form-control">
                <span>Tipo</span>
                <input
                  value={contractForm.tipo}
                  onChange={(event) => updateContractForm("tipo", event.target.value)}
                />
              </label>
              <label className="form-control">
                <span>Status</span>
                <select
                  value={contractForm.status}
                  onChange={(event) => updateContractForm("status", event.target.value)}
                >
                  <option value="ATIVO">Ativo</option>
                  <option value="PENDENTE">Pendente</option>
                  <option value="ENCERRADO">Encerrado</option>
                </select>
              </label>
            </div>
            <div className="finance-form-row">
              <label className="form-control">
                <span>Inicio</span>
                <input
                  type="date"
                  value={contractForm.dataInicio}
                  onChange={(event) => updateContractForm("dataInicio", event.target.value)}
                />
              </label>
              <label className="form-control">
                <span>Fim</span>
                <input
                  type="date"
                  value={contractForm.dataFim}
                  onChange={(event) => updateContractForm("dataFim", event.target.value)}
                />
              </label>
            </div>
            <div className="finance-form-row">
              <label className="form-control">
                <span>Valor mensal</span>
                <input
                  min="0"
                  step="0.01"
                  type="number"
                  value={contractForm.valorMensal}
                  onChange={(event) => updateContractForm("valorMensal", event.target.value)}
                />
              </label>
              <label className="form-control">
                <span>Filial</span>
                <select
                  value={contractForm.filialId}
                  onChange={(event) => updateContractForm("filialId", event.target.value)}
                >
                  <option value="">Empresa</option>
                  {filiais.map((filial) => (
                    <option key={filial.id} value={filial.id}>
                      {filial.nome}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="form-control">
              <span>Observacao</span>
              <textarea
                value={contractForm.observacao}
                onChange={(event) => updateContractForm("observacao", event.target.value)}
              />
            </label>
            <button className="checkout-button" disabled={savingContract} type="submit">
              {savingContract ? <Loader2 className="spin" size={17} /> : <FileText size={17} />}
              {savingContract ? "Salvando..." : "Salvar contrato"}
            </button>
          </form>

          <div className="account-plan-grid compact-catalog-grid">
            {contratos.length === 0 ? (
              <div className="empty-selection compact">Nenhum contrato cadastrado.</div>
            ) : (
              contratos.slice(0, 8).map((contrato) => (
                <div className="account-plan-item" key={contrato.id}>
                  <span>{contrato.status || "ATIVO"} / {contrato.tipo || "Contrato"}</span>
                  <strong>{contrato.nome}</strong>
                  <small>{contrato.filial || "Empresa"} / ate {contrato.dataFim ? formatDate(contrato.dataFim) : "-"}</small>
                  <small>{formatCurrency(contrato.valorMensal || 0)} mensais</small>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="content-grid single">
        <article className="panel permission-panel">
          <div className="panel-title">
            <div>
              <h2>Matriz de permissoes</h2>
              <p>Visao operacional dos acessos por perfil.</p>
            </div>
            <span>{formatNumber(permissionProfiles.length)} perfis</span>
          </div>

          <div className="permission-matrix-wrap">
            <table className="permission-matrix">
              <thead>
                <tr>
                  <th>Perfil</th>
                  {modules.map((module) => (
                    <th key={module.value}>{module.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {modulePermissionRows.map((row) => (
                  <tr key={row.perfil}>
                    <td>
                      <span className={`pill ${row.perfil.toLowerCase()}`}>{row.perfil}</span>
                    </td>
                    {row.modules.map((module) => (
                      <td key={module.key}>
                        <span className={`permission-dot ${module.allowed ? "allowed" : "blocked"}`}>
                          {module.allowed ? "Sim" : "Nao"}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="critical-permissions">
            {criticalPermissions.map((permission) => (
              <div key={permission.label}>
                <span>{permission.label}</span>
                <strong>{permission.profiles.join(", ")}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="content-grid single">
        <article className="panel orders-panel">
          <div className="panel-title">
            <div>
              <h2>Usuarios e permissoes</h2>
              <p>Controle administrativo por perfil e empresa.</p>
            </div>
            <div className="panel-actions">
              <span>{formatNumber(filteredUsers.length)} de {formatNumber(usuarios.length)} contas</span>
              <button
                className="panel-action-button"
                onClick={openCreateUserForm}
                type="button"
              >
                <Plus size={16} />
                Novo colaborador
              </button>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Perfil</th>
                  <th>Cargo</th>
                  <th>Status</th>
                  <th>Empresa</th>
                  <th>Criacao</th>
                  <th>Acao</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-cell">
                      Nenhum usuario cadastrado.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((usuario) => (
                    <tr key={usuario.id}>
                      <td>
                        <strong>{usuario.nome || usuario.login}</strong>
                        <small>{usuario.login}</small>
                      </td>
                      <td>
                        {usuario.perfil === "ADMIN" ? (
                          <span className={`pill ${String(usuario.perfil || "").toLowerCase()}`}>
                            {usuario.perfil}
                          </span>
                        ) : (
                          <select
                            className="table-profile-select"
                            disabled={savingProfileId === usuario.id}
                            value={usuario.perfil || "VENDEDOR"}
                            onChange={(event) => handleProfileChange(usuario, event.target.value)}
                          >
                            {editableProfiles.map((perfil) => (
                              <option key={perfil} value={perfil}>
                                {perfil}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td>
                        <strong>{usuario.cargo || "-"}</strong>
                        <small>{usuario.departamento || "Sem departamento"}</small>
                      </td>
                      <td>
                        <span className={`pill ${usuario.bloqueado ? "cancelado" : "aprovado"}`}>
                          {usuario.bloqueado ? "BLOQUEADO" : usuario.ativo === false ? "INATIVO" : "ATIVO"}
                        </span>
                      </td>
                      <td>
                        <strong>{usuario.empresa || "-"}</strong>
                        <small>{usuario.filial || "Empresa / sem filial"}</small>
                      </td>
                      <td>{formatDate(usuario.dataCriacao)}</td>
                      <td>
                        <div className="table-actions">
                          {usuario.perfil !== "ADMIN" && (
                            <button
                              className="table-icon-button"
                              onClick={() => openEditUserForm(usuario)}
                              title="Editar colaborador"
                              type="button"
                            >
                              <Pencil size={15} />
                            </button>
                          )}
                          {usuario.perfil !== "ADMIN" && (
                            <button
                              className="table-icon-button"
                              onClick={() => openPermissionEditor(usuario)}
                              title="Permissoes manuais"
                              type="button"
                            >
                              <ShieldCheck size={15} />
                            </button>
                          )}
                          {usuario.perfil !== "ADMIN" && (
                            <button
                              className="table-icon-button"
                              disabled={savingAccessId === usuario.id}
                              onClick={() =>
                                handleAccessChange(usuario, usuario.ativo === false || usuario.bloqueado)
                              }
                              title={usuario.ativo === false || usuario.bloqueado ? "Conceder acesso" : "Revogar acesso"}
                              type="button"
                            >
                              {savingAccessId === usuario.id ? (
                                <Loader2 className="spin" size={15} />
                              ) : usuario.ativo === false || usuario.bloqueado ? (
                                <CheckCircle2 size={15} />
                              ) : (
                                <LockKeyhole size={15} />
                              )}
                            </button>
                          )}
                          {usuario.perfil === "ADMIN" && "-"}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {selectedPermissionUser && (
            <div className="permission-editor">
              <div className="panel-title compact">
                <div>
                  <h2>Permissoes manuais</h2>
                  <p>{selectedPermissionUser.nome || selectedPermissionUser.login} usa o perfil {selectedPermissionUser.perfil} como base.</p>
                </div>
                <div className="panel-actions">
                  <button className="report-export secondary" onClick={closePermissionEditor} type="button">
                    <X size={16} />
                    Fechar
                  </button>
                  <button
                    className="panel-action-button"
                    disabled={savingPermissionId === selectedPermissionUser.id}
                    onClick={handlePermissionSave}
                    type="button"
                  >
                    {savingPermissionId === selectedPermissionUser.id ? <Loader2 className="spin" size={16} /> : <ShieldCheck size={16} />}
                    Salvar permissoes
                  </button>
                </div>
              </div>
              <div className="permission-editor-grid">
                <div>
                  <h3>Modulos</h3>
                  <div className="permission-editor-list">
                    {userPermissionModules.map((module) => {
                      const key = modulePermissionKey(module.value);
                      return (
                        <label className="permission-editor-row" key={key}>
                          <span>{module.label}</span>
                          <select
                            value={permissionDraft[key] || "PADRAO"}
                            onChange={(event) => updatePermissionDraft(key, event.target.value)}
                          >
                            <option value="PADRAO">Padrao</option>
                            <option value="LIBERAR">Liberar</option>
                            <option value="BLOQUEAR">Bloquear</option>
                          </select>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h3>Acoes criticas</h3>
                  <div className="permission-editor-list">
                    {userPermissionActions.map((action) => {
                      const key = actionPermissionKey(action.key);
                      return (
                        <label className="permission-editor-row" key={key}>
                          <span>{action.label}</span>
                          <select
                            value={permissionDraft[key] || "PADRAO"}
                            onChange={(event) => updatePermissionDraft(key, event.target.value)}
                          >
                            <option value="PADRAO">Padrao</option>
                            <option value="LIBERAR">Liberar</option>
                            <option value="BLOQUEAR">Bloquear</option>
                          </select>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </article>
      </section>

      <section className="content-grid single">
        <article className="panel">
          <div className="panel-title">
            <div>
              <h2>Ultimas acoes</h2>
              <p>Auditoria de eventos criticos do sistema.</p>
            </div>
            <div className="report-actions">
              <button
                className="report-export"
                disabled={auditRows.length === 0}
                onClick={() => downloadCsv(`nexus-one-auditoria-${getLocalDateKey()}.csv`, auditRows)}
                type="button"
              >
                <Download size={17} />
                CSV
              </button>
              <button
                className="report-export secondary"
                disabled={auditRows.length === 0}
                onClick={() => printRowsDocument("Auditoria administrativa", auditRows, session?.empresa || "Nexus One")}
                type="button"
              >
                <Printer size={17} />
                PDF
              </button>
            </div>
          </div>

          <div className="audit-filters">
            <label>
              <span>Busca</span>
              <input
                value={auditFilter.busca}
                onChange={(event) => setAuditFilter((current) => ({ ...current, busca: event.target.value }))}
                placeholder="Usuario, filial, descricao ou registro"
              />
            </label>
            <label>
              <span>Modulo</span>
              <select
                value={auditFilter.modulo}
                onChange={(event) => setAuditFilter((current) => ({ ...current, modulo: event.target.value }))}
              >
                {auditModules.map((modulo) => (
                  <option key={modulo} value={modulo}>
                    {modulo === "TODOS" ? "Todos" : modulo}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Acao</span>
              <select
                value={auditFilter.acao}
                onChange={(event) => setAuditFilter((current) => ({ ...current, acao: event.target.value }))}
              >
                {auditActions.map((acao) => (
                  <option key={acao} value={acao}>
                    {acao === "TODOS" ? "Todas" : acao}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Inicio</span>
              <input
                type="date"
                value={auditFilter.inicio}
                onChange={(event) => setAuditFilter((current) => ({ ...current, inicio: event.target.value }))}
              />
            </label>
            <label>
              <span>Fim</span>
              <input
                type="date"
                value={auditFilter.fim}
                onChange={(event) => setAuditFilter((current) => ({ ...current, fim: event.target.value }))}
              />
            </label>
            <button
              disabled={
                !auditFilter.busca &&
                auditFilter.modulo === "TODOS" &&
                auditFilter.acao === "TODOS" &&
                !auditFilter.inicio &&
                !auditFilter.fim
              }
              onClick={() => setAuditFilter({ busca: "", modulo: "TODOS", acao: "TODOS", inicio: "", fim: "" })}
              type="button"
            >
              <X size={16} />
              Limpar
            </button>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Usuario</th>
                  <th>Filial</th>
                  <th>Modulo</th>
                  <th>Acao</th>
                  <th>Descricao</th>
                </tr>
              </thead>
              <tbody>
                {filteredAudit.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-cell">
                      Nenhum evento de auditoria registrado.
                    </td>
                  </tr>
                ) : (
                  pagedAudit.map((evento) => (
                    <tr key={evento.id}>
                      <td>{formatDate(evento.dataEvento)}</td>
                      <td>
                        <strong>{evento.usuarioLogin || "-"}</strong>
                        <small>{evento.perfil || "Sem perfil"}</small>
                      </td>
                      <td>{getAuditUserBranch(evento)}</td>
                      <td>{evento.modulo}</td>
                      <td>
                        <span className="pill aprovado">{evento.acao}</span>
                      </td>
                      <td>{evento.descricao || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="table-pagination">
            <button
              disabled={currentAuditPage === 0}
              onClick={() => setAuditPage((page) => Math.max(page - 1, 0))}
              type="button"
            >
              Anterior
            </button>
            <span>
              Pagina {currentAuditPage + 1} de {auditTotalPages}
            </span>
            <button
              disabled={currentAuditPage >= auditTotalPages - 1}
              onClick={() => setAuditPage((page) => Math.min(page + 1, auditTotalPages - 1))}
              type="button"
            >
              Proximo
            </button>
          </div>
        </article>
      </section>

      {message && <p className={`form-message ${message.type}`}>{message.text}</p>}

      {showUserForm && (
        <div className="modal-backdrop" role="presentation">
        <aside className="panel modal-panel collaborator-modal">
          <div className="panel-title compact">
            <div>
              <h2>{editingUser ? "Editar colaborador" : "Novo colaborador"}</h2>
              <p>{editingUser ? "Atualize perfil, cargo e dados profissionais." : "Cadastro completo com acesso, cargo e dados profissionais."}</p>
            </div>
            <button
              className="modal-close"
              onClick={closeUserForm}
              title="Fechar"
              type="button"
            >
              <X size={18} />
            </button>
          </div>

          <form className="compact-form" onSubmit={handleSubmit}>
            <div className="form-section-title">Acesso</div>
            <label className="form-control">
              <span>Nome</span>
              <input
                value={form.nome}
                onChange={(event) => updateForm("nome", event.target.value)}
                placeholder="Nome completo"
              />
            </label>

            <label className="form-control">
              <span>Login</span>
              <input
                value={form.login}
                onChange={(event) => updateForm("login", event.target.value)}
                placeholder="usuario.login"
              />
            </label>

            <label className="form-control">
              <span>{editingUser ? "Nova senha" : "Senha inicial"}</span>
              <input
                type="password"
                value={form.senha}
                onChange={(event) => updateForm("senha", event.target.value)}
                placeholder={editingUser ? "Deixe em branco para manter" : "Minimo 6 caracteres"}
              />
            </label>

            <label className="form-control">
              <span>Perfil</span>
              <select
                value={form.perfil}
                onChange={(event) => updateForm("perfil", event.target.value)}
              >
                <option value="VENDEDOR">Vendedor</option>
                <option value="OPERADOR_CAIXA">Operador(a) de caixa</option>
                <option value="ESTOQUISTA">Estoquista</option>
                <option value="FINANCEIRO">Financeiro</option>
                <option value="GERENTE">Gerente</option>
              </select>
            </label>

            <label className="form-control">
              <span>Filial</span>
              <select
                value={form.filialId}
                onChange={(event) => updateForm("filialId", event.target.value)}
              >
                <option value="">Empresa / sem filial</option>
                {filiais.map((filial) => (
                  <option key={filial.id} value={filial.id}>
                    {filial.matriz ? "Matriz" : "Filial"} - {filial.nome}
                  </option>
                ))}
              </select>
            </label>

            <div className="form-section-title">Dados profissionais</div>
            <div className="finance-form-row">
              <label className="form-control">
                <span>Cargo</span>
                <input
                  value={form.cargo}
                  onChange={(event) => updateForm("cargo", event.target.value)}
                  placeholder="Ex: Gerente de vendas"
                />
              </label>
              <label className="form-control">
                <span>Departamento</span>
                <input
                  value={form.departamento}
                  onChange={(event) => updateForm("departamento", event.target.value)}
                  placeholder="Ex: Comercial"
                />
              </label>
            </div>

            <div className="finance-form-row">
              <label className="form-control">
                <span>Salario</span>
                <input
                  min="0"
                  step="0.01"
                  type="number"
                  value={form.salario}
                  onChange={(event) => updateForm("salario", event.target.value)}
                  placeholder="0,00"
                />
              </label>
              <label className="form-control">
                <span>Data inicio</span>
                <input
                  type="date"
                  value={form.dataInicio}
                  onChange={(event) => updateForm("dataInicio", event.target.value)}
                />
              </label>
            </div>

            <div className="finance-form-row">
              <label className="form-control">
                <span>Meta de vendas</span>
                <input
                  min="0"
                  step="0.01"
                  type="number"
                  value={form.metaVendas}
                  onChange={(event) => updateForm("metaVendas", event.target.value)}
                  placeholder="0,00"
                />
              </label>
            </div>

            <div className="form-section-title">Contato</div>
            <div className="finance-form-row">
              <label className="form-control">
                <span>Telefone</span>
                <input
                  value={form.telefone}
                  onChange={(event) => updateForm("telefone", event.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </label>
              <label className="form-control">
                <span>Documento</span>
                <input
                  value={form.documento}
                  onChange={(event) => updateForm("documento", event.target.value)}
                  placeholder="CPF ou documento"
                />
              </label>
            </div>

            <label className="form-control">
              <span>Email</span>
              <input
                value={form.email}
                onChange={(event) => updateForm("email", event.target.value)}
                placeholder="colaborador@empresa.com"
              />
            </label>

            {message && <p className={`form-message ${message.type}`}>{message.text}</p>}

            <button className="checkout-button" disabled={saving} type="submit">
              {saving ? <Loader2 className="spin" size={17} /> : <ShieldCheck size={17} />}
              {saving ? "Salvando..." : editingUser ? "Atualizar colaborador" : "Salvar colaborador"}
            </button>
          </form>
        </aside>
        </div>
      )}
    </div>
  );
}

function CollaboratorsDashboard({ data }) {
  const [search, setSearch] = useState("");
  const [profileFilter, setProfileFilter] = useState("TODOS");
  const [branchFilter, setBranchFilter] = useState("TODAS");
  const usuarios = asList(data?.usuarios || data);
  const filiais = asList(data?.filiais);
  const perfis = ["TODOS", ...Array.from(new Set(usuarios.map((usuario) => usuario.perfil).filter(Boolean)))];
  const normalizedSearch = search.trim().toLowerCase();
  const selectedBranchLabel = branchFilter === "TODAS"
    ? "Todas as filiais"
    : branchFilter === "EMPRESA"
      ? "Empresa / sem filial"
      : filiais.find((filial) => String(filial.id) === branchFilter)?.nome || "Filial";

  const filteredUsers = usuarios.filter((usuario) => {
    const matchesProfile = profileFilter === "TODOS" || usuario.perfil === profileFilter;
    const matchesBranch = branchFilter === "TODAS"
      || (branchFilter === "EMPRESA" ? !usuario.filialId : String(usuario.filialId || "") === branchFilter);
    const searchable = [
      usuario.nome,
      usuario.login,
      usuario.perfil,
      usuario.filial,
      usuario.cargo,
      usuario.departamento,
      usuario.telefone,
      usuario.email,
      usuario.empresa,
    ].filter(Boolean).join(" ").toLowerCase();

    return matchesProfile && matchesBranch && (!normalizedSearch || searchable.includes(normalizedSearch));
  });
  const ativos = filteredUsers.filter((usuario) => usuario.ativo !== false && !usuario.bloqueado).length;
  const bloqueados = filteredUsers.filter((usuario) => usuario.bloqueado).length;
  const gerentes = filteredUsers.filter((usuario) => usuario.perfil === "GERENTE").length;
  const semFilial = usuarios.filter((usuario) => usuario.perfil !== "ADMIN" && !usuario.filialId).length;
  const branchRows = [
    {
      id: "EMPRESA",
      nome: "Empresa / sem filial",
      total: usuarios.filter((usuario) => !usuario.filialId).length,
      ativos: usuarios.filter((usuario) => !usuario.filialId && usuario.ativo !== false && !usuario.bloqueado).length,
    },
    ...filiais.map((filial) => ({
      id: filial.id,
      nome: filial.nome,
      total: usuarios.filter((usuario) => String(usuario.filialId || "") === String(filial.id)).length,
      ativos: usuarios.filter((usuario) => String(usuario.filialId || "") === String(filial.id) && usuario.ativo !== false && !usuario.bloqueado).length,
    })),
  ];

  return (
    <div className="dashboard-view">
      <section className="kpi-grid">
        <KpiCard
          icon={UsersRound}
          label="Colaboradores"
          value={formatNumber(filteredUsers.length)}
          detail={selectedBranchLabel}
        />
        <KpiCard
          icon={CheckCircle2}
          label="Ativos"
          value={formatNumber(ativos)}
          detail="Usuarios liberados para operar"
        />
        <KpiCard
          icon={ShieldCheck}
          label="Gerentes"
          value={formatNumber(gerentes)}
          detail="Perfis com visao ampliada"
        />
        <KpiCard
          icon={AlertTriangle}
          label="Sem filial"
          value={formatNumber(semFilial)}
          detail="Colaboradores operacionais sem loja"
          tone={semFilial ? "warning" : "success"}
        />
      </section>

      <section className="panel account-plan-summary">
        <div className="account-plan-head">
          <div>
            <h3>Filtro operacional</h3>
            <p>Veja equipe, perfis e acessos por filial.</p>
          </div>
          <div className="account-plan-actions">
            <label className="commission-config-control">
              <span>Filial</span>
              <select value={branchFilter} onChange={(event) => setBranchFilter(event.target.value)}>
                <option value="TODAS">Todas as filiais</option>
                <option value="EMPRESA">Empresa / sem filial</option>
                {filiais.map((filial) => (
                  <option key={filial.id} value={filial.id}>
                    {filial.matriz ? "Matriz" : "Filial"} - {filial.nome}
                  </option>
                ))}
              </select>
            </label>
            <label className="commission-config-control">
              <span>Perfil</span>
              <select value={profileFilter} onChange={(event) => setProfileFilter(event.target.value)}>
                {perfis.map((perfil) => (
                  <option key={perfil} value={perfil}>
                    {perfil === "TODOS" ? "Todos os perfis" : perfil}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <div className="account-plan-grid compact-catalog-grid">
          {branchRows.slice(0, 8).map((row) => (
            <button
              className={branchFilter === row.id ? "account-plan-item active" : "account-plan-item"}
              key={row.id}
              onClick={() => setBranchFilter(row.id)}
              type="button"
            >
              <span>{row.nome}</span>
              <strong>{formatNumber(row.total)} colaborador(es)</strong>
              <small>{formatNumber(row.ativos)} ativos</small>
            </button>
          ))}
        </div>
      </section>

      <section className="content-grid single">
        <article className="panel">
          <div className="panel-title compact">
            <div>
              <h2>Equipe da empresa</h2>
              <p>Visualizacao rapida dos colaboradores, perfis e status de acesso.</p>
            </div>
            <span className="counter">{formatNumber(filteredUsers.length)} de {formatNumber(usuarios.length)} registros</span>
          </div>

          <div className="table-toolbar">
            <div className="search-input">
              <Search size={18} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nome, login, perfil ou filial"
              />
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Colaborador</th>
                  <th>Perfil</th>
                  <th>Cargo</th>
                  <th>Contato</th>
                  <th>Filial</th>
                  <th>Status</th>
                  <th>Inicio</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-cell">
                      Nenhum colaborador encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((usuario) => (
                    <tr key={usuario.id}>
                      <td>
                        <strong>{usuario.nome || usuario.login}</strong>
                        <small>{usuario.login}</small>
                      </td>
                      <td>
                        <span className={`pill ${String(usuario.perfil || "").toLowerCase()}`}>
                          {usuario.perfil || "-"}
                        </span>
                      </td>
                      <td>
                        <strong>{usuario.cargo || "-"}</strong>
                        <small>{usuario.departamento || "Sem departamento"}</small>
                      </td>
                      <td>
                        <strong>{usuario.telefone || "-"}</strong>
                        <small>{usuario.email || "Sem email"}</small>
                      </td>
                      <td>
                        <strong>{usuario.filial || "Empresa / sem filial"}</strong>
                        <small>{usuario.empresa || "-"}</small>
                      </td>
                      <td>
                        <span className={`pill ${usuario.bloqueado ? "cancelado" : "aprovado"}`}>
                          {usuario.bloqueado ? "BLOQUEADO" : usuario.ativo === false ? "INATIVO" : "ATIVO"}
                        </span>
                      </td>
                      <td>{formatDate(usuario.dataInicio || usuario.dataCriacao)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  );
}

function ReportDashboard({ data, session }) {
  const [salesReportPeriod, setSalesReportPeriod] = useState("diario");
  const [salesReportFilter, setSalesReportFilter] = useState({ inicio: "", fim: "" });
  const [reportBranchFilter, setReportBranchFilter] = useState("TODAS");
  const pedidos = asList(data?.pedidos);
  const clientes = asList(data?.clientes);
  const produtos = asList(data?.produtos);
  const financeiro = asList(data?.financeiro);
  const entregas = asList(data?.entregas);
  const rotas = asList(data?.rotas);
  const usuarios = asList(data?.usuarios);
  const filiais = asList(data?.filiais);
  const canSeeFinance = canAccessModule(session, "financeiro");
  const canSeeLogistics = canAccessModule(session, "logistica");
  const canSeeCollaborators = canAccessModule(session, "colaboradores");
  const completedSaleStatuses = new Set(["FINALIZADA", "RECEBIDO", "ENTREGUE", "CONCLUIDO"]);
  const salesReportOptions = [
    { value: "diario", label: "Diario" },
    { value: "semanal", label: "Semanal" },
    { value: "mensal", label: "Mensal" },
  ];

  function getSalesPeriodKey(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    if (salesReportPeriod === "mensal") {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    }

    if (salesReportPeriod === "semanal") {
      const start = new Date(date);
      const weekday = start.getDay() || 7;
      start.setDate(start.getDate() - weekday + 1);
      return getLocalDateKey(start);
    }

    return getLocalDateKey(date);
  }

  function getSalesPeriodLabel(key) {
    if (salesReportPeriod === "mensal") return formatMonth(key);
    if (salesReportPeriod === "semanal") return `Semana de ${formatShortDate(key)}`;
    return formatDate(key);
  }

  function matchesReportBranch(item) {
    if (reportBranchFilter === "TODAS") return true;
    if (reportBranchFilter === "EMPRESA") return !item?.filialId;
    return String(item?.filialId || "") === reportBranchFilter;
  }

  const selectedReportBranchLabel = reportBranchFilter === "TODAS"
    ? "Todas as filiais"
    : reportBranchFilter === "EMPRESA"
      ? "Empresa / sem filial"
      : filiais.find((filial) => String(filial.id) === reportBranchFilter)?.nome || "Filial";

  const filteredPedidos = pedidos.filter(matchesReportBranch);
  const filteredFinanceiro = financeiro.filter(matchesReportBranch);
  const filteredUsuarios = usuarios.filter(matchesReportBranch);
  const filteredEntregas = entregas.filter(matchesReportBranch);
  const filteredRotas = rotas.filter((rota) => {
    if (reportBranchFilter === "TODAS") return true;
    return filteredEntregas.some((entrega) => String(entrega.rotaId || "") === String(rota.id || ""));
  });
  function getReportRouteBranchLabel(rota) {
    const routeBranches = Array.from(new Set(
      filteredEntregas
        .filter((entrega) => String(entrega.rotaId || "") === String(rota.id || ""))
        .map((entrega) => entrega.filial || "Empresa / sem filial"),
    ));
    if (routeBranches.length === 0) return "Sem entregas";
    return routeBranches.length === 1 ? routeBranches[0] : `${formatNumber(routeBranches.length)} filiais`;
  }

  const vendasConcluidas = filteredPedidos.filter((pedido) => {
    if (!completedSaleStatuses.has(String(pedido.status || ""))) return false;

    const saleKey = getLocalDateKey(pedido.data);
    if (!saleKey) return false;
    if (salesReportFilter.inicio && saleKey < salesReportFilter.inicio) return false;
    if (salesReportFilter.fim && saleKey > salesReportFilter.fim) return false;
    return true;
  });
  const salesReportRows = Array.from(
    vendasConcluidas.reduce((acc, pedido) => {
      const key = getSalesPeriodKey(pedido.data);
      if (!key) return acc;

      const current = acc.get(key) || {
        periodo: getSalesPeriodLabel(key),
        vendas: 0,
        total: 0,
        formasPagamento: {},
      };
      const metodo = getPaymentMethodLabel(pedido.metodoPagamento);
      const valor = Number(pedido.valor || 0);

      current.vendas += 1;
      current.total += valor;
      current.formasPagamento[metodo] = (current.formasPagamento[metodo] || 0) + valor;
      acc.set(key, current);
      return acc;
    }, new Map()).entries(),
  )
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([, row]) => ({
      periodo: row.periodo,
      vendas: row.vendas,
      total: row.total,
      formasPagamento: Object.entries(row.formasPagamento)
        .map(([metodo, valor]) => `${metodo}: ${formatCurrency(valor)}`)
        .join(" | "),
    }));
  const salesReportTotal = salesReportRows.reduce((total, row) => total + row.total, 0);
  const salesReportCount = salesReportRows.reduce((total, row) => total + row.vendas, 0);
  const branchReportRows = Array.from(
    vendasConcluidas.reduce((acc, pedido) => {
      const key = pedido.filialId || "EMPRESA";
      const current = acc.get(key) || {
        filial: pedido.filial || "Empresa / sem filial",
        vendas: 0,
        total: 0,
      };
      current.vendas += 1;
      current.total += Number(pedido.valor || 0);
      acc.set(key, current);
      return acc;
    }, new Map()).values(),
  )
    .sort((a, b) => b.total - a.total)
    .map((row) => ({
      Filial: row.filial,
      Vendas: formatNumber(row.vendas),
      Receita: formatCurrency(row.total),
      "Ticket medio": formatCurrency(row.vendas > 0 ? row.total / row.vendas : 0),
    }));
  const financeBranchReportRows = canSeeFinance
    ? Array.from(
        filteredFinanceiro.reduce((acc, item) => {
          const key = item.filialId || "EMPRESA";
          const current = acc.get(key) || {
            filial: item.filial || "Empresa / sem filial",
            receitas: 0,
            despesas: 0,
            pendentes: 0,
          };
          if (item.tipo === "RECEITA" && item.status === "APROVADO") current.receitas += Number(item.valor || 0);
          if (item.tipo === "DESPESA" && item.status === "APROVADO") current.despesas += Number(item.valor || 0);
          if (item.status === "PENDENTE") current.pendentes += Number(item.valor || 0);
          acc.set(key, current);
          return acc;
        }, new Map()).values(),
      )
        .sort((a, b) => (b.receitas - b.despesas) - (a.receitas - a.despesas))
        .map((row) => ({
          Filial: row.filial,
          Receitas: formatCurrency(row.receitas),
          Despesas: formatCurrency(row.despesas),
          Resultado: formatCurrency(row.receitas - row.despesas),
          Pendentes: formatCurrency(row.pendentes),
        }))
    : [];
  const collaboratorBranchReportRows = canSeeCollaborators
    ? Array.from(
        filteredUsuarios.reduce((acc, usuario) => {
          const key = usuario.filialId || "EMPRESA";
          const current = acc.get(key) || {
            filial: usuario.filial || "Empresa / sem filial",
            total: 0,
            ativos: 0,
            bloqueados: 0,
            perfis: {},
          };
          current.total += 1;
          if (usuario.ativo !== false && !usuario.bloqueado) current.ativos += 1;
          if (usuario.bloqueado || usuario.ativo === false) current.bloqueados += 1;
          const perfil = usuario.perfil || "SEM_PERFIL";
          current.perfis[perfil] = (current.perfis[perfil] || 0) + 1;
          acc.set(key, current);
          return acc;
        }, new Map()).values(),
      )
        .sort((a, b) => b.total - a.total)
        .map((row) => ({
          Filial: row.filial,
          Colaboradores: formatNumber(row.total),
          Ativos: formatNumber(row.ativos),
          Bloqueados: formatNumber(row.bloqueados),
          Perfis: Object.entries(row.perfis)
            .map(([perfil, total]) => `${perfil}: ${formatNumber(total)}`)
            .join(" | "),
        }))
    : [];

  const reportCards = [
    {
      key: "pedidos",
      title: "Vendas",
      icon: ShoppingCart,
      count: filteredPedidos.length,
      detail: selectedReportBranchLabel,
      rows: filteredPedidos.map((item) => ({
        numero: item.numero,
        cliente: item.cliente,
        filial: item.filial || "Empresa",
        status: item.status,
        valor: item.valor,
        data: item.data,
      })),
    },
    {
      key: "clientes",
      title: "Clientes",
      icon: UserRound,
      count: clientes.length,
      detail: "Carteira comercial",
      rows: clientes.map((item) => ({
        nome: item.nome,
        cpf: item.cpf,
        email: item.email,
        telefone: item.telefone,
      })),
    },
    {
      key: "produtos",
      title: "Produtos",
      icon: Boxes,
      count: produtos.length,
      detail: "Catalogo ativo",
      rows: produtos.map((item) => ({
        nome: item.nome,
        codigoBarras: item.codigoBarras,
        precoVenda: item.precoVenda,
        precoComDesconto: item.precoComDesconto,
        lucro: item.lucro,
      })),
    },
    canSeeFinance && {
      key: "financeiro",
      title: "Financeiro",
      icon: WalletCards,
      count: filteredFinanceiro.length,
      detail: selectedReportBranchLabel,
      rows: filteredFinanceiro.map((item) => ({
        descricao: item.descricao,
        filial: item.filial || "Empresa",
        tipo: item.tipo,
        status: item.status,
        metodoPagamento: item.metodoPagamento,
        valor: item.valor,
      })),
    },
    canSeeLogistics && {
      key: "logistica",
      title: "Logistica",
      icon: Truck,
      count: filteredEntregas.length + filteredRotas.length,
      detail: `${formatNumber(filteredEntregas.length)} entregas / ${formatNumber(filteredRotas.length)} rotas`,
      rows: [
        ...filteredEntregas.map((item) => ({
          tipo: "Entrega",
          codigo: item.numeroPedido || item.id,
          filial: item.filial || "Empresa / sem filial",
          cliente: item.clienteNome || "-",
          endereco: item.enderecoEntrega || "-",
          status: item.status,
          prioridade: item.prioridade,
          valor: item.totalPedido,
        })),
        ...filteredRotas.map((item) => ({
          tipo: "Rota",
          codigo: item.nome,
          filial: getReportRouteBranchLabel(item),
          cliente: "-",
          endereco: "-",
          status: item.status,
          prioridade: item.dataRota,
          valor: item.custoEstimado,
        })),
      ],
    },
    canSeeCollaborators && {
      key: "colaboradores",
      title: "Colaboradores",
      icon: UsersRound,
      count: filteredUsuarios.length,
      detail: selectedReportBranchLabel,
      rows: filteredUsuarios.map((item) => ({
        nome: item.nome || item.login,
        login: item.login,
        filial: item.filial || "Empresa / sem filial",
        perfil: item.perfil,
        cargo: item.cargo,
        departamento: item.departamento,
        status: item.bloqueado ? "BLOQUEADO" : item.ativo === false ? "INATIVO" : "ATIVO",
        telefone: item.telefone,
        email: item.email,
        dataInicio: item.dataInicio || item.dataCriacao,
      })),
    },
  ].filter(Boolean);

  const totalRegistros = reportCards.reduce((total, card) => total + card.count, 0);
  const exportaveis = reportCards.filter((card) => card.rows.length > 0).length;

  return (
    <div className="dashboard-view">
      <section className="kpi-grid">
        <KpiCard
          icon={FileText}
          label="Relatorios"
          value={formatNumber(reportCards.length)}
          detail="Areas disponiveis para este perfil"
          tone="blue"
        />
        <KpiCard
          icon={ClipboardList}
          label="Registros"
          value={formatNumber(totalRegistros)}
          detail="Dados prontos para analise"
          tone="green"
        />
        <KpiCard
          icon={Download}
          label="Exportaveis"
          value={formatNumber(exportaveis)}
          detail="Bases com dados para CSV"
          tone="amber"
        />
        <KpiCard
          icon={ShieldCheck}
          label="Filial"
          value={selectedReportBranchLabel}
          detail="Filtro consolidado dos relatorios"
          tone="dark"
        />
      </section>

      <section className="panel sales-period-report">
        <div className="panel-title">
          <div>
            <h2>Relatorio de vendas</h2>
            <p>Resumo diario, semanal ou mensal das vendas recebidas.</p>
          </div>
          <div className="chart-tabs compact-tabs" aria-label="Periodo do relatorio de vendas">
            {salesReportOptions.map((option) => (
              <button
                className={salesReportPeriod === option.value ? "active" : ""}
                key={option.value}
                onClick={() => setSalesReportPeriod(option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="sales-period-filter">
          <label>
            <span>Filial</span>
            <select
              value={reportBranchFilter}
              onChange={(event) => setReportBranchFilter(event.target.value)}
            >
              <option value="TODAS">Todas as filiais</option>
              <option value="EMPRESA">Empresa / sem filial</option>
              {filiais.map((filial) => (
                <option key={filial.id} value={filial.id}>
                  {filial.matriz ? "Matriz" : "Filial"} - {filial.nome}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Inicio</span>
            <input
              type="date"
              value={salesReportFilter.inicio}
              onChange={(event) =>
                setSalesReportFilter((current) => ({ ...current, inicio: event.target.value }))
              }
            />
          </label>
          <label>
            <span>Fim</span>
            <input
              type="date"
              value={salesReportFilter.fim}
              onChange={(event) =>
                setSalesReportFilter((current) => ({ ...current, fim: event.target.value }))
              }
            />
          </label>
          <button
            disabled={!salesReportFilter.inicio && !salesReportFilter.fim}
            onClick={() => setSalesReportFilter({ inicio: "", fim: "" })}
            type="button"
          >
            <X size={16} />
            Limpar periodo
          </button>
        </div>

        <div className="sales-period-summary">
          <div>
            <span>Total recebido</span>
            <strong>{formatCurrency(salesReportTotal)}</strong>
          </div>
          <div>
            <span>Vendas</span>
            <strong>{formatNumber(salesReportCount)}</strong>
          </div>
          <div className="report-actions">
            <button
              className="report-export"
              disabled={salesReportRows.length === 0}
              onClick={() => downloadCsv(`nexus-one-vendas-${salesReportPeriod}.csv`, salesReportRows)}
              type="button"
            >
              <Download size={17} />
              CSV
            </button>
            <button
              className="report-export secondary"
              disabled={salesReportRows.length === 0}
              onClick={() => printRowsDocument(`Relatorio de vendas ${salesReportPeriod}`, salesReportRows, session?.empresa || "Nexus One")}
              type="button"
            >
              <Printer size={17} />
              PDF
            </button>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Periodo</th>
                <th>Vendas</th>
                <th>Total</th>
                <th>Formas de pagamento</th>
              </tr>
            </thead>
            <tbody>
              {salesReportRows.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-cell">
                    Nenhuma venda recebida para montar o relatorio.
                  </td>
                </tr>
              ) : (
                salesReportRows.map((row) => (
                  <tr key={row.periodo}>
                    <td>{row.periodo}</td>
                    <td>{formatNumber(row.vendas)}</td>
                    <td>{formatCurrency(row.total)}</td>
                    <td>{row.formasPagamento || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="analytics-grid">
        <article className="panel">
          <div className="panel-title compact">
            <div>
              <h2>Vendas por filial</h2>
              <p>Consolidado do periodo e filial selecionados.</p>
            </div>
            <div className="account-plan-actions">
              <button
                disabled={branchReportRows.length === 0}
                onClick={() => downloadCsv(`nexus-one-vendas-filiais-${getLocalDateKey()}.csv`, branchReportRows)}
                type="button"
              >
                <Download size={15} />
                CSV
              </button>
              <button
                disabled={branchReportRows.length === 0}
                onClick={() => printRowsDocument("Vendas por filial", branchReportRows, session?.empresa || "Nexus One")}
                type="button"
              >
                <Printer size={15} />
                PDF
              </button>
            </div>
          </div>
          <div className="table-wrap compact-table">
            <table>
              <tbody>
                {branchReportRows.length === 0 ? (
                  <tr>
                    <td className="empty-cell">Nenhuma venda encontrada para filial/periodo.</td>
                  </tr>
                ) : (
                  branchReportRows.map((row) => (
                    <tr key={row.Filial}>
                      <td><strong>{row.Filial}</strong></td>
                      <td>{row.Vendas} venda(s)</td>
                      <td>{row.Receita}</td>
                      <td>{row["Ticket medio"]}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>

        {canSeeFinance && (
          <article className="panel">
            <div className="panel-title compact">
              <div>
                <h2>Financeiro por filial</h2>
                <p>Receitas, despesas, resultado e pendencias.</p>
              </div>
              <div className="account-plan-actions">
                <button
                  disabled={financeBranchReportRows.length === 0}
                  onClick={() => downloadCsv(`nexus-one-financeiro-filiais-${getLocalDateKey()}.csv`, financeBranchReportRows)}
                  type="button"
                >
                  <Download size={15} />
                  CSV
                </button>
                <button
                  disabled={financeBranchReportRows.length === 0}
                  onClick={() => printRowsDocument("Financeiro por filial", financeBranchReportRows, session?.empresa || "Nexus One")}
                  type="button"
                >
                  <Printer size={15} />
                  PDF
                </button>
              </div>
            </div>
            <div className="table-wrap compact-table">
              <table>
                <tbody>
                  {financeBranchReportRows.length === 0 ? (
                    <tr>
                      <td className="empty-cell">Nenhuma movimentacao encontrada para filial.</td>
                    </tr>
                  ) : (
                    financeBranchReportRows.map((row) => (
                      <tr key={row.Filial}>
                        <td><strong>{row.Filial}</strong></td>
                        <td>{row.Receitas}</td>
                        <td>{row.Despesas}</td>
                        <td>{row.Resultado}</td>
                        <td>{row.Pendentes}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </article>
        )}

        {canSeeCollaborators && (
          <article className="panel">
            <div className="panel-title compact">
              <div>
                <h2>Colaboradores por filial</h2>
                <p>Equipe, acessos ativos e perfis por loja.</p>
              </div>
              <div className="account-plan-actions">
                <button
                  disabled={collaboratorBranchReportRows.length === 0}
                  onClick={() => downloadCsv(`nexus-one-colaboradores-filiais-${getLocalDateKey()}.csv`, collaboratorBranchReportRows)}
                  type="button"
                >
                  <Download size={15} />
                  CSV
                </button>
                <button
                  disabled={collaboratorBranchReportRows.length === 0}
                  onClick={() => printRowsDocument("Colaboradores por filial", collaboratorBranchReportRows, session?.empresa || "Nexus One")}
                  type="button"
                >
                  <Printer size={15} />
                  PDF
                </button>
              </div>
            </div>
            <div className="table-wrap compact-table">
              <table>
                <tbody>
                  {collaboratorBranchReportRows.length === 0 ? (
                    <tr>
                      <td className="empty-cell">Nenhum colaborador encontrado para filial.</td>
                    </tr>
                  ) : (
                    collaboratorBranchReportRows.map((row) => (
                      <tr key={row.Filial}>
                        <td><strong>{row.Filial}</strong></td>
                        <td>{row.Colaboradores} colaborador(es)</td>
                        <td>{row.Ativos} ativos</td>
                        <td>{row.Bloqueados} bloqueados/inativos</td>
                        <td>{row.Perfis || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </article>
        )}
      </section>

      <section className="reports-grid">
        {reportCards.map((card) => {
          const Icon = card.icon;
          return (
            <article className="panel report-card" key={card.key}>
              <div className="report-card-head">
                <div className="preview-icon">
                  <Icon size={22} />
                </div>
                <div>
                  <h2>{card.title}</h2>
                  <p>{card.detail}</p>
                </div>
              </div>

              <div className="report-card-stat">
                <span>Registros</span>
                <strong>{formatNumber(card.count)}</strong>
              </div>

              <div className="report-actions">
                <button
                  className="report-export"
                  disabled={card.rows.length === 0}
                  onClick={() => downloadCsv(`nexus-one-${card.key}.csv`, card.rows)}
                  type="button"
                >
                  <Download size={17} />
                  CSV
                </button>
                <button
                  className="report-export secondary"
                  disabled={card.rows.length === 0}
                  onClick={() => printRowsDocument(`Relatorio ${card.title}`, card.rows, session?.empresa || "Nexus One")}
                  type="button"
                >
                  <Printer size={17} />
                  PDF
                </button>
              </div>
            </article>
          );
        })}
      </section>

      <section className="panel">
        <div className="panel-title">
          <div>
            <h2>Resumo dos dados</h2>
            <p>Leitura unificada dos endpoints permitidos para este perfil.</p>
          </div>
          <span>{formatNumber(totalRegistros)} registros</span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Area</th>
                <th>Registros</th>
                <th>Status</th>
                <th>Exportacao</th>
              </tr>
            </thead>
            <tbody>
              {reportCards.map((card) => (
                <tr key={card.key}>
                  <td>
                    <strong>{card.title}</strong>
                    <small>{card.detail}</small>
                  </td>
                  <td>{formatNumber(card.count)}</td>
                  <td>
                    <span className={`pill ${card.count > 0 ? "aprovado" : "pendente"}`}>
                      {card.count > 0 ? "COM DADOS" : "VAZIO"}
                    </span>
                  </td>
                  <td>{card.rows.length > 0 ? "CSV disponivel" : "Sem dados"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function ModulePreview({ module, data }) {
  const Icon = module.icon;

  return (
    <div className="module-preview">
      <div className="preview-icon">
        <Icon size={24} />
      </div>
      <h2>{module.label}</h2>
      <p>
        Endpoint conectado com sucesso. Este modulo ja esta pronto para receber
        a tela premium completa.
      </p>
      <div className="preview-stat">
        <span>Dados recebidos</span>
        <strong>{formatNumber(getDataCount(data))}</strong>
      </div>
    </div>
  );
}

function PendingPaymentsPanel({
  canOperate,
  caixa,
  charge,
  generatingCharge,
  filteredPendingOrders,
  onCopyCharge,
  onGenerateCharge,
  onReceiveOrder,
  onSearch,
  onSelectOrder,
  paymentForm,
  onPaymentFormChange,
  pendingSearch,
  pedidosPendentes,
  receivingOrder,
  selectedPendingOrder,
}) {
  return (
    <section className="panel orders-panel">
      <div className="panel-title">
        <div>
          <h2>Pagamentos para receber</h2>
          <p>Pesquise por cliente, produto ou numero e confira o resumo antes de receber.</p>
        </div>
        <span>{formatNumber(filteredPendingOrders.length)} de {formatNumber(pedidosPendentes.length)}</span>
      </div>

      <label className="search-field cash-pending-search">
        <Search size={17} />
        <input
          value={pendingSearch}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Procurar por nome do cliente, produto ou numero"
        />
      </label>

      <div className="cash-receive-grid">
        <div className="pending-order-list">
          {filteredPendingOrders.length === 0 ? (
            <div className="empty-selection compact">Nenhum pagamento pendente encontrado.</div>
          ) : (
            filteredPendingOrders.map((pedido) => (
              <button
                className={String(selectedPendingOrder?.id) === String(pedido.id) ? "pending-order active" : "pending-order"}
                key={pedido.id}
                onClick={() => onSelectOrder(pedido.id)}
                type="button"
              >
                <span>
                  <strong>{pedido.cliente || "Cliente nao informado"}</strong>
                  <small>{pedido.numero || pedido.id}</small>
                </span>
                <em>{formatCurrency(pedido.valor)}</em>
              </button>
            ))
          )}
        </div>

        <aside className="sale-summary">
          {selectedPendingOrder ? (
            <>
              <div className="sale-summary-head">
                <div>
                  <span>Resumo da venda</span>
                  <strong>{selectedPendingOrder.cliente || "Cliente nao informado"}</strong>
                </div>
                <span className="pill pendente">Pendente</span>
              </div>

              <div className="sale-summary-meta">
                <div>
                  <span>Numero</span>
                  <strong>{selectedPendingOrder.numero || selectedPendingOrder.id}</strong>
                </div>
                <div>
                  <span>Vendedor</span>
                  <strong>{selectedPendingOrder.usuario || selectedPendingOrder.vendedor || "-"}</strong>
                </div>
                <div>
                  <span>Pagamento</span>
                  <strong>{selectedPendingOrder.metodoPagamentoDescricao || selectedPendingOrder.metodoPagamento || "-"}</strong>
                </div>
                <div>
                  <span>Filial</span>
                  <strong>{selectedPendingOrder.filial || "Empresa"}</strong>
                </div>
                <div>
                  <span>Data</span>
                  <strong>{formatDate(selectedPendingOrder.data)}</strong>
                </div>
                <div>
                  <span>Entrega</span>
                  <strong>{selectedPendingOrder.tipoEntregaDescricao || selectedPendingOrder.tipoEntrega || "Retirar na loja"}</strong>
                </div>
                <div>
                  <span>Endereco</span>
                  <strong>{selectedPendingOrder.enderecoEntrega || "Loja"}</strong>
                </div>
              </div>

              {selectedPendingOrder.observacaoEntrega && (
                <div className="sale-summary-note">
                  <span>Observacao</span>
                  <strong>{selectedPendingOrder.observacaoEntrega}</strong>
                </div>
              )}

              <div className="sale-summary-items">
                <span>Produtos</span>
                {asList(selectedPendingOrder.itens).length === 0 ? (
                  <div className="empty-selection compact">Itens nao carregados para este pedido.</div>
                ) : (
                  asList(selectedPendingOrder.itens).map((item) => (
                    <div className="sale-summary-item" key={item.id || item.produtoId || item.produto}>
                      <div>
                        <strong>{item.produto || "Produto sem nome"}</strong>
                        <small>{formatNumber(item.quantidade)} un. x {formatCurrency(item.precoUnit)}</small>
                      </div>
                      <em>{formatCurrency(item.subtotal)}</em>
                    </div>
                  ))
                )}
              </div>

              <div className="sale-summary-total">
                <span>Total a receber</span>
                <strong>{formatCurrency(selectedPendingOrder.valor)}</strong>
              </div>

              <div className="cash-payment-panel compact-payment-panel">
                <span>Receber no caixa como</span>
                <div className="cash-payment-options">
                  {cashPaymentOptions.map((option) => (
                    <button
                      className={paymentForm.metodoPagamento === option.value ? "active" : ""}
                      key={option.value}
                      onClick={() =>
                        onPaymentFormChange({
                          metodoPagamento: option.value,
                          parcelas: canInstallmentPayment(option.value) ? paymentForm.parcelas : 1,
                        })
                      }
                      type="button"
                    >
                      <CreditCard size={16} />
                      {option.label}
                    </button>
                  ))}
                </div>
                {canInstallmentPayment(paymentForm.metodoPagamento) && (
                  <label className="form-control">
                    <span>Parcelas</span>
                    <select
                      value={paymentForm.parcelas}
                      onChange={(event) =>
                        onPaymentFormChange({
                          ...paymentForm,
                          parcelas: Number(event.target.value),
                        })
                      }
                    >
                      {Array.from({ length: 12 }, (_, index) => index + 1).map((parcela) => (
                        <option key={parcela} value={parcela}>
                          {parcela}x de {formatCurrency(Number(selectedPendingOrder.valor || 0) / parcela)}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>

              {["PIX", "BOLETO"].includes(paymentForm.metodoPagamento) && (
                <div className="charge-box cash-charge-box">
                  <button
                    className="checkout-button secondary"
                    disabled={!canOperate || !caixa || generatingCharge === selectedPendingOrder.id}
                    onClick={() => onGenerateCharge(selectedPendingOrder.id)}
                    type="button"
                  >
                    {generatingCharge === selectedPendingOrder.id ? <Loader2 className="spin" size={17} /> : <Barcode size={17} />}
                    {generatingCharge === selectedPendingOrder.id
                      ? "Gerando..."
                      : paymentForm.metodoPagamento === "PIX"
                        ? "Gerar Pix"
                        : "Gerar boleto"}
                  </button>

                  {charge && String(charge.pedidoId || "") === String(selectedPendingOrder.id) && (
                    <>
                      <div className="charge-provider">
                        <span>{charge.cobrancaProvedor || "DEMO"}</span>
                        {charge.cobrancaUrl && (
                          <a href={charge.cobrancaUrl} rel="noreferrer" target="_blank">
                            <ArrowUpRight size={15} />
                            Abrir
                          </a>
                        )}
                      </div>

                      {charge.pixCopiaCola && (
                        <>
                          {charge.pixQrCodeUrl && (
                            <img alt="QR Code Pix" className="charge-qr" src={charge.pixQrCodeUrl} />
                          )}
                          <label className="form-control">
                            <span>Pix copia e cola</span>
                            <textarea readOnly value={charge.pixCopiaCola} />
                          </label>
                          <button
                            className="checkout-button secondary"
                            onClick={() => onCopyCharge(charge.pixCopiaCola, "Pix copia e cola")}
                            type="button"
                          >
                            <Copy size={17} />
                            Copiar Pix
                          </button>
                        </>
                      )}

                      {charge.boletoLinhaDigitavel && (
                        <>
                          <label className="form-control">
                            <span>Linha digitavel</span>
                            <textarea readOnly value={charge.boletoLinhaDigitavel} />
                          </label>
                          <button
                            className="checkout-button secondary"
                            onClick={() => onCopyCharge(charge.boletoLinhaDigitavel, "Linha digitavel")}
                            type="button"
                          >
                            <Copy size={17} />
                            Copiar boleto
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              )}

              <button
                className="checkout-button"
                disabled={!canOperate || !caixa || receivingOrder === selectedPendingOrder.id}
                onClick={() => onReceiveOrder(selectedPendingOrder.id)}
                type="button"
              >
                {receivingOrder === selectedPendingOrder.id ? <Loader2 className="spin" size={17} /> : <CreditCard size={17} />}
                {receivingOrder === selectedPendingOrder.id ? "Recebendo..." : "Receber pagamento"}
              </button>
            </>
          ) : (
            <div className="empty-selection">Selecione um pedido pendente para receber.</div>
          )}
        </aside>
      </div>
    </section>
  );
}

function CashRegisterDashboard({ data, session, onRefresh }) {
  const caixa = data?.aberto || null;
  const recentes = asList(data?.recentes);
  const produtos = asList(data?.produtos);
  const clientes = asList(data?.clientes);
  const filiais = asList(data?.filiais);
  const pedidosPendentes = asList(data?.pedidos).filter((pedido) => ["PENDENTE", "SEPARADO"].includes(pedido.status));
  const [pendingSearch, setPendingSearch] = useState("");
  const [selectedPendingOrderId, setSelectedPendingOrderId] = useState("");
  const [cashBranchFilter, setCashBranchFilter] = useState("TODAS");
  const [openForm, setOpenForm] = useState({ valorInicial: "0", observacao: "" });
  const [movementForm, setMovementForm] = useState({
    tipo: "pagamentoRecebido",
    valor: "",
    metodoPagamento: "PIX",
    parcelas: 1,
    descricao: "",
    observacao: "",
  });
  const [closeForm, setCloseForm] = useState({ valorFechamento: "", observacao: "" });
  const [cashAction, setCashAction] = useState("");
  const [cashView, setCashView] = useState(caixa ? "pdv" : "movimentos");
  const [selectedCashReport, setSelectedCashReport] = useState(null);
  const [cashHistoryFilter, setCashHistoryFilter] = useState({
    busca: "",
    status: "TODOS",
    inicio: "",
    fim: "",
  });
  const [saving, setSaving] = useState("");
  const [receivingOrder, setReceivingOrder] = useState("");
  const [generatingCharge, setGeneratingCharge] = useState("");
  const [selectedCashCharge, setSelectedCashCharge] = useState(null);
  const [receivePaymentForm, setReceivePaymentForm] = useState({
    metodoPagamento: "PIX",
    parcelas: 1,
  });
  const [message, setMessage] = useState(
    data?.loadWarning ? { type: "error", text: data.loadWarning } : null,
  );
  const role = normalizePerfil(session.perfil);
  const canOperate = canPerform(session, "operateCash");
  const selectedCashBranchLabel = cashBranchFilter === "TODAS"
    ? "Todas as filiais"
    : cashBranchFilter === "EMPRESA"
      ? "Empresa / sem filial"
      : filiais.find((filial) => String(filial.id) === cashBranchFilter)?.nome || "Filial";
  function matchesCashBranch(item) {
    if (cashBranchFilter === "TODAS") return true;
    if (cashBranchFilter === "EMPRESA") return !item?.filialId;
    return String(item?.filialId || "") === cashBranchFilter;
  }
  const branchScopedPendingOrders = pedidosPendentes.filter(matchesCashBranch);
  const branchScopedCashHistory = recentes.filter(matchesCashBranch);
  const totalEntradasCaixa =
    Number(caixa?.totalVendas || 0) +
    Number(caixa?.totalPagamentosRecebidos || 0) +
    Number(caixa?.totalSuprimentos || 0);
  const todayKey = getLocalDateKey();
  const todayPaymentMovements = asList(caixa?.movimentos).filter((movimento) => {
    const tipo = String(movimento?.tipo || "");
    return ["VENDA", "PAGAMENTO_RECEBIDO"].includes(tipo) && getLocalDateKey(movimento?.dataMovimento) === todayKey;
  });
  const paymentReportRows = Array.from(
    todayPaymentMovements.reduce((acc, movimento) => {
      const method = movimento?.metodoPagamento || "NAO_INFORMADO";
      const current = acc.get(method) || { method, label: getPaymentMethodLabel(method), count: 0, total: 0 };
      current.count += 1;
      current.total += Number(movimento?.valor || 0);
      acc.set(method, current);
      return acc;
    }, new Map()).values(),
  ).sort((a, b) => b.total - a.total);
  const paymentReportTotal = paymentReportRows.reduce((total, row) => total + row.total, 0);
  const displayedCashReport = selectedCashReport || caixa;
  const cashClosingRows = displayedCashReport ? [
    { item: "Operador", valor: displayedCashReport.usuarioNome || displayedCashReport.usuarioLogin || "-" },
    { item: "Perfil", valor: displayedCashReport.perfil || "-" },
    { item: "Empresa", valor: displayedCashReport.empresaNome || displayedCashReport.empresaId || "-" },
    { item: "Filial", valor: displayedCashReport.filial || "Empresa" },
    { item: "Status", valor: displayedCashReport.status || "-" },
    { item: "Abertura", valor: displayedCashReport.dataAbertura ? new Date(displayedCashReport.dataAbertura).toLocaleString("pt-BR") : "-" },
    { item: "Fechamento", valor: displayedCashReport.dataFechamento ? new Date(displayedCashReport.dataFechamento).toLocaleString("pt-BR") : "-" },
    { item: "Valor inicial", valor: formatCurrency(displayedCashReport.valorInicial) },
    { item: "Total vendas", valor: formatCurrency(displayedCashReport.totalVendas) },
    { item: "Pagamentos recebidos", valor: formatCurrency(displayedCashReport.totalPagamentosRecebidos) },
    { item: "Suprimentos", valor: formatCurrency(displayedCashReport.totalSuprimentos) },
    { item: "Sangrias", valor: formatCurrency(displayedCashReport.totalSangrias) },
    { item: "Saldo calculado", valor: formatCurrency(displayedCashReport.saldoCalculado) },
    { item: "Valor contado", valor: displayedCashReport.valorFechamento != null ? formatCurrency(displayedCashReport.valorFechamento) : "-" },
    { item: "Divergencia", valor: displayedCashReport.divergencia != null ? formatCurrency(displayedCashReport.divergencia) : "-" },
  ] : [];
  const cashMovementRows = asList(caixa?.movimentos).map((movimento) => ({
    Data: movimento.dataMovimento ? new Date(movimento.dataMovimento).toLocaleString("pt-BR") : "-",
    Filial: caixa?.filial || "Empresa / sem filial",
    Tipo: movimento.tipo || "-",
    Descricao: movimento.descricao || "-",
    Operador: movimento.usuarioNome || caixa?.usuarioNome || "-",
    Pagamento: getPaymentMethodLabel(movimento.metodoPagamento),
    Valor: formatCurrency(movimento.valor || 0),
    Observacao: getMixedPaymentObservation(movimento.observacao) || movimento.observacao || "-",
  }));
  const filteredCashHistory = branchScopedCashHistory.filter((item) => {
    const openedKey = getLocalDateKey(item.dataAbertura);
    const text = [
      item.usuarioNome,
      item.usuarioLogin,
      item.perfil,
      item.empresaNome,
      item.filial,
      item.status,
      item.id,
    ].join(" ").toLowerCase();

    if (cashHistoryFilter.busca && !text.includes(cashHistoryFilter.busca.toLowerCase())) return false;
    if (cashHistoryFilter.status !== "TODOS" && item.status !== cashHistoryFilter.status) return false;
    if (cashHistoryFilter.inicio && openedKey < cashHistoryFilter.inicio) return false;
    if (cashHistoryFilter.fim && openedKey > cashHistoryFilter.fim) return false;
    return true;
  });
  const cashHistoryTotals = filteredCashHistory.reduce(
    (totals, item) => ({
      caixas: totals.caixas + 1,
      vendas: totals.vendas + Number(item.totalVendas || 0),
      saldo: totals.saldo + Number(item.saldoCalculado || 0),
      divergencia: totals.divergencia + Number(item.divergencia || 0),
    }),
    { caixas: 0, vendas: 0, saldo: 0, divergencia: 0 },
  );
  const cashHistoryRows = filteredCashHistory.map((item) => ({
    operador: item.usuarioNome || item.usuarioLogin || "-",
    filial: item.filial || "Empresa",
    status: item.status || "-",
    abertura: item.dataAbertura ? new Date(item.dataAbertura).toLocaleString("pt-BR") : "-",
    fechamento: item.dataFechamento ? new Date(item.dataFechamento).toLocaleString("pt-BR") : "-",
    vendas: formatCurrency(item.totalVendas),
    saldo: formatCurrency(item.saldoCalculado),
    divergencia: item.divergencia != null ? formatCurrency(item.divergencia) : "-",
  }));
  const filteredPendingOrders = branchScopedPendingOrders.filter((pedido) => {
    const itemText = asList(pedido.itens)
      .map((item) => `${item.produto || ""} ${item.quantidade || ""}`)
      .join(" ");
    const text = [
      pedido.cliente,
      pedido.numero,
      pedido.id,
      pedido.usuario,
      pedido.vendedor,
      pedido.filial,
      pedido.metodoPagamentoDescricao,
      pedido.metodoPagamento,
      pedido.tipoEntregaDescricao,
      pedido.tipoEntrega,
      pedido.enderecoEntrega,
      pedido.observacaoEntrega,
      itemText,
    ].join(" ").toLowerCase();

    return text.includes(pendingSearch.toLowerCase());
  });
  const selectedPendingOrder =
    filteredPendingOrders.find((pedido) => String(pedido.id) === String(selectedPendingOrderId)) ||
    filteredPendingOrders[0] ||
    null;

  useEffect(() => {
    if (selectedPendingOrder) {
      const metodoPagamento = selectedPendingOrder.metodoPagamento || "PIX";
      setReceivePaymentForm({
        metodoPagamento,
        parcelas: canInstallmentPayment(metodoPagamento)
          ? Number(selectedPendingOrder.parcelasPagamento || 1)
          : 1,
      });
    }
  }, [selectedPendingOrder?.id]);

  useEffect(() => {
    if (!caixa && cashView === "pdv") {
      setCashView("movimentos");
    }
  }, [caixa, cashView]);

  useEffect(() => {
    if (!selectedPendingOrderId && filteredPendingOrders[0]?.id) {
      setSelectedPendingOrderId(filteredPendingOrders[0].id);
      return;
    }

    if (
      selectedPendingOrderId &&
      !filteredPendingOrders.some((pedido) => String(pedido.id) === String(selectedPendingOrderId))
    ) {
      setSelectedPendingOrderId(filteredPendingOrders[0]?.id || "");
    }
  }, [filteredPendingOrders, selectedPendingOrderId]);

  async function handleOpenCash(event) {
    event.preventDefault();
    const valorInicial = parseDecimalInput(openForm.valorInicial);

    if (!Number.isFinite(valorInicial) || valorInicial < 0) {
      setMessage({ type: "error", text: "Informe um valor inicial valido. Ex.: 150,00" });
      return;
    }

    setSaving("abrir");
    setMessage(null);

    try {
      await endpoints.caixas.abrir({
        valorInicial,
        observacao: openForm.observacao,
      });
      setOpenForm({ valorInicial: "0", observacao: "" });
      setMessage({ type: "success", text: "Caixa aberto com sucesso." });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving("");
    }
  }

  async function handleMovement(event) {
    event.preventDefault();
    if (!caixa?.id) return;
    const valor = parseDecimalInput(movementForm.valor);

    if (!Number.isFinite(valor) || valor <= 0) {
      setMessage({ type: "error", text: "Informe um valor valido para a movimentacao. Ex.: 50,00" });
      return;
    }

    setSaving(movementForm.tipo);
    setMessage(null);

    try {
      const payload = {
        valor,
        metodoPagamento: movementForm.metodoPagamento,
        parcelas: canInstallmentPayment(movementForm.metodoPagamento) ? Number(movementForm.parcelas || 1) : 1,
        descricao: movementForm.descricao,
        observacao: movementForm.observacao,
      };

      if (movementForm.tipo === "sangria") {
        await endpoints.caixas.sangria(caixa.id, payload);
      } else if (movementForm.tipo === "pagamentoRecebido") {
        await endpoints.caixas.pagamentoRecebido(caixa.id, payload);
      } else {
        await endpoints.caixas.suprimento(caixa.id, payload);
      }

      setMovementForm({
        tipo: "pagamentoRecebido",
        valor: "",
        metodoPagamento: "PIX",
        parcelas: 1,
        descricao: "",
        observacao: "",
      });
      setCashAction("");
      setMessage({ type: "success", text: "Movimento registrado." });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving("");
    }
  }

  async function handleCloseCash(event) {
    event.preventDefault();
    if (!caixa?.id) return;
    const valorFechamento = parseDecimalInput(closeForm.valorFechamento);

    if (!Number.isFinite(valorFechamento) || valorFechamento < 0) {
      setMessage({ type: "error", text: "Informe um valor contado valido. Ex.: 250,00" });
      return;
    }

    setSaving("fechar");
    setMessage(null);

    try {
      await endpoints.caixas.fechar(caixa.id, {
        valorFechamento,
        observacao: closeForm.observacao,
      });
      setCloseForm({ valorFechamento: "", observacao: "" });
      setCashAction("");
      setMessage({ type: "success", text: "Caixa fechado." });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving("");
    }
  }

  async function handleViewCashReport(id) {
    setSaving(`relatorio-${id}`);
    setMessage(null);

    try {
      const report = await endpoints.caixas.resumo(id);
      setSelectedCashReport(report);
      setCashView("movimentos");
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving("");
    }
  }

  async function handleReceiveOrder(id) {
    if (!caixa?.id) {
      setMessage({ type: "error", text: "Abra um caixa antes de receber pagamentos." });
      return;
    }

    setReceivingOrder(id);
    setMessage(null);

    try {
      await endpoints.pedidos.finalizar(id, {
        metodoPagamento: receivePaymentForm.metodoPagamento,
        parcelas: canInstallmentPayment(receivePaymentForm.metodoPagamento)
          ? Number(receivePaymentForm.parcelas || 1)
          : 1,
      });
      setMessage({ type: "success", text: "Pagamento recebido e venda finalizada pelo caixa." });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setReceivingOrder("");
    }
  }

  async function handleGeneratePendingOrderCharge(id) {
    setGeneratingCharge(id);
    setMessage(null);

    try {
      const charge = await endpoints.pedidos.gerarCobranca(id, {
        metodoPagamento: receivePaymentForm.metodoPagamento,
        parcelas: canInstallmentPayment(receivePaymentForm.metodoPagamento)
          ? Number(receivePaymentForm.parcelas || 1)
          : 1,
      });
      setSelectedCashCharge(charge);
      setMessage({
        type: "success",
        text: receivePaymentForm.metodoPagamento === "PIX" ? "Pix gerado para este pedido." : "Boleto gerado para este pedido.",
      });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setGeneratingCharge("");
    }
  }

  async function copyCashChargeText(text, label) {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setMessage({ type: "success", text: `${label} copiado.` });
    } catch {
      setMessage({ type: "error", text: "Nao foi possivel copiar automaticamente." });
    }
  }

  return (
    <div className="dashboard-view">
      {message && (
        <div className={message.type === "error" ? "error-box" : "success-box"}>
          {message.text}
        </div>
      )}

      <section className="kpi-grid">
        <KpiCard
          icon={CreditCard}
          label="Status"
          value={caixa?.status || "Sem caixa"}
          detail={caixa ? `Aberto por ${caixa.usuarioNome || caixa.usuarioLogin} | ${caixa.filial || "Empresa"}` : "Abra um caixa para iniciar operacao"}
          tone={caixa ? "green" : "amber"}
        />
        <KpiCard
          icon={WalletCards}
          label="Saldo calculado"
          value={formatCurrency(caixa?.saldoCalculado)}
          detail={`Inicial ${formatCurrency(caixa?.valorInicial)} | Vendas ${formatCurrency(caixa?.totalVendas)}`}
          tone="blue"
        />
        <KpiCard
          icon={CircleDollarSign}
          label="Entradas"
          value={formatCurrency(totalEntradasCaixa)}
          detail={`Vendas ${formatCurrency(caixa?.totalVendas)} | Pagamentos ${formatCurrency(caixa?.totalPagamentosRecebidos)} | Suprimentos ${formatCurrency(caixa?.totalSuprimentos)} | Sangrias ${formatCurrency(caixa?.totalSangrias)}`}
          tone="dark"
        />
        <KpiCard
          icon={UserRound}
          label="Perfil"
          value={caixa?.perfil || role}
          detail={cashBranchFilter === "TODAS" ? `Empresa #${caixa?.empresaId || session.empresaId || "-"}` : selectedCashBranchLabel}
          tone="green"
        />
      </section>

      <section className="panel account-plan-summary">
        <div className="account-plan-head">
          <div>
            <h3>Filtro operacional</h3>
            <p>Separe pagamentos pendentes e historico de caixas por filial.</p>
          </div>
          <label className="commission-config-control">
            <span>Filial</span>
            <select value={cashBranchFilter} onChange={(event) => setCashBranchFilter(event.target.value)}>
              <option value="TODAS">Todas as filiais</option>
              <option value="EMPRESA">Empresa / sem filial</option>
              {filiais.map((filial) => (
                <option key={filial.id} value={filial.id}>
                  {filial.matriz ? "Matriz" : "Filial"} - {filial.nome}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <div className="view-switch cash-view-switch" role="tablist" aria-label="Caixa">
        <button
          className={cashView === "pdv" ? "active" : ""}
          disabled={!caixa}
          onClick={() => setCashView("pdv")}
          type="button"
        >
          <ShoppingCart size={17} />
          PDV Caixa
        </button>
        <button
          className={cashView === "movimentos" ? "active" : ""}
          onClick={() => setCashView("movimentos")}
          type="button"
        >
          <WalletCards size={17} />
          Movimentacao
        </button>
      </div>

      {cashView === "pdv" ? (
        <>
          <PendingPaymentsPanel
            caixa={caixa}
            canOperate={canOperate}
            charge={selectedCashCharge}
            filteredPendingOrders={filteredPendingOrders}
            generatingCharge={generatingCharge}
            onCopyCharge={copyCashChargeText}
            onGenerateCharge={handleGeneratePendingOrderCharge}
            onReceiveOrder={handleReceiveOrder}
            onSearch={setPendingSearch}
            onSelectOrder={setSelectedPendingOrderId}
            onPaymentFormChange={setReceivePaymentForm}
            paymentForm={receivePaymentForm}
            pendingSearch={pendingSearch}
            pedidosPendentes={branchScopedPendingOrders}
            receivingOrder={receivingOrder}
            selectedPendingOrder={selectedPendingOrder}
          />
          <details className="direct-sale-shell">
            <summary>
              <ShoppingCart size={17} />
              Venda direta no caixa
            </summary>
            <PointOfSale
              caixa={caixa}
              canOperateCash={canOperate}
              cashMode
              clientes={clientes}
              onSaleCreated={onRefresh}
              produtos={produtos}
              session={session}
            />
          </details>
        </>
      ) : (
        <>
      <section className="dashboard-grid">
        <article className="panel">
          <div className="panel-title">
            <div>
              <h2>{caixa ? "Caixa aberto" : "Abrir caixa"}</h2>
              <p>{caixa ? "Operador, perfil e saldos do turno atual." : "Informe o valor inicial para comecar."}</p>
            </div>
            <span>{caixa?.dataAbertura ? formatDate(caixa.dataAbertura) : "Aguardando"}</span>
          </div>

          {caixa ? (
            <div className="health-list">
              <div>
                <span>Operador</span>
                <strong>{caixa.usuarioNome || caixa.usuarioLogin}</strong>
              </div>
              <div>
                <span>Perfil</span>
                <strong>{caixa.perfil}</strong>
              </div>
              <div>
                <span>Empresa</span>
                <strong>{caixa.empresaNome || caixa.empresaId}</strong>
              </div>
              <div>
                <span>Abertura</span>
                <strong>{new Date(caixa.dataAbertura).toLocaleString("pt-BR")}</strong>
              </div>
            </div>
          ) : (
            <form className="stack-form" onSubmit={handleOpenCash}>
              <label>
                <span>Valor inicial</span>
                <input
                  min="0"
                  inputMode="decimal"
                  type="text"
                  value={openForm.valorInicial}
                  onChange={(event) => setOpenForm((prev) => ({ ...prev, valorInicial: event.target.value }))}
                  disabled={!canOperate}
                />
              </label>
              <label>
                <span>Observacao</span>
                <textarea
                  value={openForm.observacao}
                  onChange={(event) => setOpenForm((prev) => ({ ...prev, observacao: event.target.value }))}
                  disabled={!canOperate}
                />
              </label>
              <button disabled={!canOperate || saving === "abrir"} type="submit">
                {saving === "abrir" ? <Loader2 className="spin" size={18} /> : <Plus size={18} />}
                Abrir caixa
              </button>
            </form>
          )}
        </article>

        <article className="panel">
          <div className="panel-title">
            <div>
              <h2>Movimentacao</h2>
              <p>Use os botoes para registrar sangria, suprimento ou fechamento.</p>
            </div>
          </div>

          {caixa && canOperate ? (
            <>
              <div className="cash-action-buttons">
                <button
                  className={cashAction === "movimento" ? "active" : ""}
                  onClick={() => setCashAction((current) => current === "movimento" ? "" : "movimento")}
                  type="button"
                >
                  <WalletCards size={18} />
                  Movimentar caixa
                </button>
                <button
                  className={cashAction === "relatorio" ? "active" : ""}
                  onClick={() => setCashAction((current) => current === "relatorio" ? "" : "relatorio")}
                  type="button"
                >
                  <FileText size={18} />
                  Relatorio do dia
                </button>
                <button
                  className={cashAction === "fechamento" ? "active" : ""}
                  onClick={() => setCashAction((current) => current === "fechamento" ? "" : "fechamento")}
                  type="button"
                >
                  <CheckCircle2 size={18} />
                  Fechar caixa
                </button>
              </div>

              {cashAction === "movimento" && (
                <form className="stack-form cash-action-form" onSubmit={handleMovement}>
                  <label>
                    <span>Tipo</span>
                    <select
                      value={movementForm.tipo}
                      onChange={(event) => setMovementForm((prev) => ({ ...prev, tipo: event.target.value }))}
                    >
                      <option value="pagamentoRecebido">Pagamento recebido</option>
                      <option value="suprimento">Suprimento</option>
                      <option value="sangria">Sangria</option>
                    </select>
                  </label>
                  {movementForm.tipo === "pagamentoRecebido" && (
                    <label>
                      <span>Forma de pagamento</span>
                      <select
                        value={movementForm.metodoPagamento}
                        onChange={(event) =>
                          setMovementForm((prev) => ({
                            ...prev,
                            metodoPagamento: event.target.value,
                            parcelas: canInstallmentPayment(event.target.value) ? prev.parcelas : 1,
                          }))
                        }
                      >
                        <option value="PIX">Pix</option>
                        <option value="DINHEIRO">Dinheiro</option>
                        <option value="CARTAO_CREDITO">Cartao de credito</option>
                        <option value="CARTAO_DEBITO">Cartao de debito</option>
                        <option value="BOLETO">Boleto</option>
                        <option value="MISTO">Misto</option>
                      </select>
                    </label>
                  )}
                  {movementForm.tipo === "pagamentoRecebido" && canInstallmentPayment(movementForm.metodoPagamento) && (
                    <label>
                      <span>Parcelas</span>
                      <select
                        value={movementForm.parcelas}
                        onChange={(event) =>
                          setMovementForm((prev) => ({ ...prev, parcelas: Number(event.target.value) }))
                        }
                      >
                        {Array.from({ length: 12 }, (_, index) => index + 1).map((parcela) => (
                          <option key={parcela} value={parcela}>
                            {parcela}x
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  <label>
                    <span>Valor</span>
                    <input
                      min="0.01"
                      required
                      inputMode="decimal"
                      type="text"
                      value={movementForm.valor}
                      onChange={(event) => setMovementForm((prev) => ({ ...prev, valor: event.target.value }))}
                    />
                  </label>
                  <label>
                    <span>Descricao</span>
                    <input
                      value={movementForm.descricao}
                      onChange={(event) => setMovementForm((prev) => ({ ...prev, descricao: event.target.value }))}
                      placeholder="Ex.: Pagamento de cliente"
                    />
                  </label>
                  <button disabled={Boolean(saving)} type="submit">
                    {saving === movementForm.tipo ? <Loader2 className="spin" size={18} /> : <Plus size={18} />}
                    Registrar movimentacao
                  </button>
                </form>
              )}

              {cashAction === "relatorio" && (
                <div className="payment-report-panel">
                  <div className="payment-report-head">
                    <div>
                      <span>Recebido hoje</span>
                      <strong>{formatCurrency(paymentReportTotal)}</strong>
                    </div>
                    <em>{formatNumber(todayPaymentMovements.length)} vendas/pagamentos</em>
                  </div>

                  {paymentReportRows.length === 0 ? (
                    <div className="empty-selection compact">Nenhum recebimento registrado hoje.</div>
                  ) : (
                    <div className="payment-report-list">
                      {paymentReportRows.map((row) => (
                        <div className="payment-report-row" key={row.method}>
                          <span>{row.label}</span>
                          <small>{formatNumber(row.count)} recebimento(s)</small>
                          <strong>{formatCurrency(row.total)}</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {cashAction === "fechamento" && (
                <form className="stack-form close-cash-form" onSubmit={handleCloseCash}>
                  <label>
                    <span>Valor contado no fechamento</span>
                    <input
                      min="0"
                      required
                      inputMode="decimal"
                      type="text"
                      value={closeForm.valorFechamento}
                      onChange={(event) => setCloseForm((prev) => ({ ...prev, valorFechamento: event.target.value }))}
                    />
                  </label>
                  <label>
                    <span>Observacao</span>
                    <textarea
                      value={closeForm.observacao}
                      onChange={(event) => setCloseForm((prev) => ({ ...prev, observacao: event.target.value }))}
                    />
                  </label>
                  <button disabled={Boolean(saving)} type="submit">
                    {saving === "fechar" ? <Loader2 className="spin" size={18} /> : <CheckCircle2 size={18} />}
                    Confirmar fechamento
                  </button>
                </form>
              )}
            </>
          ) : (
            <div className="empty-cell">
              {canOperate ? "Abra um caixa para registrar movimentos." : "Seu perfil visualiza o caixa, mas nao opera movimentos."}
            </div>
          )}
        </article>
          </section>

          <section className="panel orders-panel">
            <div className="panel-title">
              <div>
                <h2>Pagamentos para receber</h2>
                <p>Pesquise por cliente, produto ou numero e confira o resumo antes de receber.</p>
              </div>
              <span>{formatNumber(filteredPendingOrders.length)} de {formatNumber(branchScopedPendingOrders.length)}</span>
            </div>

            <label className="search-field cash-pending-search">
              <Search size={17} />
              <input
                value={pendingSearch}
                onChange={(event) => setPendingSearch(event.target.value)}
                placeholder="Procurar por nome do cliente, produto ou numero"
              />
            </label>

            <div className="cash-receive-grid">
              <div className="pending-order-list">
                {filteredPendingOrders.length === 0 ? (
                  <div className="empty-selection compact">Nenhum pagamento pendente encontrado.</div>
                ) : (
                  filteredPendingOrders.map((pedido) => (
                    <button
                      className={String(selectedPendingOrder?.id) === String(pedido.id) ? "pending-order active" : "pending-order"}
                      key={pedido.id}
                      onClick={() => setSelectedPendingOrderId(pedido.id)}
                      type="button"
                    >
                      <span>
                        <strong>{pedido.cliente || "Cliente nao informado"}</strong>
                        <small>{pedido.numero || pedido.id}</small>
                      </span>
                      <em>{formatCurrency(pedido.valor)}</em>
                    </button>
                  ))
                )}
              </div>

              <aside className="sale-summary">
                {selectedPendingOrder ? (
                  <>
                    <div className="sale-summary-head">
                      <div>
                        <span>Resumo da venda</span>
                        <strong>{selectedPendingOrder.cliente || "Cliente nao informado"}</strong>
                      </div>
                      <span className="pill pendente">Pendente</span>
                    </div>

                    <div className="sale-summary-meta">
                      <div>
                        <span>Numero</span>
                        <strong>{selectedPendingOrder.numero || selectedPendingOrder.id}</strong>
                      </div>
                      <div>
                        <span>Vendedor</span>
                        <strong>{selectedPendingOrder.usuario || selectedPendingOrder.vendedor || "-"}</strong>
                      </div>
                      <div>
                        <span>Pagamento</span>
                        <strong>{selectedPendingOrder.metodoPagamentoDescricao || selectedPendingOrder.metodoPagamento || "-"}</strong>
                      </div>
                      <div>
                        <span>Filial</span>
                        <strong>{selectedPendingOrder.filial || "Empresa"}</strong>
                      </div>
                      <div>
                        <span>Data</span>
                        <strong>{formatDate(selectedPendingOrder.data)}</strong>
                      </div>
                    </div>

                    <div className="sale-summary-items">
                      <span>Produtos</span>
                      {asList(selectedPendingOrder.itens).length === 0 ? (
                        <div className="empty-selection compact">Itens nao carregados para este pedido.</div>
                      ) : (
                        asList(selectedPendingOrder.itens).map((item) => (
                          <div className="sale-summary-item" key={item.id || item.produtoId || item.produto}>
                            <div>
                              <strong>{item.produto || "Produto sem nome"}</strong>
                              <small>{formatNumber(item.quantidade)} un. x {formatCurrency(item.precoUnit)}</small>
                            </div>
                            <em>{formatCurrency(item.subtotal)}</em>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="sale-summary-total">
                      <span>Total a receber</span>
                      <strong>{formatCurrency(selectedPendingOrder.valor)}</strong>
                    </div>

                    <div className="cash-payment-panel compact-payment-panel">
                      <span>Receber no caixa como</span>
                      <div className="cash-payment-options">
                        {cashPaymentOptions.map((option) => (
                          <button
                            className={receivePaymentForm.metodoPagamento === option.value ? "active" : ""}
                            key={option.value}
                            onClick={() =>
                              setReceivePaymentForm({
                                metodoPagamento: option.value,
                                parcelas: canInstallmentPayment(option.value) ? receivePaymentForm.parcelas : 1,
                              })
                            }
                            type="button"
                          >
                            <CreditCard size={16} />
                            {option.label}
                          </button>
                        ))}
                      </div>
                      {canInstallmentPayment(receivePaymentForm.metodoPagamento) && (
                        <label className="form-control">
                          <span>Parcelas</span>
                          <select
                            value={receivePaymentForm.parcelas}
                            onChange={(event) =>
                              setReceivePaymentForm((prev) => ({ ...prev, parcelas: Number(event.target.value) }))
                            }
                          >
                            {Array.from({ length: 12 }, (_, index) => index + 1).map((parcela) => (
                              <option key={parcela} value={parcela}>
                                {parcela}x de {formatCurrency(Number(selectedPendingOrder.valor || 0) / parcela)}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                    </div>

                    <button
                      className="checkout-button"
                      disabled={!canOperate || !caixa || receivingOrder === selectedPendingOrder.id}
                      onClick={() => handleReceiveOrder(selectedPendingOrder.id)}
                      type="button"
                    >
                      {receivingOrder === selectedPendingOrder.id ? <Loader2 className="spin" size={17} /> : <CreditCard size={17} />}
                      {receivingOrder === selectedPendingOrder.id ? "Recebendo..." : "Receber pagamento"}
                    </button>
                  </>
                ) : (
                  <div className="empty-selection">Selecione um pedido pendente para receber.</div>
                )}
              </aside>
            </div>
          </section>

          <section className="panel orders-panel">
        <div className="panel-title">
          <div>
            <h2>Movimentos recentes</h2>
            <p>Ultimas operacoes do caixa aberto.</p>
          </div>
          <div className="report-actions">
            <span>{formatNumber(asList(caixa?.movimentos).length)} registros</span>
            <button
              className="report-export"
              disabled={cashMovementRows.length === 0}
              onClick={() => downloadCsv(`nexus-one-movimentos-caixa-${caixa?.id || getLocalDateKey()}.csv`, cashMovementRows)}
              type="button"
            >
              <Download size={17} />
              CSV
            </button>
            <button
              className="report-export secondary"
              disabled={cashMovementRows.length === 0}
              onClick={() => printRowsDocument("Movimentos do caixa", cashMovementRows, caixa?.empresaNome || session?.empresa || "Nexus One")}
              type="button"
            >
              <Printer size={17} />
              PDF
            </button>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Descricao</th>
                <th>Operador</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {asList(caixa?.movimentos).length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-cell">
                    Nenhum movimento registrado.
                  </td>
                </tr>
              ) : (
                asList(caixa.movimentos).map((movimento) => {
                  const mixedPaymentObservation = getMixedPaymentObservation(movimento.observacao);
                  return (
                    <tr key={movimento.id}>
                      <td>{movimento.tipo}</td>
                      <td>
                        {movimento.descricao}
                        {mixedPaymentObservation && (
                          <small className="payment-detail-line">Pagamento misto: {mixedPaymentObservation}</small>
                        )}
                      </td>
                      <td>{movimento.usuarioNome}</td>
                      <td>{formatCurrency(movimento.valor)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {displayedCashReport && (
        <section className="panel cash-closing-report">
          <div className="panel-title">
            <div>
              <h2>{selectedCashReport ? "Relatorio de caixa consultado" : "Relatorio de fechamento"}</h2>
              <p>Conferencia do caixa com entradas, saidas e divergencia.</p>
            </div>
            <div className="report-actions">
              {selectedCashReport && (
                <button
                  className="report-export secondary"
                  onClick={() => setSelectedCashReport(null)}
                  type="button"
                >
                  <X size={17} />
                  Atual
                </button>
              )}
              <button
                className="report-export"
                onClick={() => downloadCsv(`nexus-one-fechamento-caixa-${displayedCashReport.id || getLocalDateKey()}.csv`, cashClosingRows)}
                type="button"
              >
                <Download size={17} />
                CSV
              </button>
              <button
                className="report-export secondary"
                onClick={() => printRowsDocument("Relatorio de fechamento de caixa", cashClosingRows, displayedCashReport.empresaNome || "Nexus One")}
                type="button"
              >
                <Printer size={17} />
                PDF
              </button>
            </div>
          </div>

          <div className="closing-report-grid">
            {cashClosingRows.map((row) => (
              <div key={row.item}>
                <span>{row.item}</span>
                <strong>{row.valor}</strong>
              </div>
            ))}
          </div>
        </section>
      )}

      {recentes.length > 0 && (
        <section className="panel">
          <div className="panel-title">
            <div>
              <h2>Caixas recentes</h2>
              <p>Historico rapido da empresa com filtros e exportacao.</p>
            </div>
            <div className="report-actions">
              <button
                className="report-export"
                disabled={cashHistoryRows.length === 0}
                onClick={() => downloadCsv(`nexus-one-caixas-${getLocalDateKey()}.csv`, cashHistoryRows)}
                type="button"
              >
                <Download size={17} />
                CSV
              </button>
              <button
                className="report-export secondary"
                disabled={cashHistoryRows.length === 0}
                onClick={() => printRowsDocument("Historico de caixas", cashHistoryRows, session?.empresa || "Nexus One")}
                type="button"
              >
                <Printer size={17} />
                PDF
              </button>
            </div>
          </div>

          <div className="cash-history-filters">
            <label>
              <span>Busca</span>
              <input
                value={cashHistoryFilter.busca}
                onChange={(event) => setCashHistoryFilter((current) => ({ ...current, busca: event.target.value }))}
                placeholder="Operador, perfil, filial ou empresa"
              />
            </label>
            <label>
              <span>Status</span>
              <select
                value={cashHistoryFilter.status}
                onChange={(event) => setCashHistoryFilter((current) => ({ ...current, status: event.target.value }))}
              >
                <option value="TODOS">Todos</option>
                <option value="ABERTO">Aberto</option>
                <option value="FECHADO">Fechado</option>
              </select>
            </label>
            <label>
              <span>Inicio</span>
              <input
                type="date"
                value={cashHistoryFilter.inicio}
                onChange={(event) => setCashHistoryFilter((current) => ({ ...current, inicio: event.target.value }))}
              />
            </label>
            <label>
              <span>Fim</span>
              <input
                type="date"
                value={cashHistoryFilter.fim}
                onChange={(event) => setCashHistoryFilter((current) => ({ ...current, fim: event.target.value }))}
              />
            </label>
            <button
              disabled={
                !cashHistoryFilter.busca &&
                cashHistoryFilter.status === "TODOS" &&
                !cashHistoryFilter.inicio &&
                !cashHistoryFilter.fim
              }
              onClick={() => setCashHistoryFilter({ busca: "", status: "TODOS", inicio: "", fim: "" })}
              type="button"
            >
              <X size={16} />
              Limpar
            </button>
          </div>

          <div className="cash-history-summary">
            <div>
              <span>Caixas</span>
              <strong>{formatNumber(cashHistoryTotals.caixas)}</strong>
            </div>
            <div>
              <span>Vendas</span>
              <strong>{formatCurrency(cashHistoryTotals.vendas)}</strong>
            </div>
            <div>
              <span>Saldo</span>
              <strong>{formatCurrency(cashHistoryTotals.saldo)}</strong>
            </div>
            <div>
              <span>Divergencia</span>
              <strong>{formatCurrency(cashHistoryTotals.divergencia)}</strong>
            </div>
          </div>

          <div className="action-list">
            {filteredCashHistory.slice(0, 12).map((item) => (
              <div className="action-item" key={item.id}>
                <CreditCard size={18} />
                <div>
                  <strong>{item.usuarioNome || item.usuarioLogin} - {item.status}</strong>
                  <small>{formatCurrency(item.saldoCalculado)} em {formatDate(item.dataAbertura)}</small>
                </div>
                <button
                  className="mini-action-button"
                  disabled={saving === `relatorio-${item.id}`}
                  onClick={() => handleViewCashReport(item.id)}
                  type="button"
                >
                  {saving === `relatorio-${item.id}` ? <Loader2 className="spin" size={15} /> : <FileText size={15} />}
                  Ver relatorio
                </button>
              </div>
            ))}
            {filteredCashHistory.length === 0 && (
              <div className="empty-selection compact">Nenhum caixa encontrado para os filtros.</div>
            )}
          </div>
        </section>
      )}
        </>
      )}
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [form, setForm] = useState({ login: "", senha: "" });
  const [resetForm, setResetForm] = useState({ login: "", token: "", novaSenha: "", confirmarSenha: "" });
  const [authMode, setAuthMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      setResetForm((prev) => ({ ...prev, token }));
      setAuthMode("reset");
    }
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const session = await login(form);
      onLogin(session);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRecover(event) {
    event.preventDefault();

    if (!resetForm.login.trim()) {
      setError("Informe o login do usuario.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await endpoints.auth.recuperarSenha(resetForm.login.trim());
      setSuccess("Solicitacao registrada. Use o token gerado no console do Spring Boot para definir uma nova senha.");
      setAuthMode("reset");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(event) {
    event.preventDefault();

    if (!resetForm.token.trim()) {
      setError("Informe o token de recuperacao.");
      return;
    }

    if (resetForm.novaSenha.length < 6) {
      setError("Nova senha precisa ter no minimo 6 caracteres.");
      return;
    }

    if (resetForm.novaSenha !== resetForm.confirmarSenha) {
      setError("As senhas nao conferem.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await endpoints.auth.resetarSenha(resetForm.token.trim(), resetForm.novaSenha);
      setSuccess("Senha alterada com sucesso. Entre novamente com a nova senha.");
      setAuthMode("login");
      setForm((prev) => ({ ...prev, senha: "" }));
      setResetForm({ login: "", token: "", novaSenha: "", confirmarSenha: "" });
      window.history.replaceState({}, "", window.location.pathname);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="brand-panel">
        <div className="brand">
          <span>N</span>
          <div>
            <strong>Nexus One</strong>
            <small>ERP comercial integrado</small>
          </div>
        </div>

        <div className="brand-copy">
          <p>Controle empresarial</p>
          <h1>Nexus One centraliza vendas, estoque, financeiro e logistica.</h1>
          <span>
            Front React JSX preparado para consumir o Spring Boot na porta 8080
            com JWT e PostgreSQL.
          </span>
        </div>

        <div className="brand-metrics">
          <article>
            <ShoppingCart size={18} />
            <strong>Pedidos</strong>
            <span>/pedidos</span>
          </article>
          <article>
            <PackageCheck size={18} />
            <strong>Estoque</strong>
            <span>/produtos</span>
          </article>
          <article>
            <WalletCards size={18} />
            <strong>Financeiro</strong>
            <span>/financeiro</span>
          </article>
          <article>
            <Route size={18} />
            <strong>Logistica</strong>
            <span>/logistica</span>
          </article>
        </div>
      </section>

      <section className="form-panel">
        <form
          className="login-card"
          onSubmit={
            authMode === "recover"
              ? handleRecover
              : authMode === "reset"
                ? handleResetPassword
                : handleSubmit
          }
        >
          <div className="secure">
            <ShieldCheck size={16} />
            API protegida por JWT
          </div>

          <header>
            <h2>
              {authMode === "recover"
                ? "Recuperar senha"
                : authMode === "reset"
                  ? "Nova senha"
                  : "Acesse sua conta"}
            </h2>
            <p>
              {authMode === "recover"
                ? "Informe seu login para gerar um token de recuperacao."
                : authMode === "reset"
                  ? "Informe o token recebido e defina uma nova senha."
                  : "Use o login cadastrado no Spring Boot."}
            </p>
          </header>

          {error && <div className="error-box">{error}</div>}
          {success && <div className="success-box">{success}</div>}

          {authMode === "login" && (
            <>
              <label>
                <span>Login</span>
                <input
                  value={form.login}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, login: event.target.value }))
                  }
                  placeholder="Digite seu login"
                  autoComplete="username"
                  required
                />
              </label>

              <label>
                <span>Senha</span>
                <input
                  type="password"
                  value={form.senha}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, senha: event.target.value }))
                  }
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
                  required
                />
              </label>

              <button disabled={loading} type="submit">
                {loading ? <Loader2 className="spin" size={18} /> : <LockKeyhole size={18} />}
                {loading ? "Conectando..." : "Entrar no sistema"}
              </button>

              <button
                className="auth-link-button"
                onClick={() => {
                  setError("");
                  setSuccess("");
                  setResetForm((prev) => ({ ...prev, login: form.login }));
                  setAuthMode("recover");
                }}
                type="button"
              >
                Esqueci minha senha
              </button>
            </>
          )}

          {authMode === "recover" && (
            <>
              <label>
                <span>Login</span>
                <input
                  value={resetForm.login}
                  onChange={(event) =>
                    setResetForm((prev) => ({ ...prev, login: event.target.value }))
                  }
                  placeholder="Digite seu login"
                  autoComplete="username"
                  required
                />
              </label>

              <button disabled={loading} type="submit">
                {loading ? <Loader2 className="spin" size={18} /> : <Mail size={18} />}
                {loading ? "Enviando..." : "Solicitar recuperacao"}
              </button>

              <div className="auth-actions-row">
                <button onClick={() => setAuthMode("reset")} type="button">
                  Ja tenho token
                </button>
                <button onClick={() => setAuthMode("login")} type="button">
                  Voltar ao login
                </button>
              </div>
            </>
          )}

          {authMode === "reset" && (
            <>
              <label>
                <span>Token</span>
                <input
                  value={resetForm.token}
                  onChange={(event) =>
                    setResetForm((prev) => ({ ...prev, token: event.target.value }))
                  }
                  placeholder="Cole o token de recuperacao"
                  required
                />
              </label>

              <label>
                <span>Nova senha</span>
                <input
                  type="password"
                  value={resetForm.novaSenha}
                  onChange={(event) =>
                    setResetForm((prev) => ({ ...prev, novaSenha: event.target.value }))
                  }
                  placeholder="Minimo 6 caracteres"
                  required
                />
              </label>

              <label>
                <span>Confirmar senha</span>
                <input
                  type="password"
                  value={resetForm.confirmarSenha}
                  onChange={(event) =>
                    setResetForm((prev) => ({ ...prev, confirmarSenha: event.target.value }))
                  }
                  placeholder="Repita a nova senha"
                  required
                />
              </label>

              <button disabled={loading} type="submit">
                {loading ? <Loader2 className="spin" size={18} /> : <ShieldCheck size={18} />}
                {loading ? "Alterando..." : "Alterar senha"}
              </button>

              <button className="auth-link-button" onClick={() => setAuthMode("login")} type="button">
                Voltar ao login
              </button>
            </>
          )}
        </form>
      </section>
    </main>
  );
}

function Dashboard({ session, onLogout }) {
  const [active, setActive] = useState("overview");
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [financeCriticalCount, setFinanceCriticalCount] = useState(0);

  const visibleModules = useMemo(
    () => getAccessibleModules(session),
    [session],
  );

  const activeModule = useMemo(
    () => visibleModules.find((item) => item.value === active) || visibleModules[0],
    [active, visibleModules],
  );

  async function refreshFinanceMenuBadge() {
    if (!canAccessModule(session, "financeiro")) {
      setFinanceCriticalCount(0);
      return;
    }

    try {
      const [financeiro, pedidos, caixas] = await Promise.all([
        safeApi(endpoints.financeiro.resumo(), {}),
        safeApi(endpoints.pedidos.listar(), []),
        safeApi(endpoints.caixas.listar(), []),
      ]);
      setFinanceCriticalCount(getFinanceCriticalBadgeCount(financeiro, pedidos, caixas));
    } catch {
      setFinanceCriticalCount(0);
    }
  }

  async function getModuleData(moduleValue) {
    if (!canAccessModule(session, moduleValue)) {
      return { restricted: true };
    }

    if (moduleValue === "overview") {
      const [
        vendas,
        clientes,
        produtos,
        estoqueBaixo,
        financeiro,
        entregas,
        rotas,
        veiculos,
        entregadores,
        usuarios = [],
        pedidos = [],
        filiais = [],
      ] = await Promise.all([
        canAccessModule(session, "pedidos")
          ? safeApi(endpoints.dashboard.pedidos(), {})
          : Promise.resolve({}),
        canAccessModule(session, "clientes")
          ? safeApi(endpoints.clientes.listar(), [])
          : Promise.resolve([]),
        canAccessModule(session, "produtos")
          ? safeApi(endpoints.produtos.listar(), [])
          : Promise.resolve([]),
        canAccessModule(session, "produtos")
          ? safeApi(endpoints.estoque.baixo(), [])
          : Promise.resolve([]),
        canAccessModule(session, "financeiro")
          ? safeApi(endpoints.financeiro.resumo(), { restricted: true })
          : Promise.resolve({ restricted: true }),
        canAccessModule(session, "logistica")
          ? safeApi(endpoints.logistica.resumo(), [])
          : Promise.resolve([]),
        canAccessModule(session, "logistica")
          ? safeApi(endpoints.logistica.rotas(), [])
          : Promise.resolve([]),
        canAccessModule(session, "logistica")
          ? safeApi(endpoints.logistica.veiculosAtivos(), [])
          : Promise.resolve([]),
        canAccessModule(session, "logistica")
          ? safeApi(endpoints.logistica.entregadoresAtivos(), [])
          : Promise.resolve([]),
        canAccessModule(session, "colaboradores")
          ? safeApi(endpoints.usuarios.listar(), [])
          : Promise.resolve([]),
        canAccessModule(session, "pedidos")
          ? safeApi(endpoints.pedidos.listar(), [])
          : Promise.resolve([]),
        safeApi(endpoints.empresa.filiais(), []),
      ]);

      return {
        vendas,
        clientes,
        produtos,
        estoqueBaixo,
        financeiro,
        logistica: { entregas, rotas, veiculos, entregadores },
        usuarios,
        pedidos,
        filiais,
      };
    }

    if (moduleValue === "pedidos") {
      const canManageSalesGoals = ["ADMIN", "GERENTE"].includes(normalizePerfil(session.perfil));
      const [dashboard, produtos, clientes, pedidos, comissaoConfig, usuarios, followUpsComerciais, filiais] = await Promise.all([
        endpoints.dashboard.pedidos(),
        endpoints.produtos.listar(),
        endpoints.clientes.listar(),
        safeApi(endpoints.pedidos.listar(), []),
        safeApi(endpoints.comissoes.config(), { percentualPadrao: 3 }),
        canManageSalesGoals ? safeApi(endpoints.usuarios.listar(), []) : Promise.resolve([]),
        safeApi(endpoints.pedidos.followUps(), []),
        safeApi(endpoints.empresa.filiais(), []),
      ]);

      return { dashboard: { ...dashboard, pedidos, comissaoConfig, usuarios, followUpsComerciais, filiais }, produtos, clientes };
    }

    if (moduleValue === "caixa") {
      const [aberto, recentes, produtos, clientes, pedidos, filiais] = await Promise.all([
        safeApi(endpoints.caixas.aberto(), null),
        safeApi(endpoints.caixas.listar(), []),
        safeApi(endpoints.produtos.listar(), []),
        safeApi(endpoints.clientes.listar(), []),
        safeApi(endpoints.pedidos.listar(), null),
        safeApi(endpoints.empresa.filiais(), []),
      ]);

      return {
        aberto: aberto || null,
        recentes,
        produtos,
        clientes,
        pedidos: pedidos || [],
        filiais,
        loadWarning: pedidos === null ? "Nao foi possivel carregar pedidos pendentes. O caixa ainda pode ser aberto." : "",
      };
    }

    if (moduleValue === "produtos") {
      const [produtos, estoqueBaixo, estoqueSaldos, pedidos, fornecedores, compras, categorias, marcas, filiais] = await Promise.all([
        endpoints.produtos.listar(),
        endpoints.estoque.baixo(),
        safeApi(endpoints.estoque.saldos(), []),
        safeApi(endpoints.pedidos.listar(), []),
        safeApi(endpoints.fornecedores.listar(), []),
        safeApi(endpoints.compras.listar(), []),
        safeApi(endpoints.categorias.listar("PRODUTO"), []),
        safeApi(endpoints.marcas.listar(), []),
        safeApi(endpoints.empresa.filiais(), []),
      ]);

      return { produtos, estoqueBaixo, estoqueSaldos, pedidos, fornecedores, compras, categorias, marcas, filiais };
    }

    if (moduleValue === "clientes") {
      const [clientes, pedidos, filiais] = await Promise.all([
        endpoints.clientes.listar(),
        safeApi(endpoints.pedidos.listar(), []),
        safeApi(endpoints.empresa.filiais(), []),
      ]);

      return { clientes, pedidos, filiais };
    }

    if (moduleValue === "financeiro") {
      const [financeiro, pedidos, caixas, auditoria, categorias, recorrencias, filiais, followUps] = await Promise.all([
        endpoints.financeiro.resumo(),
        safeApi(endpoints.pedidos.listar(), []),
        safeApi(endpoints.caixas.listar(), []),
        normalizePerfil(session.perfil) === "ADMIN" ? safeApi(endpoints.auditoria.listar(), []) : Promise.resolve([]),
        safeApi(endpoints.categorias.listar("FINANCEIRO"), []),
        safeApi(endpoints.financeiro.recorrencias(), []),
        safeApi(endpoints.empresa.filiais(), []),
        safeApi(endpoints.financeiro.followUps(), []),
      ]);

      return { ...financeiro, pedidos, caixas, auditoria, categorias, recorrencias, filiais, followUps };
    }

    if (moduleValue === "relatorios") {
      const [
        pedidos,
        clientes,
        produtos,
        financeiro,
        entregas,
        rotas,
        filiais,
        usuarios,
      ] = await Promise.all([
        canAccessModule(session, "pedidos")
          ? endpoints.pedidos.listar()
          : Promise.resolve([]),
        canAccessModule(session, "clientes")
          ? endpoints.clientes.listar()
          : Promise.resolve([]),
        canAccessModule(session, "produtos")
          ? endpoints.produtos.listar()
          : Promise.resolve([]),
        canAccessModule(session, "financeiro")
          ? endpoints.financeiro.listar()
          : Promise.resolve([]),
        canAccessModule(session, "logistica")
          ? endpoints.logistica.resumo()
          : Promise.resolve([]),
        canAccessModule(session, "logistica")
          ? endpoints.logistica.rotas()
          : Promise.resolve([]),
        safeApi(endpoints.empresa.filiais(), []),
        canAccessModule(session, "colaboradores")
          ? safeApi(endpoints.usuarios.listar(), [])
          : Promise.resolve([]),
      ]);

      return { pedidos, clientes, produtos, financeiro, entregas, rotas, filiais, usuarios };
    }

    if (moduleValue === "usuarios") {
      if (normalizePerfil(session.perfil) !== "ADMIN") {
        return { restricted: true };
      }

      const [usuarios, auditoria, empresa, filiais, contratos] = await Promise.all([
        endpoints.usuarios.listar(),
        endpoints.auditoria.listar(),
        endpoints.empresa.minha(),
        safeApi(endpoints.empresa.filiais(), []),
        safeApi(endpoints.empresa.contratos(), []),
      ]);

      return { usuarios, auditoria, empresa, filiais, contratos };
    }

    if (moduleValue === "colaboradores") {
      const [usuarios, filiais] = await Promise.all([
        endpoints.usuarios.listar(),
        safeApi(endpoints.empresa.filiais(), []),
      ]);
      return { usuarios, filiais };
    }

    const [entregas, rotas, veiculos, entregadores, transportadoras, filiais] = await Promise.all([
      endpoints.logistica.resumo(),
      endpoints.logistica.rotas(),
      endpoints.logistica.veiculosAtivos(),
      endpoints.logistica.entregadoresAtivos(),
      endpoints.logistica.transportadoras(),
      safeApi(endpoints.empresa.filiais(), []),
    ]);

    return { entregas, rotas, veiculos, entregadores, transportadoras, filiais };
  }

  useEffect(() => {
    let ignore = false;

    async function load() {
      setStatus("loading");
      setError("");

      try {
        const [response] = await Promise.all([
          getModuleData(active),
          refreshFinanceMenuBadge(),
        ]);

        if (!ignore) {
          setData(response);
          setStatus("success");
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message);
          setStatus("error");
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [active, session.perfil]);

  useEffect(() => {
    if (!visibleModules.some((module) => module.value === active)) {
      setActive(visibleModules[0]?.value || "overview");
    }
  }, [active, visibleModules]);

  async function refreshActiveModule() {
    setStatus("loading");
    setError("");

    try {
      const [response] = await Promise.all([
        getModuleData(active),
        refreshFinanceMenuBadge(),
      ]);
      setData(response);
      setStatus("success");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand mini">
          <span>N</span>
          <div>
            <strong>Nexus</strong>
            <small>One</small>
          </div>
        </div>

        <nav>
          {visibleModules.map((item) => {
            const Icon = item.icon;
            const hasFinanceAlert = item.value === "financeiro" && financeCriticalCount > 0;
            return (
              <button
                className={`${active === item.value ? "active" : ""}${hasFinanceAlert ? " has-alert" : ""}`}
                key={item.value}
                onClick={() => setActive(item.value)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {hasFinanceAlert && (
                  <strong className="menu-alert-badge">{formatNumber(financeCriticalCount)}</strong>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <span>Empresa #{session.empresaId || "-"}</span>
            <h1>{activeModule?.label}</h1>
          </div>

          <div className="user-pill">
            <ChartNoAxesCombined size={18} />
            <div>
              <strong>{session.usuario || session.login}</strong>
              <span>{session.perfil}</span>
            </div>
            <button onClick={onLogout} title="Sair">
              <LogOut size={17} />
            </button>
          </div>
        </header>

        <nav className="module-tabs" aria-label="Modulos do sistema">
          {visibleModules.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={active === item.value ? "active" : ""}
                key={item.value}
                onClick={() => setActive(item.value)}
              >
                <Icon size={17} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <section className="content-card">
          <div className="section-title">
            <div>
              <h2>Dashboard executivo</h2>
              <p>Dados reais do Spring Boot em http://localhost:8081</p>
            </div>
            <span className={`status ${status}`}>{status}</span>
          </div>

          {status === "loading" && (
            <div className="loading-state">
              <Loader2 className="spin" />
              Buscando dados reais da API...
            </div>
          )}

          {status === "error" && (
            <div className="error-box">
              {error}
              <small>
                Confirme se o Spring Boot esta rodando na porta 8080 e se o
                usuario possui permissao para este endpoint.
              </small>
            </div>
          )}

          {status === "success" && (
            active === "overview" ? (
              <ExecutiveDashboard data={data} session={session} />
            ) : active === "pedidos" ? (
              <SalesDashboard
                data={data}
                onRefresh={refreshActiveModule}
                session={session}
              />
            ) : active === "clientes" ? (
              <CustomerDashboard data={data} onRefresh={refreshActiveModule} />
            ) : active === "caixa" ? (
              <CashRegisterDashboard
                data={data}
                onRefresh={refreshActiveModule}
                session={session}
              />
            ) : active === "produtos" ? (
              <ProductDashboard data={data} onRefresh={refreshActiveModule} session={session} />
            ) : active === "financeiro" ? (
              <FinanceDashboard
                data={data}
                onRefresh={refreshActiveModule}
                session={session}
              />
            ) : active === "logistica" ? (
              <LogisticsDashboard data={data} onRefresh={refreshActiveModule} session={session} />
            ) : active === "relatorios" ? (
              <ReportDashboard data={data} session={session} />
            ) : active === "colaboradores" ? (
              <CollaboratorsDashboard data={data} />
            ) : active === "usuarios" ? (
              <UserAdminDashboard
                data={data}
                onRefresh={refreshActiveModule}
                session={session}
              />
            ) : (
              <ModulePreview module={activeModule} data={data} />
            )
          )}
        </section>
      </section>
    </main>
  );
}

export default function App() {
  const [session, setSession] = useState(() => {
    clearLegacyAuth();
    return isAuthenticated() ? getSession() : null;
  });

  function handleLogout() {
    logout();
    setSession(null);
  }

  if (!session) {
    return <LoginScreen onLogin={setSession} />;
  }

  return <Dashboard session={session} onLogout={handleLogout} />;
}
