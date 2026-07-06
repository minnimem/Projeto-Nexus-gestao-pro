import { Loader2, ShieldCheck } from "lucide-react";
import { formatNumber } from "../../../utils/formatters";

export function ControlledAddonsPanel({
  handleReleaseSubmit,
  liberationStatuses,
  releaseDrafts,
  savingReleaseModule,
  selectedCompany,
  selectedLiberationRows,
  updateReleaseDraft,
}) {
  return (
    <section className="content-grid single">
      <article className="panel">
        <div className="panel-title">
          <div>
            <h2>Adicionais controlados</h2>
            <p>Contrato, homologação e liberação de produção por módulo.</p>
          </div>
          <span>{formatNumber(selectedLiberationRows.filter((row) => row.liberado).length)} liberado(s)</span>
        </div>

        <div className="liberation-grid">
          {selectedLiberationRows.map((row) => {
            const draft = releaseDrafts[row.modulo] || {
              modulo: row.modulo,
              status: row.status,
              contratado: row.contratado,
              responsavel: "",
              evidencia: "",
              observacao: "",
            };
            const savingThisRelease = savingReleaseModule === row.modulo;
            return (
              <article className={`liberation-card ${row.liberado ? "ready" : "pending"}`} key={row.modulo}>
                <div>
                  <strong>{row.label}</strong>
                  <span>{row.liberadoPorPlano ? "Incluso no plano" : row.contratado ? "Adicional contratado" : "Não contratado"}</span>
                </div>
                <label className="form-control compact">
                  <span>Status</span>
                  <select disabled={savingThisRelease} value={draft.status} onChange={(event) => updateReleaseDraft(row.modulo, "status", event.target.value)}>
                    {liberationStatuses.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </label>
                <label className="form-control compact">
                  <span>Responsável</span>
                  <input disabled={savingThisRelease} value={draft.responsavel} onChange={(event) => updateReleaseDraft(row.modulo, "responsavel", event.target.value)} placeholder="Responsável" />
                </label>
                <label className="form-control compact">
                  <span>Evidência</span>
                  <input disabled={savingThisRelease} value={draft.evidencia} onChange={(event) => updateReleaseDraft(row.modulo, "evidencia", event.target.value)} placeholder="Link, documento ou protocolo" />
                </label>
                <label className="form-control compact">
                  <span>Contratado</span>
                  <input checked={Boolean(draft.contratado)} disabled={savingThisRelease} onChange={(event) => updateReleaseDraft(row.modulo, "contratado", event.target.checked)} type="checkbox" />
                </label>
                <label className="form-control compact">
                  <span>Observação</span>
                  <input disabled={savingThisRelease} value={draft.observacao} onChange={(event) => updateReleaseDraft(row.modulo, "observacao", event.target.value)} placeholder="Escopo, pendências ou restrições" />
                </label>
                <button className="ghost-button" disabled={savingThisRelease || !selectedCompany.id} onClick={() => handleReleaseSubmit(row.modulo)} type="button">
                  {savingThisRelease ? <Loader2 className="spin" size={15} /> : <ShieldCheck size={15} />}
                  {savingThisRelease ? "Salvando..." : "Salvar adicional"}
                </button>
              </article>
            );
          })}
        </div>
      </article>
    </section>
  );
}
