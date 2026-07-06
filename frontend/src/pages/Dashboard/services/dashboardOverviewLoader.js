import { endpoints } from "../../../services/resources";
import { safeApi } from "../../../utils/async";
import { canAccessModule } from "../../../utils/permissions";

export async function loadOverviewData(session) {
  const [
    vendas,
    clientes,
    produtos,
    estoqueBaixo,
    financeiro,
    entregas,
    rotas,
    veiculos,
    entregadores,
    caixas = [],
    usuarios = [],
    pedidos = [],
    filiais = [],
  ] = await Promise.all([
    canAccessModule(session, "pedidos") ?
      safeApi(endpoints.dashboard.pedidos(), {})
      : Promise.resolve({}),
    canAccessModule(session, "clientes") ?
      safeApi(endpoints.clientes.listar(), [])
      : Promise.resolve([]),
    canAccessModule(session, "produtos") ?
      safeApi(endpoints.produtos.listar(), [])
      : Promise.resolve([]),
    canAccessModule(session, "produtos") ?
      safeApi(endpoints.estoque.baixo(), [])
      : Promise.resolve([]),
    canAccessModule(session, "financeiro") ?
      safeApi(endpoints.financeiro.resumo(), { restricted: true })
      : Promise.resolve({ restricted: true }),
    canAccessModule(session, "logistica") ?
      safeApi(endpoints.logistica.resumo(), [])
      : Promise.resolve([]),
    canAccessModule(session, "logistica") ?
      safeApi(endpoints.logistica.rotas(), [])
      : Promise.resolve([]),
    canAccessModule(session, "logistica") ?
      safeApi(endpoints.logistica.veiculosAtivos(), [])
      : Promise.resolve([]),
    canAccessModule(session, "logistica") ?
      safeApi(endpoints.logistica.entregadoresAtivos(), [])
      : Promise.resolve([]),
    canAccessModule(session, "caixa") ?
      safeApi(endpoints.caixas.listar(), [])
      : Promise.resolve([]),
    canAccessModule(session, "colaboradores") ?
      safeApi(endpoints.usuarios.listar(), [])
      : Promise.resolve([]),
    canAccessModule(session, "pedidos") ?
      safeApi(endpoints.pedidos.listar(), [])
      : Promise.resolve([]),
    safeApi(endpoints.empresa.filiais(), []),
  ]);

  return {
    vendas,
    clientes,
    produtos,
    estoqueBaixo,
    financeiro,
    logistica: { entregas, rotas, veiculos, entregadores },
    caixas,
    usuarios,
    pedidos,
    filiais,
  };
}
