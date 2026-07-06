import { ClipboardList, Pencil, Search, Upload } from "lucide-react";
import { StatusBadge } from "../../../components/StatusBadge/StatusBadge";
import { TableEmptyState } from "../../../components/common/StatusUi";
import { formatCurrency, formatDate, formatNumber } from "../../../utils/formatters";
import { serviceOrderStatuses } from "../constants/serviceConstants";
import { getServiceEvidence, getServiceSla, parseServiceChecklist, parseServicePriority } from "../viewModels/serviceViewModel";

export function ServiceOrdersTable({
  filteredOrders,
  handleChecklistToggle,
  handleConsumeServiceParts,
  handleInvoiceServiceOrder,
  handleServiceAttachmentUpload,
  handleServiceSignatureUpload,
  handleStatusChange,
  openSignatureCanvas,
  savingChecklist,
  savingStatus,
  search,
  setSearch,
  setStatusFilter,
  statusFilter,
  uploadingAttachment,
}) {
  return (
    <>          <div className="customer-filter-row">
            <label className="search-field">
              <Search size={17} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por número, cliente, técnico ou título" />
            </label>
            <label className="form-control">
              <span>Status</span>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="TODOS">Todos</option>
                {serviceOrderStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="table-wrap modern-sales-table">
            <table>
              <thead>
                <tr>
                  <th>OS</th>
                  <th>Cliente</th>
                  <th>Técnico</th>
                  <th>Status</th>
                  <th>Prioridade</th>
                  <th>Prazo</th>
                  <th>Checklist</th>
                  <th>Valor</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <TableEmptyState
                    colSpan="9"
                    icon={ClipboardList}
                    title="Nenhuma ordem de serviço"
                    detail="Abra uma OS para acompanhar SLA, checklist, prioridade e faturamento."
                  />
                ) : (
                  filteredOrders.map((ordem) => {
                    const checklistItems = parseServiceChecklist(ordem.checklist);
                    const sla = getServiceSla(ordem);
                    const evidence = getServiceEvidence(ordem);
                    return (
                      <tr key={ordem.id}>
                        <td>
                          <strong>{ordem.numero || ordem.id}</strong>
                          <small>{ordem.titulo || "-"}</small>
                          <small>{ordem.filial || "Empresa / sem filial"}</small>
                          <small>{evidence.assinaturaCliente ? `Assinatura: ${evidence.assinaturaClienteNome || "coletada"}` : "Assinatura pendente"}</small>
                        </td>
                        <td>{ordem.cliente || "-"}</td>
                        <td>{ordem.tecnico || "Sem técnico"}</td>
                        <td><StatusBadge status={ordem.status} /></td>
                        <td>
                          <span className={`service-priority-pill priority-${parseServicePriority(ordem.observacao).toLowerCase()}`}>
                            {parseServicePriority(ordem.observacao)}
                          </span>
                        </td>
                        <td>
                          <strong>{formatDate(ordem.prazo)}</strong>
                          <small className={`service-sla-pill service-sla-${sla.tone}`}>{sla.label}</small>
                        </td>
                        <td>
                          <div className="service-table-checklist">
                            {checklistItems.length === 0 ? (
                              <small>Sem checklist</small>
                            ) : (
                              checklistItems.slice(0, 3).map((item, index) => (
                                <label key={`${ordem.id}-${item.text}-${index}`}>
                                  <input
                                    checked={item.done}
                                    disabled={savingChecklist === `${ordem.id}-${index}`}
                                    onChange={() => handleChecklistToggle(ordem, index)}
                                    type="checkbox"
                                  />
                                  <span>{item.text}</span>
                                </label>
                              ))
                            )}
                            {checklistItems.length > 3 && <small>+{formatNumber(checklistItems.length - 3)} item(ns)</small>}
                            <small>{evidence.pecas ? `Peças: ${evidence.pecas}` : "Sem peças"}</small>
                            <small>{evidence.evidencias ? `Evidências: ${evidence.evidencias}` : "Sem evidências"}</small>
                          </div>
                        </td>
                        <td>{formatCurrency(ordem.valorEstimado || 0)}</td>
                        <td>
                          <div className="table-actions">
                            {["EM_ANALISE", "APROVADA", "EM_EXECUCAO", "CONCLUIDA"].map((status) => (
                              <button
                                className="mini-action-button"
                                disabled={ordem.status === status || savingStatus === `${ordem.id}-${status}`}
                                key={status}
                                onClick={() => handleStatusChange(ordem, status)}
                                type="button"
                              >
                                {savingStatus === `${ordem.id}-${status}` ? "..." : status.replace("EM_", "")}
                              </button>
                            ))}
                            <button
                              className="mini-action-button"
                              disabled={
                                Boolean(ordem.financeiroId) ||
                                Number(ordem.valorEstimado || 0) <= 0 ||
                                savingStatus === `${ordem.id}-FATURAR`
                              }
                              onClick={() => handleInvoiceServiceOrder(ordem)}
                              type="button"
                            >
                              {savingStatus === `${ordem.id}-FATURAR` ? "..." : ordem.financeiroId ? "Faturada" : "Faturar"}
                            </button>
                            <button
                              className="mini-action-button"
                              disabled={
                                Boolean(ordem.pecasEstoqueBaixado) ||
                                !getServiceEvidence(ordem).pecas ||
                                savingStatus === `${ordem.id}-BAIXAR-PECAS`
                              }
                              onClick={() => handleConsumeServiceParts(ordem)}
                              type="button"
                            >
                              {savingStatus === `${ordem.id}-BAIXAR-PECAS` ?
                                "..."
                                : ordem.pecasEstoqueBaixado
                                  ? "Peças baixadas"
                                  : "Baixar peças"}
                            </button>
                            <label className="mini-action-button" title="Enviar anexo da OS">
                              {uploadingAttachment === ordem.id ? (
                                "..."
                              ) : (
                                <>
                                  <Upload size={14} />
                                  Anexo
                                </>
                              )}
                              <input
                                disabled={uploadingAttachment === ordem.id}
                                onChange={(event) => {
                                  handleServiceAttachmentUpload(ordem, event.target.files?.[0]);
                                  event.target.value = "";
                                }}
                                style={{ display: "none" }}
                                type="file"
                              />
                            </label>
                            <label className="mini-action-button" title="Enviar assinatura digitalizada">
                              {uploadingAttachment === `${ordem.id}-assinatura` ? "..." : "Assinatura"}
                              <input
                                accept="image/*,.pdf"
                                disabled={uploadingAttachment === `${ordem.id}-assinatura`}
                                onChange={(event) => {
                                  handleServiceSignatureUpload(ordem, event.target.files?.[0]);
                                  event.target.value = "";
                                }}
                                style={{ display: "none" }}
                                type="file"
                              />
                            </label>
                            <button className="mini-action-button" onClick={() => openSignatureCanvas(ordem)} type="button">
                              <Pencil size={14} />
                              Desenhar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
    </>
  );
}
