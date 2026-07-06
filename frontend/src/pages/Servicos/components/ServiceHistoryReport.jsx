import { Download, Printer } from "lucide-react";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { formatCurrency, formatDate, formatNumber, getLocalDateKey } from "../../../utils/formatters";
import { serviceOrderStatuses } from "../constants/serviceConstants";

export function ServiceHistoryReport({
  clientes,
  contratos,
  historyClienteId,
  historyEndDate,
  historyStartDate,
  historyStatus,
  historyTecnicoId,
  nextRecurringServices,
  overdueRecurringServices,
  recurringServiceOrders,
  recurringServiceRows,
  serviceHistoryAverageCycle,
  serviceHistoryEvidenceComplete,
  serviceHistoryFinished,
  serviceHistoryOrders,
  serviceHistoryOverdue,
  serviceHistoryRows,
  serviceHistoryValue,
  servicePartHistoryRows,
  servicePartTechnicianRows,
  setHistoryClienteId,
  setHistoryEndDate,
  setHistoryStartDate,
  setHistoryStatus,
  setHistoryTecnicoId,
  session,
  tecnicos,
  topServicePartProducts,
  topServicePartTechnicians,
}) {
  return (
    <>
          <section className="panel service-history-report">
            <div className="panel-title compact">
              <div>
                <span>Histórico de serviços</span>
                <p>Analise por período, cliente, técnico e status.</p>
              </div>
              <div className="panel-actions">
                <button disabled={serviceHistoryRows.length === 0} onClick={() => downloadCsv(`nexus-one-os-historico-${getLocalDateKey()}.csv`, serviceHistoryRows)} type="button">
                  <Download size={15} />
                  CSV
                </button>
                <button disabled={serviceHistoryRows.length === 0} onClick={() => printRowsDocument("Histórico de ordens de serviço", serviceHistoryRows, session.empresa || "Nexus One")} type="button">
                  <Printer size={15} />
                  PDF
                </button>
              </div>
            </div>
            <div className="service-history-filter">
              <label className="form-control">
                <span>Início</span>
                <input value={historyStartDate} onChange={(event) => setHistoryStartDate(event.target.value)} type="date" />
              </label>
              <label className="form-control">
                <span>Fim</span>
                <input value={historyEndDate} onChange={(event) => setHistoryEndDate(event.target.value)} type="date" />
              </label>
              <label className="form-control">
                <span>Cliente</span>
                <select value={historyClienteId} onChange={(event) => setHistoryClienteId(event.target.value)}>
                  <option value="TODOS">Todos</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id || cliente.idCliente} value={cliente.id || cliente.idCliente}>
                      {cliente.nome || cliente.nomeCliente || "Cliente"}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-control">
                <span>Técnico</span>
                <select value={historyTecnicoId} onChange={(event) => setHistoryTecnicoId(event.target.value)}>
                  <option value="TODOS">Todos</option>
                  {tecnicos.map((tecnico) => (
                    <option key={tecnico.id} value={tecnico.id}>
                      {tecnico.nome || tecnico.login || "Técnico"}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-control">
                <span>Status</span>
                <select value={historyStatus} onChange={(event) => setHistoryStatus(event.target.value)}>
                  <option value="TODOS">Todos</option>
                  {serviceOrderStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="service-history-summary">
              <article>
                <span>OS no período</span>
                <strong>{formatNumber(serviceHistoryOrders.length)}</strong>
              </article>
              <article>
                <span>Valor estimado</span>
                <strong>{formatCurrency(serviceHistoryValue)}</strong>
              </article>
              <article>
                <span>Concluídas/faturadas</span>
                <strong>{formatNumber(serviceHistoryFinished.length)}</strong>
              </article>
              <article>
                <span>Ciclo médio</span>
                <strong>{formatNumber(serviceHistoryAverageCycle)} dia(s)</strong>
              </article>
              <article>
                <span>SLA vencido</span>
                <strong>{formatNumber(serviceHistoryOverdue.length)}</strong>
              </article>
              <article>
                <span>Evidências completas</span>
                <strong>{formatNumber(serviceHistoryEvidenceComplete.length)}</strong>
              </article>
            </div>
          </section>

          <div className="service-margin-panel">
            <section>
              <div className="commercial-priority-head">
                <span>Contratos e garantias</span>
                <small>{formatNumber(serviceHistoryOrders.filter((ordem) => ordem.contratoId || ordem.garantiaCoberta).length)} OS</small>
              </div>
              <div className="service-margin-list">
                {serviceHistoryOrders.filter((ordem) => ordem.contratoId || ordem.garantiaCoberta).slice(0, 4).map((ordem) => (
                  <article key={`regra-${ordem.id}`}>
                    <span>{ordem.tipoServico || "Serviço"}</span>
                    <strong>{ordem.numero || ordem.id}</strong>
                    <small>
                      {ordem.contratoId ? `Contrato ${contratos.find((contrato) => String(contrato.id) === String(ordem.contratoId)).nome || ordem.contratoId}` : "Sem contrato"} / garantia {ordem.garantiaCoberta ? formatDate(ordem.garantiaAte) : "não"}
                    </small>
                  </article>
                ))}
                {serviceHistoryOrders.filter((ordem) => ordem.contratoId || ordem.garantiaCoberta).length === 0 && (
                  <div className="commercial-priority-empty">Sem OS vinculada a contrato ou garantia no período.</div>
                )}
              </div>
            </section>
            <section>
              <div className="commercial-priority-head">
                <span>Recorrências de serviço</span>
                <small>{formatNumber(recurringServiceOrders.length)} OS</small>
              </div>
              <div className="service-recurrence-summary">
                <div className={overdueRecurringServices.length > 0 ? "danger" : "success"}>
                  <span>Vencidas</span>
                  <strong>{formatNumber(overdueRecurringServices.length)}</strong>
                </div>
                <div>
                  <span>Próximas</span>
                  <strong>{formatNumber(nextRecurringServices.length)}</strong>
                </div>
                <button disabled={recurringServiceRows.length === 0} onClick={() => downloadCsv(`nexus-one-os-recorrencias-${getLocalDateKey()}.csv`, recurringServiceRows)} type="button">
                  <Download size={14} />
                  CSV
                </button>
              </div>
              <div className="service-margin-list">
                {recurringServiceOrders.slice(0, 4).map(({ ordem, recurrenceStatus, billingStatus }) => (
                  <article className={`service-recurrence-${recurrenceStatus.tone}`} key={`recorrente-${ordem.id}`}>
                    <span>{recurrenceStatus.label}</span>
                    <strong>{ordem.numero || ordem.id}</strong>
                    <small>{ordem.cliente || "-"} / próx. {ordem.proximaRecorrencia ? formatDate(ordem.proximaRecorrencia) : "sem data"}</small>
                    <small>{billingStatus} / {formatCurrency(ordem.valorEstimado || 0)}</small>
                  </article>
                ))}
                {recurringServiceOrders.length === 0 && (
                  <div className="commercial-priority-empty">Sem OS recorrente no período filtrado.</div>
                )}
              </div>
            </section>
          </div>

          <div className="service-margin-panel">
            <section>
              <div className="commercial-priority-head">
                <span>Margem por peça</span>
                <small>{formatNumber(servicePartHistoryRows.length)} item(ns) estruturado(s)</small>
              </div>
              <div className="service-margin-list">
                {topServicePartProducts.length === 0 ? (
                  <div className="commercial-priority-empty">Sem peças estruturadas para consolidar margem.</div>
                ) : (
                  topServicePartProducts.map((row) => (
                    <article key={row.produto}>
                      <span>{formatNumber(row.quantidade)} un.</span>
                      <strong>{row.produto}</strong>
                      <small>Venda {formatCurrency(row.venda)} / custo {formatCurrency(row.custo)} / margem {formatCurrency(row.margem)}</small>
                    </article>
                  ))
                )}
              </div>
            </section>
            <section>
              <div className="commercial-priority-head">
                <span>Margem por técnico</span>
                <small>{formatNumber(servicePartTechnicianRows.length)} técnico(s)</small>
              </div>
              <div className="service-margin-list">
                {topServicePartTechnicians.length === 0 ? (
                  <div className="commercial-priority-empty">Sem técnico com peças estruturadas.</div>
                ) : (
                  topServicePartTechnicians.map((row) => (
                    <article key={row.tecnico}>
                      <span>{formatNumber(row.os)} OS</span>
                      <strong>{row.tecnico}</strong>
                      <small>{formatNumber(row.quantidade)} peça(s) / margem {formatCurrency(row.margem)}</small>
                    </article>
                  ))
                )}
              </div>
            </section>
            <div className="panel-actions service-margin-actions">
              <button disabled={servicePartHistoryRows.length === 0} onClick={() => downloadCsv(`nexus-one-os-peças-margem-${getLocalDateKey()}.csv`, servicePartHistoryRows)} type="button">
                <Download size={15} />
                CSV peças
              </button>
              <button disabled={servicePartHistoryRows.length === 0} onClick={() => printRowsDocument("Margem de peças por OS", servicePartHistoryRows, session.empresa || "Nexus One")} type="button">
                <Printer size={15} />
                PDF peças
              </button>
            </div>
          </div>
    </>
  );
}
