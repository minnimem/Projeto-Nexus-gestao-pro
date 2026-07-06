export function getPointOfSaleSubmissionError({
  caixa,
  canOperateCash,
  cart,
  cashMode,
  isMixedPayment,
  mixedPaymentDifference,
  paymentMethod,
  received,
  selectedClienteId,
  session,
  total,
}) {
  if (cashMode && !caixa.id) return "Abra um caixa antes de finalizar vendas no PDV.";
  if (cashMode && !canOperateCash) return "Seu perfil não tem permissão para operar o caixa.";
  if (!selectedClienteId) return "Selecione o cliente da venda.";
  if (cart.length === 0) return "Adicione pelo menos um produto.";
  if (!session.usuarioId) return "Sessão sem usuárioId para registrar a venda.";
  if (cashMode && paymentMethod === "DINHEIRO" && received < total) return "Valor recebido em dinheiro menor que o total da venda.";
  if (cashMode && isMixedPayment && Math.abs(mixedPaymentDifference) > 0.009) return "A soma do pagamento misto deve ser igual ao total da venda.";

  const itemSemEstoque = cart.find(
    (item) => Number(item.estoqueDisponivel || 0) <= 0 || item.quantidade > Number(item.estoqueDisponivel || 0),
  );
  if (itemSemEstoque) return `${itemSemEstoque.nome} não possui estoque suficiente para finalizar a venda.`;

  return "";
}
