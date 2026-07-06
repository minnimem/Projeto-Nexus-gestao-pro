import { Download, Printer } from "lucide-react";
import { formatDateTime, formatNumber, getLocalDateKey } from "../../../utils/formatters";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";

export function CommercialHistorySection({ commercialHistory, commercialHistoryRows, selectedCompany }) {
  return (
    <section className="content-grid single">
      <article className="panel orders-panel">
        <div className="panel-title">
          <div>
            <h2>Histórico comercial</h2>
            <p>Alterações recentes de plano, adicionais, status e cadastro da empresa.</p>
          </div>
          <div className="account-plan-actions">
            <span>{formatNumber(commercialHistory.length)} evento(s)</span>
            <button
              disabled={commercialHistoryRows.length === 0}
              onClick={() => downloadCsv(`nexus-one-historico-comercial-${selectedCompany.nome || "empresa"}-${getLocalDateKey()}.csv`, commercialHistoryRows)}
              type="button"
            >
              <Download size={15} />
              CSV
            </button>
            <button
              disabled={commercialHistoryRows.length === 0}
              onClick={() => printRowsDocument("Histórico comercial", commercialHistoryRows, selectedCompany.nome || "Nexus One")}
              type="button"
            >
              <Printer size={15} />
              PDF
            </button>
          </div>
        </div>

        {commercialHistory.length === 0 ? (
          <div className="empty-selection compact">
            Nenhuma alteração comercial registrada para está empresa.
          </div>
        ) : (
          <div className="audit-event-list">
            {commercialHistory.map((evento) => (
              <article className="audit-event-item" key={evento.id || `${evento.acao}-${evento.dataEvento}`}>
                <div>
                  <strong>{evento.acao || "Evento comercial"}</strong>
                  <span>{evento.descricao || "-"}</span>
                </div>
                <small>{evento.dataEvento ? formatDateTime(evento.dataEvento) : "-"} / {evento.usuarioLogin || "sistema"}</small>
              </article>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
