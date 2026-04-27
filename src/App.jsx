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
  Loader2,
  LockKeyhole,
  LogOut,
  Minus,
  PackageCheck,
  Plus,
  ReceiptText,
  Route,
  Search,
  ShieldCheck,
  ShoppingCart,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";
import { getSession, isAuthenticated, login, logout } from "./services/auth";
import { endpoints } from "./services/resources";

const modules = [
  { label: "Vendas", icon: ShoppingCart, value: "pedidos" },
  { label: "Estoque", icon: Boxes, value: "produtos" },
  { label: "Financeiro", icon: WalletCards, value: "financeiro" },
  { label: "Logistica", icon: Route, value: "logistica" },
];

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

function getDataCount(data) {
  if (Array.isArray(data)) return data.length;
  if (data && typeof data === "object") return Object.keys(data).length;
  return 0;
}

function asList(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.value)) return value.value;
  return [];
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

function SalesOverview({ data }) {
  const ultimosPedidos = data?.ultimosPedidos || [];
  const rankingProdutos = data?.rankingProdutos || [];
  const vendasPorDia = data?.vendasPorDia || [];

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

      <section className="dashboard-grid">
        <article className="panel orders-panel">
          <div className="panel-title">
            <div>
              <h2>Ultimos pedidos</h2>
              <p>Movimentacoes recentes vindas do PostgreSQL.</p>
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

function PointOfSale({ produtos, clientes, session, onSaleCreated }) {
  const [selectedClienteId, setSelectedClienteId] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [priority, setPriority] = useState("NORMAL");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

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

  const subtotal = cart.reduce(
    (total, item) => total + item.preco * item.quantidade,
    0,
  );
  const descontoValor = subtotal * (Number(discount || 0) / 100);
  const total = Math.max(subtotal - descontoValor, 0);

  function addProduct(produto) {
    const produtoId = getProductId(produto);

    if (!produtoId) {
      setMessage({ type: "error", text: "Produto sem identificador valido." });
      return;
    }

    setCart((prev) => {
      const exists = prev.find((item) => item.produtoId === produtoId);

      if (exists) {
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
        },
      ];
    });
  }

  function changeQuantity(produtoId, delta) {
    setCart((prev) =>
      prev.map((item) =>
        item.produtoId === produtoId
          ? { ...item, quantidade: Math.max(1, item.quantidade + delta) }
          : item,
      ),
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

    setSaving(true);
    setMessage(null);

    try {
      const pedido = await endpoints.pedidos.criar({
        clienteId: selectedClienteId,
        usuarioId: session.usuarioId,
        prioridade: priority,
        desconto: Number(discount || 0),
        itens: cart.map((item) => ({
          produtoId: item.produtoId,
          quantidade: item.quantidade,
        })),
      });

      setCart([]);
      setDiscount(0);
      setProductSearch("");
      setMessage({
        type: "success",
        text: `Venda ${pedido.numero || ""} registrada com sucesso.`,
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
          <label className="form-control">
            <span>Cliente</span>
            <select
              value={selectedClienteId}
              onChange={(event) => setSelectedClienteId(event.target.value)}
            >
              <option value="">Selecione o cliente</option>
              {clientes.map((cliente) => (
                <option value={getClientId(cliente)} key={getClientId(cliente)}>
                  {getClientName(cliente)}
                </option>
              ))}
            </select>
          </label>

          <label className="form-control">
            <span>Prioridade</span>
            <select value={priority} onChange={(event) => setPriority(event.target.value)}>
              <option value="NORMAL">Normal</option>
              <option value="ALTA">Alta</option>
              <option value="URGENTE">Urgente</option>
              <option value="BAIXA">Baixa</option>
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
                  <small>{produto.codigoBarras || "Sem codigo"}</small>
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
                  <small>{formatCurrency(item.preco)} un.</small>
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

        <button className="checkout-button" disabled={saving} type="submit">
          {saving ? <Loader2 className="spin" size={17} /> : <CreditCard size={17} />}
          {saving ? "Registrando..." : "Finalizar venda"}
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
        <SalesOverview data={dashboard} />
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

function ProductDashboard({ data, onRefresh }) {
  const [search, setSearch] = useState("");
  const [adjustment, setAdjustment] = useState({
    produtoId: "",
    quantidade: 1,
    type: "entrada",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const produtos = asList(data?.produtos);
  const estoqueBaixo = asList(data?.estoqueBaixo);
  const ativos = produtos.filter((produto) => produto.ativo).length;
  const valorCatalogo = produtos.reduce(
    (total, produto) => total + Number(produto.precoComDesconto || produto.precoVenda || 0),
    0,
  );

  const filteredProducts = produtos.filter((produto) => {
    const text = `${produto.nome || ""} ${produto.codigoBarras || ""}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  async function handleAdjustment(event) {
    event.preventDefault();
    if (!adjustment.produtoId || Number(adjustment.quantidade) <= 0) {
      setMessage("Selecione um produto e informe uma quantidade valida.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      if (adjustment.type === "entrada") {
        await endpoints.estoque.entrada(adjustment.produtoId, adjustment.quantidade);
      } else {
        await endpoints.estoque.saida(adjustment.produtoId, adjustment.quantidade);
      }

      setMessage("Estoque atualizado com sucesso.");
      await onRefresh();
    } catch (err) {
      setMessage(err.message);
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
          label="Produtos ativos"
          value={formatNumber(ativos)}
          detail="Itens disponiveis para venda"
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
            <span>{filteredProducts.length} itens</span>
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
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-cell">
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
                      <td>{formatNumber(produto.lucro)}%</td>
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
          <div className="panel-title compact">
            <div>
              <h2>Ajuste rapido</h2>
              <p>Entrada e saida conectadas ao Spring Boot.</p>
            </div>
          </div>

          <form className="stock-form" onSubmit={handleAdjustment}>
            <label>
              <span>Produto</span>
              <select
                value={adjustment.produtoId}
                onChange={(event) =>
                  setAdjustment((prev) => ({ ...prev, produtoId: event.target.value }))
                }
              >
                <option value="">Selecione</option>
                {produtos.map((produto) => (
                  <option value={produto.id} key={produto.id}>
                    {produto.nome}
                  </option>
                ))}
              </select>
            </label>

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

            {message && <p className="form-message">{message}</p>}
          </form>

          <div className="ranking stock-alerts">
            <h3>Alertas de estoque</h3>
            {estoqueBaixo.length === 0 ? (
              <p>Nenhum produto em estoque baixo agora.</p>
            ) : (
              estoqueBaixo.map((item) => (
                <div className="ranking-row" key={item.id || getStockProductName(item)}>
                  <span>{getStockProductName(item)}</span>
                  <strong>{formatNumber(getStockQuantity(item))}</strong>
                </div>
              ))
            )}
          </div>
        </aside>
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const session = await login(form);
      onLogin(session);
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
        <form className="login-card" onSubmit={handleSubmit}>
          <div className="secure">
            <ShieldCheck size={16} />
            API protegida por JWT
          </div>

          <header>
            <h2>Acesse sua conta</h2>
            <p>Use o login cadastrado no Spring Boot.</p>
          </header>

          {error && <div className="error-box">{error}</div>}

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
        </form>
      </section>
    </main>
  );
}

function Dashboard({ session, onLogout }) {
  const [active, setActive] = useState("pedidos");
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const activeModule = useMemo(
    () => modules.find((item) => item.value === active),
    [active],
  );

  async function getModuleData(moduleValue) {
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

    if (moduleValue === "financeiro") {
      return endpoints.financeiro.resumo();
    }

    return endpoints.logistica.resumo();
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
  }, [active]);

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
          {modules.map((item) => {
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
          {modules.map((item) => {
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
            active === "pedidos" ? (
              <SalesDashboard
                data={data}
                onRefresh={refreshActiveModule}
                session={session}
              />
            ) : active === "produtos" ? (
              <ProductDashboard data={data} onRefresh={refreshActiveModule} />
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
  const [session, setSession] = useState(() =>
    isAuthenticated() ? getSession() : null,
  );

  function handleLogout() {
    logout();
    setSession(null);
  }

  if (!session) {
    return <LoginScreen onLogin={setSession} />;
  }

  return <Dashboard session={session} onLogout={handleLogout} />;
}
