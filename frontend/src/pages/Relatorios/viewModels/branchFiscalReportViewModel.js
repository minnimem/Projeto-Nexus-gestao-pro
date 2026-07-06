import {
  asList,
  formatCurrency,
  formatNumber,
} from "../../../utils/formatters.js";

function buildSalesByBranchRows(vendasConcluidas) {
  return Array.from(
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
  ).sort((a, b) => b.total - a.total);
}

function buildFinanceBranchRows(filteredFinanceiro, canSeeFinance) {
  if (!canSeeFinance) return [];

  return Array.from(
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
    }));
}

function buildCollaboratorBranchRows(filteredUsuarios, canSeeCollaborators) {
  if (!canSeeCollaborators) return [];

  return Array.from(
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
    }));
}

function buildFiscalRows(filteredPedidos, documentosFiscaisPorPedido) {
  return filteredPedidos
    .filter((pedido) => String(pedido.status || "") !== "ORCAMENTO")
    .map((pedido) => {
      const documento = asList(documentosFiscaisPorPedido[pedido.id])[0];
      return {
        Pedido: pedido.numero || pedido.id,
        Cliente: pedido.cliente || "Cliente não informado",
        Filial: pedido.filial || "Empresa / sem filial",
        Documento: documento
          ?
          `${documento.modelo || "-"} ${documento.serie || "-"}-${documento.numero || "-"}`
          : "Não preparado",
        "Status fiscal": documento?.status || "PENDENTE",
        Protocolo: documento?.protocolo || "-",
        Chave: documento?.chaveAcesso || "-",
      };
    });
}

export function buildBranchFiscalReportViewModel({
  canSeeCollaborators,
  canSeeFinance,
  documentosFiscaisPorPedido,
  filteredFinanceiro,
  filteredPedidos,
  filteredUsuarios,
  vendasConcluidas,
}) {
  const branchPerformanceRows = buildSalesByBranchRows(vendasConcluidas);
  const bestBranchPerformance = branchPerformanceRows[0] || null;
  const branchReportRows = branchPerformanceRows.map((row) => ({
    Filial: row.filial,
    Vendas: formatNumber(row.vendas),
    Receita: formatCurrency(row.total),
    "Ticket médio": formatCurrency(row.vendas > 0 ? row.total / row.vendas : 0),
  }));
  const financeBranchReportRows = buildFinanceBranchRows(filteredFinanceiro, canSeeFinance);
  const collaboratorBranchReportRows = buildCollaboratorBranchRows(filteredUsuarios, canSeeCollaborators);
  const fiscalReportRows = buildFiscalRows(filteredPedidos, documentosFiscaisPorPedido);
  const fiscalPreparedCount = fiscalReportRows.filter((row) => row.Documento !== "Não preparado").length;

  return {
    bestBranchPerformance,
    branchReportRows,
    collaboratorBranchReportRows,
    financeBranchReportRows,
    fiscalPreparedCount,
    fiscalReportRows,
  };
}
