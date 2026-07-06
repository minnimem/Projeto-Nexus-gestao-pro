import { Download, Loader2, Mail, Plus, Printer, X } from "lucide-react";
import { StatusBadge } from "../../../components/StatusBadge/StatusBadge";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { formatCurrency, formatDate, formatDateTime, getLocalDateKey } from "../../../utils/formatters";

export function FinanceCollectionAgendaSection({
  branchScopedFollowUps,
  canManageNotifications,
  canMutateFinance,
  collectionFollowUpForm,
  followUpRows,
  handleCreateCollectionFollowUp,
  handleFollowUpStatus,
  handleSendFollowUpNotifications,
  reminderFollowUps,
  resetCollectionFollowUpForm,
  saving,
  session,
  setCollectionFollowUpForm,
}) {
  return (
    <section className="panel delinquency-panel">
      <div className="panel-title compact">
        <div>
          <h2>Agenda de cobrança</h2>
          <p>Follow-ups persistidos para retomada de contato.</p>
        </div>
        <div className="account-plan-actions">
          {canManageNotifications && (
            <button
              disabled={saving || reminderFollowUps.length === 0}
              onClick={handleSendFollowUpNotifications}
              type="button"
            >
              {saving ? <Loader2 className="spin" size={15} /> : <Mail size={15} />}
              Notificar
            </button>
          )}
          <button
            disabled={followUpRows.length === 0}
            onClick={() => downloadCsv(`nexus-one-follow-ups-cobranca-${getLocalDateKey()}.csv`, followUpRows)}
            type="button"
          >
            <Download size={15} />
            CSV
          </button>
          <button
            disabled={followUpRows.length === 0}
            onClick={() => printRowsDocument("Agenda de cobrança", followUpRows, session.empresa || "Nexus One")}
            type="button"
          >
            <Printer size={15} />
            PDF
          </button>
        </div>
      </div>

      {collectionFollowUpForm.financeiroId && (
        <form className="compact-form product-form collection-followup-form" onSubmit={handleCreateCollectionFollowUp}>
          <div className="finance-form-row">
            <label className="form-control">
              <span>Cliente</span>
              <input readOnly value={collectionFollowUpForm.cliente} />
            </label>
            <label className="form-control">
              <span>Canal</span>
              <select
                value={collectionFollowUpForm.canal}
                onChange={(event) => setCollectionFollowUpForm((prev) => ({ ...prev, canal: event.target.value }))}
              >
                <option value="WhatsApp">WhatsApp</option>
                <option value="Telefone">Telefone</option>
                <option value="Email">Email</option>
                <option value="Presencial">Presencial</option>
              </select>
            </label>
            <label className="form-control">
              <span>Próxima ação</span>
              <input
                type="date"
                value={collectionFollowUpForm.proximaAcao}
                onChange={(event) => setCollectionFollowUpForm((prev) => ({ ...prev, proximaAcao: event.target.value }))}
              />
            </label>
          </div>
          <label className="form-control">
            <span>Observação</span>
            <textarea
              value={collectionFollowUpForm.observacao}
              onChange={(event) => setCollectionFollowUpForm((prev) => ({ ...prev, observacao: event.target.value }))}
            />
          </label>
          <div className="cash-action-buttons compact-bulk-actions">
            <button className="checkout-button" disabled={saving} type="submit">
              {saving ? <Loader2 className="spin" size={17} /> : <Plus size={17} />}
              Agendar follow-up
            </button>
            <button className="report-export secondary" onClick={resetCollectionFollowUpForm} type="button">
              <X size={17} />
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="table-wrap compact-table">
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Próxima ação</th>
              <th>Status</th>
              <th>Valor</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {branchScopedFollowUps.length === 0 ? (
              <tr>
                <td className="empty-cell" colSpan="5">Nenhum follow-up de cobrança agendado.</td>
              </tr>
            ) : (
              branchScopedFollowUps.slice(0, 8).map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.clienteNome || "Cliente não identificado"}</strong>
                    <small>{item.financeiroDescricao || "Lançamento financeiro"} / {item.canal || "-"}</small>
                    <small>Filial: {item.filial || "Empresa"}</small>
                    {item.notificacaoExternaEm && (
                      <small>Notificado em {formatDateTime(item.notificacaoExternaEm)}</small>
                    )}
                    <small>{item.observacao || "Sem observação"}</small>
                  </td>
                  <td>{item.proximaAcao ? formatDate(item.proximaAcao) : "-"}</td>
                  <td>
                    <StatusBadge status={item.status} />
                  </td>
                  <td>{formatCurrency(item.valor)}</td>
                  <td>
                    <div className="table-actions">
                      {canMutateFinance && item.status === "PENDENTE" ? (
                        <>
                          <button disabled={saving} onClick={() => handleFollowUpStatus(item.id, "concluir")} type="button">
                            Concluir
                          </button>
                          <button disabled={saving} onClick={() => handleFollowUpStatus(item.id, "cancelar")} type="button">
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <span>-</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
