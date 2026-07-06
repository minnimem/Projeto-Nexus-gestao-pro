import { getClientName } from "../../../utils/customers.js";
import { formatCurrency } from "../../../utils/formatters.js";
import { canInstallmentPayment } from "../../../utils/payments.js";
import { getPriorityPayload } from "../../../utils/sales.js";

export function buildProposalCsvRows({
  proposalBranchLabel,
  proposalNumber,
  proposalRows,
  selectedCliente,
  total,
}) {
  return [
    ...proposalRows,
    {
      Proposta: proposalNumber,
      Cliente: selectedCliente ? getClientName(selectedCliente) : "Cliente não informado",
      Filial: proposalBranchLabel,
      Produto: "TOTAL",
      Código: "",
      Quantidade: "",
      Unitario: "",
      Total: formatCurrency(total),
    },
  ];
}

export function buildQuotePayload({
  cart,
  deliveryAddress,
  deliveryNote,
  deliveryType,
  discountPayload,
  paymentInstallments,
  paymentMethod,
  priority,
  quoteConditions,
  quoteValidity,
  selectedClienteId,
  session,
}) {
  return {
    clienteId: selectedClienteId,
    usuarioId: session.usuarioId,
    filialId: session.filialId || null,
    prioridade: getPriorityPayload(priority),
    metodoPagamento: paymentMethod,
    parcelas: canInstallmentPayment(paymentMethod) ? Number(paymentInstallments || 1) : 1,
    tipoEntrega: deliveryType,
    enderecoEntrega: deliveryType === "ENTREGA" ? deliveryAddress : "",
    observacaoEntrega: deliveryNote,
    validadeProposta: quoteValidity || null,
    condicoesComerciais: quoteConditions,
    desconto: discountPayload,
    orcamento: true,
    itens: cart.map((item) => ({ produtoId: item.produtoId, quantidade: item.quantidade })),
  };
}
