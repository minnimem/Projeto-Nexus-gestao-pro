import { formatCurrency, formatNumber } from "../../../utils/formatters";

export function OverviewHealthPanel({
  canSeeFinance,
  entregadores,
  entregas,
  financeiro,
  isCashOperator,
  openCashRegisters,
  periodCashMovements,
  periodCashTicket,
  rotasAtivas,
  todayCashRevenue,
  veiculos,
  vendas,
}) {
  return (
    <div className="overview-side-stack">
      <article className="panel">
        <div className="panel-title compact">
          <div>
            <h2>{isCashOperator ? "Saúde do caixa" : "Saúde comercial"}</h2>
            <p>{isCashOperator ? "Recebimentos e abertura operacional." : "Indicadores consolidados do dia."}</p>
          </div>
        </div>

        <div className="health-list">
          <div>
            <span>{isCashOperator ? "Caixa hoje" : "Vendas hoje"}</span>
            <strong>{formatCurrency(isCashOperator ? todayCashRevenue : vendas.vendasHoje)}</strong>
          </div>
          <div>
            <span>Ticket médio</span>
            <strong>{formatCurrency(isCashOperator ? periodCashTicket : vendas.ticketMedio)}</strong>
          </div>
          <div>
            <span>{isCashOperator ? "Caixas abertos" : "Lançamentos"}</span>
            <strong>{isCashOperator ? formatNumber(openCashRegisters) : canSeeFinance ? formatNumber(financeiro.lancamentos) : "-"}</strong>
          </div>
          <div>
            <span>{isCashOperator ? "Movimentos" : "Pedidos pagos"}</span>
            <strong>{isCashOperator ? formatNumber(periodCashMovements) : canSeeFinance ? formatNumber(financeiro.pedidosPagos) : "-"}</strong>
          </div>
        </div>
      </article>

      <article className="panel">
        <div className="panel-title compact">
          <div>
            <h2>Operação</h2>
            <p>Estoque, frota e equipe.</p>
          </div>
        </div>

        <div className="health-list">
          <div>
            <span>Entregas</span>
            <strong>{formatNumber(entregas.length)}</strong>
          </div>
          <div>
            <span>Rotas ativas</span>
            <strong>{formatNumber(rotasAtivas)}</strong>
          </div>
          <div>
            <span>Veiculos</span>
            <strong>{formatNumber(veiculos.length)}</strong>
          </div>
          <div>
            <span>Entregadores</span>
            <strong>{formatNumber(entregadores.length)}</strong>
          </div>
        </div>
      </article>
    </div>
  );
}
