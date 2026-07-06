import { endpoints } from "../../../services/resources";
import { safeApi } from "../../../utils/async";
import {
  canAccessModule,
  isAdminPerfil,
  isMasterPerfil,
  isPrivilegedPerfil,
} from "../../../utils/permissions";

export async function loadFinanceData(session) {
  const [financeiro, pedidos, caixas, auditoria, categorias, recorrencias, filiais, followUps] = await Promise.all([
    safeApi(endpoints.financeiro.resumo(), {}),
    safeApi(endpoints.pedidos.listar(), []),
    safeApi(endpoints.caixas.listar(), []),
    isAdminPerfil(session.perfil) ? safeApi(endpoints.auditoria.listar(), []) : Promise.resolve([]),
    safeApi(endpoints.categorias.listar("FINANCEIRO"), []),
    safeApi(endpoints.financeiro.recorrencias(), []),
    safeApi(endpoints.empresa.filiais(), []),
    safeApi(endpoints.financeiro.followUps(), []),
  ]);

  return { ...financeiro, pedidos, caixas, auditoria, categorias, recorrencias, filiais, followUps };
}

export async function loadReportsData(session) {
  const [pedidos, clientes, produtos, financeiro, entregas, rotas, filiais, usuarios] = await Promise.all([
    canAccessModule(session, "pedidos") ?
      safeApi(endpoints.pedidos.listar(), [])
      : Promise.resolve([]),
    canAccessModule(session, "clientes") ?
      safeApi(endpoints.clientes.listar(), [])
      : Promise.resolve([]),
    canAccessModule(session, "produtos") ?
      safeApi(endpoints.produtos.listar(), [])
      : Promise.resolve([]),
    canAccessModule(session, "financeiro") ?
      safeApi(endpoints.financeiro.listar(), [])
      : Promise.resolve([]),
    canAccessModule(session, "logistica") ?
      safeApi(endpoints.logistica.resumo(), [])
      : Promise.resolve([]),
    canAccessModule(session, "logistica") ?
      safeApi(endpoints.logistica.rotas(), [])
      : Promise.resolve([]),
    safeApi(endpoints.empresa.filiais(), []),
    canAccessModule(session, "colaboradores") ?
      safeApi(endpoints.usuarios.listar(), [])
      : Promise.resolve([]),
  ]);

  const documentosFiscaisPorPedido = pedidos.length > 0
    ? await safeApi(endpoints.fiscal.documentosPorPedidos(pedidos.map((pedido) => pedido.id).filter(Boolean)), {})
    : {};

  return { pedidos, clientes, produtos, financeiro, entregas, rotas, filiais, usuarios, documentosFiscaisPorPedido };
}

export async function loadUsersData(session) {
  if (!isPrivilegedPerfil(session.perfil)) return { restricted: true };

  const [usuarios, auditoria, empresa, plano, filiais, contratos, configuracoesFiscais, liberacoes, masterEmpresas] = await Promise.all([
    safeApi(endpoints.usuarios.listar(), []),
    safeApi(endpoints.auditoria.listar(), []),
    safeApi(endpoints.empresa.minha(), {}),
    safeApi(endpoints.empresa.plano(), null),
    safeApi(endpoints.empresa.filiais(), []),
    safeApi(endpoints.empresa.contratos(), []),
    safeApi(endpoints.fiscal.configuracoes(), []),
    safeApi(endpoints.empresa.liberacoes(), []),
    isMasterPerfil(session.perfil) ? safeApi(endpoints.empresa.masterEmpresas(), []) : Promise.resolve([]),
  ]);

  return {
    usuarios,
    auditoria,
    empresa: { ...empresa, ...(plano || {}) },
    filiais,
    contratos,
    configuracoesFiscais,
    liberacoes,
    masterEmpresas,
  };
}

export async function loadCompaniesData(session) {
  if (!isMasterPerfil(session.perfil)) return { restricted: true };
  return { empresas: await safeApi(endpoints.empresa.masterEmpresas(), []) };
}

export async function loadEmployeesData() {
  const [usuarios, filiais, auditoria] = await Promise.all([
    safeApi(endpoints.usuarios.listar(), []),
    safeApi(endpoints.empresa.filiais(), []),
    safeApi(endpoints.auditoria.listar(), []),
  ]);
  return { usuarios, filiais, auditoria };
}

export async function loadLogisticsData() {
  const [entregas, rotas, veiculos, entregadores, transportadoras, filiais] = await Promise.all([
    safeApi(endpoints.logistica.resumo(), []),
    safeApi(endpoints.logistica.rotas(), []),
    safeApi(endpoints.logistica.veiculosAtivos(), []),
    safeApi(endpoints.logistica.entregadoresAtivos(), []),
    safeApi(endpoints.logistica.transportadoras(), []),
    safeApi(endpoints.empresa.filiais(), []),
  ]);

  return { entregas, rotas, veiculos, entregadores, transportadoras, filiais };
}
