import {
  Boxes,
  ShoppingCart,
  Truck,
  UserRound,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { formatNumber } from "../../../utils/formatters.js";

function getReportRouteBranchLabel(rota, filteredEntregas) {
  const routeBranches = Array.from(new Set(
    filteredEntregas
      .filter((entrega) => String(entrega.rotaId || "") === String(rota.id || ""))
      .map((entrega) => entrega.filial || "Empresa / sem filial"),
  ));
  if (routeBranches.length === 0) return "Sem entregas";
  return routeBranches.length === 1 ? routeBranches[0] : `${formatNumber(routeBranches.length)} filiais`;
}

export function buildReportCardsViewModel({
  canSeeCollaborators,
  canSeeFinance,
  canSeeLogistics,
  clientes,
  filteredEntregas,
  filteredFinanceiro,
  filteredPedidos,
  filteredRotas,
  filteredUsuarios,
  produtos,
  selectedReportBranchLabel,
}) {
  const reportCards = [
    {
      key: "pedidos",
      title: "Vendas",
      icon: ShoppingCart,
      count: filteredPedidos.length,
      detail: selectedReportBranchLabel,
      rows: filteredPedidos.map((item) => ({
        numero: item.numero,
        cliente: item.cliente,
        filial: item.filial || "Empresa",
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
      count: filteredFinanceiro.length,
      detail: selectedReportBranchLabel,
      rows: filteredFinanceiro.map((item) => ({
        descricao: item.descricao,
        filial: item.filial || "Empresa",
        tipo: item.tipo,
        status: item.status,
        metodoPagamento: item.metodoPagamento,
        valor: item.valor,
      })),
    },
    canSeeLogistics && {
      key: "logistica",
      title: "Logística",
      icon: Truck,
      count: filteredEntregas.length + filteredRotas.length,
      detail: `${formatNumber(filteredEntregas.length)} entregas / ${formatNumber(filteredRotas.length)} rotas`,
      rows: [
        ...filteredEntregas.map((item) => ({
          tipo: "Entrega",
          codigo: item.numeroPedido || item.id,
          filial: item.filial || "Empresa / sem filial",
          cliente: item.clienteNome || "-",
          endereco: item.enderecoEntrega || "-",
          status: item.status,
          prioridade: item.prioridade,
          valor: item.totalPedido,
        })),
        ...filteredRotas.map((item) => ({
          tipo: "Rota",
          codigo: item.nome,
          filial: getReportRouteBranchLabel(item, filteredEntregas),
          cliente: "-",
          endereco: "-",
          status: item.status,
          prioridade: item.dataRota,
          valor: item.custoEstimado,
        })),
      ],
    },
    canSeeCollaborators && {
      key: "colaboradores",
      title: "Colaboradores",
      icon: UsersRound,
      count: filteredUsuarios.length,
      detail: selectedReportBranchLabel,
      rows: filteredUsuarios.map((item) => ({
        nome: item.nome || item.login,
        login: item.login,
        filial: item.filial || "Empresa / sem filial",
        perfil: item.perfil,
        cargo: item.cargo,
        departamento: item.departamento,
        status: item.bloqueado ? "BLOQUEADO" : item.ativo === false ? "INATIVO" : "ATIVO",
        telefone: item.telefone,
        email: item.email,
        dataInicio: item.dataInicio || item.dataCriacao,
      })),
    },
  ].filter(Boolean);

  return {
    exportaveis: reportCards.filter((card) => card.rows.length > 0).length,
    reportCards,
    totalRegistros: reportCards.reduce((total, card) => total + card.count, 0),
  };
}
