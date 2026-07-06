import { asList } from "../../../utils/formatters";
import { normalizePerfil } from "../../../utils/permissions";

export function createProductPageContext(data, session) {
  const perfil = normalizePerfil(session.perfil);

  return {
    canManageNotifications: ["ADMIN", "GERENTE"].includes(perfil),
    compras: asList(data.compras),
    estoqueBaixoApi: asList(data.estoqueBaixo),
    estoqueSaldos: asList(data.estoqueSaldos),
    filiais: asList(data.filiais),
    fornecedores: asList(data.fornecedores),
    isStockOperator: perfil === "ESTOQUISTA",
    marcas: asList(data.marcas),
    pedidos: asList(data.pedidos),
    productCategories: asList(data.categorias).filter((categoria) => categoria.ativo !== false),
    produtos: asList(data.produtos),
  };
}
