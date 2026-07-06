import { Download, Phone, Printer } from "lucide-react";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";
import { formatCurrency, formatDate, formatNumber, getLocalDateKey } from "../../../utils/formatters";

export function FinanceCustomerCollectionSection({
  canMutateFinance,
  cobrancaPorCliente,
  cobrancaRows,
  collectionRiskSummary,
  session,
  startCollectionFollowUp,
}) {
  return (
    <section className="panel delinquency-panel">
      <div className="panel-title compact">
        <div>
          <h2>Cobrança por cliente</h2>
          <p>Carteira inadimplente agrupada para priorizar contato.</p>
        </div>
        <div className="account-plan-actions">
          <button
            disabled={cobrancaRows.length === 0}
            onClick={() => downloadCsv(`nexus-one-cobranca-clientes-${getLocalDateKey()}.csv`, cobrancaRows)}
            type="button"
          >
            <Download size={15} />
            CSV
          </button>
          <button
            disabled={cobrancaRows.length === 0}
            onClick={() => printRowsDocument("Cobrança por cliente", cobrancaRows, session.empresa || "Nexus One")}
            type="button"
          >
            <Printer size={15} />
            PDF
          </button>
        </div>
      </div>

      <div className="aging-grid">
        {collectionRiskSummary.map((item) => (
          <div className={`aging-card active ${item.classe}`} key={item.risco}>
            <span>Risco {item.risco}</span>
            <strong>{formatCurrency(item.total)}</strong>
            <small>{formatNumber(item.quantidade)} cliente(s)</small>
          </div>
        ))}
      </div>

      <div className="account-plan-grid collection-grid">
        {cobrancaPorCliente.length === 0 ? (
          <div className="empty-selection compact">Nenhum cliente com cobrança vencida.</div>
        ) : (
          cobrancaPorCliente.slice(0, 8).map((item) => (
            <div className={`account-plan-item collection-card ${item.classe}`} key={item.cliente}>
              <span>{item.cliente}</span>
              <strong>{formatCurrency(item.total)}</strong>
              <small>Risco {item.risco} / {item.acao}</small>
              <small>{formatNumber(item.titulos)} título(s) / maior atraso {formatNumber(item.maiorAtraso)} dia(s)</small>
              <small>Último vencimento {formatDate(item.ultimoVencimento)}</small>
              <small>{item.observacoes.slice(-1)[0] || "Sem contato registrado"}</small>
              {canMutateFinance && (
                <button className="mini-action-button" onClick={() => startCollectionFollowUp(item)} type="button">
                  <Phone size={15} />
                  Agendar
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

