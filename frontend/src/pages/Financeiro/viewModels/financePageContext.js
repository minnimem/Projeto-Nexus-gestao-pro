import { asList } from "../../../utils/formatters";
import { canPerform, isAdminPerfil, normalizePerfil } from "../../../utils/permissions";

export function createFinancePageContext(data, session) {
  return {
    auditoria: asList(data.auditoria),
    caixas: asList(data.caixas),
    canManageNotifications: ["ADMIN", "GERENTE"].includes(normalizePerfil(session.perfil)),
    canMutateFinance: canPerform(session, "mutateFinance"),
    canReverseFinance: canPerform(session, "reverseFinance"),
    canSeeProfit: canPerform(session, "seeProfit"),
    filiais: asList(data.filiais),
    financeCategories: asList(data.categorias).filter((categoria) => categoria.ativo !== false),
    followUps: asList(data.followUps),
    isAdmin: isAdminPerfil(session.perfil),
    movimentacoes: asList(data.movimentacoes),
    pedidos: asList(data.pedidos),
    recorrencias: asList(data.recorrencias),
  };
}

