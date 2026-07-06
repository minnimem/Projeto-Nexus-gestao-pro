import { asList, formatNumber } from "./formatters.js";

export function getCustomerInitials(name) {
  return String(name || "Cliente")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function getClientId(cliente) {
  return cliente.id || cliente.idCliente;
}

export function getClientName(cliente) {
  return cliente.nome || "Cliente sem nome";
}

export function getOrderProductSummary(pedido) {
  const items = asList(pedido.itens);

  if (items.length === 0) {
    return pedido.produto || pedido.nomeProduto || "Produtos não carregados";
  }

  return items
    .map((item) => {
      const name =
        item.produto?.nomeProduto ||
        item.produto?.nome ||
        item.produto ||
        item.nomeProduto ||
        item.descricao ||
        "Produto sem nome";
      const quantity = item.quantidade ? `${formatNumber(item.quantidade)}x ` : "";
      return `${quantity}${name}`;
    })
    .join(", ");
}

export function buildClientsFromOrders(pedidos) {
  const clientesPorId = new Map();

  asList(pedidos).forEach((pedido) => {
    const id = pedido.clienteId || pedido.idCliente;
    const nome = pedido.cliente || pedido.clienteNome || pedido.nomeCliente;
    if (!id && !nome) return;

    const key = String(id || nome);
    if (!clientesPorId.has(key)) {
      clientesPorId.set(key, {
        id,
        idCliente: id,
        nome: nome || "Cliente sem nome",
        email: pedido.clienteEmail || "",
        telefone: pedido.clienteTelefone || "",
        endereco: pedido.clienteEndereco || "",
        origemFallback: true,
      });
    }
  });

  return Array.from(clientesPorId.values());
}
