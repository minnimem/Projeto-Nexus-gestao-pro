import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Barcode,
  Boxes,
  ChartNoAxesCombined,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
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
  clientes: ["ADMIN", "GERENTE", "VENDEDOR"],
  produtos: ["ADMIN", "GERENTE", "VENDEDOR", "ESTOQUISTA"],
  financeiro: ["ADMIN", "GERENTE", "FINANCEIRO"],
  logistica: ["ADMIN", "GERENTE"],
  colaboradores: ["ADMIN", "GERENTE"],
  relatorios: ["ADMIN", "GERENTE", "VENDEDOR", "ESTOQUISTA", "FINANCEIRO"],
  usuarios: ["ADMIN"],
};

function canAccessModule(perfil, moduleValue) {
  return moduleAccess[moduleValue]?.includes(normalizePerfil(perfil));
}

function getAccessibleModules(perfil) {
  return modules.filter((module) => canAccessModule(perfil, module.value));
}

function normalizePerfil(perfil) {
  return String(perfil || "").replace("ROLE_", "").toUpperCase();
}

function canPerform(perfil, action) {
  const role = normalizePerfil(perfil);
  const actionAccess = {
    manageCollaborators: ["ADMIN"],
    editRoute: ["ADMIN", "GERENTE"],
    printRoute: ["ADMIN", "GERENTE"],
    mutateFinance: ["ADMIN", "GERENTE", "FINANCEIRO"],
    reverseFinance: ["ADMIN"],
    seeProfit: ["ADMIN", "GERENTE", "FINANCEIRO"],
  };

  return actionAccess[action]?.includes(role);
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const numberFormatter = new Intl.NumberFormat("pt-BR");

function formatCurrency(value) {
  return currencyFormatter.format(Number(value || 0));
}

function formatNumber(value) {
  return numberFormatter.format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}

function formatShortDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(new Date(value));
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

function printSaleInvoice(sale, companyName = "Nexus One") {
  if (!sale) return;

  const rows = sale.itens
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.nome)}</td>
          <td>${escapeHtml(item.codigoBarras || "-")}</td>
          <td>${escapeHtml(item.quantidade)}</td>
          <td>${escapeHtml(formatCurrency(item.preco))}</td>
          <td>${escapeHtml(formatCurrency(item.preco * item.quantidade))}</td>
        </tr>
      `,
    )
    .join("");

  printHtmlDocument(
    `Nota fiscal ${sale.numero || ""}`.trim(),
    `
      <header>
        <h1>${escapeHtml(companyName)}</h1>
        <p>Nota fiscal / comprovante de venda</p>
        <p><strong>Numero:</strong> ${escapeHtml(sale.numero || sale.id || "-")} |
          <strong>Data:</strong> ${escapeHtml(sale.data)}</p>
      </header>
      <section>
        <p><strong>Cliente:</strong> ${escapeHtml(sale.cliente)}</p>
        <p><strong>Vendedor:</strong> ${escapeHtml(sale.vendedor)}</p>
        <p><strong>Pagamento:</strong> ${escapeHtml(sale.pagamento)}</p>
      </section>
      <h2>Itens</h2>
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
        <div><span>Subtotal</span><strong>${escapeHtml(formatCurrency(sale.subtotal))}</strong></div>
        <div><span>Desconto</span><strong>${escapeHtml(formatCurrency(sale.descontoValor))}</strong></div>
        <div class="grand"><span>Total</span><strong>${escapeHtml(formatCurrency(sale.total))}</strong></div>
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
  const canSeeFinance = canAccessModule(session.perfil, "financeiro");
  const canSeeLogistics = canAccessModule(session.perfil, "logistica");
  const canSeeAdmin = canAccessModule(session.perfil, "usuarios");
  const vendas = data?.vendas || {};
  const financeiro = data?.financeiro || {};
  const clientes = asList(data?.clientes);
  const produtos = asList(data?.produtos);
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
  const rotasAtivas = rotas.filter((rota) =>
    ["ABERTA", "EM_ANDAMENTO"].includes(rota.status),
  ).length;

  const actions = [
    produtos.length === 0 && "Cadastre produtos para liberar vendas no PDV.",
    clientes.length === 0 && "Cadastre clientes para operar pedidos completos.",
    canSeeFinance && Number(financeiro?.lancamentos || 0) === 0 && "Registre receitas/despesas para ativar o painel financeiro.",
    canSeeLogistics && rotas.length === 0 && "Crie rotas para demonstrar a operacao logistica.",
    canSeeAdmin && usuarios.length <= 1 && "Crie usuarios operacionais para demonstrar permissao por perfil.",
  ].filter(Boolean);

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

        <aside className="panel side-panel">
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
                <AlertTriangle size={18} />
                <div>
                  <strong>{formatNumber(estoqueBaixo.length)} item(ns) precisam de reposicao</strong>
                  <div className="priority-stock-list">
                    {estoqueBaixo.slice(0, 5).map((item) => (
                      <div className="priority-stock-row" key={item.produtoId || item.id || getStockProductName(item)}>
                        <span>{getStockProductName(item)}</span>
                        <small>
                          Atual {formatNumber(getStockQuantity(item))} / Min {formatNumber(getStockMinimum(item))}
                        </small>
                      </div>
                    ))}
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

