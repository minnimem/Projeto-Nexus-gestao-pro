import { endpoints } from "../../../services/resources";
import { safeApi } from "../../../utils/async";
import { asList } from "../../../utils/formatters";
import { canAccessModule } from "../../../utils/permissions";
import {
  loadCompaniesData,
  loadEmployeesData,
  loadFinanceData,
  loadLogisticsData,
  loadReportsData,
  loadUsersData,
} from "./dashboardManagementLoaders";
import {
  loadCashRegisterData,
  loadCustomersData,
  loadOrdersData,
  loadProductsData,
  loadServicesData,
} from "./dashboardOperationalLoaders";
import { loadOverviewData } from "./dashboardOverviewLoader";

const moduleLoaders = {
  caixa: loadCashRegisterData,
  clientes: loadCustomersData,
  colaboradores: loadEmployeesData,
  empresas: loadCompaniesData,
  financeiro: loadFinanceData,
  logistica: loadLogisticsData,
  overview: loadOverviewData,
  pedidos: loadOrdersData,
  produtos: loadProductsData,
  relatorios: loadReportsData,
  servicos: loadServicesData,
  usuarios: loadUsersData,
};

function getFinanceCriticalBadgeCount(financeiro, pedidos, caixas) {
  const completedSaleStatuses = new Set(["FINALIZADA", "RECEBIDO", "ENTREGUE", "CONCLUIDO"]);
  const movimentacoes = asList(financeiro.movimentacoes);
  const approvedRevenuePedidoIds = new Set(
    movimentacoes
      .filter((item) => item.tipo === "RECEITA" && item.status === "APROVADO" && item.pedidoId)
      .map((item) => String(item.pedidoId)),
  );
  const pedidosSemItens = asList(pedidos)
    .filter((pedido) => completedSaleStatuses.has(String(pedido.status || "")))
    .filter((pedido) => !approvedRevenuePedidoIds.has(String(pedido.id)))
    .filter((pedido) => asList(pedido.itens).length === 0)
    .length;
  const caixasComDivergencia = asList(caixas)
    .filter((caixa) => Number(caixa.divergencia || 0) !== 0)
    .length;

  return pedidosSemItens + caixasComDivergencia;
}

export async function loadFinanceCriticalCount(session) {
  if (!canAccessModule(session, "financeiro")) return 0;

  try {
    const [financeiro, pedidos, caixas] = await Promise.all([
      safeApi(endpoints.financeiro.resumo(), {}),
      safeApi(endpoints.pedidos.listar(), []),
      safeApi(endpoints.caixas.listar(), []),
    ]);
    return getFinanceCriticalBadgeCount(financeiro, pedidos, caixas);
  } catch {
    return 0;
  }
}

export async function loadDashboardModuleData(moduleValue, session) {
  if (!canAccessModule(session, moduleValue)) return { restricted: true };
  const loader = moduleLoaders[moduleValue] || loadLogisticsData;
  return loader(session);
}
