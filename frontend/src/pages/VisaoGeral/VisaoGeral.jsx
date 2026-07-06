import {
  ArrowUpRight,
  Boxes,
  CircleDollarSign,
  RefreshCw,
  ShoppingCart,
} from "lucide-react";
import { KpiCard } from "../../components/common/KpiCard";
import { periodPresets } from "../../constants/modules";
import { canAccessModule, normalizePerfil } from "../../utils/permissions";
import {
  asList,
  formatCurrency,
  formatNumber,
  getLocalDateKey,
  getPeriodPresetRange,
} from "../../utils/formatters";
import {
  getProductStockMinimum,
  getProductStockQuantity,
  getStockProductName,
  isLowStockProduct,
} from "../../utils/stock";
import { ActivityAlertsPanel } from "./components/ActivityAlertsPanel";
import { AiRecommendationPanel } from "./components/AiRecommendationPanel";
import { BranchOverviewPanel } from "./components/BranchOverviewPanel";
import { DailyReportPanel } from "./components/DailyReportPanel";
import { OperationalBiPanel } from "./components/OperationalBiPanel";
import { OrdersPrioritiesPanel } from "./components/OrdersPrioritiesPanel";
import { OverviewHealthPanel } from "./components/OverviewHealthPanel";
import { SalesTrendPanel } from "./components/SalesTrendPanel";
import {
  buildOverviewPeriodViewModel,
} from "./viewModels/overviewPeriodViewModel";
import { buildOverviewInsightsViewModel } from "./viewModels/overviewInsightsViewModel";
import { useOverviewActivityData } from "./hooks/useOverviewActivityData";
import { useOverviewWidgetLayout } from "./hooks/useOverviewWidgetLayout";
import "./VisaoGeral.css";


