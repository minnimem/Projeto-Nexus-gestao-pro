import { Download, Printer } from "lucide-react";
import { formatNumber, getLocalDateKey } from "../../../utils/formatters";
import { downloadCsv, printRowsDocument } from "../../../utils/exporters";

export function FiscalReadinessSection({ empresa, fiscalPendingCount, fiscalReadinessRows, session }) {
  return (
    <section className="content-grid single">
      <article className="panel">
        <div className="panel-title">
          <div>
            <h2>Prontidão fiscal</h2>
            <p>Checklist cadastral por unidade antes de NF-e/NFC-e real.</p>
          </div>
          <div className="account-plan-actions">
            <span>{formatNumber(fiscalPendingCount)} pendência(s)</span>
            <button
              disabled={fiscalReadinessRows.length === 0}
              onClick={() => downloadCsv(`nexus-one-prontidao-fiscal-${getLocalDateKey()}.csv`, fiscalReadinessRows)}
              type="button"
            >
              <Download size={15} />
              CSV balanço
            </button>
            <button
              disabled={fiscalReadinessRows.length === 0}
              onClick={() => printRowsDocument("Prontidão fiscal", fiscalReadinessRows, empresa.nome || session.empresa || "Nexus One")}
              type="button"
            >
              <Printer size={15} />
              PDF balanço
            </button>
          </div>
        </div>
        <div className="account-plan-grid compact-catalog-grid">
          {fiscalReadinessRows.map((row) => (
            <div
              className={row.Status === "Pronta para homologação" ? "account-plan-item fiscal-ready-card ready" : "account-plan-item fiscal-ready-card pending"}
              key={`${row.Tipo}-${row.Unidade}`}
            >
              <span>{row.Tipo} / {row.CNPJ}</span>
              <strong>{row.Unidade}</strong>
              <small>{row.Status}</small>
              <small>{row.Pendencias === "-" ? `${row.Contratos} contrato(s) ativo(s)` : `Pendências: ${row.Pendencias}`}</small>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
