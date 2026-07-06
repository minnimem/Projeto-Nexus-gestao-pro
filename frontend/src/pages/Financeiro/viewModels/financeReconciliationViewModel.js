import {
  asList,
  formatCurrency,
  formatDateTime,
  formatNumber,
  getLocalDateKey,
} from "../../../utils/formatters";

export function createFinanceReconciliationViewModel({
  auditoria,
  branchScopedMovimentacoes,
  caixas,
  orphanHistoryFilter,
  pedidoIdsComFinanceiro,
  pedidosPorId,
  session,
  vendasRecebidas,
}) {
  const vendasSemFinanceiroRaw = vendasRecebidas
    .filter((pedido) => !pedidoIdsComFinanceiro.has(String(pedido.id)))
    .map((pedido) => pedidosPorId.get(String(pedido.id)) || pedido);
  const pedidosSemItens = vendasSemFinanceiroRaw.filter((pedido) => asList(pedido.itens).length === 0);
  const vendasSemFinanceiro = vendasSemFinanceiroRaw.filter((pedido) => asList(pedido.itens).length > 0);
  const orphanPreview = pedidosSemItens.slice(0, 6);
  const orphanReportRows = pedidosSemItens.map((pedido) => ({
    Pedido: pedido.numero || pedido.id,
    "Data e hora": formatDateTime(pedido.data),
    Usuario: pedido.usuario || "Não identificado",
    Empresa: pedido.empresa || session.empresa || "Não identificada",
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
        usuarioOrigem: pedido.usuario || "Não identificado",
        empresaOrigem: pedido.empresa || session.empresa || "Não identificada",
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
    "Descrição": evento.descricao,
  }));
  const vendasSemFinanceiroRows = vendasSemFinanceiro.map((pedido) => ({
    Categoria: "Vendas sem financeiro",
    Pedido: pedido.numero || pedido.id,
    "Data e hora": formatDateTime(pedido.data),
    Usuario: pedido.usuario || "Não identificado",
    Empresa: pedido.empresa || session.empresa || "Não identificada",
    Valor: formatCurrency(pedido.valor),
    Status: pedido.status || "-",
    Detalhe: asList(pedido.itens).length > 0
      ? asList(pedido.itens)
        .map((item) => {
          const codigo = item.codigoBarras || item.sku || item.produtoId || "sem código";
          return `${item.produto || "Produto sem nome"} - ${codigo} (${formatNumber(item.quantidade)} un.)`;
        })
        .join(" | ")
      : "Pedido sem itens cadastrados",
  }));
  const pedidosSemItensRows = pedidosSemItens.map((pedido) => ({
    Categoria: "Pedidos sem itens",
    Pedido: pedido.numero || pedido.id,
    "Data e hora": formatDateTime(pedido.data),
    Usuario: pedido.usuario || "Não identificado",
    Empresa: pedido.empresa || session.empresa || "Não identificada",
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
    "Lançamento": item.descricao || item.id || "Sem descrição",
    "Data e hora": formatDateTime(item.dataLancamento),
    Usuario: item.usuario || "-",
    Empresa: session.empresa || "Nexus One",
    Valor: formatCurrency(item.valor),
    Status: item.status || "-",
    Detalhe: item.metodoPagamento || item.categoria || "Sem vínculo",
  }));
  const caixasComDivergenciaRows = caixasComDivergencia.map((caixa) => ({
    Categoria: "Caixas com divergencia",
    Caixa: caixa.id || "-",
    Operador: caixa.usuarioNome || caixa.usuario || "-",
    Empresa: caixa.empresaNome || session.empresa || "Nexus One",
    Abertura: formatDateTime(caixa.dataAbertura),
    Fechamento: formatDateTime(caixa.dataFechamento),
    Divergencia: formatCurrency(caixa.divergencia),
    Status: caixa.status || "-",
  }));

  return {
    caixasComDivergencia,
    caixasComDivergenciaRows,
    canceladosAdministrativamenteRows,
    filteredOrphanCancellationEvents,
    financeiroSemPedido,
    orphanCancellationRows,
    orphanPreview,
    orphanReportRows,
    pedidosSemItens,
    pedidosSemItensRows,
    receitasSemPedidoRows,
    vendasSemFinanceiro,
    vendasSemFinanceiroRaw,
    vendasSemFinanceiroRows,
  };
}


