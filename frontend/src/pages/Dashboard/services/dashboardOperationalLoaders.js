import { endpoints } from "../../../services/resources";
import { safeApi } from "../../../utils/async";
import { buildClientsFromOrders } from "../../../utils/customers";
import { asList } from "../../../utils/formatters";
import { normalizePerfil } from "../../../utils/permissions";

export async function loadOrdersData(session) {
  const canManageSalesGoals = ["ADMIN", "GERENTE"].includes(normalizePerfil(session.perfil));
  const [dashboard, produtos, clientes, pedidos, comissaoConfig, usuarios, followUpsComerciais, filiais, configuracoesFiscais] = await Promise.all([
    safeApi(endpoints.dashboard.pedidos(), {}),
    safeApi(endpoints.produtos.listar(), []),
    safeApi(endpoints.clientes.listar(), []),
    safeApi(endpoints.pedidos.listar(), []),
    safeApi(endpoints.comissoes.config(), { percentualPadrao: 3 }),
    canManageSalesGoals ? safeApi(endpoints.usuarios.listar(), []) : Promise.resolve([]),
    safeApi(endpoints.pedidos.followUps(), []),
    safeApi(endpoints.empresa.filiais(), []),
    safeApi(endpoints.fiscal.configuracoes(), []),
  ]);
  const documentosFiscaisPorPedido = Object.fromEntries(
    Object.entries(
      asList(pedidos).length > 0
        ? await safeApi(endpoints.fiscal.documentosPorPedidos(asList(pedidos).map((pedido) => pedido.id).filter(Boolean)), {})
        : {},
    ),
  );
  const clientesResolvidos = asList(clientes).length > 0 ? clientes : buildClientsFromOrders(pedidos);

  return {
    dashboard: {
      ...dashboard,
      pedidos,
      comissaoConfig,
      usuarios,
      followUpsComerciais,
      filiais,
      configuracoesFiscais,
      documentosFiscaisPorPedido,
    },
    produtos,
    clientes: clientesResolvidos,
  };
}

export async function loadCashRegisterData() {
  const [aberto, recentes, produtos, clientes, pedidos, filiais] = await Promise.all([
    safeApi(endpoints.caixas.aberto(), null),
    safeApi(endpoints.caixas.listar(), []),
    safeApi(endpoints.produtos.listar(), []),
    safeApi(endpoints.clientes.listar(), []),
    safeApi(endpoints.pedidos.listar(), null),
    safeApi(endpoints.empresa.filiais(), []),
  ]);

  return {
    aberto: aberto || null,
    recentes,
    produtos,
    clientes,
    pedidos: pedidos || [],
    filiais,
    loadWarning: pedidos === null ? "Não foi possível carregar pedidos pendentes. O caixa ainda pode ser aberto." : "",
  };
}

export async function loadProductsData() {
  const [produtos, estoqueBaixo, estoqueSaldos, pedidos, fornecedores, compras, categorias, marcas, filiais] = await Promise.all([
    safeApi(endpoints.produtos.listar(), []),
    safeApi(endpoints.estoque.baixo(), []),
    safeApi(endpoints.estoque.saldos(), []),
    safeApi(endpoints.pedidos.listar(), []),
    safeApi(endpoints.fornecedores.listar(), []),
    safeApi(endpoints.compras.listar(), []),
    safeApi(endpoints.categorias.listar("PRODUTO"), []),
    safeApi(endpoints.marcas.listar(), []),
    safeApi(endpoints.empresa.filiais(), []),
  ]);

  return { produtos, estoqueBaixo, estoqueSaldos, pedidos, fornecedores, compras, categorias, marcas, filiais };
}

export async function loadCustomersData() {
  const [clientes, pedidos, filiais, followUpsComerciais] = await Promise.all([
    safeApi(endpoints.clientes.listar(), []),
    safeApi(endpoints.pedidos.listar(), []),
    safeApi(endpoints.empresa.filiais(), []),
    safeApi(endpoints.pedidos.followUps(), []),
  ]);

  return {
    clientes: asList(clientes).length > 0 ? clientes : buildClientsFromOrders(pedidos),
    pedidos,
    filiais,
    followUpsComerciais,
  };
}

export async function loadServicesData() {
  const [ordens, clientes, usuarios, filiais, contratos] = await Promise.all([
    safeApi(endpoints.ordensServico.listar(), []),
    safeApi(endpoints.clientes.listar(), []),
    safeApi(endpoints.usuarios.listar(), []),
    safeApi(endpoints.empresa.filiais(), []),
    safeApi(endpoints.empresa.contratos(), []),
  ]);

  return { ordens, clientes, usuarios, filiais, contratos };
}
