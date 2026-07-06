import { asList, formatDateOnly, formatDateTime } from "../../../utils/formatters";

export function mapOrderItems({ itensPedido, itensResponse }) {
  return (itensPedido.length > 0 ? itensPedido : asList(itensResponse)).map((item) => ({
    nome: item.produto || item.nomeProduto || "Produto sem nome",
    codigoBarras: item.codigoBarras || item.sku || "",
    quantidade: Number(item.quantidade || 0),
    preco: Number(item.precoUnit || item.precoUnitario || item.preco || 0),
  }));
}

export function buildSavedQuotePrintData({ itens, pedido }) {
  const subtotal = itens.reduce((total, item) => total + item.quantidade * item.preco, 0);
  const total = Number(pedido.valor || pedido.total || subtotal);
  const descontoValor = Math.max(subtotal - total, 0);

  return {
    numero: pedido.numero || pedido.id,
    cliente: pedido.cliente || "Cliente não informado",
    vendedor: pedido.usuario || pedido.vendedor || "Usuário",
    filial: pedido.filial || "Empresa / sem filial",
    data: formatDateTime(pedido.data),
    validade: pedido.validadeProposta ? formatDateOnly(pedido.validadeProposta) : "A combinar",
    entrega: pedido.tipoEntregaDescricao || pedido.tipoEntrega || "Retirada na loja",
    itens,
    subtotal,
    descontoValor,
    total,
    observacao: pedido.observacaoEntrega || pedido.observacao || "",
    condicoesComerciais: pedido.condicoesComerciais || "",
  };
}

export function buildFiscalMirrorPrintData({ itens, pedido }) {
  return {
    id: pedido.id,
    numero: pedido.numero,
    cliente: pedido.cliente || "Cliente não informado",
    filial: pedido.filial || "Empresa / sem filial",
    data: pedido.data,
    valor: pedido.valor || pedido.total,
    itens,
  };
}
