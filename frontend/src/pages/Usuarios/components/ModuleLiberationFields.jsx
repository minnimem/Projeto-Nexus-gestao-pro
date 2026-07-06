export function ModuleLiberationFields({
  canManagePlans,
  draft,
  liberationStatuses,
  row,
  savingThisRelease,
  updateReleaseDraft,
}) {
  return (
    <>
      <label className="form-control compact">
        <span>Status</span>
        <select
          disabled={!canManagePlans || savingThisRelease}
          value={draft.status}
          onChange={(event) => updateReleaseDraft(row.modulo, "status", event.target.value)}
        >
          {liberationStatuses.map((statusOption) => (
            <option key={statusOption} value={statusOption}>
              {statusOption}
            </option>
          ))}
        </select>
      </label>

      <label className="form-control compact">
        <span>Responsável</span>
        <input
          disabled={!canManagePlans || savingThisRelease}
          value={draft.responsavel}
          onChange={(event) => updateReleaseDraft(row.modulo, "responsavel", event.target.value)}
          placeholder="Responsável"
        />
      </label>

      <label className="form-control compact">
        <span>Evidencia</span>
        <input
          disabled={!canManagePlans || savingThisRelease}
          value={draft.evidência}
          onChange={(event) => updateReleaseDraft(row.modulo, "evidência", event.target.value)}
          placeholder="Link, documento ou protocolo"
        />
      </label>

      <label className="form-control compact">
        <span>Contratado</span>
        <input
          checked={Boolean(draft.contratado)}
          disabled={!canManagePlans || savingThisRelease}
          onChange={(event) => updateReleaseDraft(row.modulo, "contratado", event.target.checked)}
          type="checkbox"
        />
      </label>

      <label className="form-control compact">
        <span>Observação</span>
        <input
          disabled={!canManagePlans || savingThisRelease}
          value={draft.observacao}
          onChange={(event) => updateReleaseDraft(row.modulo, "observacao", event.target.value)}
          placeholder="Pendências, escopo ou restrições"
        />
      </label>
    </>
  );
}
