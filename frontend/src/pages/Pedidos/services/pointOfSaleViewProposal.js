import { getClientName } from "../../../utils/customers";
import { formatCurrency, formatDateOnly, formatNumber, getLocalDateKey } from "../../../utils/formatters";

export function getPointOfSaleProposalView({
  cart,
  deliveryAddress,
  deliveryNote,
  deliveryType,
  descontoValor,
  proposalBranchLabel,
  quoteConditions,
  quoteValidity,
  selectedCliente,
  session,
  subtotal,
  total,
}) {
  const proposalNumber = `PROP-${getLocalDateKey().replace(/-/g, "")}-${String(Date.now()).slice(-5)}`;
  const buildProposal = () => ({
    numero: proposalNumber,
    cliente: selectedCliente ? getClientName(selectedCliente) : "Cliente não informado",
    vendedor: session.nome || session.login || session.perfil || "Usuário",
    filial: proposalBranchLabel,
    data: new Date().toLocaleString("pt-BR"),
    validade: quoteValidity ? formatDateOnly(quoteValidity) : "A combinar",
    entrega: deliveryType === "ENTREGA" ? deliveryAddress || "Entrega a combinar" : "Retirada na loja",
    itens: cart,
    subtotal,
    descontoValor,
    total,
    observacao: deliveryNote,
    condicoesComerciais: quoteConditions,
  });
  const proposalRows = cart.map((item) => ({
    Proposta: proposalNumber,
    Cliente: selectedCliente ? getClientName(selectedCliente) : "Cliente não informado",
    Filial: proposalBranchLabel,
    Produto: item.nome,
    Código: item.codigoBarras || "-",
    Quantidade: formatNumber(item.quantidade),
    Unitario: formatCurrency(item.preco),
    Total: formatCurrency(item.preco * item.quantidade),
  }));

  return { buildProposal, proposalNumber, proposalRows };
}