function SalesOverview({ data, onRefresh }) {
  const [chartPeriod, setChartPeriod] = useState("dia");
  const [orderStatusFilter, setOrderStatusFilter] = useState("todos");
  const [orderPeriodFilter, setOrderPeriodFilter] = useState("todos");
  const [finalizingOrder, setFinalizingOrder] = useState("");
  const [orderMessage, setOrderMessage] = useState(null);
  const ultimosPedidos = data?.ultimosPedidos || [];
  const rankingProdutos = data?.rankingProdutos || [];
  const vendasPorDia = data?.vendasPorDia || [];
  const chartRows = groupSalesByPeriod(vendasPorDia, chartPeriod);
  const maxSaleValue = Math.max(...chartRows.map((item) => item.value), 1);
  const totalChartValue = chartRows.reduce((total, item) => total + item.value, 0);
  const topProducts = rankingProdutos.slice(0, 5);
  const maxProductQty = Math.max(...topProducts.map((item) => Number(item.quantidade || 0)), 1);
  const orderStatusOptions = [
    { value: "todos", label: "Todos" },
    { value: "FINALIZADA", label: "Finalizadas" },
    { value: "PENDENTE", label: "Pendentes" },
    { value: "RECEBIDO", label: "Recebidos" },
  ];
  const orderPeriodOptions = [
    { value: "todos", label: "Tudo", days: null },
    { value: "7", label: "7 dias", days: 7 },
    { value: "30", label: "30 dias", days: 30 },
  ];
  const selectedOrderPeriod = orderPeriodOptions.find((option) => option.value === orderPeriodFilter);
  const filteredOrders = ultimosPedidos.filter((pedido) => {
    const statusOk = orderStatusFilter === "todos" || pedido.status === orderStatusFilter;
    const periodOk = isWithinLastDays(pedido.data, selectedOrderPeriod?.days);
    return statusOk && periodOk;
  });

  async function handleFinalizeOrder(id) {
    setFinalizingOrder(id);
    setOrderMessage(null);

    try {
      await endpoints.pedidos.finalizar(id);
      setOrderMessage({ type: "success", text: "Entrega/pagamento confirmado. Venda concretizada com sucesso." });
      await onRefresh();
    } catch (err) {
      setOrderMessage({ type: "error", text: err.message });
    } finally {
      setFinalizingOrder("");
    }
  }

  return (
    <div className="dashboard-view">
      <section className="kpi-grid">
        <KpiCard
          icon={ShoppingCart}
          label="Total de vendas"
          value={formatNumber(data?.totalVendas)}
          detail="Pedidos entregues no periodo"
          tone="blue"
        />
        <KpiCard
          icon={ClipboardList}
          label="Pendentes"
          value={formatNumber(data?.pedidosPendentes)}
          detail="Pedidos aguardando andamento"
          tone="amber"
        />
        <KpiCard
          icon={CircleDollarSign}
          label="Receita total"
          value={formatCurrency(data?.receitaTotal)}
          detail="Somatorio de vendas concluidas"
          tone="green"
        />
        <KpiCard
          icon={ArrowUpRight}
          label="Vendas hoje"
          value={formatCurrency(data?.vendasHoje)}
          detail={`${formatNumber(data?.crescimento)}% vs periodo anterior`}
          tone="dark"
        />
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

      <section className="dashboard-grid">
        <article className="panel orders-panel">
          <div className="panel-title">
            <div>
              <h2>Ultimos pedidos</h2>
              <p>Movimentacoes recentes vindas do PostgreSQL.</p>
            </div>
            <span>{filteredOrders.length} registros</span>
          </div>

          {orderMessage && <p className={`form-message ${orderMessage.type}`}>{orderMessage.text}</p>}

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

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th>Valor</th>
                  <th>Acao</th>
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
                        {pedido.status === "PENDENTE" ? (
                          <div className="table-actions">
                            <button
                              disabled={finalizingOrder === pedido.id}
                              onClick={() => handleFinalizeOrder(pedido.id)}
                              type="button"
                            >
                              {finalizingOrder === pedido.id ? "Confirmando..." : "Confirmar pagamento"}
                            </button>
                          </div>
                        ) : (
                          "-"
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

function getPriorityPayload(value) {
  const priorities = {
    BAIXA: "Baixa",
    NORMAL: "Normal",
    ALTA: "Alta",
    URGENTE: "Urgente",
  };
  return priorities[value] || value || "Normal";
}

function PointOfSale({ produtos, clientes, session, onSaleCreated }) {
  const [selectedClienteId, setSelectedClienteId] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [priority, setPriority] = useState("Normal");
  const [paymentMethod, setPaymentMethod] = useState("PIX");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [lastSale, setLastSale] = useState(null);
  const isPayOnDelivery = paymentMethod === "PAGAR_NA_ENTREGA";

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
        prioridade: getPriorityPayload(priority),
        metodoPagamento: paymentMethod,
        desconto: Number(discount || 0),
        itens: cart.map((item) => ({
          produtoId: item.produtoId,
          quantidade: item.quantidade,
        })),
      });

      if (isPayOnDelivery) {
        setLastSale(null);
      } else {
        setLastSale({
          id: pedido.id,
          numero: pedido.numero,
          cliente: selectedCliente ? getClientName(selectedCliente) : "Cliente nao informado",
          vendedor: session.nome || session.login || session.perfil || "Usuario",
          pagamento: paymentMethod,
          data: new Date().toLocaleString("pt-BR"),
          itens: cart,
          subtotal,
          descontoValor,
          total,
        });
      }

      setCart([]);
      setDiscount(0);
      setProductSearch("");
      setClientSearch("");
      setSelectedClienteId("");
      setMessage({
        type: "success",
        text: isPayOnDelivery
          ? `Pedido ${pedido.numero || ""} registrado para pagamento na entrega. A venda so sera concretizada apos confirmar entrega/pagamento.`
          : `Venda ${pedido.numero || ""} registrada com sucesso.`,
      });
      await onSaleCreated();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="pos-grid" onSubmit={handleSubmit}>
      <article className="panel pos-panel">
        <div className="panel-title">
          <div>
            <h2>Nova venda</h2>
            <p>Monte o pedido com cliente, itens, prioridade e desconto.</p>
          </div>
          <span>{formatNumber(activeProducts.length)} produtos</span>
        </div>

        <div className="pos-form-grid">
          <label className="form-control client-picker-control">
            <span>Cliente</span>
            <div className="client-search-box">
              <Search size={17} />
              <input
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

          <label className="form-control">
            <span>Prioridade</span>
            <select value={priority} onChange={(event) => setPriority(event.target.value)}>
              <option value="Normal">Normal</option>
              <option value="Alta">Alta</option>
              <option value="Urgente">Urgente</option>
              <option value="Baixa">Baixa</option>
            </select>
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
              <option value="PAGAR_NA_ENTREGA">Pagar na entrega</option>
            </select>
          </label>
        </div>

        <label className="search-field product-search">
          <Search size={17} />
          <input
            value={productSearch}
            onChange={(event) => setProductSearch(event.target.value)}
            placeholder="Buscar produto para adicionar"
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

        {message && <p className={`form-message ${message.type}`}>{message.text}</p>}

        {lastSale && (
          <button
            className="invoice-button"
            onClick={() => printSaleInvoice(lastSale, session?.empresa || "Nexus One")}
            type="button"
          >
            <Printer size={17} />
            Imprimir nota fiscal
          </button>
        )}

        <button className="checkout-button" disabled={saving} type="submit">
          {saving ? <Loader2 className="spin" size={17} /> : <CreditCard size={17} />}
          {saving ? "Registrando..." : isPayOnDelivery ? "Registrar para entrega" : "Finalizar venda"}
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
        <SalesOverview data={dashboard} onRefresh={onRefresh} />
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

function CustomerDashboard({ data, onRefresh }) {
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(initialCustomerForm);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const clientes = asList(data);

  const clientesComEmail = clientes.filter((cliente) => cliente.email).length;
  const clientesComTelefone = clientes.filter((cliente) => cliente.telefone).length;
  const clientesNovosMes = clientes.filter((cliente) => {
    if (!cliente.dataCriacao) return false;
    const criado = new Date(cliente.dataCriacao);
    const hoje = new Date();
    return criado.getMonth() === hoje.getMonth() && criado.getFullYear() === hoje.getFullYear();
  }).length;

  const filteredClientes = clientes.filter((cliente) => {
    const text = `${cliente.nome || ""} ${cliente.cpf || ""} ${cliente.email || ""}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

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
          value={formatNumber(clientes.length)}
          detail="Base comercial ativa"
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

          <label className="search-field">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome, CPF ou email"
            />
          </label>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Contato</th>
                  <th>Endereco</th>
                  <th>Nascimento</th>
                  <th>Cadastro</th>
                </tr>
              </thead>
              <tbody>
                {filteredClientes.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-cell">
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
                      <td>
                        <span className="code-cell">
                          <MapPin size={14} />
                          {cliente.endereco || "-"}
                        </span>
                      </td>
                      <td>{formatDate(cliente.dataNascimento)}</td>
                      <td>{formatDate(cliente.dataCriacao)}</td>
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
};

function ProductDashboard({ data, onRefresh }) {
  const [search, setSearch] = useState("");
  const [stockProductSearch, setStockProductSearch] = useState("");
  const [productForm, setProductForm] = useState(initialProductForm);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productSaving, setProductSaving] = useState(false);
  const [productMessage, setProductMessage] = useState(null);
  const [adjustment, setAdjustment] = useState({
    produtoId: "",
    quantidade: 1,
    type: "entrada",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const produtos = asList(data?.produtos);
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
  const ativos = produtos.filter((produto) => produto.ativo).length;
  const saldoEstoque = produtos.reduce(
    (total, produto) => total + Number(getProductStockQuantity(produto)),
    0,
  );
  const valorCatalogo = produtos.reduce(
    (total, produto) => total + Number(produto.precoComDesconto || produto.precoVenda || 0),
    0,
  );
  const selectedProduct = produtos.find((produto) => produto.id === adjustment.produtoId);
  const stockSearchResults = produtos
    .filter((produto) => {
      const text = `${produto.nome || ""} ${produto.codigoBarras || ""}`.toLowerCase();
      return text.includes(stockProductSearch.toLowerCase());
    })
    .slice(0, 8);

  const filteredProducts = produtos.filter((produto) => {
    const text = `${produto.nome || ""} ${produto.codigoBarras || ""}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

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
          value={formatNumber(produtos.length)}
          detail="Catalogo conectado ao PostgreSQL"
          tone="blue"
        />
        <KpiCard
          icon={CheckCircle2}
          label="Unidades em estoque"
          value={formatNumber(saldoEstoque)}
          detail={`${formatNumber(ativos)} produtos ativos para venda`}
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
      </section>

      <section className="dashboard-grid inventory-grid">
        <article className="panel orders-panel">
          <div className="panel-title">
            <div>
              <h2>Produtos e estoque</h2>
              <p>Lista real consumida do endpoint /produtos.</p>
            </div>
            <div className="panel-actions">
              <span>{filteredProducts.length} itens</span>
              <button
                className="panel-action-button"
                onClick={() => {
                  setProductMessage(null);
                  setShowProductForm(true);
                }}
                type="button"
              >
                <Plus size={17} />
                Novo produto
              </button>
            </div>
          </div>

          <label className="search-field">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome ou codigo de barras"
            />
          </label>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Codigo</th>
                  <th>Preco</th>
                  <th>Lucro</th>
                  <th>Estoque</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-cell">
                      Nenhum produto encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((produto) => (
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
                      <td>
                        <strong>{formatCurrency(produto.precoComDesconto)}</strong>
                        <small>Base {formatCurrency(produto.precoVenda)}</small>
                      </td>
                      <td>{formatProfit(produto.lucro)}</td>
                      <td>
                        <span
                          className={`stock-badge ${
                            isLowStockProduct(produto)
                              ? "low"
                              : getProductStockQuantity(produto) > 0
                                ? "ok"
                                : "empty"
                          }`}
                        >
                          {formatNumber(getProductStockQuantity(produto))}
                        </span>
                        <small>Min {formatNumber(getProductStockMinimum(produto))}</small>
                      </td>
                      <td>
                        <span className={`pill ${produto.ativo ? "entregue" : "cancelado"}`}>
                          {produto.ativo ? "ATIVO" : "INATIVO"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>

        <aside className="panel side-panel">
          {showProductForm && (
            <div className="inline-form-panel">
              <div className="panel-title compact">
                <div>
                  <h2>Novo produto</h2>
                  <p>Cadastro comercial conectado ao /produtos.</p>
                </div>
                <button
                  className="modal-close"
                  onClick={() => setShowProductForm(false)}
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

          <div className="ranking stock-alerts">
            <h3>Alertas de estoque</h3>
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
  observacao: "",
};

function FinanceDashboard({ data, session, onRefresh }) {
  const [form, setForm] = useState(initialFinanceForm);
  const [showFinanceForm, setShowFinanceForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const movimentacoes = asList(data?.movimentacoes);
  const canMutateFinance = canPerform(session.perfil, "mutateFinance");
  const canReverseFinance = canPerform(session.perfil, "reverseFinance");
  const canSeeProfit = canPerform(session.perfil, "seeProfit");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.descricao.trim()) {
      setMessage({ type: "error", text: "Informe a descricao do lancamento." });
      return;
    }

    if (Number(form.valor) <= 0) {
      setMessage({ type: "error", text: "Informe um valor maior que zero." });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      await endpoints.financeiro.criar({
        descricao: form.descricao,
        tipo: form.tipo,
        categoria: form.categoria,
        valor: Number(form.valor),
        metodoPagamento: form.metodoPagamento,
        status: form.status,
        usuarioId: session.usuarioId,
        observacao: form.observacao,
      });

      setForm(initialFinanceForm);
      setMessage({ type: "success", text: "Lancamento financeiro registrado." });
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

  return (
    <div className="dashboard-view">
      <section className="kpi-grid">
        <KpiCard
          icon={CircleDollarSign}
          label="Receita"
          value={formatCurrency(data?.receitaTotal)}
          detail="Entradas aprovadas no periodo"
          tone="green"
        />
        <KpiCard
          icon={WalletCards}
          label="Despesas"
          value={formatCurrency(data?.despesas)}
          detail="Saidas aprovadas no periodo"
          tone="amber"
        />
        <KpiCard
          icon={ArrowUpRight}
          label="Lucro"
          value={canSeeProfit ? formatCurrency(data?.lucro) : "Restrito"}
          detail={canSeeProfit ? "Receita menos despesas" : "Visivel para perfis autorizados"}
          tone="dark"
        />
        <KpiCard
          icon={ReceiptText}
          label="Lancamentos"
          value={formatNumber(data?.lancamentos)}
          detail={`${formatNumber(data?.pedidosPagos)} pagamentos aprovados`}
          tone="blue"
        />
      </section>

      <section className={`dashboard-grid finance-grid ${showFinanceForm ? "" : "single-panel-grid"}`}>
        <article className="panel orders-panel">
          <div className="panel-title">
            <div>
              <h2>Movimentacoes financeiras</h2>
              <p>Receitas, despesas, pagamentos, cancelamentos e estornos.</p>
            </div>
            <div className="panel-actions">
              <span>{movimentacoes.length} registros</span>
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
                {movimentacoes.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-cell">
                      Nenhuma movimentacao financeira encontrada.
                    </td>
                  </tr>
                ) : (
                  movimentacoes.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.descricao || "Lancamento sem descricao"}</strong>
                        <small>{formatDate(item.dataLancamento)} / {item.categoria || "Sem categoria"}</small>
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
                          {canReverseFinance && item.status === "APROVADO" ? (
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
                  ))
                )}
              </tbody>
            </table>
          </div>
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
                <input
                  value={form.categoria}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, categoria: event.target.value }))
                  }
                  placeholder="Venda, custo, taxa..."
                />
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
                  </select>
                </label>
              </div>

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

function getRoutePaymentLabel(rota) {
  return rota?.pagamentoEntrega === "PAGAR_NA_ENTREGA" ? "Receber na entrega" : "Ja pago";
}

function printRouteManifest(rota, companyName = "Nexus One") {
  if (!rota) return;

  const deliveryCount = Math.max(1, getRouteDeliveryCount(rota));
  const deliveryRows = Array.from({ length: deliveryCount }, (_, index) => `
    <tr>
      <td>${index + 1}</td>
      <td></td>
      <td></td>
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
              <th>Cliente / destino</th>
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
  });
  const [relationForm, setRelationForm] = useState({
    rotaId: "",
    entregadorId: "",
    veiculoId: "",
  });
  const rotas = asList(data?.rotas);
  const veiculos = asList(data?.veiculos);
  const entregadores = asList(data?.entregadores);
  const canEditRoute = canPerform(session.perfil, "editRoute");
  const canPrintRoute = canPerform(session.perfil, "printRoute");

  const rotasFila = sortRoutesByDate(rotas.filter((rota) => getRouteStatus(rota) === "ABERTA"));
  const rotasEmRota = sortRoutesByDate(
    rotas.filter((rota) => ["EM_ANDAMENTO", "EM_ROTA"].includes(getRouteStatus(rota))),
  );
  const rotasFinalizadas = sortRoutesByDate(
    rotas.filter((rota) => ["FINALIZADA", "FINALIZADO"].includes(getRouteStatus(rota))),
  );
  const rotasAtivas = rotasFila.length + rotasEmRota.length;
  const entregasPlanejadas = rotas.reduce(
    (total, rota) => total + getRouteDeliveryCount(rota),
    0,
  );
  const custoEstimado = rotas.reduce(
    (total, rota) => total + Number(rota.custoEstimado || 0),
    0,
  );
  const todasRotas = sortRoutesByDate(rotas);
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
  const logisticsFormOptions = [
    { value: "veiculo", label: "Veiculo", icon: Truck },
    { value: "entregador", label: "Entregador", icon: UserRound },
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
        quantidadeEntregas: Number(routeForm.quantidadeEntregas || 0),
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
    <div className="dashboard-view">
      <section className="kpi-grid">
        <KpiCard
          icon={PackageCheck}
          label="Fila"
          value={formatNumber(rotasFila.length)}
          detail={`${formatNumber(entregasPlanejadas)} entregas planejadas`}
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
          detail={`${formatNumber(entregadores.length)} entregadores ativos`}
          tone="green"
        />
      </section>

      <section className="dashboard-grid logistics-grid">
        <article className="panel orders-panel">
          <div className="panel-title">
            <div>
              <h2>Rotas logisticas</h2>
              <p>Filtre abertas, em rota e finalizadas vindas do Spring Boot.</p>
            </div>
            <span>{rotasFiltradas.length} rotas</span>
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
                    <td colSpan="8" className="empty-cell">
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
                        <span className={`pill ${rota.pagamentoEntrega === "PAGAR_NA_ENTREGA" ? "pendente" : "aprovado"}`}>
                          {getRoutePaymentLabel(rota)}
                        </span>
                      </td>
                      <td>{formatNumber(getRouteDeliveryCount(rota))}</td>
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
                              onClick={() => printRouteManifest(rota, session?.empresa || "Nexus One")}
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

        <aside className="panel side-panel">
          <div className="panel-title compact">
            <div>
              <h2>Rotas por status</h2>
              <p>Fila, em rota e finalizadas no mesmo painel.</p>
            </div>
          </div>

          {message && <p className={`form-message ${message.type}`}>{message.text}</p>}

          <div className="route-list">
            {rotas.length === 0 ? (
              <div className="empty-selection">Nenhuma rota cadastrada.</div>
            ) : (
              routeGroups.map((group) => (
                <section className="route-section" key={group.title}>
                  <div className="route-section-title">
                    <strong>{group.title}</strong>
                    <span>{formatNumber(group.items.length)}</span>
                  </div>
                  <p>{group.detail}</p>

                  {group.items.length === 0 ? (
                    <div className="empty-selection compact">Nenhuma rota neste status.</div>
                  ) : (
                    group.items.slice(0, 5).map((rota) => {
                      const status = getRouteStatus(rota);
                      return (
                        <div className="route-card" key={rota.id}>
                          <div>
                            <strong>{rota.nome}</strong>
                            <small>
                              {formatDate(rota.dataRota)} / {formatNumber(getRouteDeliveryCount(rota))} entregas / {getRoutePaymentLabel(rota)}
                            </small>
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
                                onClick={() => printRouteManifest(rota, session?.empresa || "Nexus One")}
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
                    })
                  )}
                </section>
              ))
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
                  min="0"
                  type="number"
                  value={routeForm.quantidadeEntregas}
                  onChange={(event) =>
                    setRouteForm((prev) => ({ ...prev, quantidadeEntregas: event.target.value }))
                  }
                />
              </label>
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
                {rotas.map((rota) => (
                  <option key={rota.id} value={rota.id}>
                    {rota.nome} - {formatDate(rota.dataRota)}
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
  cargo: "",
  departamento: "",
  salario: "",
  dataInicio: "",
  telefone: "",
  email: "",
  documento: "",
};

const editableProfiles = ["GERENTE", "VENDEDOR", "ESTOQUISTA", "FINANCEIRO"];

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

function UserAdminDashboard({ data, session, onRefresh }) {
  const [form, setForm] = useState(initialUserForm);
  const [companyForm, setCompanyForm] = useState(initialCompanyForm);
  const [saving, setSaving] = useState(false);
  const [savingCompany, setSavingCompany] = useState(false);
  const [savingProfileId, setSavingProfileId] = useState(null);
  const [message, setMessage] = useState(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const usuarios = asList(data?.usuarios || data);
  const auditoria = asList(data?.auditoria);
  const empresa = data?.empresa || {};
  const ativos = usuarios.filter((usuario) => usuario.ativo !== false).length;
  const admins = usuarios.filter((usuario) => usuario.perfil === "ADMIN").length;
  const bloqueados = usuarios.filter((usuario) => usuario.bloqueado).length;

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

  function updateCompanyForm(field, value) {
    setCompanyForm((prev) => ({ ...prev, [field]: value }));
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
      cargo: usuario.cargo || "",
      departamento: usuario.departamento || "",
      salario: usuario.salario ?? "",
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

  function buildUserPayload(includePassword) {
    return {
      nome: form.nome.trim(),
      login: form.login.trim(),
      senha: includePassword ? form.senha : form.senha ? form.senha : null,
      perfil: form.perfil,
      cargo: form.cargo.trim() || null,
      departamento: form.departamento.trim() || null,
      salario: form.salario ? Number(form.salario) : null,
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
          value={formatNumber(usuarios.length)}
          detail="Acessos cadastrados"
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
          icon={LockKeyhole}
          label="Bloqueados"
          value={formatNumber(bloqueados)}
          detail="Seguranca de login"
          tone="amber"
        />
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
        <article className="panel orders-panel">
          <div className="panel-title">
            <div>
              <h2>Usuarios e permissoes</h2>
              <p>Controle administrativo por perfil e empresa.</p>
            </div>
            <div className="panel-actions">
              <span>{usuarios.length} contas</span>
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
                {usuarios.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-cell">
                      Nenhum usuario cadastrado.
                    </td>
                  </tr>
                ) : (
                  usuarios.map((usuario) => (
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
                      <td>{usuario.empresa || "-"}</td>
                      <td>{formatDate(usuario.dataCriacao)}</td>
                      <td>
                        {usuario.perfil !== "ADMIN" ? (
                          <button
                            className="table-icon-button"
                            onClick={() => openEditUserForm(usuario)}
                            title="Editar colaborador"
                            type="button"
                          >
                            <Pencil size={15} />
                          </button>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="content-grid single">
        <article className="panel">
          <div className="panel-title">
            <div>
              <h2>Ultimas acoes</h2>
              <p>Auditoria de eventos criticos do sistema.</p>
            </div>
            <span>{auditoria.length} eventos</span>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Usuario</th>
                  <th>Modulo</th>
                  <th>Acao</th>
                  <th>Descricao</th>
                </tr>
              </thead>
              <tbody>
                {auditoria.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-cell">
                      Nenhum evento de auditoria registrado.
                    </td>
                  </tr>
                ) : (
                  auditoria.slice(0, 12).map((evento) => (
                    <tr key={evento.id}>
                      <td>{formatDate(evento.dataEvento)}</td>
                      <td>
                        <strong>{evento.usuarioLogin || "-"}</strong>
                        <small>{evento.perfil || "Sem perfil"}</small>
                      </td>
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
                <option value="ESTOQUISTA">Estoquista</option>
                <option value="FINANCEIRO">Financeiro</option>
                <option value="GERENTE">Gerente</option>
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
  const usuarios = asList(data);
  const ativos = usuarios.filter((usuario) => usuario.ativo !== false && !usuario.bloqueado).length;
  const bloqueados = usuarios.filter((usuario) => usuario.bloqueado).length;
  const gerentes = usuarios.filter((usuario) => usuario.perfil === "GERENTE").length;
  const perfis = ["TODOS", ...Array.from(new Set(usuarios.map((usuario) => usuario.perfil).filter(Boolean)))];
  const normalizedSearch = search.trim().toLowerCase();

  const filteredUsers = usuarios.filter((usuario) => {
    const matchesProfile = profileFilter === "TODOS" || usuario.perfil === profileFilter;
    const searchable = [
      usuario.nome,
      usuario.login,
      usuario.perfil,
      usuario.cargo,
      usuario.departamento,
      usuario.telefone,
      usuario.email,
      usuario.empresa,
    ].filter(Boolean).join(" ").toLowerCase();

    return matchesProfile && (!normalizedSearch || searchable.includes(normalizedSearch));
  });

  return (
    <div className="dashboard-view">
      <section className="kpi-grid">
        <KpiCard
          icon={UsersRound}
          label="Colaboradores"
          value={formatNumber(usuarios.length)}
          detail="Equipe cadastrada na empresa"
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
          label="Bloqueados"
          value={formatNumber(bloqueados)}
          detail="Acessos que precisam revisao"
          tone={bloqueados ? "warning" : "success"}
        />
      </section>

      <section className="content-grid single">
        <article className="panel">
          <div className="panel-title compact">
            <div>
              <h2>Equipe da empresa</h2>
              <p>Visualizacao rapida dos colaboradores, perfis e status de acesso.</p>
            </div>
            <span className="counter">{filteredUsers.length} registros</span>
          </div>

          <div className="table-toolbar">
            <div className="search-input">
              <Search size={18} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nome, login ou perfil"
              />
            </div>
            <select
              className="toolbar-select"
              value={profileFilter}
              onChange={(event) => setProfileFilter(event.target.value)}
            >
              {perfis.map((perfil) => (
                <option key={perfil} value={perfil}>
                  {perfil === "TODOS" ? "Todos os perfis" : perfil}
                </option>
              ))}
            </select>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Colaborador</th>
                  <th>Perfil</th>
                  <th>Cargo</th>
                  <th>Contato</th>
                  <th>Status</th>
                  <th>Empresa</th>
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
                        <span className={`pill ${usuario.bloqueado ? "cancelado" : "aprovado"}`}>
                          {usuario.bloqueado ? "BLOQUEADO" : usuario.ativo === false ? "INATIVO" : "ATIVO"}
                        </span>
                      </td>
                      <td>{usuario.empresa || "-"}</td>
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
  const pedidos = asList(data?.pedidos);
  const clientes = asList(data?.clientes);
  const produtos = asList(data?.produtos);
  const financeiro = asList(data?.financeiro);
  const entregas = asList(data?.entregas);
  const rotas = asList(data?.rotas);
  const canSeeFinance = canAccessModule(session.perfil, "financeiro");
  const canSeeLogistics = canAccessModule(session.perfil, "logistica");

  const reportCards = [
    {
      key: "pedidos",
      title: "Vendas",
      icon: ShoppingCart,
      count: pedidos.length,
      detail: "Pedidos cadastrados",
      rows: pedidos.map((item) => ({
        numero: item.numero,
        cliente: item.cliente,
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
      count: financeiro.length,
      detail: "Movimentacoes",
      rows: financeiro.map((item) => ({
        descricao: item.descricao,
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
      count: entregas.length + rotas.length,
      detail: `${formatNumber(entregas.length)} entregas / ${formatNumber(rotas.length)} rotas`,
      rows: [
        ...entregas.map((item) => ({
          tipo: "Entrega",
          codigo: item.numeroPedido || item.id,
          status: item.status,
          prioridade: item.prioridade,
          valor: item.totalPedido,
        })),
        ...rotas.map((item) => ({
          tipo: "Rota",
          codigo: item.nome,
          status: item.status,
          prioridade: item.dataRota,
          valor: item.custoEstimado,
        })),
      ],
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
          label="Perfil"
          value={session.perfil}
          detail="Relatorios filtrados por permissao"
          tone="dark"
        />
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

  const visibleModules = useMemo(
    () => getAccessibleModules(session.perfil),
    [session.perfil],
  );

  const activeModule = useMemo(
    () => visibleModules.find((item) => item.value === active) || visibleModules[0],
    [active, visibleModules],
  );

  async function getModuleData(moduleValue) {
    if (!canAccessModule(session.perfil, moduleValue)) {
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
      ] = await Promise.all([
        canAccessModule(session.perfil, "pedidos")
          ? endpoints.dashboard.pedidos()
          : Promise.resolve({}),
        canAccessModule(session.perfil, "clientes")
          ? endpoints.clientes.listar()
          : Promise.resolve([]),
        canAccessModule(session.perfil, "produtos")
          ? endpoints.produtos.listar()
          : Promise.resolve([]),
        canAccessModule(session.perfil, "produtos")
          ? endpoints.estoque.baixo()
          : Promise.resolve([]),
        canAccessModule(session.perfil, "financeiro")
          ? endpoints.financeiro.resumo()
          : Promise.resolve({ restricted: true }),
        canAccessModule(session.perfil, "logistica")
          ? endpoints.logistica.resumo()
          : Promise.resolve([]),
        canAccessModule(session.perfil, "logistica")
          ? endpoints.logistica.rotas()
          : Promise.resolve([]),
        canAccessModule(session.perfil, "logistica")
          ? endpoints.logistica.veiculosAtivos()
          : Promise.resolve([]),
        canAccessModule(session.perfil, "logistica")
          ? endpoints.logistica.entregadoresAtivos()
          : Promise.resolve([]),
        canAccessModule(session.perfil, "usuarios")
          ? endpoints.usuarios.listar()
          : Promise.resolve([]),
      ]);

      return {
        vendas,
        clientes,
        produtos,
        estoqueBaixo,
        financeiro,
        logistica: { entregas, rotas, veiculos, entregadores },
        usuarios,
      };
    }

    if (moduleValue === "pedidos") {
      const [dashboard, produtos, clientes] = await Promise.all([
        endpoints.dashboard.pedidos(),
        endpoints.produtos.listar(),
        endpoints.clientes.listar(),
      ]);

      return { dashboard, produtos, clientes };
    }

    if (moduleValue === "produtos") {
      const [produtos, estoqueBaixo] = await Promise.all([
        endpoints.produtos.listar(),
        endpoints.estoque.baixo(),
      ]);

      return { produtos, estoqueBaixo };
    }

    if (moduleValue === "clientes") {
      return endpoints.clientes.listar();
    }

    if (moduleValue === "financeiro") {
      return endpoints.financeiro.resumo();
    }

    if (moduleValue === "relatorios") {
      const [
        pedidos,
        clientes,
        produtos,
        financeiro,
        entregas,
        rotas,
      ] = await Promise.all([
        canAccessModule(session.perfil, "pedidos")
          ? endpoints.pedidos.listar()
          : Promise.resolve([]),
        canAccessModule(session.perfil, "clientes")
          ? endpoints.clientes.listar()
          : Promise.resolve([]),
        canAccessModule(session.perfil, "produtos")
          ? endpoints.produtos.listar()
          : Promise.resolve([]),
        canAccessModule(session.perfil, "financeiro")
          ? endpoints.financeiro.listar()
          : Promise.resolve([]),
        canAccessModule(session.perfil, "logistica")
          ? endpoints.logistica.resumo()
          : Promise.resolve([]),
        canAccessModule(session.perfil, "logistica")
          ? endpoints.logistica.rotas()
          : Promise.resolve([]),
      ]);

      return { pedidos, clientes, produtos, financeiro, entregas, rotas };
    }

    if (moduleValue === "usuarios") {
      if (session.perfil !== "ADMIN") {
        return { restricted: true };
      }

      const [usuarios, auditoria, empresa] = await Promise.all([
        endpoints.usuarios.listar(),
        endpoints.auditoria.listar(),
        endpoints.empresa.minha(),
      ]);

      return { usuarios, auditoria, empresa };
    }

    if (moduleValue === "colaboradores") {
      return endpoints.usuarios.listar();
    }

    const [entregas, rotas, veiculos, entregadores] = await Promise.all([
      endpoints.logistica.resumo(),
      endpoints.logistica.rotas(),
      endpoints.logistica.veiculosAtivos(),
      endpoints.logistica.entregadoresAtivos(),
    ]);

    return { entregas, rotas, veiculos, entregadores };
  }

  useEffect(() => {
    let ignore = false;

    async function load() {
      setStatus("loading");
      setError("");

      try {
        const response = await getModuleData(active);

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
      const response = await getModuleData(active);
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
            return (
              <button
                className={active === item.value ? "active" : ""}
                key={item.value}
                onClick={() => setActive(item.value)}
              >
                <Icon size={18} />
                {item.label}
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
              <p>Dados reais do Spring Boot em http://localhost:8080</p>
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
            ) : active === "produtos" ? (
              <ProductDashboard data={data} onRefresh={refreshActiveModule} />
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