export function VisaoGeral({ data, session, periodPreset = "month", periodRange = getPeriodPresetRange("month") }) {
  const todayKey = getLocalDateKey();
  const {
    dailyReportDate,
    dismissedAutomationAlerts,
    dismissAutomationAlert,
    moveWidget,
    resetWidgets,
    restoreAutomationAlerts,
    toggleWidget,
    widgetLayout,
  } = useOverviewWidgetLayout({ perfil: session.perfil, todayKey });
  const canSeeFinance = canAccessModule(session, "financeiro");
  const canSeeLogistics = canAccessModule(session, "logistica");
  const canSeeAdmin = canAccessModule(session, "usuarios");
  const vendas = data.vendas || {};
  const financeiro = data.financeiro || {};
  const clientes = asList(data.clientes);
  const produtos = asList(data.produtos);
  const pedidos = asList(data.pedidos);
  const caixas = asList(data.caixas);
  const filiais = asList(data.filiais);
  const isCashOperator = normalizePerfil(session.perfil) === "OPERADOR_CAIXA";
  const isStockOperator = normalizePerfil(session.perfil) === "ESTOQUISTA";
  const estoqueBaixoApi = asList(data.estoqueBaixo);
  const estoqueBaixoFallback = produtos
    .filter(isLowStockProduct)
    .map((produto) => ({
      id: produto.id,
      produtoId: produto.id,
      produto: produto.nome,
      nomeProduto: produto.nome,
      quantidade: getProductStockQuantity(produto),
      quantidadeAtual: getProductStockQuantity(produto),
      qtaMinimo: getProductStockMinimum(produto),
      estoqueMinimo: getProductStockMinimum(produto),
    }));
  const estoqueBaixo = [
    ...estoqueBaixoApi,
    ...estoqueBaixoFallback.filter(
      (fallback) =>
        !estoqueBaixoApi.some(
          (item) =>
            String(item.produtoId || item.id || getStockProductName(item)) ===
            String(fallback.produtoId || fallback.id || getStockProductName(fallback)),
        ),
    ),
  ];
  const entregas = asList(data.logistica.entregas);
  const rotas = asList(data.logistica.rotas);
  const veiculos = asList(data.logistica.veiculos);
  const entregadores = asList(data.logistica.entregadores);
  const usuarios = asList(data.usuarios);
  const ultimosPedidos = asList(vendas.ultimosPedidos).slice(0, 5);
  const {
    branchOverviewRows,
    openCashRegisters,
    periodAverageTicket,
    periodCashMovements,
    periodCashRevenue,
    periodCashTicket,
    periodCaixas,
    periodCompletedPedidos,
    periodDays,
    periodPedidos,
    periodPendingOrders,
    periodRevenue,
    previousRevenue,
    revenueChange,
    revenueChangeLabel,
    revenueChangePercent,
    todayCashRevenue,
  } = buildOverviewPeriodViewModel({
    caixas,
    entregas,
    filiais,
    pedidos,
    periodRange,
    todayKey,
    usuarios,
  });
  const {
    actions,
    activeAutomationAlerts,
    aiRecommendationRows,
    aiRecommendations,
    dailyReportRows,
    executiveSnapshot,
    operationalBiExportRows,
    operationalBiRows,
    operationalBiScore,
    operationalBiStatus,
    operationalBiTone,
    projectedRevenue,
    rotasAtivas,
  } = buildOverviewInsightsViewModel({
    canSeeAdmin,
    canSeeFinance,
    canSeeLogistics,
    clientes,
    dailyReportDate,
    dismissedAutomationAlerts,
    entregadores,
    entregas,
    estoqueBaixo,
    financeiro,
    isCashOperator,
    periodAverageTicket,
    periodCashMovements,
    periodCashRevenue,
    periodCashTicket,
    periodCompletedPedidos,
    periodDays,
    periodPendingOrders,
    periodPedidos,
    periodRevenue,
    pedidos,
    previousRevenue,
    produtos,
    revenueChangeLabel,
    revenueChangePercent,
    rotas,
    todayKey,
    usuarios,
    vendas,
    veiculos,
  });
  const {
    overviewTrendRows,
    recentActivityRows,
    visibleWidgetIds,
    visibleWidgetLabels,
    widgetCatalog,
  } = useOverviewActivityData({
    estoqueBaixo,
    financeiro,
    isCashOperator,
    periodCaixas,
    periodCompletedPedidos,
    periodPedidos,
    periodPreset,
    periodRange,
    session,
    todayKey,
    widgetLayout,
  });

  return (
    <div className="dashboard-view overview-view">
      <section className="kpi-grid">
        <KpiCard
          icon={CircleDollarSign}
          label={isCashOperator ? "Caixa" : "Receita"}
          value={isCashOperator ? formatCurrency(periodCashRevenue) : canSeeFinance ? formatCurrency(periodRevenue) : "Restrito"}
          change={!isCashOperator && canSeeFinance ? revenueChange : null}
          detail={isCashOperator ?
            `${formatNumber(periodCashMovements)} movimento(s) recebidos no período`
            : canSeeFinance ? `${formatNumber(periodCompletedPedidos.length)} venda(s) concluídas no período` : "Visivel para ADMIN/GERENTE/FINANCEIRO"}
          tone="green"
        />
        <KpiCard
          icon={ShoppingCart}
          label={isCashOperator ? "Atendimentos" : "Vendas"}
          value={formatNumber(isCashOperator ? periodCashMovements : periodPedidos.length)}
          change={{
            value: isCashOperator ? `${formatNumber(periodCaixas.length)} caixa(s)` : `${formatNumber(periodCompletedPedidos.length)} concluídas`,
            tone: "neutral",
          }}
          detail={isCashOperator ? "Recebimentos do operador no caixa" : `${formatNumber(periodPendingOrders.length)} pedidos pendentes no período`}
          tone="blue"
        />
        <KpiCard
          icon={Boxes}
          label="Produtos"
          value={formatNumber(produtos.length)}
          detail={`${formatNumber(estoqueBaixo.length)} em estoque baixo`}
          tone="amber"
        />
        <KpiCard
          icon={ArrowUpRight}
          label="Lucro"
          value={canSeeFinance ? formatCurrency(financeiro.lucro) : "Restrito"}
          change={canSeeFinance ? revenueChange : null}
          detail={`${formatNumber(clientes.length)} clientes na carteira`}
          tone="dark"
        />
      </section>

      <section className="panel configurable-widgets-panel">
        <div className="account-plan-head">
          <div>
            <h3>Widgets configuraveis</h3>
            <p>Favoritos e ordem salvos para o perfil {normalizePerfil(session.perfil) || "GERAL"}.</p>
          </div>
          <div className="account-plan-actions">
            <span>{formatNumber(visibleWidgetIds.length)} ativo(s)</span>
            <button onClick={resetWidgets} type="button">
              <RefreshCw size={15} />
              Restaurar
            </button>
          </div>
        </div>
        <div className="widget-config-grid">
          {widgetLayout.order.map((id) => {
            const widget = widgetCatalog.find((item) => item.id === id);
            if (!widget) return null;
            const hidden = widgetLayout.hidden.includes(id);
            return (
              <div className={`widget-config-card ${hidden ? "hidden" : ""}`} key={id}>
                <span>{widget.profile}</span>
                <strong>{widget.label}</strong>
                <small>{hidden ? "Oculto no dashboard" : "Visivel no dashboard"}</small>
                <div>
                  <button onClick={() => moveWidget(id, "up")} type="button">Subir</button>
                  <button onClick={() => moveWidget(id, "down")} type="button">Descer</button>
                  <button onClick={() => toggleWidget(id)} type="button">{hidden ? "Mostrar" : "Ocultar"}</button>
                </div>
              </div>
            );
          })}
        </div>
        <small className="widget-config-summary">Ordem atual: {visibleWidgetLabels.join(" / ") || "nenhum widget ativo"}</small>
      </section>

      <section className="executive-snapshot">
        {executiveSnapshot.map((item) => (
          <article key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.detail}</small>
          </article>
        ))}
      </section>

      {visibleWidgetIds.includes("bi") && (
        <OperationalBiPanel
          activeAutomationAlerts={activeAutomationAlerts}
          operationalBiExportRows={operationalBiExportRows}
          operationalBiRows={operationalBiRows}
          operationalBiScore={operationalBiScore}
          operationalBiStatus={operationalBiStatus}
          operationalBiTone={operationalBiTone}
          projectedRevenue={projectedRevenue}
          session={session}
        />
      )}
      {visibleWidgetIds.includes("ai") && (
        <AiRecommendationPanel
          aiRecommendationRows={aiRecommendationRows}
          aiRecommendations={aiRecommendations}
          session={session}
        />
      )}
      {(visibleWidgetIds.includes("trend") || visibleWidgetIds.includes("health")) && (
      <section className={`overview-command-grid ${isStockOperator ? "stock-overview-grid" : ""}`}>
        {!isStockOperator && visibleWidgetIds.includes("trend") && (
          <SalesTrendPanel
            description={isCashOperator
              ?
              `${formatNumber(periodCashMovements)} movimento(s) de caixa no período selecionado.`
              : undefined}
            periodLabel={periodPresets[periodPreset]}
            rows={overviewTrendRows}
            title={isCashOperator ? "Resumo do caixa" : "Resumo de vendas"}
          />
        )}

        {visibleWidgetIds.includes("health") && (
          <OverviewHealthPanel
            canSeeFinance={canSeeFinance}
            entregadores={entregadores}
            entregas={entregas}
            financeiro={financeiro}
            isCashOperator={isCashOperator}
            openCashRegisters={openCashRegisters}
            periodCashMovements={periodCashMovements}
            periodCashTicket={periodCashTicket}
            rotasAtivas={rotasAtivas}
            todayCashRevenue={todayCashRevenue}
            veiculos={veiculos}
            vendas={vendas}
          />
        )}
      </section>
      )}

      <ActivityAlertsPanel
        activeAutomationAlerts={activeAutomationAlerts}
        dismissedAutomationAlerts={dismissedAutomationAlerts}
        dismissAutomationAlert={dismissAutomationAlert}
        recentActivityRows={recentActivityRows}
        restoreAutomationAlerts={restoreAutomationAlerts}
        showActivity={visibleWidgetIds.includes("activity")}
        showAlerts={visibleWidgetIds.includes("alerts")}
      />
      {visibleWidgetIds.includes("daily") && (
        <DailyReportPanel
          dailyReportDate={dailyReportDate}
          dailyReportRows={dailyReportRows}
          session={session}
          todayKey={todayKey}
        />
      )}
      {visibleWidgetIds.includes("branches") && (
        <BranchOverviewPanel branchOverviewRows={branchOverviewRows} />
      )}
      <OrdersPrioritiesPanel
        actions={actions}
        estoqueBaixo={estoqueBaixo}
        showOrders={visibleWidgetIds.includes("orders")}
        showPriorities={visibleWidgetIds.includes("priorities")}
        ultimosPedidos={ultimosPedidos}
      />
    </div>
  );
}

