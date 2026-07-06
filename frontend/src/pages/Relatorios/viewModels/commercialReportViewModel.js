import {
  asList,
  formatCurrency,
  formatDate,
  formatNumber,
  formatPercent,
  getLocalDateKey,
} from "../../../utils/formatters.js";
import { getPaymentMethodLabel } from "../../../utils/payments.js";
import { isCompletedSale } from "./salesPeriodReportViewModel.js";

export function buildCommercialReportViewModel({
  clientes,
  filteredPedidos,
  salesReportTotal,
  todayKey,
  vendasConcluidas,
}) {
  const paymentSummaryRows = Array.from(
    vendasConcluidas.reduce((acc, pedido) => {
      const metodo = getPaymentMethodLabel(pedido.metodoPagamento);
      const current = acc.get(metodo) || { metodo, total: 0, vendas: 0 };
      current.total += Number(pedido.valor || 0);
      current.vendas += 1;
      acc.set(metodo, current);
      return acc;
    }, new Map()).values(),
  ).sort((a, b) => b.total - a.total);

  const dominantPaymentMethod = paymentSummaryRows[0] || null;
  const paymentReportRows = paymentSummaryRows.map((row) => ({
    "Forma de pagamento": row.metodo,
    Vendas: formatNumber(row.vendas),
    Total: formatCurrency(row.total),
    Participacao: salesReportTotal > 0 ? `${formatPercent((row.total / salesReportTotal) * 100)}%` : "0%",
    "Ticket médio": formatCurrency(row.vendas > 0 ? row.total / row.vendas : 0),
  }));

  const customerRevenueRows = Array.from(
    vendasConcluidas.reduce((acc, pedido) => {
      const key = pedido.clienteId || pedido.cliente || "SEM_CLIENTE";
      const current = acc.get(key) || {
        cliente: pedido.cliente || "Cliente não informado",
        vendas: 0,
        total: 0,
        ultimaCompra: "",
      };
      const saleKey = getLocalDateKey(pedido.data);
      current.vendas += 1;
      current.total += Number(pedido.valor || 0);
      if (!current.ultimaCompra || saleKey > current.ultimaCompra) current.ultimaCompra = saleKey;
      acc.set(key, current);
      return acc;
    }, new Map()).values(),
  ).sort((a, b) => b.total - a.total);

  const customerRevenueReportRows = customerRevenueRows.map((row, index) => ({
    Posicao: index + 1,
    Cliente: row.cliente,
    Vendas: formatNumber(row.vendas),
    Receita: formatCurrency(row.total),
    "Ticket médio": formatCurrency(row.vendas > 0 ? row.total / row.vendas : 0),
    "Última compra": row.ultimaCompra ? formatDate(row.ultimaCompra) : "-",
  }));

  const activeCustomerKeys = new Set(
    vendasConcluidas.map((pedido) => String(pedido.clienteId || pedido.cliente || "")),
  );
  const dormantCustomerRows = clientes
    .filter((cliente) => !activeCustomerKeys.has(String(cliente.id || cliente.nome || "")))
    .map((cliente) => {
      const customerOrders = filteredPedidos
        .filter((pedido) =>
          String(pedido.clienteId || pedido.cliente || "") === String(cliente.id || cliente.nome || ""),
        )
        .filter((pedido) => isCompletedSale(pedido))
        .sort((a, b) => String(getLocalDateKey(b.data)).localeCompare(String(getLocalDateKey(a.data))));
      const lastOrder = customerOrders[0] || {};
      const lastDate = getLocalDateKey(lastOrder.data || cliente.ultimaCompra || cliente.dataUltimaCompra);
      const daysInactive = lastDate
        ?
        Math.max(0, Math.round((new Date(`${todayKey}T00:00:00`).getTime() - new Date(`${lastDate}T00:00:00`).getTime()) / 86400000))
        : null;
      return {
        Cliente: cliente.nome || cliente.razaoSocial || "Cliente sem nome",
        Telefone: cliente.telefone || "-",
        Email: cliente.email || "-",
        "Última compra": lastDate ? formatDate(lastDate) : "Sem histórico",
        "Dias sem compra": daysInactive == null ? "Sem histórico" : formatNumber(daysInactive),
        Acao: daysInactive == null || daysInactive > 90 ? "Reativar com contato consultivo" : "Agendar follow-up preventivo",
      };
    })
    .sort((a, b) => {
      const aDays = Number(String(a["Dias sem compra"]).replace(/\D/g, "")) || 9999;
      const bDays = Number(String(b["Dias sem compra"]).replace(/\D/g, "")) || 9999;
      return bDays - aDays;
    });

  const productSalesRows = Array.from(
    vendasConcluidas.reduce((acc, pedido) => {
      asList(pedido.itens).forEach((item) => {
        const productName = item.produto || item.nomeProduto || item.descricao || "Produto sem nome";
        const current = acc.get(productName) || {
          produto: productName,
          quantidade: 0,
          receita: 0,
          pedidos: 0,
        };
        const quantidade = Number(item.quantidade || 0);
        const unitPrice = Number(item.precoUnit || item.precoUnitario || item.preco || 0);
        current.quantidade += quantidade;
        current.receita += Number(item.subtotal || quantidade * unitPrice || 0);
        current.pedidos += 1;
        acc.set(productName, current);
      });
      return acc;
    }, new Map()).values(),
  ).sort((a, b) => b.receita - a.receita || b.quantidade - a.quantidade);

  const productSalesReportRows = productSalesRows.map((row, index) => ({
    Posicao: index + 1,
    Produto: row.produto,
    Quantidade: formatNumber(row.quantidade),
    Receita: formatCurrency(row.receita),
    Pedidos: formatNumber(row.pedidos),
    "Preco médio": formatCurrency(row.quantidade > 0 ? row.receita / row.quantidade : 0),
    Acao: index < 3 ? "Garantir estoque e destaque comercial" : "Monitorar giro no período",
  }));

  return {
    customerRevenueReportRows,
    dominantPaymentMethod,
    dormantCustomerRows,
    paymentReportRows,
    productSalesReportRows,
  };
}
