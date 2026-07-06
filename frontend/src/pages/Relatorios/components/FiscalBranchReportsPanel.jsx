import { Download, Printer } from "lucide-react";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { formatNumber, getLocalDateKey } from "../../../utils/formatters";

export function FiscalBranchReportsPanel({
  branchReportRows,
  canSeeCollaborators,
  canSeeFinance,
  collaboratorBranchReportRows,
  financeBranchReportRows,
  fiscalPreparedCount,
  fiscalReportRows,
  selectedReportBranchLabel,
  session,
}) {
  return (
    <>      <section className="panel">
        <div className="panel-title compact">
          <div>
            <h2>Relatório fiscal</h2>
            <p>Resumo de documentos fiscais por pedido e filial.</p>
          </div>
          <div className="account-plan-actions">
            <button
              disabled={fiscalReportRows.length === 0}
              onClick={() => downloadCsv(`nexus-one-relatorio-fiscal-${getLocalDateKey()}.csv`, fiscalReportRows)}
              type="button"
            >
              <Download size={15} />
              CSV
            </button>
            <button
              disabled={fiscalReportRows.length === 0}
              onClick={() => printRowsDocument("Relatório fiscal", fiscalReportRows, session.empresa || "Nexus One")}
              type="button"
            >
              <Printer size={15} />
              PDF
            </button>
          </div>
        </div>
        <div className="sales-period-summary">
          <div>
            <span>Pedidos fiscais</span>
            <strong>{formatNumber(fiscalReportRows.length)}</strong>
          </div>
          <div>
            <span>Documentos preparados</span>
            <strong>{formatNumber(fiscalPreparedCount)}</strong>
          </div>
          <div>
            <span>Filtro</span>
            <strong>{selectedReportBranchLabel}</strong>
          </div>
        </div>
        <div className="table-wrap compact-table">
          <table>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Filial</th>
                <th>Documento</th>
                <th>Status fiscal</th>
                <th>Protocolo</th>
              </tr>
            </thead>
            <tbody>
              {fiscalReportRows.length === 0 ? (
                <tr>
                  <td className="empty-cell" colSpan="6">Nenhum pedido fiscal encontrado para o filtro selecionado.</td>
                </tr>
              ) : (
                fiscalReportRows.slice(0, 12).map((row) => (
                  <tr key={`${row.Pedido}-${row.Documento}`}>
                    <td><strong>{row.Pedido}</strong></td>
                    <td>{row.Cliente}</td>
                    <td>{row.Filial}</td>
                    <td>{row.Documento}</td>
                    <td>{row["Status fiscal"]}</td>
                    <td>{row.Protocolo}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="analytics-grid">
        <article className="panel">
          <div className="panel-title compact">
            <div>
              <h2>Vendas por filial</h2>
              <p>Consolidado do período e filial selecionados.</p>
            </div>
            <div className="account-plan-actions">
              <button
                disabled={branchReportRows.length === 0}
                onClick={() => downloadCsv(`nexus-one-vendas-filiais-${getLocalDateKey()}.csv`, branchReportRows)}
                type="button"
              >
                <Download size={15} />
                CSV
              </button>
              <button
                disabled={branchReportRows.length === 0}
                onClick={() => printRowsDocument("Vendas por filial", branchReportRows, session.empresa || "Nexus One")}
                type="button"
              >
                <Printer size={15} />
                PDF
              </button>
            </div>
          </div>
          <div className="table-wrap compact-table">
            <table>
              <tbody>
                {branchReportRows.length === 0 ? (
                  <tr>
                    <td className="empty-cell">Nenhuma venda encontrada para filial/período.</td>
                  </tr>
                ) : (
                  branchReportRows.map((row) => (
                    <tr key={row.Filial}>
                      <td><strong>{row.Filial}</strong></td>
                      <td>{row.Vendas} venda(s)</td>
                      <td>{row.Receita}</td>
                      <td>{row["Ticket médio"]}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>

        {canSeeFinance && (
          <article className="panel">
            <div className="panel-title compact">
              <div>
                <h2>Financeiro por filial</h2>
                <p>Receitas, despesas, resultado e pendências.</p>
              </div>
              <div className="account-plan-actions">
                <button
                  disabled={financeBranchReportRows.length === 0}
                  onClick={() => downloadCsv(`nexus-one-financeiro-filiais-${getLocalDateKey()}.csv`, financeBranchReportRows)}
                  type="button"
                >
                  <Download size={15} />
                  CSV
                </button>
                <button
                  disabled={financeBranchReportRows.length === 0}
                  onClick={() => printRowsDocument("Financeiro por filial", financeBranchReportRows, session.empresa || "Nexus One")}
                  type="button"
                >
                  <Printer size={15} />
                  PDF
                </button>
              </div>
            </div>
            <div className="table-wrap compact-table">
              <table>
                <tbody>
                  {financeBranchReportRows.length === 0 ? (
                    <tr>
                      <td className="empty-cell">Nenhuma movimentação encontrada para filial.</td>
                    </tr>
                  ) : (
                    financeBranchReportRows.map((row) => (
                      <tr key={row.Filial}>
                        <td><strong>{row.Filial}</strong></td>
                        <td>{row.Receitas}</td>
                        <td>{row.Despesas}</td>
                        <td>{row.Resultado}</td>
                        <td>{row.Pendentes}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </article>
        )}

        {canSeeCollaborators && (
          <article className="panel">
            <div className="panel-title compact">
              <div>
                <h2>Colaboradores por filial</h2>
                <p>Equipe, acessos ativos e perfis por loja.</p>
              </div>
              <div className="account-plan-actions">
                <button
                  disabled={collaboratorBranchReportRows.length === 0}
                  onClick={() => downloadCsv(`nexus-one-colaboradores-filiais-${getLocalDateKey()}.csv`, collaboratorBranchReportRows)}
                  type="button"
                >
                  <Download size={15} />
                  CSV
                </button>
                <button
                  disabled={collaboratorBranchReportRows.length === 0}
                  onClick={() => printRowsDocument("Colaboradores por filial", collaboratorBranchReportRows, session.empresa || "Nexus One")}
                  type="button"
                >
                  <Printer size={15} />
                  PDF
                </button>
              </div>
            </div>
            <div className="table-wrap compact-table">
              <table>
                <tbody>
                  {collaboratorBranchReportRows.length === 0 ? (
                    <tr>
                      <td className="empty-cell">Nenhum colaborador encontrado para filial.</td>
                    </tr>
                  ) : (
                    collaboratorBranchReportRows.map((row) => (
                      <tr key={row.Filial}>
                        <td><strong>{row.Filial}</strong></td>
                        <td>{row.Colaboradores} colaborador(es)</td>
                        <td>{row.Ativos} ativos</td>
                        <td>{row.Bloqueados} bloqueados/inativos</td>
                        <td>{row.Perfis || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </article>
        )}
      </section>
    </>
  );
}
